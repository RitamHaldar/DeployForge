# 🩺 DeployForge Heal & Orchestration Service (`healservice`)

The **DeployForge Heal Service** is the deployment orchestration, container virtualization, and Kubernetes cluster management engine for DeployForge. Built with **Node.js**, **Express 5**, **TypeScript**, **Dockerode**, and the **Kubernetes Client Node SDK**, it manages sandbox container builds, pod scheduling, live log streaming, and GitHub repository synchronization.

---

## 📑 Table of Contents

- [Features](#-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Folder Structure](#-folder-structure)
- [Prerequisites](#-prerequisites)
- [Environment Variables](#-environment-variables)
- [Installation & Local Setup](#-installation--local-setup)
- [API Reference & Endpoints](#-api-reference--endpoints)
  - [1. Kubernetes Pod Monitoring & Logs](#1-kubernetes-pod-monitoring--logs)
  - [2. GitHub User Repositories](#2-github-user-repositories)
  - [3. Docker Container Deployment Engine](#3-docker-container-deployment-engine)
- [Kubernetes & Docker Engine Architecture](#-kubernetes--docker-engine-architecture)
- [Available Scripts](#-available-scripts)

---

## ✨ Features

- **Kubernetes Cluster Management**:
  - Automatically connects via local or in-cluster `KubeConfig`.
  - Filters and queries non-system application pods across all namespaces.
  - Streams real-time pod tail logs (last 100 lines) for troubleshooting.
  - Deploys namespaced application pods with CPU and memory resource quotas.
- **Docker Sandboxed Build & Deployment**:
  - Clones user Git repositories on-demand using `simple-git` with token authentication.
  - Automatic `Dockerfile` synthesis (defaults to modern Node.js 22 Alpine) if the repo lacks one.
  - Streams repository source as tarball archives directly into the Docker Engine daemon.
  - Runs isolated sandbox containers with CPU caps (1 core), memory limits (512MB), and dynamic host port assignment.
- **GitHub Repository Synchronization**:
  - Securely accesses user repositories via Octokit using the stored `GitHubAccessToken`.
  - Protected with JWT cookie verification middleware (`VerifyUser`).
- **End-to-End Type Safety**:
  - Typed request interfaces (`AuthRequest`, `UserPayload`) guaranteeing validated user contexts.

---

## 🛠 Architecture & Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (v20+)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (ES2022 / NodeNext)
- **Framework**: [Express.js](https://expressjs.com/) (v5)
- **Containerization Engine**: [Dockerode](https://github.com/apocas/dockerode) & Docker Engine API (`/var/run/docker.sock`)
- **Kubernetes Client**: [@kubernetes/client-node](https://github.com/kubernetes-client/javascript) (`CoreV1Api`)
- **AI Orchestration & Agent**: [LangChain](https://js.langchain.com/), [@langchain/mistralai](https://www.npmjs.com/package/@langchain/mistralai) (`codestral-latest`), and [@langchain/openai](https://www.npmjs.com/package/@langchain/openai) (`openai/gpt-oss-20b` via NVIDIA NIM)
- **Git & GitHub Integration**: [Octokit REST](https://github.com/octokit/rest.js), [simple-git](https://github.com/steveukx/git-js), and [tar-fs](https://github.com/mafintosh/tar-fs)
- **Database & Auth**: [Mongoose](https://mongoosejs.com/) & [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- **Realtime / Sockets**: [Socket.io](https://socket.io/) (for real-time events)

---

## 📁 Folder Structure

```text
healservice/
├── package.json                  # Dependencies, build tools, and scripts
├── server.ts                     # Entry point (binds Express & tests K8s cluster connectivity)
├── tsconfig.json                 # TypeScript compiler configuration (NodeNext, Strict)
└── src/
    ├── app.ts                    # Express application instance and route mounting
    ├── config/
    │   ├── config.ts             # Centralized environment variable loader (MONGO_URI, JWT_TOKEN, AI keys)
    │   └── db.ts                 # MongoDB Mongoose connection utility
    ├── controller/
    │   ├── docker.controller.ts  # Git clone, Docker build, and container run orchestration
    │   ├── github.controller.ts  # GitHub repository fetcher using user's OAuth access token
    │   └── k8s.controller.ts     # Kubernetes cluster query, pod log retrieval, and build orchestration
    ├── github/
    │   └── clone.ts              # Docker daemon client, cleanDockerfile extractor & safety validator
    ├── k8s/
    │   ├── kubernetes.ts         # Kubernetes KubeConfig initialization & CoreV1Api client
    │   ├── pod.ts                # Pod deployment with dynamic containerPort & agent sidecar
    │   └── service.ts            # Kubernetes Service provisioner with dynamic targetPort mapping
    ├── middleware/
    │   └── user.middleware.ts    # JWT verification middleware & AuthRequest type definitions
    ├── models/
    │   └── user.model.ts         # User model reference to retrieve GitHub access tokens
    ├── routes/
    │   ├── github.routes.ts      # Router for GitHub repository operations
    │   └── k8s.routes.ts         # Router for Kubernetes pod queries and log streams
    └── utils/
        ├── agent.ts              # LangChain ReAct Docker agent with framework-specific templates
        └── tools.ts              # Workspace inspection tools (fileListTool, readfileTool with safety limits)
```

---

## 📋 Prerequisites

Before running the service, make sure you have:

1. **Node.js** (v20.x or higher) and **npm**.
2. A running **Kubernetes cluster** (e.g. Minikube, Kind, Docker Desktop Kubernetes, or remote cloud cluster) with a valid `~/.kube/config`.
3. **Docker Daemon** running locally with the Docker socket available at `/var/run/docker.sock` (or Docker Desktop on Windows/macOS).
4. A running **MongoDB** database instance containing user accounts created by the Auth service.
5. A **Mistral AI API Key** (`MISTRAL_API_KEY`) or **NVIDIA API Key** (`NVIDIA_API_KEY`) for AI Dockerfile synthesis.

---

## ⚙️ Environment Variables

Create a `.env` file in the root of the `healservice` directory:

| Variable | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `PORT` | `number` | Port on which the Heal service listens | `3000` |
| `MONGO_URI` | `string` | MongoDB connection URI matching the Auth service | `mongodb+srv://...` |
| `JWT_TOKEN` | `string` | Secret key used to verify user auth cookies | `your_jwt_secret` |
| `MISTRAL_API_KEY` | `string` | Mistral API key (uses `codestral-latest` for Dockerfile synthesis) | `your_mistral_api_key` |
| `NVIDIA_API_KEY` | `string` | NVIDIA NIM API key (fallback model `openai/gpt-oss-20b`) | `nvapi-...` |

---

## 🚀 Installation & Local Setup

1. **Navigate to the service directory**:
   ```bash
   cd healservice
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start in development mode (hot reloading)**:
   ```bash
   npm run dev
   ```

4. **Compile TypeScript & run production build**:
   ```bash
   npm run build
   npm start
   ```

On startup, the service will verify connectivity with your active Kubernetes context and print active non-system pods:
```text
[KubeHeal Controller] Running on http://localhost:3000
[KubeHeal Controller] Connected to Kubernetes. Detected 2 application pods:
  • default/my-app-pod
```

---

## 📡 API Reference & Endpoints

### 1. Kubernetes Pod Monitoring & Logs

#### List Active Pods
Returns running application pods, automatically filtering out Kubernetes system namespaces (`kube-system`, `kube-public`, `kube-node-lease`, `ingress-nginx`).

- **URL**: `/api/k8s/nodes`
- **Method**: `GET`
- **Response (`200 OK`)**:
  ```json
  {
    "message": "nodes fetched successfully",
    "nodes": [
      {
        "name": "api-deployment-7f8d9b-x8q1",
        "namespace": "default",
        "status": "Running"
      }
    ]
  }
  ```

#### Fetch Pod Logs
Retrieves the most recent 100 log lines from a specified pod in the `default` namespace.

- **URL**: `/api/k8s/get-logs?podname=<pod-name>`
- **Method**: `GET`
- **Query Parameters**:
  - `podname` (*required*): Name of the target pod
- **Response (`200 OK`)**:
  ```json
  {
    "message": "logs fetched successfully",
    "logs": {
      "response": "Server listening on port 3000\nConnected to database\n..."
    }
  }
  ```

---

### 2. GitHub User Repositories

#### List Authenticated User Repositories
Fetches the user's latest 50 repositories from GitHub using the user's saved `GitHubAccessToken`.

- **URL**: `/api/github/repos`
- **Method**: `GET`
- **Authentication**: Requires valid `token` cookie (JWT).
- **Response (`200 OK`)**:
  ```json
  [
    {
      "id": 892341234,
      "name": "my-service",
      "fullName": "developer/my-service",
      "private": false,
      "cloneUrl": "https://github.com/developer/my-service.git",
      "defaultBranch": "main"
    },
    {
      "id": 987654321,
      "name": "internal-payment-gateway",
      "fullName": "developer/internal-payment-gateway",
      "private": true,
      "cloneUrl": "https://github.com/developer/internal-payment-gateway.git",
      "defaultBranch": "main"
    }
  ]
  ```

> [!NOTE]
> **Unified Repository Sync (OAuth & GitHub Apps)**:
> The service queries both standard user repositories (`octokit.rest.repos.listForAuthenticatedUser`) and installed repositories from GitHub Apps (`octokit.rest.apps.listInstallationReposForAuthenticatedUser`). This ensures that private repositories granted to fine-grained GitHub Apps (identical to Render/Vercel architecture) and classic OAuth apps are seamlessly aggregated without duplicates.

---

### 3. Kubernetes & Docker Container Deployment Engine

The deployment controller handles end-to-end repository cloning, subfolder resolution, AI-driven Dockerfile synthesis, Docker build, and Kubernetes multi-container pod/service orchestration:

```
[Git Repo URL + Token] ──> simpleGit.clone()
                                    │
    [folderpath (e.g. /Backend)] ──> resolve targetDir ──> ensureDockerfile()
                                                                 │
                                                       (AI Agent / Codestral)
                                                       Inspect manifest & scripts
                                                       Guard against missing build
                                                                 │
                                                            tar-fs.pack()
                                                                 │
                                                                 ▼
[deployforge-service-<id>] <── createPod() & CreateService() <── docker.buildImage()
(port 80 -> dynamic appPort)       (App + Agent Sidecar)      (Real-time log streaming)
(port 4000 -> agent port 4000)
            │
            ├─► [Preview URL: http://<id>.preview.localhost]
            └─► [Agent URL:   http://<id>.agent.localhost]
```

- **Endpoint**: `POST /api/k8s/deploy`
- **Authentication**: Requires valid JWT token in cookies (`VerifyUser` middleware).
- **Request Body**:
  ```json
  {
    "repoUrl": "https://github.com/developer/my-monorepo.git",
    "repoName": "my-monorepo",
    "folderpath": "/Backend"
  }
  ```
  *(Note: `folderpath` is optional. If omitted or left empty, the repository root is deployed.)*

- **Execution Workflow**:
  1. **Authentication & Token Retrieval**: Retrieves the user's `GitHubAccessToken` from MongoDB and builds an authenticated URL (`https://<token>@github.com/...`).
  2. **Shallow Clone**: Clones the repository non-interactively with `--depth 1` into an isolated build directory `/tmp/builds/<buildId>`.
  3. **Subfolder & Monorepo Support**:
     - Strips leading/trailing slashes (e.g., `/Backend` ➔ `Backend`).
     - Enforces security checks preventing path traversal outside the cloned directory (`targetDir.startsWith(workspacePath)`).
     - Performs case-insensitive directory resolution to handle capitalization discrepancies (`/backend` vs `/Backend`).
  4. **Autonomous AI Dockerfile Synthesis**:
     - If no `Dockerfile` exists in the target directory, invokes a LangChain ReAct agent powered by Mistral AI (`codestral-latest`) or NVIDIA (`openai/gpt-oss-20b`).
     - Uses `fileListTool` and `readFileTool` (with 8KB guardrails) to inspect `package.json`, `tsconfig.json`, `requirements.txt`, or server entry files.
     - **Build Script Safety Guard**: Verifies whether `"build"` exists in `package.json.scripts`. If no build script is defined, it prevents adding `RUN npm run build` (eliminating `npm error Missing script: build` failures).
     - **Dependency Protection**: Guarantees `NODE_ENV=production` and `--omit=dev` are never applied prior to `npm run build`, ensuring devDependencies (e.g. `vite`, `tsc`, `tailwindcss`) are available for compilation.
     - Detects framework architecture:
       - **React / Vite / Vue / Angular SPA**: Uses `FROM node:22-alpine`, installs build dependencies with `npm install --include=dev`, compiles the static bundle (`dist`/`build`), and serves production assets via `serve -s dist -l 3000`.
       - **Next.js (SSR / Fullstack)**: Uses `FROM node:22-alpine`, ensures devDependencies with `npm install --include=dev`, verifies PostCSS/Tailwind dependencies (`npm ls @tailwindcss/postcss tailwindcss`), sets `ENV NEXT_TELEMETRY_DISABLED=1` and `ENV HOSTNAME=0.0.0.0`, compiles with `npm run build`, and starts with `npm start` on port 3000.
       - **Plain Node.js / Express**: Single-stage lightweight `node:22-alpine` container, running the detected start script or entrypoint on the detected port.
       - **TypeScript Node.js Backend**: Multi-stage build with `node:22-alpine` builder and runner stages.
       - **Python (FastAPI / Flask / Django)**: Installs `requirements.txt` and runs with `uvicorn` / `gunicorn` binding to `0.0.0.0:8000`.
  5. **Docker Build with Real-time Diagnostics**:
     - Streams repository tarball via `tar-fs.pack()` into the local Docker daemon.
     - Follows build progress in real time via `docker.modem.followProgress` streaming stdout/stderr to the console.
     - On failure, captures the trailing build logs and returns the exact compiler/npm error.
  6. **Dynamic Port Discovery & Kubernetes Orchestration**:
     - Automatically parses `EXPOSE <port>` from the generated `Dockerfile` (defaulting to 3000).
     - Schedules pod `deployforge-pod-<id>` with multi-container architecture:
       - **Init Container**: Seeds code from the built image into a shared `workspace-volume` (`emptyDir`).
       - **App Container**: Runs the user application with `containerPort` dynamically matching `EXPOSE <port>`.
       - **Agent Sidecar**: In-pod developer agent sharing `/workspace` on port 4000.
       - Resource allocations: Memory limits `512Mi` (requests `256Mi`), CPU limits `500m` (requests `250m`).
     - Provisions a dual-port ClusterIP Service `deployforge-service-<id>`:
       - Port `80` mapped to the dynamic application `targetPort`.
       - Port `4000` mapped to the agent sidecar container port `4000`.
     - Returns preview and agent endpoints.
  7. **Build Cleanup**: Safely cleans up temporary clone files from `/tmp/builds/<buildId>`.

- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "containerId": "deployforge-pod-d11b0449-b2ab-47fa-8bfa-6a7a27a72de4",
    "status": "Pending",
    "message": "Deployment pod deployforge-pod-d11b0449-b2ab-47fa-8bfa-6a7a27a72de4 provisioned successfully",
    "previewurl": "http://d11b0449-b2ab-47fa-8bfa-6a7a27a72de4.preview.localhost",
    "agenturl": "http://d11b0449-b2ab-47fa-8bfa-6a7a27a72de4.agent.localhost"
  }
  ```

> [!TIP]
> **Frontend Automated Redirection**:
> When `POST /api/k8s/deploy` succeeds, DeployForge's frontend (`useGit.ts`) intercepts this payload, commits the record to Redux (`setCurrentDeployment`), and immediately routes the developer to `/deployment/<sandboxId>` to observe the build in the single-window command center without requiring a manual page refresh.

---

## 🔒 Kubernetes & Docker Engine Architecture

- **Namespace Isolation**: System-level pods (`kube-system`, etc.) are hidden from query endpoints to safeguard cluster infrastructure.
- **Resource Constraints**: Container runs enforce strict CPU and memory limits to prevent runaway processes from starving the host node.
- **Safe Cleanup**: Temporary clone directories are removed via `fs.rmSync` even when builds fail.
- **Authentication Security**: Access tokens are kept in-memory during clone and build operations and are never committed or persisted to disk.

---

## 📜 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `dev` | `npm run dev` | Runs the server using `tsx watch` for hot-reload development |
| `build` | `npm run build` | Compiles TypeScript source to `./dist` |
| `start` | `npm start` | Runs the compiled JavaScript server from `./dist/server.js` |
