/**
 * Express Application Configuration
 * Configures global middlewares, CORS policy, Passport authentication, and exports the Express app.
 */

import express from "express";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser";
import { stratagey } from "./config/passport.js";
import { authRoute } from "./routes/auth.routes.js";

// Initialize Express application instance
const app = express();

// Middleware: Parse incoming JSON request payloads
app.use(express.json());

// Middleware: Parse cookies from incoming HTTP requests
app.use(cookieParser());

// Middleware: Enable Cross-Origin Resource Sharing (CORS)
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    })
);

// Middleware: Initialize Passport for authentication strategies
app.use(passport.initialize());

// Register Google OAuth 2.0 strategy with Passport
passport.use(stratagey);

// Mount authentication routes at /api/auth and root
app.use("/api/auth", authRoute);
app.use("/", authRoute);

export default app;