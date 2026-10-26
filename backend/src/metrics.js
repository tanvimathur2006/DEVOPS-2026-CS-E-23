const client = require("@prometheus-io/client");

// Create a dedicated Prometheus Registry
const register = new client.Registry();

// Enable default Node.js process and runtime metrics
client.collectDefaultMetrics({ register });

// A. HTTP request counter
const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests processed",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

// B. HTTP request duration histogram
const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

/**
 * Normalizes request route patterns to prevent high-cardinality label explosion.
 * Replaces dynamic values (e.g., student IDs) with Express route templates (e.g. /:id).
 */
function getNormalizedRoute(req) {
  if (req.metricsRoute) {
    return req.metricsRoute;
  }

  if (req.route && req.route.path) {
    const basePath = req.baseUrl || "";
    const routePath = req.route.path;
    let fullPath = `${basePath}${routePath}`;
    if (fullPath.endsWith("/") && fullPath.length > 1) {
      fullPath = fullPath.slice(0, -1);
    }
    return fullPath || "/";
  }
  return "unmatched";
}

/**
 * Express middleware to track HTTP request metrics.
 * Excludes /metrics endpoint to prevent self-monitoring recursion.
 */
function metricsMiddleware(req, res, next) {
  // Exclude /metrics from request counting and latency recording
  if (req.path === "/metrics" || req.originalUrl?.startsWith("/metrics")) {
    return next();
  }

  const endTimer = httpRequestDurationSeconds.startTimer();
  let recorded = false;

  const recordMetrics = () => {
    if (recorded) return;
    recorded = true;

    const route = getNormalizedRoute(req);
    const statusCode = res.statusCode ? res.statusCode.toString() : "500";
    const labels = {
      method: req.method,
      route,
      status_code: statusCode,
    };

    httpRequestsTotal.inc(labels);
    endTimer(labels);
  };

  res.on("finish", recordMetrics);
  res.on("close", recordMetrics);

  next();
}

/**
 * Express handler for GET /metrics endpoint.
 * Returns Prometheus exposition format with proper Content-Type header.
 */
async function metricsHandler(req, res) {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error.message);
  }
}

module.exports = {
  register,
  httpRequestsTotal,
  httpRequestDurationSeconds,
  getNormalizedRoute,
  metricsMiddleware,
  metricsHandler,
};
