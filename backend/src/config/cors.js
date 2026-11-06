const LOCAL_DEVELOPMENT_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const createCorsOptions = (frontendUrl = process.env.FRONTEND_URL) => {
  const allowedOrigins = new Set(LOCAL_DEVELOPMENT_ORIGINS);

  if (frontendUrl) {
    try {
      const frontend = new URL(frontendUrl);
      if (frontend.protocol === "http:" || frontend.protocol === "https:") {
        allowedOrigins.add(frontend.origin);
      }
    } catch {
      // Invalid or missing deployment configuration never expands the allowlist.
    }
  }

  return {
    origin: (origin, callback) => {
      // Requests without an Origin include health checks and server-to-server calls.
      callback(null, !origin || allowedOrigins.has(origin));
    },
  };
};

module.exports = { createCorsOptions };
