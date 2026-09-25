# 🤖 DeployForge Agent Sidecar (`/agent`)

> **In-pod autonomous sidecar agent providing live workspace inspection, health telemetry, and developer tool APIs for deployed application sandboxes.**

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express 5](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Node_25_Alpine-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Port](https://img.shields.io/badge/Port-4000-FF6B6B?style=for-the-badge)

</div>

---

## 📖 Overview

The **Agent Sidecar** is a lightweight Node.js/TypeScript microservice deployed co-located alongside each user's application container inside the Kubernetes sandbox pod (`deployforge-pod-<sandboxId>`).

It mounts a shared Kubernetes volume (`workspace-volume`) at `/workspace`, enabling real-time file tree analysis, code inspection, and future autonomous debugging/healing workflows without interfering with the user's primary application runtime.

---

## 🏛️ In-Pod Architecture

Inside the deployed Kubernetes Pod, the `agent` acts as a sidecar:

```text
┌─────────────────────────────────────────────────────────────┐
│ Pod: deployforge-pod-<sandboxId>                            │
│                                                             │
│  ┌────────────────────────┐     ┌────────────────────────┐  │
│  │  App Sandbox Container │     │  Agent Sidecar Container│ │
│  │   (Vite / Node / App)  │     │      (Express 5)       │  │
│  │      Port: 5173        │     │       Port: 4000       │  │
│  └───────────┬────────────┘     └───────────┬────────────┘  │
│              │                              │               │
│              ▼                              ▼               │
│      Mount: /workspace              Mount: /workspace       │
│              ▲                              ▲               │
│              └──────────────┬───────────────┘               │
│                             │                               │
│                 ┌───────────┴──────────┐                    │
│                 │  emptyDir Volume     │                    │
│                 │  (workspace-volume)  │                    │
│                 └──────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

1. **Init Container Seeding**: An init container seeds the user's project files into `workspace-volume` at `/seed`.
2. **Shared Volume**: Both the app container and the agent mount `workspace-volume` at `/workspace`.
3. **Dedicated Port**: The agent listens on port `4000`, completely isolated from any port `3000` or `5173` used by the application container.
4. **Subdomain Routing**: Requests to `http://<sandboxId>.agent.localhost` are automatically routed by DeployForge's Router Gateway to port `4000` of the corresponding sandbox service.

---

## 🔌 API Endpoints

### 1. Health Probe
- **Route**: `GET /api/agent/health`
- **Description**: Liveness probe to verify the agent process is healthy.
- **Response**:
  ```json
  {
    "message": "Ai agent Running Healthy"
  }
  ```

### 2. Readiness Probe
- **Route**: `GET /api/agent/ready`
- **Description**: Readiness probe confirming the agent is initialized and ready to handle traffic.
- **Response**:
  ```json
  {
    "message": "Ai agent Ready"
  }
  ```

### 3. List Workspace Files
- **Route**: `GET /api/agent/listFiles`
- **Description**: Recursively traverses `/workspace` and returns all relative file paths and directories in JSON.
- **Ignored Directories**: `node_modules`, `.git`, `.vscode`, `dist`
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Files listed successfully",
    "status": "success",
    "data": [
      "src/",
      "src/App.tsx",
      "src/main.tsx",
      "src/components/",
      "src/components/Header.tsx",
      "public/",
      "public/favicon.ico",
      "package.json",
      "tsconfig.json",
      "vite.config.ts"
    ]
  }
  ```
- **Error Response (`500 Internal Server Error`)**:
  ```json
  {
    "message": "Failed to list files",
    "status": "error",
    "data": "ENOENT: no such file or directory, scandir '/workspace'"
  }
  ```

---

## 📂 Project Structure

```text
agent/
├── src/
│   └── app.ts           # Express application, routes, and recursive listFiles logic
├── Dockerfile           # Node 25 Alpine container image for in-pod deployment
├── package.json         # Dependencies, tsx runtime, and scripts
├── server.ts            # Entrypoint binding to port 4000
├── tsconfig.json        # Strict TypeScript NodeNext compiler configuration
├── .dockerignore        # Build exclusion rules
└── README.md            # Service documentation
```

---

## 🛠️ Local Development & Testing

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally in Development Mode
Uses `tsx watch` for hot-reloading:
```bash
npm run dev
# Server running on http://localhost:4000
```

> **Note**: When testing locally without Docker/Kubernetes, create a local `/workspace` folder on your machine or adjust `WORKSPACE_DIR` in `src/app.ts` for scratch testing.

### 3. Build & Typecheck
```bash
# Typecheck with TypeScript
npx tsc --noEmit

# Production execution
npm start
```

### 4. Build Docker Container
```bash
docker build -t agent:latest .
```

---

## 🔗 Integration with DeployForge Services

- **`healservice`**: Dynamically defines the `agent` container spec in `src/k8s/pod.ts` with `ports: [{ containerPort: 4000 }]` and creates the `deployforge-service-<id>` mapping `port: 4000 ➔ targetPort: 4000`.
- **`router`**: Inspects the incoming host header for `.agent.` and proxies to `http://deployforge-service-<sandboxId>:4000`.
- **`k8s/ingress.yml`**: Exposes `*.agent.localhost` through the cluster NGINX Ingress controller.
- **`skaffold.yml`**: Continuously builds and synchronizes the `agent` image during local cluster development.
