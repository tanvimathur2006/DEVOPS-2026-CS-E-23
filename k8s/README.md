# Kubernetes Deployment

## Prerequisites

- Docker Desktop with Kubernetes enabled and a Ready node
- `kubectl` configured for the intended local cluster
- Node.js/npm only if running the frontend tests locally
- `backend/.env` containing a valid `MONGODB_URI` for MongoDB Atlas; this ignored local file must not be committed

The backend connects to Atlas at startup. Atlas must allow connections from the cluster's outbound network, and its database user must have the required student collection permissions.

## Build Local Images

From the repository root, build both images with the same explicit tag:

```powershell
docker build -t student-management-backend:k8s-20261027 ./backend
docker build -t student-management-frontend:k8s-20261027 ./client
```

The local Docker Desktop Kubernetes cluster uses the Docker Desktop image store. The Deployments use `IfNotPresent`, so these locally built tags are not pulled from a remote registry.

## Configure the Atlas Secret

Create or update the Kubernetes Secret directly from the ignored local environment file. This command does not print the value:

```powershell
kubectl create namespace student-management --dry-run=client -o yaml | kubectl apply -f -
kubectl create secret generic student-management-secrets `
  --namespace student-management `
  --from-env-file=backend/.env `
  --dry-run=client -o yaml | kubectl apply -f -
```

The Deployment reads only `MONGODB_URI`. `secret.yaml` is a credential-free placeholder and must not be applied; use the command above so no real credential is stored in tracked YAML. Do not paste credentials into shell commands or commit them.

## Deploy

Build the images and configure the Secret first, then apply the application resources:

```powershell
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl rollout status deployment/backend -n student-management --timeout=180s
kubectl rollout status deployment/frontend -n student-management --timeout=180s
```

The frontend container's existing Nginx configuration proxies `/api/` to `backend:5000`. Kubernetes resolves that Service name inside the namespace, so the browser uses the same origin for both UI and API.

## Access and Verify

Run this command in a terminal and leave it running:

```powershell
kubectl port-forward -n student-management service/frontend 8080:80
```

Open <http://localhost:8080>. In another terminal, inspect status and exercise the health route through the frontend proxy:

```powershell
kubectl get deployments,pods,services -n student-management -o wide
kubectl get events -n student-management --sort-by=.lastTimestamp
kubectl logs -n student-management deployment/backend
kubectl logs -n student-management deployment/frontend
Invoke-RestMethod http://localhost:8080/api/health
```

A successful `/api/health` response confirms the browser-facing reverse proxy reaches the backend. The backend logs should report a successful MongoDB connection. Student CRUD can then be exercised in the UI; use a uniquely identifiable test student and delete it afterward. The backend test suite is available from `backend/` with `npm test`; it includes metrics and route-level tests that stub database operations.

Probe endpoints use the existing `/api/health` endpoint for the backend and `/` for Nginx. Startup probes allow connection setup time; readiness controls Service routing and liveness restarts an unresponsive process. To verify replacement behavior, delete a Pod by name and confirm its Deployment creates a new Ready Pod:

```powershell
kubectl get pods -n student-management
kubectl delete pod <pod-name> -n student-management
kubectl get pods -n student-management -w
```

## Prometheus Monitoring

The backend exposes Prometheus metrics at `/metrics` on its existing port `5000`. The `http_requests_total` counter and `http_request_duration_seconds` histogram record method, matched route, and status code. The plain Prometheus Deployment scrapes the backend Service at `backend.student-management.svc.cluster.local:5000`; the Service selects Pods labelled `app: backend`. Prometheus uses an internal ClusterIP Service and is not exposed publicly.

After building the backend image with the current manifest tag, create the database Secret as described above and deploy in this order:

```powershell
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/prometheus-config.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/prometheus-deployment.yaml
kubectl apply -f k8s/prometheus-service.yaml
kubectl rollout status deployment/backend -n student-management --timeout=180s
kubectl rollout status deployment/prometheus -n student-management --timeout=180s
```

`k8s/secret.yaml` has no credentials and is a placeholder. For local use, place `MONGODB_URI` in the ignored `backend/.env` file and create/update the Secret with the earlier `kubectl create secret generic ... --from-env-file=backend/.env` command. Never commit real credentials; the Deployment reads `MONGODB_URI` from the Secret while `configmap.yaml` contains only non-secret settings. After backend code changes, rebuild the manifest's image tag and restart the Deployment so its Pods use the rebuilt image:

```powershell
docker build -t student-management-backend:k8s-20261027 ./backend
kubectl rollout restart deployment/backend -n student-management
kubectl rollout status deployment/backend -n student-management --timeout=180s
```

Forward the Prometheus UI port in a terminal:

```powershell
kubectl port-forward -n student-management service/prometheus 9090:9090
```

Open <http://localhost:9090>, select **Status → Targets**, and confirm `student-management-backend` is `UP`. To query request counts, enter `http_requests_total` in the expression field. Generate traffic with `Invoke-RestMethod http://localhost:8080/api/health` (with the frontend port-forward running) or `kubectl port-forward service/backend 5000:5000 -n student-management` and query `http://localhost:5000/api/health` directly.

For local Docker Compose monitoring, first start the backend on the host as described in `monitoring/README.md`, then from the repository root run `docker compose -f monitoring/compose.yaml up -d`. Open <http://localhost:9090>. This Compose file runs Prometheus and uses `host.docker.internal:5000` to reach the host backend; Kubernetes uses its Service DNS name.

## Troubleshooting

- `CreateContainerConfigError`: confirm the Secret exists and has key `MONGODB_URI` without printing Secret data: `kubectl describe pod -n student-management <pod-name>`.
- Backend restarts or fails readiness: inspect `kubectl logs -n student-management deployment/backend`; check Atlas network access and the local Secret source.
- `ImagePullBackOff`: rebuild the exact image tag in Docker Desktop and confirm `imagePullPolicy: IfNotPresent`; do not use a remote image name that is not published.
- Frontend loads but API fails: verify the `backend` Service has a ready endpoint and Nginx's `/api/` proxy configuration remains intact.
- Prometheus backend target is `DOWN`: check backend readiness and endpoints with `kubectl get pods,services,endpoints -n student-management`; confirm `/metrics` is reachable at `http://backend.student-management.svc.cluster.local:5000/metrics` from inside the cluster and inspect `kubectl logs deployment/prometheus -n student-management`.

## Cleanup

Remove only this application's namespace and resources:

```powershell
kubectl delete namespace student-management
```

This does not delete the MongoDB Atlas database or locally built Docker images. Docker Compose and Jenkins configuration are unchanged.
