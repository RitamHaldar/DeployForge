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
  - Automatic `Dockerfile` synthesis (defaults to Node.js 20 Alpine) if the repo lacks one.
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
    │   ├── config.ts             # Centralized environment variable loader (MONGO_URI, JWT_TOKEN)
    │   └── db.ts                 # MongoDB Mongoose connection utility
    ├── controller/
    │   ├── docker.controller.ts  # Git clone, Docker build, and container run orchestration
    │   ├── github.controller.ts  # GitHub repository fetcher using user's OAuth access token
    │   └── k8s.controller.ts     # Kubernetes cluster query and pod log retrieval handlers
    ├── github/
    │   └── clone.ts              # Docker daemon client & fallback Dockerfile generator
    ├── k8s/
    │   ├── kubernetes.ts         # Kubernetes KubeConfig initialization & CoreV1Api client
    │   └── pod.ts                # Pod deployment, status queries, and log extraction logic
    ├── middleware/
    │   └── user.middleware.ts    # JWT verification middleware & AuthRequest type definitions
    ├── models/
    │   └── user.model.ts         # User model reference to retrieve GitHub access tokens
    └── routes/
        ├── github.routes.ts      # Router for GitHub repository operations
        └── k8s.routes.ts         # Router for Kubernetes pod queries and log streams
```

---

## 📋 Prerequisites

Before running the service, make sure you have:

1. **Node.js** (v20.x or higher) and **npm**.
2. A running **Kubernetes cluster** (e.g. Minikube, Kind, Docker Desktop Kubernetes, or remote cloud cluster) with a valid `~/.kube/config`.
3. **Docker Daemon** running locally with the Docker socket available at `/var/run/docker.sock` (or Docker Desktop on Windows/macOS).
4. A running **MongoDB** database instance containing user accounts created by the Auth service.

---

## ⚙️ Environment Variables

Create a `.env` file in the root of the `healservice` directory:

| Variable | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `PORT` | `number` | Port on which the Heal service listens | `5000` (or `3001`) |
| `MONGO_URI` | `string` | MongoDB connection URI matching the Auth service | `mongodb+srv://...` |
| `JWT_TOKEN` | `string` | Secret key used to verify user auth cookies | `your_jwt_secret` |

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

The deployment controller handles end-to-end repository cloning, subfolder resolution, Docker build, and Kubernetes pod/service orchestration:

```
[Git Repo URL + Token] ──> simpleGit.clone()
                                    │
    [folderpath (e.g. /Backend)] ──> resolve targetDir ──> ensureDockerfile()
                                                                 │
                                                            tar-fs.pack()
                                                                 │
                                                                 ▼
[delpoyforge-service-<id>] <── createPod() & CreateService() <── docker.buildImage()
            │
            ▼
[Preview URL: http://<id>.preview.localhost]
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
  4. **Dockerfile Synthesis**:
     - Inspects the target directory for an existing `Dockerfile`.
     - If absent, generates an optimized Node.js 20 Alpine `Dockerfile` directly inside the subfolder.
  5. **Docker Build**:
     - Archives the target subfolder via `tar-fs.pack()` so the build context and `package.json` are properly scoped.
     - Builds the Docker image `sandbox-<buildId>`.
  6. **Kubernetes Orchestration**:
     - Schedules pod `deployforge-pod-<id>` with production-grade resource allocations:
       - Memory Limits: `512Mi` (requests `256Mi`) to eliminate Node.js `OOMKilled` crashes.
       - CPU Limits: `500m` (requests `250m`).
     - Provisions a ClusterIP Service `delpoyforge-service-<id>` mapping port `80` to container port `3000`.
     - Returns a direct preview URL: `http://<buildId>.preview.localhost`.
  7. **Build Cleanup**: Safely cleans up temporary clone files from `/tmp/builds/<buildId>`.

- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "containerId": "deployforge-pod-d11b0449-b2ab-47fa-8bfa-6a7a27a72de4",
    "status": "Pending",
    "message": "Deployment pod deployforge-pod-d11b0449-b2ab-47fa-8bfa-6a7a27a72de4 provisioned successfully",
    "previewurl": "http://d11b0449-b2ab-47fa-8bfa-6a7a27a72de4.preview.localhost"
  }
  ```

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
