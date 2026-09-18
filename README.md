# ⚡ DeployForge
> **Autonomous Cloud Deployment, Self-Healing Infrastructure & Developer Platform**

<div align="center">

![DeployForge Monorepo](https://img.shields.io/badge/DeployForge-v2.4_LTS-00F0FF?style=for-the-badge&logo=shield&logoColor=black)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Native-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Engine_API-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-State-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![React 19](https://img.shields.io/badge/React_19-Vite_8-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**Deploy with confidence. Sleep through incidents.**  
DeployForge continuously monitors container workloads, isolates anomalies in milliseconds, and orchestrates zero-downtime hot-standby promotion.

[Architecture](#-monorepo-architecture) • [Frontend Portal](#-frontend-portal-frontend) • [Auth Microservice](#-auth-microservice-auth) • [Heal Service](#-heal--orchestration-service-healservice) • [Kubernetes & Skaffold](#-kubernetes--skaffold-orchestration) • [Local Quickstart](#-local-development-quickstart)

</div>

---

## 🏛️ Monorepo Architecture

DeployForge is organized as a modular microservices platform with unified ingress and reactive state management:

```text
DeployForge/
├── frontend/                 # React 19 + Vite 8 Developer Portal & Cloud Dashboard
│   ├── src/App/              # React Router v7 routes & Redux Toolkit store (auth & git reducers)
│   ├── src/features/home/    # Self-healing simulator, eBPF telemetry, interactive pipeline & dynamic Navbar
│   ├── src/features/auth/    # Dedicated /login & /register pages with unified useAuthForm & OAuth
│   └── src/features/github/  # Fluid, lag-free /repos dashboard with 60fps spotlight cards & deploy modal
├── auth/                     # Identity & Session Gateway Microservice (Port 3000)
│   ├── src/controller/       # Register, Login, Google OAuth, GitHub OAuth, and GetUser controllers
│   ├── src/middleware/       # JWT session verification middleware (supports JWT_TOKEN & JWT_SECRET)
│   ├── src/model/            # Mongoose User model with bcrypt password hashing
│   └── src/routes/           # Express 5 authentication routes (/api/auth)
├── healservice/              # Orchestration, Docker Sandbox & K8s Controller Engine (Port 3000)
│   ├── src/k8s/              # Kubernetes Client Node SDK queries, pod logs, & node monitoring
│   ├── src/github/           # On-demand Git clone, tar streaming, & Dockerfile synthesis
│   ├── src/routes/           # /api/k8s and /api/github/repos routes
│   └── src/controller/       # GitHub repository sync & dynamic container deployments
├── k8s/                      # Production & Staging Kubernetes Manifests
│   ├── auth-deployment.yml   # Auth microservice deployment
│   ├── auth-service.yml      # Auth ClusterIP service (port 80 -> 3000)
│   ├── heal-deployment.yml   # Heal microservice deployment
│   ├── heal-service.yml      # Heal ClusterIP service (port 80 -> 3000)
│   ├── ingress.yml           # NGINX Ingress rules (/api/auth, /api/github, /api/k8s)
│   └── secrets.yml           # Cluster secrets (MongoDB URI, JWT tokens, OAuth credentials)
└── skaffold.yml              # Skaffold continuous development & container build pipeline
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
  - `/login`: Dedicated Sign In page with active spring pill indicator, TLS 1.3 telemetry badge, and unified OAuth.
  - `/register`: Dedicated Create Account page with 4-tier password strength bar, developer handle (`@`), and free-tier onboarding.
  - `/repos` (also `/repositories`, `/console`): Ultra-smooth, animated GitHub repository management console with 60fps spotlight cards, search/filter controls, and 1-click deployment modal.
- **Seamless Authentication & Navigation**:
  - `useAuthForm`: Unified hook combining credential validation, Redux dispatching, and Google/GitHub OAuth handshakes in a single interface.
  - **Dynamic Navbar**: Automatically detects login state to display the **"Repositories"** launcher, authenticated user handle, and quick sign-out.
  - **Hero CTA**: Dynamically toggles between "Launch Autonomous Engine" and "Manage Cloud Repositories" based on user session.
  - **Session Hydration**: Auto-invokes `authApi.getUser()` on app load to restore authenticated sessions from HTTP-only cookies.

### 🔐 Auth Microservice (`/auth`)
- **Framework**: Express 5, TypeScript, Mongoose, Passport.js, JWT, bcryptjs.
- **Endpoints**:
  - `POST /api/auth/register`: Credential registration with bcrypt hashing.
  - `POST /api/auth/login`: Issues 24h HTTP-only secure cookie sessions with automated redirect to `/repos`.
  - `GET /api/auth/google`: Google OAuth 2.0 Single Sign-On flow.
  - `GET /api/auth/github`: GitHub OAuth authorization with repo and email scopes.
  - `GET /api/auth/get-user`: Authenticated user profile retrieval with JWT cookie verification.

### 🩺 Heal & Orchestration Service (`/healservice`)
- **Framework**: Express 5, TypeScript, `@kubernetes/client-node`, `dockerode`, `octokit`.
- **Endpoints & Capabilities**:
  - `GET /api/github/repos`: Fetches authenticated user repositories with branch and clone metadata using saved OAuth access tokens.
  - `GET /api/k8s/health`: Health probe endpoint for Kubernetes liveness/readiness probes.
  - **Kubernetes Controller**: Queries application pods across namespaces and tails real-time logs.
  - **Docker Engine Sandbox**: Clones repos via token auth, synthesizes standardized Dockerfiles, builds images directly into Docker Engine, and runs sandboxed containers with resource limits.

---

## 🌐 Kubernetes & Skaffold Ingress Routing

DeployForge routes all microservices through a unified NGINX Ingress Controller:

| Path Prefix | Target Service | Container Port | Service Name |
| :--- | :--- | :--- | :--- |
| **`/api/auth`** | `auth-service` | `3000` | `auth` |
| **`/api/github`** | `heal-service` | `3000` | `heal` |
| **`/api/k8s`** | `heal-service` | `3000` | `heal` |

`skaffold.yml` continuously monitors source files, builds local Docker containers, and deploys manifests (`auth`, `heal`, `secrets`, and `ingress`) to your local Kubernetes cluster.

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
# 1. Start backend microservices and Kubernetes Ingress
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

#### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

---

## 📜 Monorepo Scripts Reference

| Service | Dev Command | Build Command | Production Start |
| :--- | :--- | :--- | :--- |
| **`frontend`** | `npm run dev` | `npm run build` | `npm run preview` |
| **`auth`** | `npm run dev` | `npm run build` | `npm start` |
| **`healservice`** | `npm run dev` | `npm run build` | `npm start` |

---

<div align="center">
  <sub>DeployForge Engineering Platform • Built for Resilient Multi-Cloud Operations</sub>
</div>

