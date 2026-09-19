import Jwt from "jsonwebtoken";
import { config } from "../config/config.js";
export async function VerifyUser(req, res, next) {
    const token = req.cookies?.token;
    if (!token)
        return res.status(404).json({
            "success": false,
            "message": "token is required"
        });
    try {
        const decoded = Jwt.verify(token, config.JWT);
        req.user = decoded;
        next();
    }
    catch (e) {
        return res.status(400).json({
            "success": false,
            "message": "Error in verification"
        });
    }
}
