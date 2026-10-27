# Kubernetes Deployment

## Prerequisites

- Docker Desktop with Kubernetes enabled and a Ready node
- `kubectl` configured for the intended local cluster
- Node.js/npm only if running backend or frontend tests locally
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

A successful `/api/health` response confirms the browser-facing reverse proxy reaches the backend. The backend logs should report a successful MongoDB connection. Student CRUD can then be exercised in the UI; use a uniquely identifiable test student and delete it afterward. Run backend checks with `npm test` from `backend/` and frontend tests with `npm test` from `client/`.

Probe endpoints use the existing `/api/health` endpoint for the backend and `/` for Nginx. Startup probes allow connection setup time; readiness controls Service routing and liveness restarts an unresponsive process. To verify replacement behavior, delete a Pod by name and confirm its Deployment creates a new Ready Pod:

```powershell
kubectl get pods -n student-management
kubectl delete pod <pod-name> -n student-management
kubectl get pods -n student-management -w
```

## Backend Metrics, Prometheus, and Grafana

The backend exposes `GET /metrics` in Prometheus exposition format. Its request counter is `http_requests_total`; its latency histogram is `http_request_duration_seconds`. Both include bounded `method`, Express route-template `route`, and `status_code` labels. `/metrics` scrapes are excluded from those request metrics. The backend Service listens on port `5000`; Prometheus scrapes its fully qualified Service DNS name at `/metrics`.

### Deploy in dependency order

Do not apply manifests until the cluster context is correct. The backend image tag below matches `k8s/backend-deployment.yaml`; rebuild and restart it so the running Pod includes the metrics code:

```powershell
kubectl config current-context
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
docker build -t student-management-backend:k8s-20261027 ./backend
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl rollout restart deployment/backend -n student-management
kubectl rollout status deployment/backend -n student-management --timeout=180s
```

Check `student-management-secrets` exists without displaying its data. Then, in one terminal, port-forward the backend and check `/metrics` in another:

```powershell
kubectl get secret student-management-secrets -n student-management
kubectl port-forward -n student-management service/backend 5000:5000
```

```powershell
(Invoke-WebRequest http://localhost:5000/metrics).Content
```

Apply Prometheus only after the backend endpoint responds:

```powershell
kubectl apply -f k8s/prometheus-config.yaml
kubectl apply -f k8s/prometheus-deployment.yaml
kubectl apply -f k8s/prometheus-service.yaml
kubectl rollout status deployment/prometheus -n student-management --timeout=180s
```

Before deploying Grafana, ensure the existing `grafana-admin` Secret is present and includes the `admin-password` key. `kubectl describe secret` lists key names without revealing values; never use `kubectl get secret -o yaml` for this check. If the Secret is absent, create it from a secure prompt (do not save the password to a file):

```powershell
$securePassword = Read-Host 'Grafana admin password' -AsSecureString
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
    $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
    $encodedPassword = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($password))
    @"
apiVersion: v1
kind: Secret
metadata:
  name: grafana-admin
  namespace: student-management
type: Opaque
data:
  admin-password: $encodedPassword
"@ | kubectl apply -f -
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    Remove-Variable password, encodedPassword -ErrorAction SilentlyContinue
    $securePassword.Dispose()
}
```

Grafana uses the in-cluster datasource URL `http://prometheus.student-management.svc.cluster.local:9090`, provisions the dashboard from `grafana-dashboard.yaml`, and stores state in the `grafana-data` PVC. Check that the cluster has a default StorageClass; then apply the ConfigMaps, claim, Service, and Deployment:

```powershell
kubectl get storageclass
kubectl apply -f k8s/grafana-provisioning.yaml
kubectl apply -f k8s/grafana-dashboard.yaml
kubectl apply -f k8s/grafana-storage.yaml
kubectl apply -f k8s/grafana-service.yaml
kubectl apply -f k8s/grafana-deployment.yaml
kubectl rollout status deployment/grafana -n student-management --timeout=180s
```

### Verify and access

```powershell
kubectl get deployments,pods,services,pvc -n student-management -o wide
kubectl get events -n student-management --sort-by=.lastTimestamp
```

Port-forward Prometheus on local port `9090` and Grafana on local port `13000` (use separate terminals):

```powershell
kubectl port-forward -n student-management service/prometheus 9090:9090
kubectl port-forward -n student-management service/grafana 13000:3000
```

Check scrape target health and query the backend request counter:

```powershell
$targets = Invoke-RestMethod http://localhost:9090/api/v1/targets
$targets.data.activeTargets |
    Where-Object { $_.scrapePool -in @('prometheus', 'student-management-backend') } |
    Select-Object scrapePool, health, lastError, scrapeUrl

Invoke-RestMethod 'http://localhost:9090/api/v1/query?query=http_requests_total%7Bjob%3D%22student-management-backend%22%7D'
```

Open <http://localhost:13000>, sign in as `admin` with the password associated with `grafana-admin`, and use **Connections → Data sources → Prometheus → Save & test** to check datasource connectivity. The Grafana health endpoint is <http://localhost:13000/api/health>. The dashboard includes backend request rate, total requests, rates by HTTP status, and p50/p95 latency panels.

Troubleshooting:

- If the backend Pod is not Ready, check `kubectl describe pod` and `kubectl logs deployment/backend -n student-management`; the application must connect to MongoDB before it starts listening. Verify required Secret/config references without printing Secret values.
- If Prometheus is not Ready, inspect its events/logs and confirm `prometheus-config` is mounted at `/etc/prometheus/prometheus.yml`.
- If `grafana-data` remains Pending, check `kubectl get storageclass` and configure the cluster's supported default provisioner.
- If Grafana has `CreateContainerConfigError`, verify the Secret key and `grafana-config` ConfigMap exist; do not print secret data.
- If the datasource test fails or backend series are absent, check the Prometheus target's `health`/`lastError`, verify the `/metrics` response, and confirm the configured in-cluster Service URL.
- After editing a provisioning ConfigMap, reapply it and restart the Grafana Deployment so environment-based datasource settings are refreshed.

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
