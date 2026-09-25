# 🌐 DeployForge Router Service (`router`)

> **Dynamic Multi-Tenant Reverse Proxy & Preview Subdomain Dispatcher for DeployForge**

<div align="center">

![Service](https://img.shields.io/badge/Service-Router_v1.0-00F0FF?style=for-the-badge&logo=fastapi&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-v20_Alpine-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express 5](https://img.shields.io/badge/Express-v5.2-000000?style=for-the-badge&logo=express&logoColor=white)
![Proxy](https://img.shields.io/badge/Proxy-http--proxy--middleware-FF6C37?style=for-the-badge)
![Kubernetes](https://img.shields.io/badge/Kubernetes-ClusterIP_Routing-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)

**Instant Sandbox Previews • Subdomain Virtual Host Multiplexing • Zero-Reload Ingress**

[Architecture](#-architecture--how-it-works) • [Host-Based Routing](#-host-based-routing-mechanism) • [Kubernetes Integration](#-kubernetes-cluster-integration) • [Endpoints](#-endpoints) • [Local Development](#-local-development) • [Troubleshooting](#-troubleshooting)

</div>

---

## ⚡ Overview

The **DeployForge Router Service** acts as an intelligent, dynamic reverse proxy layer sitting between the public **NGINX Ingress Controller** and internal sandbox application pods provisioned by DeployForge.

When developers deploy an application through DeployForge, the platform generates an on-demand preview URL in the format:
```text
http://<sandboxId>.preview.localhost
```

The router dynamically inspects incoming HTTP request headers, extracts the `sandboxId`, instantiates or retrieves a cached proxy middleware pipeline, and forwards traffic seamlessly to the corresponding internal Kubernetes service (`delpoyforge-service-<sandboxId>`) with full WebSocket and HTTP/1.1 streaming support.

---

## 🏛 Architecture & How It Works

```
                        [ Browser / Client ]
                                 │
                 http://<id>.preview.localhost/
                                 ▼
                     [ NGINX Ingress Controller ]
                         (frameforge-ingress)
                        Rule: *.preview.localhost
                                 │
                   Forward to router-service:80
                                 ▼
                    [ DeployForge Router Pod ]
                     (Express 5 + Proxy Pool)
                                 │
         1. Parse req.headers.host -> "<sandboxId>.preview.localhost"
         2. Validate subdomain type == "preview"
         3. Lookup or cache proxy instance for sandboxId
         4. Forward to internal ClusterIP Service
                                 │
                                 ▼
                 [ Kubernetes ClusterIP Service ]
                  delpoyforge-service-<sandboxId>:80
                         (targetPort: 3000)
                                 │
                                 ▼
                  [ Deployed Application Pod ]
                   deployforge-pod-<sandboxId>
                   Container listening on :3000
```

---

## 🔀 Host-Based Routing Mechanism

The router inspects the `Host` header of every incoming HTTP request:

```typescript
const host = req.headers.host || "";
const sandboxId = host.split(".")[0]?.trim(); // e.g. "d11b0449-b2ab-47fa-8bfa-6a7a27a72de4"
const type = host.split(".")[1]?.trim();      // e.g. "preview"
```

### Routing Rules

| Subdomain Pattern | Action | Destination |
| :--- | :--- | :--- |
| **`<id>.preview.localhost`** | Dynamically proxied | `http://delpoyforge-service-<id>:80` |
| **`/api/router/health`** | Direct response (200 OK) | Internal health monitor |
| **`/api/router/ready`** | Direct response (200 OK) | Internal readiness monitor |
| **Unknown host or non-preview** | Returns `404 Not Found` | `{ "error": "Invalid preview host" }` |

### Dynamic Proxy Caching
To maintain high throughput and minimize overhead, proxy instances are lazily created and cached in memory per `sandboxId`:

```typescript
const proxies: Record<string, ReturnType<typeof createProxyMiddleware>> = {};

function getOrCreateProxy(sandboxId: string) {
    if (!proxies[sandboxId]) {
        proxies[sandboxId] = createProxyMiddleware({
            target: `http://delpoyforge-service-${sandboxId}`,
            changeOrigin: true,
            ws: true // Full WebSocket & Vite/Next.js HMR support
        });
    }
    return proxies[sandboxId];
}
```

---

## ☸️ Kubernetes Cluster Integration

### 1. Ingress Manifest (`k8s/ingress.yml`)
Routes all wildcard preview traffic to the router service:

```yaml
spec:
  ingressClassName: nginx
  rules:
    - host: "*.preview.localhost"
      http:
        paths:
          - pathType: Prefix
            path: /
            backend:
              service:
                name: router-service
                port:
                  number: 80
