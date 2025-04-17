const scraper = require("./src/services/scraper");

async function testScraper() {
  try {
    console.log("Starting scraper test...");
    const jobs = await scraper.scrapeAllJobs("software engineer", "remote");
    console.log("Scraping completed successfully!");
    console.log("Total jobs found:", jobs.length);
    console.log("Sample job:", jobs[0]);
  } catch (error) {
    console.error("Error during scraping:", error);
  } finally {
    await scraper.close();
  }
}

testScraper();
