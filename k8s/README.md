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

A successful `/api/health` response confirms the browser-facing reverse proxy reaches the backend. The backend logs should report a successful MongoDB connection. Student CRUD can then be exercised in the UI; use a uniquely identifiable test student and delete it afterward. The repository currently has frontend tests but no backend integration test harness.

Probe endpoints use the existing `/api/health` endpoint for the backend and `/` for Nginx. Startup probes allow connection setup time; readiness controls Service routing and liveness restarts an unresponsive process. To verify replacement behavior, delete a Pod by name and confirm its Deployment creates a new Ready Pod:

```powershell
kubectl get pods -n student-management
kubectl delete pod <pod-name> -n student-management
kubectl get pods -n student-management -w
```

## Prometheus Contract

- Namespace: `student-management`
- Backend Service: `backend`
- Service/application port: `5000` (`http`)
- Metrics path: `/metrics`
- Scrape annotations: `prometheus.io/scrape: "true"`, `prometheus.io/path: /metrics`, and `prometheus.io/port: "5000"`

The current backend does not implement `/metrics`; Tanvi's metrics change must add that endpoint and build a new explicit image tag, then deploy that tag so Kubernetes does not reuse a cached image:

```powershell
docker build -t student-management-backend:k8s-metrics-20261027 ./backend
kubectl set image deployment/backend backend=student-management-backend:k8s-metrics-20261027 -n student-management
kubectl rollout status deployment/backend -n student-management --timeout=180s
```

Update `backend-deployment.yaml` to the new tag before the next manifest apply. Prometheus must use Kubernetes Service/Pod discovery with annotation relabeling enabled, or explicitly scrape `backend.student-management.svc:5000` with `metrics_path: /metrics`. The API Service is reachable inside the cluster; no extra externally exposed port is required.

## Troubleshooting

- `CreateContainerConfigError`: confirm the Secret exists and has key `MONGODB_URI` without printing Secret data: `kubectl describe pod -n student-management <pod-name>`.
- Backend restarts or fails readiness: inspect `kubectl logs -n student-management deployment/backend`; check Atlas network access and the local Secret source.
- `ImagePullBackOff`: rebuild the exact image tag in Docker Desktop and confirm `imagePullPolicy: IfNotPresent`; do not use a remote image name that is not published.
- Frontend loads but API fails: verify the `backend` Service has a ready endpoint and Nginx's `/api/` proxy configuration remains intact.

## Cleanup

Remove only this application's namespace and resources:

```powershell
kubectl delete namespace student-management
```

This does not delete the MongoDB Atlas database or locally built Docker images. Docker Compose and Jenkins configuration are unchanged.
