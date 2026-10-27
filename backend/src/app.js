const express = require("express");
const cors = require("cors");

const studentRoutes = require("./routes/studentRoutes");
const { metricsMiddleware, metricsHandler } = require("./metrics");

const app = express();

app.use(metricsMiddleware);
app.use(cors());
app.use(express.json());

app.get("/metrics", metricsHandler);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Student Management System backend is running",
  });
});

app.use("/api/students", studentRoutes);

module.exports = app;