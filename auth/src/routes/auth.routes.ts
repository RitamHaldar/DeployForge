import { Router, Request, Response } from "express";
import {
    GetUser,
    Login,
    Register,
    GoogleAuth,
    GitLogin,
} from "../controller/auth.controller.js";
import { verifyuser } from "../middleware/auth.middleware.js";
import passport from "passport";
import { config } from "../config/cofig.js"
export const authRoute = Router();

/**
 * @route   PATCH /register
 * @desc    Register a new user account with credentials
 * @access  Public
 */
authRoute.patch("/register", Register);

/**
 * @route   GET /login
 * @desc    Authenticate existing user and return JWT + set cookie
 * @access  Public
 */
authRoute.get("/login", Login);

/**
 * @route   GET /get-user
 * @desc    Retrieve profile data of currently authenticated user
 * @access  Private (Requires JWT token cookie)
 */
authRoute.get("/get-user", verifyuser, GetUser);

/**
 * @route   GET /google
 * @desc    Initiate Google OAuth 2.0 authentication flow
 * @access  Public
 */
authRoute.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * @route   GET /google/callback
 * @desc    Google OAuth 2.0 callback URL for token issuance and redirection
 * @access  Public
 */
authRoute.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: "/",
    }),
    GoogleAuth
);

authRoute.get('/github', (req: Request, res: Response) => {
    const redirectUri = `https://github.com/login/oauth/authorize?client_id=${config.CLIENT_ID}&scope=repo,read:user`;
    res.redirect(redirectUri);
});

authRoute.get("/github/callback",GitLogin);