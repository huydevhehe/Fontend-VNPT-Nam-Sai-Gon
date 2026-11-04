import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

export interface AuthPayload {
  id: string;
  role: string;
  name?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Thiếu token xác thực" });
    return;
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { sub: string; role: string; name?: string };
    req.user = { id: decoded.sub, role: decoded.role, name: decoded.name };
    next();
  } catch (error: any) {
    if (error?.name === "TokenExpiredError") {
      res.status(401).json({ success: false, message: "Token đã hết hạn" });
      return;
    }
    if (error?.name === "JsonWebTokenError") {
      res.status(401).json({ success: false, message: "Token không hợp lệ" });
      return;
    }
    res.status(401).json({ success: false, message: "Xác thực không hợp lệ" });
  }
}
