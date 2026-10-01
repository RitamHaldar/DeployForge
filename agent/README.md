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
- **Ignored Directories**: `node_modules`, `dist`, `build`, `out`, `.next`, `.nuxt`, `.output`, `.venv`, `venv`, `.git`, `.vscode`, `.idea`, `coverage`, `tmp`, `logs`, etc.
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

### 4. Read Workspace Files
- **Route**: `POST /api/agent/readfile`
- **Description**: Reads the contents of one or more workspace files specified as a comma-separated string.
- **Request Body**:
  ```json
  {
    "files": "package.json, src/App.tsx"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Files read successfully",
    "status": "success",
    "data": [
      {
        "package.json": "{\n  \"name\": \"my-app\",\n  \"version\": \"1.0.0\"...\n}"
      },
      {
        "src/App.tsx": "import React from 'react';\nexport default function App() { ... }"
      }
    ]
  }
  ```
- **Error Response (`400 Bad Request`)**:
  ```json
  {
    "message": "Filename is required and must be a comma-separated string",
    "status": "error",
    "data": null
  }
  ```

### 5. Update Workspace Files
- **Route**: `PATCH /api/agent/updateFile`
- **Description**: Atomically applies code edits or creates new files inside the workspace directory, automatically ensuring parent directories exist (`fs.mkdir(..., { recursive: true })`).
- **Request Body**:
  ```json
  {
    "updates": [
      {
        "file": "src/App.tsx",
        "content": "export default function App() { return <h1>Fixed!</h1>; }"
      }
    ]
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Files updated successfully",
    "status": "success",
    "data": [
      {
        "/workspace/src/App.tsx": "File updated successfully"
      }
    ]
  }
  ```
- **Error Response (`400 Bad Request`)**:
  ```json
  {
    "message": "Updates is required and must be an array",
    "status": "error",
    "data": null
  }
  ```

---

## 🧠 Autonomous AI Debugging Agent

The sidecar houses an autonomous debugging agent built on **LangChain**:

- **Model Hierarchy**: Prioritizes Mistral AI (`codestral-latest`) for code reasoning, with seamless fallback to NVIDIA NIM (`openai/gpt-oss-20b`).
- **Agent Protocol**: Governed by strict operational directives:
  1. **Read & Diagnose**: Inspect the complete error trace, failing command, and missing modules before touching any code.
  2. **Structure First**: Always call `fileListTool` first to map actual file paths. Never guess filenames.
  3. **Inspect Relevant Files**: Inspect `package.json`, lockfiles, configs, and source files via `readfileTool`.
  4. **Minimal Targeted Fix**: Apply the smallest surgical edit using `updateFileTool`. Never rewrite whole files, downgrade dependencies unnecessarily, or inject temporary hacks.
- **Sidecar Agent Tools (`src/utils/tools.ts`)**:
  - `fileListTool`: Queries `/api/agent/listFiles` on the target agent URL.
  - `readfileTool`: Queries `/api/agent/readfile` on the target agent URL.
  - `updateFileTool`: Dispatches file changes to `/api/agent/updateFile`.

---

## 📂 Project Structure

```text
agent/
├── src/
│   ├── app.ts                  # Express application, routes, listFiles, readfile, and updateFile
│   ├── config/
│   │   └── config.ts           # Centralized environment config (NVIDIA & Mistral API keys)
│   ├── controllers/
│   │   └── agent.controller.ts # Agent execution controller
│   └── utils/
│       ├── agent.ts            # LangChain debugging agent & system prompt definition
│       └── tools.ts            # LangChain tools (fileListTool, readfileTool, updateFileTool)
├── Dockerfile                  # Node 25 Alpine container image for in-pod deployment
├── package.json                # Dependencies, LangChain SDKs, tsx runtime, and scripts
├── server.ts                   # Entrypoint binding to port 4000
├── tsconfig.json               # Strict TypeScript NodeNext compiler configuration
├── .dockerignore               # Build exclusion rules
└── README.md                   # Service documentation
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root of the `agent` directory (also populated via Kubernetes secrets in pod deployments):

| Variable | Type | Description |
| :--- | :--- | :--- |
| `PORT` | `number` | Port on which the agent listens (defaults to `4000`) |
| `WORKSPACE_DIR` | `string` | Shared workspace directory path (defaults to `/workspace`) |
| `MISTRAL_API_KEY` | `string` | Mistral AI API key (uses `codestral-latest` for debugging) |
| `NVIDIA_API_KEY` | `string` | NVIDIA NIM API key (fallback model `openai/gpt-oss-20b`) |

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

