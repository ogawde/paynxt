

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { JWTPayload } from "@paynxt/types";

declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}


export function requireAuth(req: Request, res: Response, next: NextFunction): void {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                error: "Authentication required. Please provide a valid token.",
            });
            return;
        }

        const token = authHeader.substring(7);

        const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;

        req.user = decoded;

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            error: "Invalid or expired token. Please log in again.",
        });
    }
}


export function requireUserType(...allowedTypes: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Authentication required.",
            });
            return;
        }

        if (!allowedTypes.includes(req.user.userType)) {
            res.status(403).json({
                success: false,
                error: `Access denied. Required user type: ${allowedTypes.join(" or ")}`,
            });
            return;
        }

        next();
    };
}

