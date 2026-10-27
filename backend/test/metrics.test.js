const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const test = require("node:test");
const express = require("express");

const app = require("../src/app");
const {
  getNormalizedRoute,
  metricsHandler,
  metricsMiddleware,
} = require("../src/metrics");

async function listen(application, t) {
  const server = createServer(application);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const { port } = server.address();
  return `http://127.0.0.1:${port}`;
}

test("normalizes Express route templates and unmatched paths", () => {
  assert.equal(
    getNormalizedRoute({
      baseUrl: "/api/students",
      route: { path: "/:id" },
    }),
    "/api/students/:id"
  );
  assert.equal(getNormalizedRoute({ baseUrl: "", route: { path: "/" } }), "/");
  assert.equal(getNormalizedRoute({ baseUrl: "", route: undefined }), "unmatched");
});

test("serves Prometheus metrics without recursively recording scrapes", async (t) => {
  const baseUrl = await listen(app, t);

  const healthResponse = await fetch(`${baseUrl}/api/health`);
  assert.equal(healthResponse.status, 200);
  assert.equal((await healthResponse.json()).success, true);

  const missingResponse = await fetch(`${baseUrl}/missing/student-123`);
  assert.equal(missingResponse.status, 404);

  const metricsResponse = await fetch(`${baseUrl}/metrics?format=prometheus`);
  assert.equal(metricsResponse.status, 200);
  assert.match(metricsResponse.headers.get("content-type"), /text\/plain/);

  const exposition = await metricsResponse.text();
  assert.match(
    exposition,
    /http_requests_total\{[^}]*method="GET"[^}]*route="\/api\/health"[^}]*status_code="200"[^}]*\} [1-9]\d*/
  );
  assert.match(
    exposition,
    /http_request_duration_seconds_count\{[^}]*route="\/api\/health"[^}]*status_code="200"[^}]*\} [1-9]\d*/
  );
  assert.match(
    exposition,
    /http_requests_total\{[^}]*route="unmatched"[^}]*status_code="404"[^}]*\} [1-9]\d*/
  );
  assert.doesNotMatch(exposition, /route="\/metrics"/);
  assert.doesNotMatch(exposition, /student-123/);
});

test("records error responses using route templates rather than request IDs", async (t) => {
  const metricsApp = express();
  metricsApp.use(metricsMiddleware);
  metricsApp.get("/students/:studentId", (req, res, next) => {
    next(new Error("intentional metrics test error"));
  });
  metricsApp.get("/metrics", metricsHandler);
  metricsApp.use((error, req, res, next) => {
    res.status(500).end();
  });

  const baseUrl = await listen(metricsApp, t);
  const errorResponse = await fetch(`${baseUrl}/students/65f012345678901234567890`);
  assert.equal(errorResponse.status, 500);

  const exposition = await (await fetch(`${baseUrl}/metrics`)).text();
  assert.match(
    exposition,
    /http_requests_total\{[^}]*route="\/students\/:studentId"[^}]*status_code="500"[^}]*\} [1-9]\d*/
  );
  assert.doesNotMatch(exposition, /65f012345678901234567890/);
});
