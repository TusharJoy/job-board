const { Job } = require("../models");
const { Op } = require("sequelize");
const scraper = require("../services/scraper");

const jobController = {
  // Get all jobs
  async getAllJobs(req, res) {
    try {
      const jobs = await Job.findAll({
        order: [["createdAt", "DESC"]],
      });
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Search jobs
  async searchJobs(req, res) {
    try {
      const { keyword = "", location = "", jobType = "" } = req.query;
      const jobs = await Job.findAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                { title: { [Op.iLike]: `%${keyword}%` } },
                { company: { [Op.iLike]: `%${keyword}%` } },
                { description: { [Op.iLike]: `%${keyword}%` } },
              ],
            },
            ...(location
              ? [{ location: { [Op.iLike]: `%${location}%` } }]
              : []),
            ...(jobType ? [{ jobType: { [Op.iLike]: `%${jobType}%` } }] : []),
          ],
        },
        order: [["createdAt", "DESC"]],
      });
      res.json(jobs);
    } catch (error) {
      console.error("Error searching jobs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Scrape and save new jobs
  async scrapeJobs(req, res) {
    try {
      const { keyword = "software engineer", location = "" } = req.body;

      // Scrape jobs from multiple sources
      const jobs = await scraper.scrapeAllJobs(keyword, location);

      // Save jobs to database
      const savedJobs = await Promise.all(
        jobs.map(async (job) => {
          try {
            const [jobRecord, created] = await Job.findOrCreate({
              where: { url: job.url },
              defaults: job,
            });
            return [jobRecord, created];
          } catch (error) {
            console.error("Error saving job:", error);
            return null;
          }
        })
      );

      const validSavedJobs = savedJobs.filter((job) => job !== null);

      res.json({
        message: "Jobs scraped successfully",
        total: jobs.length,
        new: validSavedJobs.filter((job) => job[1]).length,
        saved: validSavedJobs.length,
      });
    } catch (error) {
      console.error("Error scraping jobs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Get job by ID
  async getJobById(req, res) {
    try {
      const job = await Job.findByPk(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = jobController;
