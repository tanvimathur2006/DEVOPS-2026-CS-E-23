const express = require("express");
const cors = require("cors");

const { metricsMiddleware, metricsHandler } = require("./metrics");
const studentRoutes = require("./routes/studentRoutes");

const app = express();

app.use(cors());
app.use(metricsMiddleware);
app.use(express.json());

// Application Health Endpoints
const healthHandler = (req, res) => {
  res.json({
    success: true,
    message: "Student Management System backend is running",
  });
};

app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

// Prometheus Metrics Endpoint
app.get("/metrics", metricsHandler);

// Application Routes
app.use("/api/students", studentRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;