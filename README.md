# ⚡ DeployForge
> **Autonomous Cloud Deployment, Self-Healing Infrastructure & Developer Platform**

<div align="center">

![DeployForge Monorepo](https://img.shields.io/badge/DeployForge-v2.5_LTS-00F0FF?style=for-the-badge&logo=shield&logoColor=black)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Native-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Engine_API-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-State-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![React 19](https://img.shields.io/badge/React_19-Vite_8-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**Deploy with confidence. Sleep through incidents.**  
DeployForge continuously monitors container workloads, isolates anomalies in milliseconds, orchestrates zero-downtime hot-standby promotion, and provides live in-pod sidecar developer agents.

[Architecture](#-monorepo-architecture) • [Frontend Portal](#-frontend-portal-frontend) • [Auth Microservice](#-auth-microservice-auth) • [Heal Service](#-heal--orchestration-service-healservice) • [Router Gateway](#-router--preview-gateway-router) • [Agent Sidecar](#-in-pod-agent-sidecar-agent) • [Kubernetes & Skaffold](#-kubernetes--skaffold-orchestration) • [Local Quickstart](#-local-development-quickstart)

</div>

---

## 🏛️ Monorepo Architecture

DeployForge is organized as a modular microservices platform with unified ingress, dynamic routing, and in-pod sidecar agents:

```text
DeployForge/
├── frontend/                 # React 19 + Vite 8 Developer Portal & Cloud Dashboard
│   ├── src/App/              # React Router v7 routes & Redux Toolkit store (auth & git reducers)
│   ├── src/features/home/    # Self-healing simulator, eBPF telemetry, interactive pipeline & dynamic Navbar
│   ├── src/features/auth/    # Dedicated /login & /register pages with unified useAuthForm & OAuth
│   └── src/features/github/  # /repos dashboard with subfolder selection & 1-click cloud deployment modal
├── auth/                     # Identity & Session Gateway Microservice (Port 3000)
│   ├── src/controller/       # Register, Login, Google OAuth, GitHub OAuth, and GetUser controllers
│   ├── src/middleware/       # JWT session verification middleware (supports JWT_TOKEN & JWT_SECRET)
│   ├── src/model/            # Mongoose User model with bcrypt password hashing
│   └── src/routes/           # Express 5 authentication routes (/api/auth)
├── healservice/              # Orchestration, Docker Sandbox & K8s Controller Engine (Port 3000)
│   ├── src/k8s/              # Kubernetes Node SDK client, multi-container pod builder, & service provisioner
│   ├── src/github/           # On-demand Git clone, subfolder Dockerfile synthesis, & tar streaming
│   ├── src/routes/           # /api/k8s and /api/github/repos routes
│   └── src/controller/       # Monorepo subfolder resolution, image build & pod/service deployment
├── router/                   # Dynamic Multi-Tenant Reverse Proxy & Preview Gateway (Port 3000)
│   ├── src/app.ts            # Host header routing (*.preview.localhost & *.agent.localhost) & proxy cache
│   └── server.ts             # Express server entrypoint (port 3000)
├── agent/                    # In-Pod Sidecar Developer Agent Microservice (Port 4000)
│   ├── src/app.ts            # Express 5 app with recursive workspace file inspection & health probes
│   ├── server.ts             # Server entrypoint (listens on port 4000)
│   └── Dockerfile            # Container image definition for in-pod deployment
├── k8s/                      # Production & Staging Kubernetes Manifests
│   ├── auth-deployment.yml   # Auth microservice deployment
│   ├── auth-service.yml      # Auth ClusterIP service (port 80 -> 3000)
│   ├── heal-deployment.yml   # Heal microservice deployment
│   ├── heal-service.yml      # Heal ClusterIP service (port 80 -> 3000)
│   ├── router-deployment.yml # Dynamic reverse proxy router deployment
│   ├── router-service.yml    # Router ClusterIP service (port 80 -> 3000)
│   ├── ingress.yml           # NGINX Ingress rules (*.preview.localhost, *.agent.localhost, /api/*)
│   ├── rabac.yml             # Role-based access control for Kubernetes cluster management
│   └── secrets.yml           # Cluster secrets (MongoDB URI, JWT tokens, OAuth credentials)
└── skaffold.yml              # Skaffold continuous development & multi-container build pipeline
```

---

## 📦 Services Overview

### 🖥️ Frontend Portal (`/frontend`)
- **Core Stack**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Framer Motion, Lenis Smooth Scroll, Lucide React.
- **Global State Management**: Redux Toolkit (`@reduxjs/toolkit` + `react-redux`):
  - `authSlice`: Manages `user`, `isLoading`, and `error` state with `setUser`, `setLoading`, `setError`, and `logout`.
  - `gitSlice`: Manages repository list, loading state, and error handling for connected GitHub repositories.
- **Routing**: React Router v7 (`createBrowserRouter`):
  - `/`: High-velocity homepage with interactive self-healing lab, live pipeline stages, and eBPF laser waveform.
  - `/auth` (also `/login`, `/register`): Dual-mode Authentication Showcase featuring smooth tab morphing, password strength telemetry, and one-click GitHub/Google OAuth.
  - `/repos` (also `/repositories`, `/console`): Animated GitHub repository management console with 60fps spotlight cards, search/filter controls, and a deployment modal supporting root or subfolder/monorepo targeting (e.g. `/Backend`).
- **Seamless Authentication & Navigation**:
  - `useAuthForm`: Unified hook combining credential validation, Redux dispatching, and Google/GitHub OAuth handshakes.
  - **Dynamic Navbar**: Automatically detects login state to display the **"Repositories"** launcher, authenticated user handle, and quick sign-out.
  - **Hero CTA**: Dynamically toggles between "Launch Autonomous Engine" and "Manage Cloud Repositories" based on user session.
  - **Session Hydration**: Auto-invokes `authApi.getUser()` on app load to restore authenticated sessions from HTTP-only cookies.

### 🔐 Auth Microservice (`/auth`)
- **Framework**: Express 5, TypeScript, Mongoose, Passport.js, JWT, bcryptjs.
- **Endpoints & Networking**:
  - `POST /api/auth/register`: Credential registration with bcrypt hashing.
  - `POST /api/auth/login`: Issues 24h HTTP-only secure cookie sessions with automated redirect to `/repos`.
  - `GET /api/auth/google`: Google OAuth 2.0 Single Sign-On flow.
  - `GET /api/auth/github`: GitHub OAuth authorization with repo and email scopes.
  - `GET /api/auth/get-user`: Authenticated user profile retrieval with JWT cookie verification.
  - **Resilient DNS Resolver**: Explicit public DNS resolver fallback (`dns.setServers`) ensuring reliable SRV lookup (`querySrv`) for MongoDB Atlas clusters inside Docker and Kubernetes pods.

### 🩺 Heal & Orchestration Service (`/healservice`)
- **Framework**: Express 5, TypeScript, `@kubernetes/client-node`, `dockerode`, `octokit`.
- **Endpoints & Capabilities**:
  - `GET /api/github/repos`: Fetches authenticated user repositories with branch and clone metadata using saved OAuth access tokens. Supports both classic OAuth scopes and fine-grained **GitHub App** installations.
  - `POST /api/k8s/deploy`: Orchestrates monorepo subfolder resolution, shallow clone, Dockerfile synthesis, Docker image build, and multi-container pod creation:
    - **Init Container**: Seeds code from the built image into a shared `workspace-volume` (`emptyDir`).
    - **App Container**: Runs the user application with port 5173 exposed.
    - **Agent Sidecar**: Deploys the `agent` container sharing `/workspace` on port 4000.
    - **Dual Endpoint Return**: Returns both `previewurl` (`http://<id>.preview.localhost`) and `agenturl` (`http://<id>.agent.localhost`).
  - `GET /api/k8s/health`: Health probe endpoint for Kubernetes liveness/readiness probes.
  - **Kubernetes Controller**: Queries application pods across namespaces, manages lifecycle, and tails real-time logs.

### 🌐 Router & Preview Gateway (`/router`)
- **Framework**: Express 5, TypeScript, `http-proxy-middleware`, CORS, Morgan.
- **Dual-Domain Subdomain Routing**:
  - Parses incoming `Host` headers formatted as:
    - `<sandboxId>.preview.localhost` ➔ Proxies to `deployforge-service-<sandboxId>:80` (App Preview)
    - `<sandboxId>.agent.localhost` ➔ Proxies to `deployforge-service-<sandboxId>:4000` (Agent Sidecar)
  - Instantiates cached, low-latency reverse proxies streaming to internal Kubernetes services.
  - Built-in WebSocket upgrade support (`ws: true`) for live Hot Module Reloading (Vite/Next.js).
  - Probes at `/api/router/health` and `/api/router/ready`.

### 🤖 In-Pod Agent Sidecar (`/agent`)
- **Framework**: Express 5, TypeScript, `tsx`, Morgan.
- **Role & Execution**:
  - Runs inside the deployed sandbox pod as a co-located sidecar container on port **4000**.
  - Mounts the shared `workspace-volume` at `/workspace` populated by the pod's init container.
- **Endpoints**:
  - `GET /api/agent/health`: Liveness probe (`"Ai agent Running Healthy"`).
  - `GET /api/agent/ready`: Readiness probe (`"Ai agent Ready"`).
  - `GET /api/agent/listFiles`: Recursively scans and returns the full directory tree of `/workspace` in JSON, automatically ignoring noise directories (`node_modules`, `.git`, `.vscode`, `dist`).

---

## 🌐 Kubernetes & Skaffold Ingress Routing

DeployForge routes all traffic through a unified NGINX Ingress Controller:

| Host / Path Pattern | Target Service | Target Port | Description |
| :--- | :--- | :--- | :--- |
| **`*.preview.localhost`** | `router-service` | `80` (➔ `app:5173`) | Dynamic subdomain router for deployed sandbox app previews |
| **`*.agent.localhost`** | `router-service` | `80` (➔ `agent:4000`) | Subdomain router for sandbox in-pod developer agents |
| **`/api/auth`** | `auth-service` | `3000` | Authentication, sessions, & OAuth callbacks |
| **`/api/github`** | `heal-service` | `3000` | GitHub repository discovery & sync |
| **`/api/k8s`** | `heal-service` | `3000` | Pod scheduling, logs streaming, & deployment trigger |

`skaffold.yml` continuously monitors source files, builds local Docker containers (`auth`, `heal`, `router`, and `agent`), and deploys manifests to your local Kubernetes cluster.

---

## 🚀 Local Development Quickstart

### Prerequisites
- **Node.js**: v20.x or higher
- **Docker**: Docker Desktop or Linux Docker daemon running
- **Kubernetes**: Minikube, Kind, or Docker Desktop K8s
- **Skaffold**: v2.x+ (for single-command cluster orchestration)
- **MongoDB**: Local MongoDB instance or Atlas connection string

### Quickstart with Skaffold (Recommended)
```bash
# 1. Start all cluster microservices and ingress
skaffold dev

# 2. In another terminal, start the Frontend portal
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

### Running Services Independently

#### 1. Start the Auth Service
```bash
cd auth
npm install
npm run dev
# Running on http://localhost:3000
```

#### 2. Start the Heal Service
```bash
cd healservice
npm install
npm run dev
# Running on http://localhost:3000
```

#### 3. Start the Router Service
```bash
cd router
npm install
npm run dev
# Running on http://localhost:3000
```

#### 4. Start the Agent Service (Standalone test)
```bash
cd agent
npm install
npm run dev
# Running on http://localhost:4000
```

#### 5. Start the Frontend
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

---

## 📜 Monorepo Scripts Reference

| Service | Dev Command | Build Command | Production Start | Default Port |
| :--- | :--- | :--- | :--- | :--- |
| **`frontend`** | `npm run dev` | `npm run build` | `npm run preview` | `5173` |
| **`auth`** | `npm run dev` | `npm run build` | `npm start` | `3000` |
| **`healservice`** | `npm run dev` | `npm run build` | `npm start` | `3000` |
| **`router`** | `npm run dev` | `npm run build` | `npm start` | `3000` |
| **`agent`** | `npm run dev` | `npm run build` | `npm start` | `4000` |

---

<div align="center">
  <sub>DeployForge Engineering Platform • Built for Resilient Multi-Cloud Operations</sub>
</div>
