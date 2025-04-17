const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const axios = require("axios");

// Helper function to determine job type from title and description
function determineJobType(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();

  if (text.includes("intern") || text.includes("internship")) {
    return "INTERNSHIP";
  } else if (
    text.includes("contract") ||
    text.includes("freelance") ||
    text.includes("temporary")
  ) {
    return "CONTRACT";
  } else if (text.includes("part time") || text.includes("part-time")) {
    return "PART_TIME";
  } else {
    return "FULL_TIME"; // Default job type
  }
}

class JobScraper {
  constructor() {
    this.browser = null;
    this.axiosInstance = axios.create({
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      timeout: 30000,
    });
  }

  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: "new",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
          "--window-size=1920x1080",
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      });
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async scrapeLinkedInJobs(keyword = "software engineer", location = "") {
    console.log("Starting LinkedIn scraping...");
    try {
      const searchUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(
        keyword
      )}&location=${encodeURIComponent(location)}&f_TPR=r86400&start=0`;
      console.log("LinkedIn URL:", searchUrl);

      const response = await this.axiosInstance.get(searchUrl);
      const $ = cheerio.load(response.data);

      const jobs = [];
      $(".job-search-card").each((i, element) => {
        try {
          const title = $(element)
            .find(".base-search-card__title")
            .text()
            .trim();
          const description =
            $(element).find(".job-search-card__snippet").text().trim() || "";

          const job = {
            title,
            company: $(element)
              .find(".base-search-card__subtitle")
              .text()
              .trim(),
            location: $(element)
              .find(".job-search-card__location")
              .text()
              .trim(),
            url: $(element).find(".base-card__full-link").attr("href"),
            source: "LinkedIn",
            description,
            jobType: determineJobType(title, description),
          };

          if (job.title && job.company && job.url) {
            console.log("Found LinkedIn job:", job.title);
            jobs.push(job);
          }
        } catch (err) {
          console.error("Error parsing LinkedIn job:", err);
        }
      });

      console.log(`LinkedIn scraping complete. Found ${jobs.length} jobs.`);
      return jobs;
    } catch (error) {
      console.error("Error scraping LinkedIn jobs:", error);
      return [];
    }
  }

  async scrapeRemoteOKJobs(keyword = "javascript") {
    console.log("Starting RemoteOK scraping...");
    try {
      const response = await this.axiosInstance.get(
        "https://remoteok.com/api",
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          },
        }
      );

      const jobs = response.data
        .filter((item) => item.position && item.company) // Filter out non-job items
        .map((item) => ({
          title: item.position,
          company: item.company,
          location: "Remote",
          url: `https://remoteok.com${item.url}`,
          source: "RemoteOK",
          salary: item.salary || null,
          description: item.description || null,
          jobType: determineJobType(item.position, item.description),
        }));

      console.log(`RemoteOK scraping complete. Found ${jobs.length} jobs.`);
      return jobs;
    } catch (error) {
      console.error("Error scraping RemoteOK jobs:", error);
      return [];
    }
  }

  async scrapeRelocateJobs(keyword) {
    try {
      console.log("Starting Relocate.me HTML scraping...");
      const searchUrl = `https://relocate.me/search?q=${encodeURIComponent(
        keyword
      )}`;
      console.log("Relocate.me Search URL:", searchUrl);

      const response = await this.axiosInstance.get(searchUrl);
      const $ = cheerio.load(response.data);

      const jobs = [];
      // Use selectors based on the provided HTML structure
      $(".jobs-list__job").each((i, element) => {
        try {
          const titleElement = $(element).find(".job__title a b");
          const companyElement = $(element).find(
            ".job__info > div:nth-child(2) p"
          ); // Second div for company
          const locationElement = $(element).find(
            ".job__info > div:first-child p"
          ); // First div for location
          const urlElement = $(element).find(".job__title a"); // Link containing title and URL
          const descriptionElement = $(element).find(".job__preview");

          const title = titleElement.text().trim();
          const company = companyElement.text().trim();
          const location = locationElement.text().trim();
          let url = urlElement.attr("href");

          // Ensure the URL is absolute
          if (url && !url.startsWith("http")) {
            url = `https://relocate.me${url}`;
          }

          const description = descriptionElement.text().trim() || "";

          // Log extracted data for debugging
          // console.log(`-- Relocate.me Raw Data --`);
          // console.log(`   Title: ${title}`);
          // console.log(`   Company: ${company}`);
          // console.log(`   Location: ${location}`);
          // console.log(`   URL: ${url}`);
          // console.log(`   Description: ${description}`);

          if (title && company && url) {
            const job = {
              title,
              company,
              location: location || "Location not specified",
              url,
              source: "Relocate.me",
              description,
              jobType: determineJobType(title, description),
            };
            console.log("Found Relocate.me job:", job.title);
            jobs.push(job);
          } else {
            // Log if essential data is missing
            // console.log(`Skipping Relocate.me item due to missing data: Title='${title}', Company='${company}', URL='${url}'`);
          }
        } catch (err) {
          console.error("Error parsing Relocate.me job HTML:", err);
        }
      });

      console.log(
        `Relocate.me HTML scraping complete. Found ${jobs.length} jobs.`
      );
      return jobs;
    } catch (error) {
      if (error.response) {
        console.error(
          `Error scraping Relocate.me HTML: Status ${error.response.status}`,
          error.message
        );
      } else {
        console.error("Error scraping Relocate.me HTML:", error.message);
      }
      return [];
    }
  }

  async scrapeLarajobs(keyword = "software engineer") {
    try {
      console.log("Starting Larajobs scraping (all jobs)...");
      const searchUrl = `https://larajobs.com/api/jobs`;
      console.log("Larajobs URL:", searchUrl);

      const response = await this.axiosInstance.get(searchUrl, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.data || !Array.isArray(response.data)) {
        console.log("No jobs found from Larajobs");
        return [];
      }

      const jobs = response.data.map((job) => ({
        title: job.title || "",
        company: job.company_name || "",
        location: job.location || "Remote",
        url: `https://larajobs.com/jobs/${job.slug}`,
        source: "Larajobs",
        description: job.description || "",
        jobType: determineJobType(job.title, job.description),
      }));

      console.log(`Larajobs scraping complete. Found ${jobs.length} jobs.`);
      return jobs;
    } catch (error) {
      console.error("Error scraping Larajobs:", error.message);
      return [];
    }
  }

  async scrapeVueJobs(keyword = "software engineer") {
    try {
      console.log("Starting VueJobs HTML scraping (all jobs)...");
      const searchUrl = `https://vuejobs.com/jobs`; // Fetch the main jobs page without keyword query
      console.log("VueJobs Jobs URL:", searchUrl);

      const response = await this.axiosInstance.get(searchUrl);
      const $ = cheerio.load(response.data);

      const jobs = [];
      // Selectors based on provided HTML for VueJobs
      $('a[href^="/jobs/"]').each((i, element) => {
        try {
          const titleElement = $(element).find(
            ".font-display.text-lg.font-bold"
          );
          const companyElement = $(element).find(
            ".text-sm.font-medium.text-muted"
          );
          const locationElement = $(element).find(
            '.text-xs.mt-3 span.inline-flex[class*="gap-1.5"]'
          );
          const salaryElement = $(element).find(
            '.text-xs.mt-3 span[class*="bg-purple-100"]'
          );
          const url = $(element).attr("href");

          const title = titleElement.text().trim();
          const company = companyElement.text().replace("at ", "").trim(); // Remove 'at '
          const location = locationElement.text().trim();
          const salary = salaryElement.text().trim() || null;
          let absoluteUrl = url;

          // Ensure the URL is absolute
          if (absoluteUrl && !absoluteUrl.startsWith("http")) {
            absoluteUrl = `https://vuejobs.com${absoluteUrl}`;
          }

          // Simple description placeholder (can't get from list view)
          const description = "";

          // REMOVED keyword check
          // const matchesKeyword = keyword ? `${title} ${company}`.toLowerCase().includes(keyword.toLowerCase()) : true;

          if (title && company && absoluteUrl /*&& matchesKeyword - REMOVED*/) {
            const job = {
              title,
              company,
              location: location || "Location not specified",
              url: absoluteUrl,
              source: "VueJobs",
              description,
              salary,
              jobType: determineJobType(title, description),
            };
            // Only log if found, to avoid spamming console for every job on the page
            // console.log("Found VueJobs job:", job.title);
            jobs.push(job);
          }
        } catch (err) {
          console.error("Error parsing VueJobs job HTML:", err);
        }
      });

      console.log(`VueJobs HTML scraping complete. Found ${jobs.length} jobs.`);
      return jobs;
    } catch (error) {
      if (error.response) {
        console.error(
          `Error scraping VueJobs HTML: Status ${error.response.status}`,
          error.message
        );
      } else {
        console.error("Error scraping VueJobs HTML:", error.message);
      }
      return [];
    }
  }

  async scrapeAllJobs(keyword, location) {
    console.log(
      `Starting job scraping for keyword: ${keyword}, location: ${location}`
    );
    try {
      // Scrape from all sources in parallel
      const [linkedInJobs, remoteOKJobs, relocateJobs, larajobs, vuejobs] =
        await Promise.all([
          this.scrapeLinkedInJobs(keyword, location),
          this.scrapeRemoteOKJobs(keyword),
          this.scrapeRelocateJobs(keyword),
          this.scrapeLarajobs(keyword),
          this.scrapeVueJobs(keyword),
        ]);

      // Combine all jobs
      const allJobs = [
        ...linkedInJobs,
        ...remoteOKJobs,
        ...relocateJobs,
        ...larajobs,
        ...vuejobs,
      ];

      console.log(`Total jobs found: ${allJobs.length}`);
      console.log(`- LinkedIn: ${linkedInJobs.length} jobs`);
      console.log(`- RemoteOK: ${remoteOKJobs.length} jobs`);
      console.log(`- Relocate.me: ${relocateJobs.length} jobs`);
      console.log(`- Larajobs: ${larajobs.length} jobs`);
      console.log(`- VueJobs: ${vuejobs.length} jobs`);

      return allJobs;
    } catch (error) {
      console.error("Error scraping all jobs:", error);
      return [];
    }
  }
}

module.exports = new JobScraper();
