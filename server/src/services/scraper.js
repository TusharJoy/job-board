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
      console.log("Starting Relocate.me scraping...");
      const searchUrl = `https://relocate.me/api/jobs/search?q=${encodeURIComponent(
        keyword
      )}`;
      console.log("Relocate.me URL:", searchUrl);

      const response = await this.axiosInstance.get(searchUrl, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.data || !Array.isArray(response.data)) {
        console.log("No jobs found from Relocate.me");
        return [];
      }

      const jobs = response.data.map((job) => ({
        title: job.title || "",
        company: job.company_name || "",
        location: job.country || "",
        url: `https://relocate.me/jobs/${job.id}`,
        source: "Relocate.me",
        description: job.description || "",
        jobType: determineJobType(job.title, job.description),
      }));

      console.log(`Relocate.me scraping complete. Found ${jobs.length} jobs.`);
      return jobs;
    } catch (error) {
      console.error("Error scraping Relocate.me jobs:", error.message);
      return [];
    }
  }

  async scrapeLarajobs(keyword = "software engineer") {
    try {
      console.log("Starting Larajobs scraping...");
      const searchUrl = `https://larajobs.com/api/jobs?search=${encodeURIComponent(
        keyword
      )}`;
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

  async scrapeJSJobs(keyword = "software engineer") {
    try {
      console.log("Starting JSJobs scraping...");
      const searchUrl = `https://jsjobs.com/api/v1/jobs?q=${encodeURIComponent(
        keyword
      )}`;
      console.log("JSJobs URL:", searchUrl);

      const response = await this.axiosInstance.get(searchUrl, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          Referer: "https://jsjobs.com/",
        },
      });

      if (!response.data || !Array.isArray(response.data.jobs)) {
        console.log("No jobs found from JSJobs");
        return [];
      }

      const jobs = response.data.jobs.map((job) => ({
        title: job.title || "",
        company: job.company || "",
        location: job.location || "Remote",
        url: `https://jsjobs.com/jobs/${job.id}`,
        source: "JSJobs",
        description: job.description || "",
        jobType: determineJobType(job.title, job.description),
      }));

      console.log(`JSJobs scraping complete. Found ${jobs.length} jobs.`);
      return jobs;
    } catch (error) {
      console.error("Error scraping JSJobs:", error.message);
      return [];
    }
  }

  async scrapeVueJobs(keyword = "software engineer") {
    try {
      console.log("Starting VueJobs scraping...");
      const searchUrl = "https://vuejobs.com/api/jobs/search";
      console.log("VueJobs URL:", searchUrl);

      const response = await this.axiosInstance.post(
        searchUrl,
        {
          query: keyword,
          page: 1,
          perPage: 100,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            Origin: "https://vuejobs.com",
            Referer: "https://vuejobs.com/jobs",
          },
        }
      );

      if (!response.data || !Array.isArray(response.data.jobs)) {
        console.log("No jobs found from VueJobs");
        return [];
      }

      const jobs = response.data.jobs.map((job) => ({
        title: job.title || "",
        company: job.company ? job.company.name : "Unknown Company",
        location: job.location || "Remote",
        url: `https://vuejobs.com/jobs/${job.id}`,
        source: "VueJobs",
        description: job.description || "",
        salary: job.salary || null,
        jobType: determineJobType(job.title, job.description),
      }));

      console.log(`VueJobs scraping complete. Found ${jobs.length} jobs.`);
      return jobs;
    } catch (error) {
      console.error("Error scraping VueJobs:", error.message);
      return [];
    }
  }

  async scrapeAllJobs(keyword, location) {
    console.log(
      `Starting job scraping for keyword: ${keyword}, location: ${location}`
    );
    try {
      // Scrape from all sources in parallel
      const [
        linkedInJobs,
        remoteOKJobs,
        relocateJobs,
        larajobs,
        jsjobs,
        vuejobs,
      ] = await Promise.all([
        this.scrapeLinkedInJobs(keyword, location),
        this.scrapeRemoteOKJobs(keyword),
        this.scrapeRelocateJobs(keyword),
        this.scrapeLarajobs(keyword),
        this.scrapeJSJobs(keyword),
        this.scrapeVueJobs(keyword),
      ]);

      // Combine all jobs
      const allJobs = [
        ...linkedInJobs,
        ...remoteOKJobs,
        ...relocateJobs,
        ...larajobs,
        ...jsjobs,
        ...vuejobs,
      ];

      console.log(`Total jobs found: ${allJobs.length}`);
      console.log(`- LinkedIn: ${linkedInJobs.length} jobs`);
      console.log(`- RemoteOK: ${remoteOKJobs.length} jobs`);
      console.log(`- Relocate.me: ${relocateJobs.length} jobs`);
      console.log(`- Larajobs: ${larajobs.length} jobs`);
      console.log(`- JSJobs: ${jsjobs.length} jobs`);
      console.log(`- VueJobs: ${vuejobs.length} jobs`);

      return allJobs;
    } catch (error) {
      console.error("Error scraping all jobs:", error);
      return [];
    }
  }
}

module.exports = new JobScraper();
