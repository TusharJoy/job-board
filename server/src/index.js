const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cron = require("node-cron");
const axios = require("axios");
const jobRoutes = require("./routes/jobRoutes");
const db = require("./models");

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const serverBaseUrl = `http://localhost:${port}`;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/jobs", jobRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Schedule Job Scraping Cron Job (Runs daily at midnight)
// Cron format: second minute hour day-of-month month day-of-week
cron.schedule(
  "0 0 * * *",
  async () => {
    console.log("Running scheduled job: Triggering job scrape...");
    try {
      const response = await axios.post(`${serverBaseUrl}/api/jobs/scrape`);
      console.log("Scheduled job: Scrape request successful.", response.data);
    } catch (error) {
      console.error(
        "Scheduled job: Error triggering scrape request:",
        error.message
      );
    }
  },
  {
    scheduled: true,
    timezone: "UTC", // Adjust timezone as needed, e.g., "America/New_York"
  }
);
console.log("Job scraping cron job scheduled to run daily at midnight UTC.");

// Start server
app.listen(port, async () => {
  try {
    // Sync database
    await db.sequelize.sync();
    console.log("Database synced successfully");
    console.log(`Server is running on port ${port}`);
  } catch (error) {
    console.error("Error starting server:", error);
  }
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  await db.sequelize.close();
  process.exit(0);
});
