# 🔐 DeployForge Auth Service

The **DeployForge Auth Service** is a dedicated authentication and user identity microservice built with **Node.js**, **Express**, **TypeScript**, and **MongoDB (Mongoose)**. It provides secure credential-based authentication, Google OAuth 2.0 single sign-on (SSO), JWT token generation, secure HTTP-only cookie session handling, and user profile management.

---

## 📑 Table of Contents

- [Features](#-features)
- [Folder Structure](#-folder-structure)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Prerequisites](#-prerequisites)
- [Environment Variables](#-environment-variables)
- [Installation & Local Setup](#-installation--local-setup)
- [Running with Docker](#-running-with-docker)
- [API Reference & Endpoints](#-api-reference--endpoints)
  - [1. User Registration](#1-user-registration)
  - [2. User Login](#2-user-login)
  - [3. Get User Profile](#3-get-user-profile)
  - [4. Google OAuth Login](#4-google-oauth-login)
  - [5. Google OAuth Callback](#5-google-oauth-callback)
- [Database Schema](#-database-schema)
- [Security Features](#-security-features)
- [Available Scripts](#-available-scripts)

---

## ✨ Features

- **Standard Authentication**: User registration and login using email/username and password.
- **Google OAuth 2.0**: Seamless Social Login via Google Single Sign-On (SSO) with Passport.js.
- **Bcrypt Password Hashing**: Automatic pre-save password hashing with salt rounds.
- **JWT Authentication**: JSON Web Token signing (1-day expiration) for stateless authentication.
- **Secure Cookie Management**: Issues HTTP-only, SameSite cookies to protect against XSS and CSRF attacks.
- **Protected Routes Middleware**: `verifyuser` middleware for decoding JWTs and attaching user contexts to requests.
- **Type Safety**: Fully typed with TypeScript interfaces for requests, responses, models, and configs.
- **Containerized**: Production-ready `Dockerfile` and `.dockerignore` for Docker and Kubernetes deployments.

---

## 📁 Folder Structure

```text
auth/
├── .dockerignore                 # Specifies files excluded from Docker build context
├── .env.example                  # Template for required environment variables
├── .gitignore                    # Git ignore rules (node_modules, .env, build output)
├── dockerfile                    # Container definition for building the Auth service image
├── package.json                  # NPM package configuration, scripts, and dependencies
├── package-lock.json             # NPM dependency lockfile
├── server.ts                     # Application entry point (DB connection & HTTP server listener)
└── src/
    ├── app.ts                    # Express application setup, global middlewares, and route mounting
    ├── config/
    │   ├── cofig.ts              # Centralized environment variable loader and config export
    │   ├── db.ts                 # Mongoose MongoDB database connection logic
    │   └── passport.ts           # Google OAuth 2.0 Passport strategy configuration
    ├── controller/
    │   └── auth.controller.ts    # Business logic for register, login, get-user, and Google OAuth
    ├── middleware/
    │   └── auth.middleware.ts    # JWT token verification middleware for protected routes
    ├── model/
    │   └── user.model.ts         # Mongoose User schema, pre-save hook, and comparepass method
    ├── routes/
    │   └── auth.routes.ts        # Express router defining authentication endpoints
    └── types/
        ├── response.types.ts     # Interface definition for standardized API JSON responses
        └── user.types.ts         # Interface definition for User data structures
```

### Detailed File & Directory Guide

| Path | Purpose |
| :--- | :--- |
| `server.ts` | Initializes database connection via `connecttodb()` and binds Express to the designated port. |
| `src/app.ts` | Configures Express, JSON body parser, cookie parser, CORS policies, Passport, and mounts `authRoute`. |
| `src/config/cofig.ts` | Loads `.env` variables and exports a structured configuration object (`JWT_SECRET`, `MONGO_URI`, `clientID`, `clientSecret`). |
| `src/config/db.ts` | Manages MongoDB connection life cycle using Mongoose. |
| `src/config/passport.ts` | Configures `passport-google-oauth20` strategy with client IDs, secrets, and callback URL. |
| `src/controller/auth.controller.ts` | Implements handler methods: `Register`, `Login`, `GetUser`, and `GoogleAuth`. |
| `src/middleware/auth.middleware.ts` | Intercepts protected requests to validate the `token` cookie and populate `req.user`. |
| `src/model/user.model.ts` | Mongoose schema with schema validations, conditional required fields for OAuth, pre-save hashing hook, and `comparepass()` method. |
| `src/routes/auth.routes.ts` | Maps HTTP verbs and paths to their respective controller actions and middleware. |
| `src/types/response.types.ts` | Defines `Iresponse` standard response envelope (`success`, `message`, `body`, `error`). |
| `src/types/user.types.ts` | Defines `IUsers` interface representing user properties. |
| `dockerfile` | Multi-stage / Alpine Docker build definition for local and cloud containerization. |

---

## 🛠 Architecture & Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (v20+)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Framework**: [Express.js](https://expressjs.com/) (v5)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Authentication**: [Passport.js](http://www.passportjs.org/) (`passport-google-oauth20`), [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken), [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Utilities**: `cookie-parser`, `cors`, `dotenv`, `tsx` / `nodemon`

---

## 📋 Prerequisites

Before running the application, ensure you have the following installed:

1. **Node.js** (v20.x or higher) & **npm** (v10+)
2. **MongoDB** instance running locally (`mongodb://localhost:27017`) or a remote MongoDB Atlas URI.
3. *(Optional for Google OAuth)* Google Cloud Console OAuth 2.0 Web Application credentials.

---

## ⚙️ Environment Variables

Create a `.env` file in the root of the `auth` directory:

```bash
cp .env.example .env
```

Configure the following variables in `.env`:

| Variable | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `PORT` | `number` | Port on which the auth service listens | `3000` |
| `NODE_ENV` | `string` | Node environment (`development` / `production`) | `development` |
| `MONGO_URI` | `string` | MongoDB connection connection string | `mongodb://localhost:27017/deployforge_auth` |
| `JWT_SECRET` | `string` | Secret key for signing and verifying JWT tokens | `your_jwt_secret_key_here` |
| `clientID` | `string` | Google OAuth 2.0 Client ID | `123456...apps.googleusercontent.com` |
| `clientSecret` | `string` | Google OAuth 2.0 Client Secret | `GOCSPX-xxxxxxxxxxxx` |
| `CLIENT_URL` | `string` | Frontend client URL for CORS & OAuth redirection | `http://localhost:5173` |

---

## 🚀 Installation & Local Setup

1. **Navigate to the auth service directory**:
   ```bash
   cd auth
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secrets
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

The service will start and listen on `http://localhost:3000`.

---

## 🐳 Running with Docker

1. **Build the Docker Image**:
   ```bash
   docker build -t deployforge-auth .
   ```

2. **Run the Container**:
   ```bash
   docker run -d \
     -p 3000:3000 \
     --name deployforge-auth-container \
     --env-file .env \
     deployforge-auth
   ```

3. **View Container Logs**:
   ```bash
   docker logs -f deployforge-auth-container
   ```

4. **Stop the Container**:
   ```bash
   docker stop deployforge-auth-container
   ```

---

## 📡 API Reference & Endpoints

Base URL: `http://localhost:3000` (or `http://localhost:3000/api/auth`)

### Summary of Routes

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `PATCH` | `/register` or `/api/auth/register` | Register a new user | No |
| `GET` | `/login` or `/api/auth/login` | Authenticate user & get JWT token | No |
| `GET` | `/get-user` or `/api/auth/get-user` | Retrieve authenticated user profile | Yes (JWT Cookie) |
| `GET` | `/google` or `/api/auth/google` | Trigger Google OAuth 2.0 flow | No |
| `GET` | `/google/callback` or `/api/auth/google/callback` | Google OAuth 2.0 Callback handler | No |

---

### 1. User Registration

Creates a new user account with hashed password.

- **URL**: `/register`
- **Method**: `PATCH`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "email": "johndoe@example.com",
    "password": "SecretPassword123",
    "mobile": {
      "Number": "9876543210",
      "CountryCode": "+91"
    }
  }
  ```
- **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "User Registered Successfully",
    "body": {
      "name": "johndoe",
      "email": "johndoe@example.com"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing credentials or user already exists.
  - `500 Internal Server Error`: Server error during registration.

---

### 2. User Login

Authenticates user credentials, sets HTTP-only `token` cookie, and returns a JWT.

- **URL**: `/login`
- **Method**: `GET`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "johndoe@example.com",
    "password": "SecretPassword123"
  }
  ```
  *(Or provide `"username": "johndoe"` in place of `"email"`)*
- **Success Response (`200 OK`)**:
  - **Set-Cookie**: `token=<JWT_STRING>; HttpOnly; SameSite=Strict; Max-Age=86400`
  ```json
  {
    "success": true,
    "message": "Login successful",
    "body": {
      "user": {
        "id": "66da5d87a9123f4c10a8b9e1",
        "username": "johndoe",
        "email": "johndoe@example.com",
        "mobile": {
          "Number": "9876543210",
          "CountryCode": "+91"
        }
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Email/Username or password missing.
  - `401 Unauthorized`: Invalid password.
  - `404 Not Found`: User does not exist.

---

### 3. Get User Profile

Fetches the currently authenticated user's profile.

- **URL**: `/get-user`
- **Method**: `GET`
- **Headers / Cookies**: Requires `token` in HTTP cookies.
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "User fetched successfully",
    "body": {
      "user": {
        "_id": "66da5d87a9123f4c10a8b9e1",
        "Username": "johndoe",
        "Email": "johndoe@example.com",
        "Mobileno": {
          "Number": "9876543210",
          "CountryCode": "+91"
        },
        "isVerified": false,
        "__v": 0
      }
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Token missing or invalid.
  - `401 Unauthorized`: User not identified from token.
  - `404 Not Found`: User not found in database.

---

### 4. Google OAuth Login

Initiates Google SSO consent screen.

- **URL**: `/google`
- **Method**: `GET`
- **Behavior**: Redirects client to Google OAuth consent screen requesting `profile` and `email` scopes.

---

### 5. Google OAuth Callback

Google OAuth redirection callback.

- **URL**: `/google/callback`
- **Method**: `GET`
- **Behavior**:
  1. Validates Google response.
  2. Finds or creates the user with `Gid` (Google ID) and marks `isVerified: true`.
  3. Signs JWT and sets `token` HTTP-only cookie.
  4. Redirects user to `CLIENT_URL` (default: `http://localhost:5173`).

---

## 🗄 Database Schema

The `users` collection is modeled with the following fields:

```typescript
{
  Username: { type: String, required: true },
  Mobileno: {
    Number: { type: String, required: () => !this.Gid },
    CountryCode: { 
      type: String, 
      required: () => !this.Gid,
      enum: ["+91", "+1", "+20", "+44", "+971", "+966", "+212"]
    }
  },
  Email: { type: String, required: true, unique: true },
  Gid: { type: String, default: null },
  Password: { type: String, required: () => !this.Gid, minlength: 6 },
  isVerified: { type: Boolean, default: false }
}
```

### Schema Hooks & Methods

- **`pre("save")`**: Checks if `Password` field is modified. If modified, hashes the password using `bcrypt.hashSync(password, 10)`.
- **`comparepass(password)`**: Compares the plain text password with the hashed password using `bcrypt.compareSync`.

---

## 🔒 Security Features

1. **Password Hashing**: Passwords are never stored in plain text; Bcrypt with 10 salt rounds is applied.
2. **Exclusion of Password**: Controller methods exclude `Password` from query results (`.select("-Password")`).
3. **HTTP-Only Cookies**: JWT tokens are issued with `httpOnly: true` and `sameSite: "strict"` to mitigate XSS and CSRF risks.
4. **CORS Control**: Configured to only permit trusted origins defined in `CLIENT_URL`.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts server in development mode with nodemon/tsx. |
| `npm test` | Runs test suite (if configured). |
