const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jobRoutes = require("./routes/jobRoutes");
const db = require("./models");

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

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
