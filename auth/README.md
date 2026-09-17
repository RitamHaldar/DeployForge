# 🔐 DeployForge Auth Service

The **DeployForge Auth Service** is the authentication and identity management microservice for the DeployForge platform, built with **Node.js**, **Express 5**, **TypeScript**, and **MongoDB (Mongoose)**.

It provides credential-based registration and login, Google OAuth 2.0 and GitHub OAuth authentication, JWT issuance, HTTP-only secure cookie session handling, and authenticated profile retrieval.

---

## 📑 Table of Contents

- [Features](#-features)
- [Folder Structure](#-folder-structure)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Prerequisites](#-prerequisites)
- [Environment Variables](#-environment-variables)
- [Installation & Local Setup](#-installation--local-setup)
- [API Reference & Endpoints](#-api-reference--endpoints)
  - [1. User Registration](#1-user-registration)
  - [2. User Login](#2-user-login)
  - [3. Get User Profile](#3-get-user-profile)
  - [4. Google OAuth Flow](#4-google-oauth-flow)
  - [5. GitHub OAuth Flow](#5-github-oauth-flow)
- [Database Schema](#-database-schema)
- [Security Features](#-security-features)
- [Available Scripts](#-available-scripts)

---

## ✨ Features

- **Multi-Provider Authentication**:
  - **Local Credentials**: Email/username and password registration and login with bcrypt hashing.
  - **Google OAuth 2.0**: Single Sign-On (SSO) via Passport.js (`passport-google-oauth20`).
  - **GitHub OAuth**: Direct OAuth 2.0 authorization code exchange, GitHub user profile fetching, primary verified email resolution, and `GitHubAccessToken` storage for downstream services.
- **Unified Identity Management**: Links Google and GitHub identities via a consolidated `Oauthid` field while preserving standard user account options.
- **Stateless JWT Sessions**: Signs JSON Web Tokens (1-day expiration) containing user ID, email, and username.
- **Secure Cookie Transport**: Stores the authentication token in `httpOnly`, `sameSite: strict`, and SSL-secured (in production) cookies.
- **Strict TypeScript Integration**: Global declaration merging on `Express.User` ensuring end-to-end type safety for `req.user` across all middlewares and controllers.
- **CORS & Middleware**: Configured to work seamlessly with frontend clients (e.g., Vite/React on port 5173).

---

## 📁 Folder Structure

```text
auth/
├── .dockerignore                 # Excluded files for container builds
├── .env                          # Local environment variables (do not commit)
├── .gitignore                    # Git ignored patterns
├── dockerfile                    # Containerization configuration
├── package.json                  # Dependencies and execution scripts
├── server.ts                     # Service entry point & DB connection initialization
└── src/
    ├── app.ts                    # Express application configuration and route mounting
    ├── config/
    │   ├── cofig.ts              # Centralized environment variable loader
    │   ├── db.ts                 # Mongoose MongoDB connection handler
    │   └── passport.ts           # Google OAuth 2.0 Passport strategy configuration
    ├── controller/
    │   └── auth.controller.ts    # Handlers for Register, Login, GetUser, GoogleAuth, GitLogin
    ├── middleware/
    │   └── auth.middleware.ts    # JWT verification middleware & Express.User type augmentation
    ├── model/
    │   └── user.model.ts         # User Mongoose schema, password hashing hooks, comparepass method
    ├── routes/
    │   └── auth.routes.ts        # Express router mapping API endpoints
    └── types/
        ├── response.types.ts     # Standardized JSON response envelope
        └── user.types.ts         # User interface & data contracts
```

---

## 🛠 Architecture & Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (v20+)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Framework**: [Express.js](https://expressjs.com/) (v5)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Authentication**:
  - [Passport.js](http://www.passportjs.org/) & `passport-google-oauth20`
  - GitHub OAuth via [Axios](https://axios-http.com/)
  - [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) (JWT)
  - [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Tooling**: `tsx` (TypeScript Execute / Watch), `cookie-parser`, `cors`, `dotenv`

---

## 📋 Prerequisites

1. **Node.js** (v20.x or higher) & **npm** (v10+)
2. **MongoDB** instance running locally or via MongoDB Atlas
3. **Google Cloud Console OAuth 2.0** credentials (for Google SSO)
4. **GitHub App / OAuth App** credentials (for GitHub login & repo access)

---

## ⚙️ Environment Variables

Create or update `.env` in the root of the `auth` directory:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | HTTP port on which the auth service runs | `3000` |
| `NODE_ENV` | Runtime environment (`development` / `production`) | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_TOKEN` | Secret key used for signing and verifying JWTs | `your_jwt_secret` |
| `CLIENT_URL` | Frontend URL for CORS origin and post-login redirects | `http://localhost:5173` |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 Web Application Client ID | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET`| Google OAuth 2.0 Client Secret | `GOCSPX-xxx` |
| `GITHUB_CLIENT_ID` | GitHub OAuth / GitHub App Client ID | `Iv23liw...` |
| `GITHUB_CLIENT_SECRET`| GitHub OAuth / GitHub App Client Secret | `ed313...` |
| `GITHUB_CALLBACK_URL` | GitHub OAuth callback URL | `http://localhost:3000/api/auth/github/callback` |

---

## 🚀 Installation & Local Setup

1. **Navigate to the directory**:
   ```bash
   cd auth
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server with live reload**:
   ```bash
   npm run dev
   ```

4. **Production launch**:
   ```bash
   npm start
   ```

The service will start listening on `http://localhost:3000`.

---

## 📡 API Reference & Endpoints

All endpoints are mounted at `/api/auth` and `/` (e.g. `/api/auth/login` or `/login`).

### Summary of Routes

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `PATCH` | `/api/auth/register` | Register new user with username, email, password | No |
| `GET` | `/api/auth/login` | Authenticate with credentials, return JWT & set cookie | No |
| `GET` | `/api/auth/get-user` | Retrieve profile of currently authenticated user | Yes (JWT Cookie) |
| `GET` | `/api/auth/google` | Initiate Google OAuth 2.0 redirect | No |
| `GET` | `/api/auth/google/callback` | Handle Google OAuth callback, issue JWT & redirect | No |
| `GET` | `/api/auth/github` | Initiate GitHub OAuth authorization redirect | No |
| `GET` | `/api/auth/github/callback` | Exchange code, fetch user & email, save token, redirect | No |

---

### 1. User Registration
- **URL**: `/api/auth/register`
- **Method**: `PATCH`
- **Body**:
  ```json
  {
    "username": "developer",
    "email": "dev@deployforge.io",
    "password": "StrongPassword123",
    "mobile": {
      "Number": "9876543210",
      "CountryCode": "+91"
    }
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "User Registered Successfully",
    "body": {
      "name": "developer",
      "email": "dev@deployforge.io"
    }
  }
  ```

---

### 2. User Login
- **URL**: `/api/auth/login`
- **Method**: `GET`
- **Body**:
  ```json
  {
    "email": "dev@deployforge.io",
    "password": "StrongPassword123"
  }
  ```
  *(Or provide `"username": "developer"` instead of `"email"`)*
- **Response (`200 OK`)**:
  - Sets `token` HTTP-only cookie (`Max-Age: 24h`, `SameSite: Strict`).
  - Returns user profile and token.

---

### 3. Get User Profile
- **URL**: `/api/auth/get-user`
- **Method**: `GET`
- **Headers**: Cookie `token=<jwt>`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "User fetched successfully",
    "body": {
      "user": {
        "_id": "66da5d87a9123f4c10a8b9e1",
        "Username": "developer",
        "Email": "dev@deployforge.io",
        "isVerified": true
      }
    }
  }
  ```

---

### 4. Google OAuth Flow
- **Initiate**: `GET /api/auth/google`
  - Redirects to Google consent screen requesting `profile` and `email` scopes.
- **Callback**: `GET /api/auth/google/callback`
  - Upserts user with `Oauthid` matching Google profile ID.
  - Sets JWT cookie and redirects to `CLIENT_URL`.

---

### 5. GitHub OAuth Flow
- **Initiate**: `GET /api/auth/github`
  - Redirects to GitHub authorization requesting `repo`, `read:user`, and `user:email` scopes.
- **Callback**: `GET /api/auth/github/callback?code=<code>`
  - Exchanges one-time code for GitHub `access_token`.
  - Queries `https://api.github.com/user` and `https://api.github.com/user/emails` for verified primary email.
  - Upserts user record with `Oauthid`, `GitHubAccessToken`, and verified status.
  - Issues DeployForge JWT cookie and redirects to `CLIENT_URL`.

---

## 🗄 Database Schema

The `users` collection model supports both credentialed and OAuth accounts:

```typescript
export interface IUsers {
    Username: string;
    Mobileno?: {
        Number: string;
        CountryCode: string;
    };
    Email: string;
    Oauthid?: string;              // Stores Google ID or GitHub ID
    GitHubAccessToken?: string;    // Used for GitHub repository operations
    Password?: string;
    isVerified: boolean;
}
```

- **Pre-save Hook**: Automatically hashes `Password` with `bcryptjs` (salt rounds: 10) if modified.
- **Conditional Requirements**: Phone numbers and passwords are required for direct registrations, but optional for OAuth accounts (`!this.Oauthid`).

---

## 🔒 Security Features

1. **Bcrypt Password Hashing**: Passwords are never stored in plaintext.
2. **Safe Querying**: Controllers explicitly exclude password hashes (`.select("-Password")`).
3. **Protected Cookie Transport**: Tokens are stored in `httpOnly`, `sameSite: strict` cookies to prevent client-side JavaScript access and cross-site request forgery.
4. **Single-Use OAuth Codes**: Validates incoming OAuth codes immediately and handles errors gracefully without leaking tokens.
5. **CORS Restrictions**: Accepts incoming credentials exclusively from configured `CLIENT_URL`.

---

## 📜 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `dev` | `npm run dev` | Runs the server with `tsx watch` for hot reloading |
| `start` | `npm start` | Runs the server directly with `tsx` |
