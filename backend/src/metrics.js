const client = require("@prometheus-io/client");
const { METHODS } = require("node:http");

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests processed",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

function getNormalizedRoute(req) {
  if (typeof req.route?.path !== "string") {
    return "unmatched";
  }

  const fullPath = `${req.baseUrl || ""}${req.route.path}`;
  const normalizedPath = fullPath.replace(/\/{2,}/g, "/").replace(/\/+$/, "");
  return normalizedPath || "/";
}

function metricsMiddleware(req, res, next) {
  if (req.path === "/metrics") {
    return next();
  }

  const endTimer = httpRequestDurationSeconds.startTimer();
  res.once("finish", () => {
    const route = getNormalizedRoute(req);
    const labels = {
      method: METHODS.includes(req.method) ? req.method : "OTHER",
      route,
      status_code: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels);
    endTimer(labels);
  });

  next();
}

async function metricsHandler(req, res) {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
}

module.exports = {
  register,
  httpRequestsTotal,
  httpRequestDurationSeconds,
  getNormalizedRoute,
  metricsMiddleware,
  metricsHandler,
};
