import jwt, { JwtPayload } from "jsonwebtoken";
import { Iresponse } from "../types/response.types.js";
import { Request, Response, NextFunction } from "express";
import { config } from "../config/cofig.js";
export interface AuthRequest extends Request {
    /** Decoded JWT token payload attached after successful verification */
    user?: string | JwtPayload;
}

/**
 * Middleware function to verify JWT authentication token from incoming request cookies.
 *
 * Checks `req.cookies.token`, decodes it using the application JWT Secret,
 * attaches decoded payload to `req.user`, and passes control to the next handler.
 * Returns 400 Bad Request if token is missing or invalid.
 *
 * @param req - Extended Express request containing cookies and optional user object
 * @param res - Express response typed with Iresponse
 * @param next - Express next middleware function
 */
export async function verifyuser(
    req: AuthRequest,
    res: Response<Iresponse>,
    next: NextFunction
) {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(400).json({
            success: false,
            message: "Token not provided",
        });
    }

    try {
        const data = jwt.verify(token, config.key);
        req.user = data;
        next();
    } catch (e) {
        return res.status(400).json({
            success: false,
            message: "User not found",
            error: { e },
        });
    }
}