```

### 2. Router Deployment (`k8s/router-deployment.yml`)
Runs the router container with liveness and readiness probes:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: router
  labels:
    name: router
spec:
  replicas: 1
  selector:
    matchLabels:
      app: router
  template:
    metadata:
      labels:
        app: router
    spec:
      containers:
        - image: router:latest
          name: router
          imagePullPolicy: IfNotPresent
          resources:
            limits:
              cpu: "500m"
              memory: "512M"
            requests:
              cpu: "250m"
              memory: "256M"
          livenessProbe:
            httpGet:
              path: /api/router/health
              port: 3000
            initialDelaySeconds: 90
            timeoutSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/router/ready
              port: 3000
            initialDelaySeconds: 30
            timeoutSeconds: 10
      restartPolicy: Always
```

### 3. Router Service (`k8s/router-service.yml`)
Exposes the router on port `80` inside the cluster:

```yaml
kind: Service
apiVersion: v1
metadata:
  name: router-service
spec:
  selector:
    app: router
  type: ClusterIP
  ports:
    - name: router-port
      port: 80
      targetPort: 3000
```

---

## 📡 Endpoints

### Direct Endpoints
- **`GET /api/router/health`**: Returns `200 OK` with JSON status payload indicating router liveness.
- **`GET /api/router/ready`**: Returns `200 OK` indicating router readiness for cluster traffic.

### Virtual Host Proxy
- **`ANY /*`** (with `Host: <id>.preview.localhost`): Transparently forwarded to the corresponding sandbox application.

---

## 📁 File Structure

```text
router/
├── Dockerfile          # Multi-stage production container build (Node 20 Alpine)
├── package.json        # Dependencies (Express 5, http-proxy-middleware, morgan, cors)
├── package-lock.json   # Deterministic lockfile
├── server.ts           # Server bootstrap & port binding (default :3000)
├── tsconfig.json       # Strict TypeScript configuration (ES2022 / NodeNext)
└── src/
    └── app.ts          # Express app, CORS, Morgan logging, & dynamic proxy logic
```

---

## 🛠 Local Development

### 1. Install Dependencies
```bash
cd router
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
# Starts on port 3000 with tsx watch
```

### 3. Test Routing Locally via cURL / PowerShell
```powershell
# Verify Health
Invoke-RestMethod -Uri "http://localhost:3000/api/router/health"

# Test Proxy with Mock Sandbox Host
Invoke-RestMethod -Uri "http://localhost:3000" -Headers @{ Host = "<sandboxId>.preview.localhost" }
```

---

## 🔍 Troubleshooting

| Issue | Cause | Fix |
| :--- | :--- | :--- |
| **`404 Not Found (nginx)`** | Ingress controller does not match host | Ensure `k8s/ingress.yml` contains `host: "*.preview.localhost"` and is applied. |
| **`504 Gateway Timeout`** | Target sandbox service is not reachable | Verify that `delpoyforge-service-<id>` exists via `kubectl get svc` and that the application pod is in `Running` state. |
| **`Connection refused` on target** | Port mismatch on the sandbox service | Verify that the target service maps port `80` to the actual app port (typically `3000` or `5173`). |
| **Subdomain does not resolve on client** | DNS resolver configuration | Modern browsers automatically resolve `*.localhost` to `127.0.0.1`. If using custom domain suffixes, add a wildcard entry in your local `hosts` or dnsmasq. |
