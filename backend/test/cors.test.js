const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { createCorsOptions } = require("../src/config/cors");

process.env.FRONTEND_URL = "https://frontend.example.test";
const app = require("../src/app");

describe("CORS origin allowlist", () => {
  let server;
  let baseUrl;

  before(async () => {
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, "127.0.0.1", () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
  });

  test("missing frontend configuration never permits arbitrary origins", () => {
    const checkOrigin = createCorsOptions("").origin;
    checkOrigin("https://unapproved.example.test", (error, allowed) => {
      assert.ifError(error);
      assert.equal(allowed, false);
    });
  });

  for (const origin of [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://frontend.example.test",
  ]) {
    test(`allows configured origin ${origin}`, async () => {
      const response = await fetch(`${baseUrl}/health`, {
        headers: { Origin: origin },
      });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("access-control-allow-origin"), origin);
    });
  }

  test("does not grant access to an unapproved origin", async () => {
    const response = await fetch(`${baseUrl}/health`, {
      headers: { Origin: "https://unapproved.example.test" },
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("access-control-allow-origin"), null);
  });

  test("requests without an Origin header continue to work", async () => {
    const response = await fetch(`${baseUrl}/health`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("access-control-allow-origin"), null);
  });
});
