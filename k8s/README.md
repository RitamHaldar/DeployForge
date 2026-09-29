# ☸️ DeployForge Kubernetes Cluster Infrastructure (`/k8s`)

> **Production & Local Kubernetes Manifests, Ingress Controllers, Dynamic Subdomain Routing, RBAC, and Sandbox Workloads**

<div align="center">

![Kubernetes](https://img.shields.io/badge/Kubernetes-v1.30+-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![NGINX Ingress](https://img.shields.io/badge/NGINX-Ingress_Controller-009639?style=for-the-badge&logo=nginx&logoColor=white)
![Skaffold](https://img.shields.io/badge/Skaffold-v2_Automation-1772F6?style=for-the-badge&logo=googlecloud&logoColor=white)
![RBAC](https://img.shields.io/badge/Security-Cluster_RBAC-10B981?style=for-the-badge&logo=shield&logoColor=white)

</div>

---

## ⚡ Overview

The `/k8s` directory contains all declarative Kubernetes manifests required to run the DeployForge cloud deployment engine. It defines:
1. **Core Microservices**: Identity & Auth (`auth`), Orchestration & Healing (`healservice`), and the Dynamic Reverse Proxy (`router`).
2. **Unified Ingress Layer**: NGINX Ingress rules multiplexing API endpoints and wildcard subdomains (`*.preview.localhost` and `*.agent.localhost`).
3. **Role-Based Access Control (RBAC)**: Least-privilege cluster permissions empowering the `heal-service` controller to build images, schedule pods, tail logs, and provision services.
4. **Secrets & Configs**: Centralized environment credentials, OAuth secrets, MongoDB connections, and JWT encryption keys.
5. **Multi-Container Sandbox Architecture**: Dynamic pods hosting user application containers alongside co-located developer agent sidecars.

---

## 🏛️ Cluster Topology & Traffic Routing

```text
                                [ Client / Developer Browser ]
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         http://localhost/api/*                       http://<id>.preview.localhost
       (e.g., /api/auth, /api/k8s)                    http://<id>.agent.localhost
                      │                                               │
                      └───────────────────────┬───────────────────────┘
                                              ▼
                                 [ NGINX Ingress Controller ]
                                     (ingress-nginx / k8s)
                                              │
         ┌────────────────────────────────────┼────────────────────────────────────┐
         │                                    │                                    │
         ▼                                    ▼                                    ▼
[ Host: /api/auth/* ]                [ Host: /api/k8s/* ]             [ Host: *.preview.localhost ]
         │                           [ Host: /api/github/* ]          [ Host: *.agent.localhost ]
         ▼                                    │                                    │
   auth-service:80                            ▼                                    ▼
         │                             heal-service:80                      router-service:80
         ▼                                    │                                    │
  [ auth-pod:3000 ]                   [ heal-pod:3000 ]                     [ router-pod:3000 ]
  (Express 5 Auth)                    (Docker & K8s Engine)                 (Proxy Pool Gateway)
                                              │                                    │
                                  POST /api/k8s/deploy                             │
                                  Builds image & schedules                         │
                                              │                                    │
                                              ▼                                    ▼
                              [ deployforge-pod-<id> ] ◄──────────── deployforge-service-<id>
                              ├── init: workspace-seed               ├── port 80 -> appPort
                              ├── app:  user application             └── port 4000 -> 4000
                              └── agent: in-pod sidecar:4000
```

---

## 📁 Manifest Catalog

| File | Resource Kind | Service / Component | Description |
| :--- | :--- | :--- | :--- |
| **[`ingress.yml`](file:///c:/Users/RH/Desktop/DeployForge/k8s/ingress.yml)** | `Ingress` | NGINX Controller | Global ingress routes for `/api/auth`, `/api/k8s`, `/api/github`, and wildcards `*.preview.localhost` / `*.agent.localhost`. |
| **[`auth-deployment.yml`](file:///c:/Users/RH/Desktop/DeployForge/k8s/auth-deployment.yml)** | `Deployment` | `auth` | 1-replica deployment running the Auth microservice with resource limits (250m CPU, 256Mi RAM). |
| **[`auth-service.yml`](file:///c:/Users/RH/Desktop/DeployForge/k8s/auth-service.yml)** | `Service` | `auth-service` | ClusterIP service exposing the Auth pod on port 80 (targets containerPort 3000). |
| **[`heal-deployment.yml`](file:///c:/Users/RH/Desktop/DeployForge/k8s/heal-deployment.yml)** | `Deployment` | `heal` | Deployment running the Orchestration/Controller engine with mounted `/var/run/docker.sock` and assigned `heal-service-account`. |
| **[`heal-service.yml`](file:///c:/Users/RH/Desktop/DeployForge/k8s/heal-service.yml)** | `Service` | `heal-service` | ClusterIP service exposing the Heal engine on port 80 (targets containerPort 3000). |
| **[`router-deployment.yml`](file:///c:/Users/RH/Desktop/DeployForge/k8s/router-deployment.yml)** | `Deployment` | `router` | Dynamic multi-tenant reverse proxy deployment inspecting `Host` headers and forwarding to sandbox services. |
| **[`router-service.yml`](file:///c:/Users/RH/Desktop/DeployForge/k8s/router-service.yml)** | `Service` | `router-service` | ClusterIP service exposing the Router on port 80 (targets containerPort 3000). |
| **[`rabac.yml`](file:///c:/Users/RH/Desktop/DeployForge/k8s/rabac.yml)** | `ServiceAccount`, `ClusterRole`, `ClusterRoleBinding` | `heal-service-account` | RBAC binding granting the controller permissions over Pods, Services, Namespaces, and Pod logs. |
| **[`secrets.yml`](file:///c:/Users/RH/Desktop/DeployForge/k8s/secrets.yml)** | `Secret` | `app-secret` | Base64-encoded cluster secrets including `MONGO_URI`, `JWT_TOKEN`, and OAuth client credentials. |

---

## 📦 Multi-Container Sandbox Pod Architecture

When a developer triggers a deployment from the frontend repository dashboard, the `heal-service` controller declaratively schedules an isolated sandbox pod named `deployforge-pod-<sandboxId>`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: deployforge-pod-<sandboxId>
  labels:
    app: sandbox-<sandboxId>
spec:
  volumes:
    - name: workspace-volume
      emptyDir: {}
  initContainers:
    - name: seed-workspace
      image: sandbox-<sandboxId>:latest
      command: ["sh", "-c", "cp -a /app/. /workspace/"]
      volumeMounts:
        - name: workspace-volume
          mountPath: /workspace
  containers:
    - name: app
      image: sandbox-<sandboxId>:latest
      ports:
        - containerPort: <dynamic-app-port> # Auto-detected (e.g. 3000, 5173, 8080)
      resources:
        limits:
          cpu: "1000m"
          memory: "512Mi"
        requests:
          cpu: "250m"
          memory: "128Mi"
    - name: supervisor
      image: agent:latest
      ports:
        - containerPort: 4000
      volumeMounts:
        - name: workspace-volume
          mountPath: /workspace
```

### Companion ClusterIP Service (`deployforge-service-<sandboxId>`)
A corresponding service is provisioned alongside every sandbox pod to provide predictable, cluster-internal DNS endpoints:
- **Port `80`**: Maps directly to the application container's auto-detected port (`<dynamic-app-port>`).
- **Port `4000`**: Maps directly to the co-located developer agent container (`agent:4000`).

---

## 🔒 Security & RBAC Configuration

The `healservice` container requires cluster privileges to monitor cluster health, deploy sandbox pods, and stream stdout/stderr logs. This is governed by [`rabac.yml`](file:///c:/Users/RH/Desktop/DeployForge/k8s/rabac.yml):

- **ServiceAccount**: `heal-service-account` in namespace `default`.
- **ClusterRole**: `heal-cluster-role` granting:
  - `apiGroups: [""]`: Resources `["pods", "pods/log", "services", "namespaces", "nodes"]` with verbs `["get", "list", "watch", "create", "update", "delete"]`.
- **ClusterRoleBinding**: `heal-cluster-role-binding` associating `heal-service-account` with `heal-cluster-role`.

---

## 🛠️ Operational Commands & Debugging

### Inspecting Running DeployForge Pods
```bash
# List all DeployForge application and sandbox pods
kubectl get pods -l app -o wide

# Check cluster service mapping
kubectl get svc
```

### Viewing Real-Time Pod Logs
```bash
# Tail logs from the Heal orchestration engine
kubectl logs -l app=heal -f

# Tail logs from the Router proxy gateway
kubectl logs -l app=router -f

# Tail application container logs from a specific deployed sandbox pod
kubectl logs deployforge-pod-<id> -c app -f

# Tail sidecar agent logs from the same sandbox pod
kubectl logs deployforge-pod-<id> -c supervisor -f
```

### Ingress Verification
```bash
# Verify NGINX Ingress rules and hosts
kubectl describe ingress frameforge-ingress
```

### Hot Development with Skaffold
DeployForge is configured with `skaffold.yml` to automatically build container images, sync source files, and deploy manifests upon file modification:
```bash
# Run local live continuous development pipeline
skaffold dev

# Clean up all deployed resources
skaffold delete
```
