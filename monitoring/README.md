# Prometheus monitoring

## Architecture

The Express backend exposes `GET /metrics` on port 5000. `src/metrics.js` uses [`@prometheus-io/client`](https://github.com/prometheus/client_js), the official successor to deprecated `prom-client`, with a dedicated Prometheus registry, default Node.js process/runtime metrics, an HTTP request counter, and an HTTP request latency histogram. The dependency was migrated because this repository runs Node 24, which meets the successor's Node.js requirement. Its package name/import changed; upstream also documents behavioral and compatibility changes for gauges, reset behavior, cluster/worker IPC, and TypeScript APIs. This app uses none of those affected features. Prometheus scrapes the endpoint every 15 seconds.

The checked-out `tanvi` branch currently has no backend Docker Compose service or Dockerfile. The included Compose project therefore runs Prometheus in Docker and scrapes a backend running on the host at `host.docker.internal:5000`. Prometheus binds only to `127.0.0.1:9090` on the host. The inspected `origin/main` and `origin/tanu-shree` refs do contain a Docker setup with a backend service named `backend`, port 5000, and a default Compose network; that deployment has not been merged into this branch. `prometheus.docker.yml` provides the corresponding `backend:5000` scrape target for use once Prometheus is attached to that same Compose network.

## Start the backend

Create `backend/.env` from `.env.example` and configure `MONGODB_URI` for normal server startup. Keep that file local; it contains application secrets. Then, from `backend/`, run:

```sh
npm install
npm run dev
```

The server connects to MongoDB before listening. For health checks, request `http://localhost:5000/health` or `http://localhost:5000/api/health`; both return the existing application health response. The metrics endpoint is `http://localhost:5000/metrics`.

## Run automated tests

From `backend/`, run:

```sh
npm test
```

The metrics tests create an ephemeral HTTP server in the same Node.js process and stub MongoDB for student-route cases. They do not require Atlas credentials or an available database.

## Start Prometheus

Start the backend first, then from the repository root run:

```sh
docker compose -f monitoring/compose.yaml up -d
```

Open [http://localhost:9090](http://localhost:9090). Check **Status → Targets** and confirm `student-management-backend` is `UP`. The Prometheus UI is intentionally published only on the local loopback interface.

Check the target directly from the UI or query:

```promql
up{job="student-management-backend"}
```

Generate traffic against `/health`, `/api/health`, and the student API, then allow at least one scrape interval before querying. For local Docker validation, run a request from the host, for example:

```sh
curl http://localhost:5000/health
curl http://localhost:5000/metrics
```

Stop Prometheus with `docker compose -f monitoring/compose.yaml down`. Its time-series data remains in the named `prometheus-data` volume.

## Example PromQL

```promql
# Backend scrape availability
up{job="student-management-backend"}

# Total HTTP request rate
sum(rate(http_requests_total[5m]))

# 4xx and 5xx response rates
sum(rate(http_requests_total{status_code=~"4..|5.."}[5m]))

# 5xx response rate only
sum(rate(http_requests_total{status_code=~"5.."}[5m]))

# 95th percentile request latency in seconds
histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))

# Current Node.js process resident memory in bytes
process_resident_memory_bytes
```

HTTP series use `method`, normalized `route`, and final `status_code` labels. Express route templates are used when available; unmatched paths share the bounded `unmatched` label. `/metrics` is omitted from these HTTP series.

`rate()` needs at least two samples for each series inside its range, so wait for scrapes to accumulate before using the rate queries. Histogram quantiles also need observations; with few requests the 95th percentile can be absent or unrepresentative. A single backend process owns its own in-memory registry. If multiple backend instances run, configure Prometheus to scrape each instance separately; the registries do not aggregate across processes.

## Docker networking

`localhost` inside the Prometheus container means the Prometheus container itself. The included Compose project adds the `host.docker.internal` host-gateway mapping and uses it to reach the host-run backend. For the Docker setup inspected on `origin/main`, use `prometheus.docker.yml` and place Prometheus on the application's default Compose network so it can resolve `backend:5000`; a separately launched Compose project has a different default network unless both projects are explicitly configured to share one. Do not use the host-gateway target for a backend that is only reachable on a separate Docker network.

## Kubernetes integration

There are no Kubernetes manifests in this checkout, so Kubernetes scraping has not been configured or verified. Coordinate with Tanu Shree before adding or renaming shared resources. The integration needs the exact backend `Service` name, namespace, and service port (or named port), plus confirmation that `/metrics` is reachable through that Service. Configure Prometheus with the resulting in-cluster DNS target, for example `<service>.<namespace>.svc:<port>`, and `metrics_path: /metrics`. Do not put Atlas credentials or other application secrets in Prometheus configuration.

## Troubleshooting

- **Target is DOWN / connection refused:** confirm the backend is listening on port 5000 and `/metrics` works from the host. This app starts listening only after its MongoDB connection succeeds.
- **Target cannot resolve `host.docker.internal`:** use Docker Desktop or retain the `host-gateway` mapping in `monitoring/compose.yaml`; check that the backend is bound to an interface reachable from Docker, not only `127.0.0.1`.
- **Metrics show HELP/TYPE but no HTTP samples:** make requests to health or API endpoints before querying; the middleware records observations when responses complete. The test suite runs its app and `/metrics` in one process, while a manually started backend must be restarted after source changes.
- **Student requests take a long time in tests:** monitoring tests stub the Mongoose model so they do not wait for MongoDB buffering or Atlas timeouts.
- **Prometheus configuration errors:** inspect Prometheus container logs with `docker compose -f monitoring/compose.yaml logs prometheus` and validate edits against the Prometheus configuration reference.

## Limitations

Prometheus startup and scraping must be verified in an environment with a reachable Docker daemon and a running backend. Kubernetes scraping remains pending the service details from the Kubernetes owner. The current repository has no Compose definition for the application itself, so local Prometheus uses host-gateway networking.
