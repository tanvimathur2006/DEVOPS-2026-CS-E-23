const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const app = require("../src/app");
const { register } = require("../src/metrics");
const Student = require("../src/models/Student");

describe("Prometheus Metrics & Health Tests", () => {
  let server;
  let baseUrl;

  before(async () => {
    // Reset metrics before running tests
    register.resetMetrics();

    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, "127.0.0.1", () => {
        const address = server.address();
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test("1. GET /api/health and GET /health return 200 JSON status", async () => {
    const res1 = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res1.status, 200);
    const body1 = await res1.json();
    assert.strictEqual(body1.success, true);
    assert.strictEqual(
      body1.message,
      "Student Management System backend is running"
    );

    const res2 = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res2.status, 200);
    const body2 = await res2.json();
    assert.strictEqual(body2.success, true);
  });

  test("2. GET /metrics returns 200 with Prometheus Content-Type header", async () => {
    const res = await fetch(`${baseUrl}/metrics`);
    assert.strictEqual(res.status, 200);

    const contentType = res.headers.get("content-type");
    assert.ok(
      contentType.includes("text/plain"),
      `Expected text/plain content-type, got: ${contentType}`
    );
    assert.ok(
      contentType.includes("version=0.0.4"),
      `Expected version=0.0.4, got: ${contentType}`
    );

    const text = await res.text();
    assert.ok(text.includes("# HELP http_requests_total"));
    assert.ok(text.includes("# TYPE http_requests_total counter"));
    assert.ok(text.includes("# HELP http_request_duration_seconds"));
    assert.ok(text.includes("# TYPE http_request_duration_seconds histogram"));
  });

  test("3. Process and Node.js default runtime metrics are exposed", async () => {
    const res = await fetch(`${baseUrl}/metrics`);
    const text = await res.text();

    assert.ok(
      text.includes("process_cpu_user_seconds_total") ||
        text.includes("process_cpu_seconds_total"),
      "Should expose CPU metrics"
    );
    assert.ok(
      text.includes("process_resident_memory_bytes"),
      "Should expose resident memory bytes"
    );
    assert.ok(
      text.includes("nodejs_heap_size_used_bytes"),
      "Should expose nodejs heap size used"
    );
    assert.ok(
      text.includes("nodejs_version_info"),
      "Should expose nodejs version info"
    );
  });

  test("4. HTTP request counter records method, normalized route, and status code", async () => {
    // Send health request to generate metric
    await fetch(`${baseUrl}/api/health`);

    const res = await fetch(`${baseUrl}/metrics`);
    const text = await res.text();

    // Check request counter has normalized route and 200 status
    const expectedMetricRegex =
      /http_requests_total\{method="GET",route="\/api\/health",status_code="200"\}\s+([1-9]\d*)/;
    assert.match(
      text,
      expectedMetricRegex,
      "http_requests_total should increment with method, route, and status_code"
    );
  });

  test("5. HTTP request duration histogram observes latency buckets", async () => {
    const res = await fetch(`${baseUrl}/metrics`);
    const text = await res.text();

    const expectedBucketRegex =
      /http_request_duration_seconds_bucket\{le="(\d+(\.\d+)?|\+Inf)",method="GET",route="\/api\/health",status_code="200"\}/;
    assert.match(
      text,
      expectedBucketRegex,
      "http_request_duration_seconds histogram should contain buckets for the route"
    );

    const expectedCountRegex =
      /http_request_duration_seconds_count\{method="GET",route="\/api\/health",status_code="200"\}\s+([1-9]\d*)/;
    assert.match(text, expectedCountRegex, "Histogram count should be >= 1");
  });

  test("6. Route normalization prevents label explosion on parameterized routes", async () => {
    const sampleId1 = "65b987654321fedcba098765";
    const sampleId2 = "65b123456789abcdef012345";
    const originalFindById = Student.findById;

    try {
      // Keep this metrics test independent of MongoDB Atlas availability.
      Student.findById = async () => null;
      await fetch(`${baseUrl}/api/students/${sampleId1}`);
      await fetch(`${baseUrl}/api/students/${sampleId2}`);
    } finally {
      Student.findById = originalFindById;
    }

    const res = await fetch(`${baseUrl}/metrics`);
    const text = await res.text();

    // Verify neither sampleId appears as a route label
    assert.ok(
      !text.includes(sampleId1),
      `Raw ID ${sampleId1} must NOT appear in metrics labels`
    );
    assert.ok(
      !text.includes(sampleId2),
      `Raw ID ${sampleId2} must NOT appear in metrics labels`
    );

    // Both requests should share one Express route-template series.
    assert.ok(
      text.includes('route="/api/students/:id"'),
      'Normalized route "/api/students/:id" should be recorded in metrics'
    );
  });

  test("7. Student API database errors are measured with their final status", async () => {
    const originalFindById = Student.findById;

    try {
      Student.findById = async () => {
        throw new Error("synthetic database failure");
      };
      const response = await fetch(`${baseUrl}/api/students/65b987654321fedcba098765`);
      assert.strictEqual(response.status, 500);
      await response.text();
    } finally {
      Student.findById = originalFindById;
    }

    const metrics = await (await fetch(`${baseUrl}/metrics`)).text();
    assert.match(
      metrics,
      /http_requests_total\{method="GET",route="\/api\/students\/:id",status_code="500"\}\s+1/,
      "The final 500 response should be recorded against the route template"
    );
  });

  test("8. Existing student CRUD routes respond without requiring a database", async () => {
    const originalMethods = {
      find: Student.find,
      findById: Student.findById,
      create: Student.create,
      findByIdAndUpdate: Student.findByIdAndUpdate,
      findByIdAndDelete: Student.findByIdAndDelete,
    };

    try {
      Student.find = () => ({ sort: async () => [] });
      Student.findById = async () => null;
      Student.create = async (student) => ({ _id: "test-id", ...student });
      Student.findByIdAndUpdate = async () => null;
      Student.findByIdAndDelete = async () => null;

      const listResponse = await fetch(`${baseUrl}/api/students`);
      assert.strictEqual(listResponse.status, 200);
      assert.strictEqual((await listResponse.json()).count, 0);

      const getResponse = await fetch(`${baseUrl}/api/students/test-id`);
      assert.strictEqual(getResponse.status, 404);

      const createResponse = await fetch(`${baseUrl}/api/students`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Test Student" }),
      });
      assert.strictEqual(createResponse.status, 201);

      const updateResponse = await fetch(`${baseUrl}/api/students/test-id`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Updated Student" }),
      });
      assert.strictEqual(updateResponse.status, 404);

      const deleteResponse = await fetch(`${baseUrl}/api/students/test-id`, {
        method: "DELETE",
      });
      assert.strictEqual(deleteResponse.status, 404);
    } finally {
      Object.assign(Student, originalMethods);
    }
  });

  test("9. Missing routes (404) are normalized to 'unmatched' and avoid label explosion", async () => {
    const randomRoute1 = `/nonexistent-route-${Date.now()}`;
    const randomRoute2 = `/another-random-path-${Date.now()}`;

    const res1 = await fetch(`${baseUrl}${randomRoute1}`);
    assert.strictEqual(res1.status, 404);

    const res2 = await fetch(`${baseUrl}${randomRoute2}`);
    assert.strictEqual(res2.status, 404);

    const resMetrics = await fetch(`${baseUrl}/metrics`);
    const text = await resMetrics.text();

    // Verify raw paths do NOT appear in labels
    assert.ok(!text.includes(randomRoute1), "Random route 1 must not be in labels");
    assert.ok(!text.includes(randomRoute2), "Random route 2 must not be in labels");

    // Verify normalized 'unmatched' route with 404 status
    const unmatchedRegex =
      /http_requests_total\{method="GET",route="unmatched",status_code="404"\}\s+([1-9]\d*)/;
    assert.match(
      text,
      unmatchedRegex,
      "404 requests should be recorded under route='unmatched' with status_code='404'"
    );
  });

  test("10. GET /metrics excludes itself from request counting", async () => {
    // Fetch metrics multiple times
    await fetch(`${baseUrl}/metrics`);
    await fetch(`${baseUrl}/metrics`);
    await fetch(`${baseUrl}/metrics`);

    const res = await fetch(`${baseUrl}/metrics`);
    const text = await res.text();

    // Verify route="/metrics" does not exist in http_requests_total
    assert.ok(
      !text.includes('route="/metrics"'),
      '/metrics must be excluded from http_requests_total to avoid self-counting recursion'
    );
  });
});
