# ⚡ DeployForge
> **Autonomous Cloud Deployment, Self-Healing Infrastructure & Developer Platform**

<div align="center">

![DeployForge Monorepo](https://img.shields.io/badge/DeployForge-v2.4_LTS-00F0FF?style=for-the-badge&logo=shield&logoColor=black)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Native-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Engine_API-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React 19](https://img.shields.io/badge/React_19-Vite_8-61DAFB?style=for-the-badge&logo=react&logoColor=black)

**Deploy with confidence. Sleep through incidents.**  
DeployForge continuously monitors container workloads, isolates anomalies in milliseconds, and orchestrates zero-downtime hot-standby promotion.

[Frontend Service](#-frontend-portal) • [Auth Microservice](#-auth-microservice) • [Heal Service](#-heal--orchestration-service) • [Kubernetes & Skaffold](#-kubernetes--skaffold-orchestration) • [Getting Started](#-local-development-quickstart)

</div>

---

## 🏛️ Monorepo Architecture

DeployForge is organized as a modular microservices platform:

```text
DeployForge/
├── frontend/               # React 19 + Vite 8 Developer Portal & Showcase
│   ├── src/features/home/  # Self-healing simulator, eBPF telemetry, interactive pipeline
│   ├── src/features/auth/  # Dedicated /login and /register pages with fluid GPU transitions
│   └── src/App/            # React Router v7 route tree and core application shell
├── auth/                   # Identity & Session Gateway Microservice
│   ├── src/controller/     # Register (POST), Login (POST), OAuth handshakes (Google, GitHub)
│   ├── src/model/          # Mongoose User model with bcrypt password hashing
│   └── src/routes/         # Express 5 authentication routes
├── healservice/            # Orchestration, Docker Sandbox & K8s Controller Engine
│   ├── src/k8s/            # Kubernetes Client Node SDK queries, pod logs, & node monitoring
│   ├── src/github/         # On-demand Git clone, tar streaming, & Dockerfile synthesis
│   └── src/controller/     # Dynamic container deployment & GitHub repository sync
├── k8s/                    # Production & staging Kubernetes manifests
└── skaffold.yml            # Skaffold continuous development & container build pipeline
```

---

## 📦 Services Overview

### 🖥️ Frontend Portal (`/frontend`)
- **Framework**: React 19, TypeScript, Vite 8, Framer Motion, Lenis Smooth Scroll, GSAP, Tailwind CSS.
- **Routing**: React Router v7 (`createBrowserRouter`):
  - `/`: High-velocity homepage with interactive self-healing lab, live pipeline stages, and eBPF laser waveform.
  - `/login`: Dedicated Sign In page with active spring pill indicator, TLS 1.3 telemetry badge, and credential fields.
  - `/register`: Dedicated Create Account page with 4-tier password strength bar, developer handle (`@`), and free tier onboarding.
  - Clean URL guarantee: No query strings or search parameters needed (`/login` and `/register`).
- **Zero-Jitter Architecture**: `AuthLayout` maintains persistent ambient canvas particles, 3D cursor follower lights, and live Sentinel telemetry across route changes without frame drops or canvas restarts.

### 🔐 Auth Microservice (`/auth`)
- **Framework**: Express 5, TypeScript, Mongoose, Passport.js, JWT, bcryptjs.
- **Endpoints**:
  - `POST /api/auth/register`: Credential registration with bcrypt hashing.
  - `POST /api/auth/login`: Issues 24h HTTP-only secure cookie sessions.
  - `GET /api/auth/google`: Google OAuth 2.0 Single Sign-On flow.
  - `GET /api/auth/github`: GitHub OAuth authorization with repo & email scopes.
  - `GET /api/auth/get-user`: Authenticated user profile retrieval.

### 🩺 Heal & Orchestration Service (`/healservice`)
- **Framework**: Express 5, TypeScript, `@kubernetes/client-node`, `dockerode`, `simple-git`, `octokit`.
- **Capabilities**:
  - **Kubernetes Controller**: Queries application pods across namespaces and tails real-time logs.
  - **Docker Deployment Engine**: Clones repos via token auth, synthesizes standardized Dockerfiles, builds images directly into Docker Engine, and runs sandboxes with memory and CPU resource caps.
  - **Repository Sync**: Retrieves authenticated user GitHub repositories using saved OAuth access tokens.

---

## 🚀 Local Development Quickstart

### Prerequisites
- **Node.js**: v20.x or higher
- **Docker**: Docker Desktop or Linux Docker daemon running
- **Kubernetes**: Minikube, Kind, or Docker Desktop K8s (optional for healservice)
- **MongoDB**: Local MongoDB instance or Atlas connection string

### Running Services Locally

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
# Running on http://localhost:5000 (or configured PORT)
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
