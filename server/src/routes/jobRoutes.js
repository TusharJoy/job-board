const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");

// Job routes
router.get("/", jobController.getAllJobs);
router.get("/search", jobController.searchJobs);
router.post("/scrape", jobController.scrapeJobs);
router.get("/:id", jobController.getJobById);

module.exports = router;
