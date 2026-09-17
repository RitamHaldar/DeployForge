import { UserModel } from "../model/user.model.js";
import { Request, Response } from "express";
import { Iresponse } from "../types/response.types.js";
import { config } from "../config/cofig.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import jwt from "jsonwebtoken";
import axios from "axios";

/**
 * @param req - Express Request with registration payload in `req.body`
 * @param res - Express Response returning standardized Iresponse JSON
 * @returns Promise<Response<Iresponse>>
 */
export async function Register(req: Request, res: Response<Iresponse>) {
    try {
        const { username, email, mobile, password } = req.body;
        if (!username || !email || !mobile || !password) {
            return res.status(400).json({
                success: false,
                message: "Credentials are missing",
            });
        }

        const userExists = await UserModel.findOne({
            $or: [{ Username: username }, { Email: email }],
        });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const user = await UserModel.create({
            Username: username,
            Mobileno: {
                Number: mobile.phno || mobile.Number,
                CountryCode: mobile.code || mobile.CountryCode,
            },
            Email: email,
            Password: password,
        });

        return res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            body: {
                name: user.Username,
                email: user.Email,
            },
        });
    } catch (e: any) {
        return res.status(500).json({
            success: false,
            message: "Internal server error during registration",
            error: { error: e.message },
        });
    }
}

/**
 * @param req - Express Request with login credentials in `req.body`
 * @param res - Express Response returning standardized Iresponse JSON
 * @returns Promise<Response<Iresponse>>
 */
export async function Login(req: Request, res: Response<Iresponse>) {
    try {
        const { email, username, password } = req.body;

        if ((!email && !username) || !password) {
            return res.status(400).json({
                success: false,
                message: "Email/Username and password are required",
            });
        }

        const user = await UserModel.findOne({
            $or: [{ Email: email }, { Username: username }],
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const isMatch = user.comparepass(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const token = jwt.sign(
            { id: user._id, email: user.Email, username: user.Username },
            config.JWT,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            body: {
                user: {
                    id: user._id,
                    username: user.Username,
                    email: user.Email,
                    mobile: user.Mobileno,
                },
                token,
            },
        });
    } catch (e: any) {
        return res.status(500).json({
            success: false,
            message: "Internal server error during login",
            error: { error: e.message },
        });
    }
}

/**
 * @param req - Authenticated Express Request (`AuthRequest`) with `req.user`
 * @param res - Express Response returning standardized Iresponse JSON
 * @returns Promise<Response<Iresponse>>
 */
export async function GetUser(req: AuthRequest, res: Response<Iresponse>) {
    try {
        const userId = req.user?.id
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not identified",
            });
        }

        const user = await UserModel.findById(userId).select("-Password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            body: {
                user,
            },
        });
    } catch (e: any) {
        return res.status(500).json({
            success: false,
            message: "Error fetching user profile",
            error: { error: e.message },
        });
    }
}

/**
 * @param req - Express Request containing Google profile in `req.user`
 * @param res - Express Response for setting cookie and redirecting to frontend
 * @returns Promise<void | Response>
 */
export async function GoogleAuth(req: Request, res: Response) {
    try {
        const profile = req.user as any;
        if (!profile) {
            return res.status(400).json({
                success: false,
                message: "Google authentication failed: profile not found",
            });
        }

        const email = profile.emails?.[0]?.value;
        const gid = profile.id;
        const username =
            profile.displayName || profile.name?.givenName || email?.split("@")[0];

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "No email found in Google profile",
            });
        }

        let user = await UserModel.findOne({
            $or: [{ Oauthid: gid }, { Email: email }],
        });

        if (!user) {
            user = await UserModel.create({
                Username: username,
                Email: email,
                Oauthid: gid,
                isVerified: true,
            });
        } else if (!user.Oauthid) {
            user.Oauthid = gid;
            user.isVerified = true;
            await user.save();
        }

        const token = jwt.sign(
            { id: user._id, email: user.Email, username: user.Username },
            config.JWT,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
        });

        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        return res.redirect(clientUrl);
    } catch (e: any) {
        return res.status(500).json({
            success: false,
            message: "Error during Google authentication",
            error: { error: e.message },
        });
    }
}

export async function GitLogin(req: Request, res: Response) {
    const code = req.query.code as string;
    if (!code) return res.status(400).json({ error: 'Authorization code missing' });

    try {
        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: config.CLIENT_ID,
                client_secret: config.CLIENT_SECRET,
                code,
            },
            {
                headers: { Accept: 'application/json' },
            }
        );

        const { access_token: accessToken, error, error_description } = tokenResponse.data;

        if (error || !accessToken) {
            console.error("GitHub OAuth token exchange failed:", tokenResponse.data);
            return res.status(400).json({
                success: false,
                message: error_description || error || 'Failed to obtain access token from GitHub',
                details: tokenResponse.data,
            });
        }

        const userResponse = await axios.get(
            'https://api.github.com/user',
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github+json',
                    'User-Agent': 'DeployForge-App',
                },
            }
        );
        const emailResponse = await axios.get(
            'https://api.github.com/user/emails',
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github+json',
                    'User-Agent': 'DeployForge-App',
                },
            }
        );
        const primaryEmail = emailResponse.data.find(
            (email: any) =>
                email.primary && email.verified
        );

        const email = primaryEmail?.email || null;
        const user= await UserModel.create({
            Username: userResponse.data.name,
            Email: email,
            Oauthid: userResponse.data.id,
            GitHubAccessToken: accessToken,
            isVerified: true
        })
        const token = jwt.sign(
            { id: user._id, email: user.Email, username: user.Username },
            config.JWT,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
        });

        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        return res.redirect(clientUrl);
    } catch (error: any) {
        console.error("Error in GitLogin:", error?.response?.data || error?.message || error);
        res.status(500).json({
            message: 'Failed to exchange token or fetch user profile',
            error: error?.response?.data || error?.message || error,
        });
    }
}