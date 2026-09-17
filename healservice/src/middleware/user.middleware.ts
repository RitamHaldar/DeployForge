import { NextFunction, Request, Response } from "express";
import Jwt,{JwtPayload}  from "jsonwebtoken";
import { config } from "../config/config.js";


export interface UserPayload extends JwtPayload {
    id: string;
    email?: string;
    username?: string;
}

export interface AuthRequest extends Request {
    /** Decoded JWT token payload attached after successful verification */
    user?: UserPayload;
}

export async function VerifyUser(req:AuthRequest,res:Response,next:NextFunction) {
    const token = req.cookies?.token;
    if (!token) return res.status(404).json({
        "success":false,
        "message": "token is required"
    })
    try{
        const decoded = Jwt.verify(token,config.JWT) as UserPayload;
        req.user=decoded;
        next();
    }catch(e){
        return res.status(400).json({
            "success":false,
            "message":"Error in verification"
        })
    }
}