import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { query } from "../database/db.js";
import { USER_STATUS } from "../constants/org.js";

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

const ACCOUNT_INVALID_MESSAGE = "Tài khoản không còn hiệu lực";

/** Tài khoản còn hiệu lực khi tồn tại và trạng thái trống (dữ liệu cũ) hoặc "Đang hoạt động". */
async function isAccountActive(userId: string): Promise<boolean> {
  const rows = await query<{ status: string | null }>("SELECT status FROM users WHERE id = ?", [userId]);
  if (!rows.length) {
    return false;
  }
  const status = rows[0].status;
  return !status || status === USER_STATUS.ACTIVE;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Thiếu token xác thực" });
    return;
  }

  const token = authHeader.slice("Bearer ".length);

  let decoded: { sub: string; role: string; name?: string };
  try {
    decoded = jwt.verify(token, config.jwtSecret) as { sub: string; role: string; name?: string };
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
    return;
  }

  try {
    if (!(await isAccountActive(decoded.sub))) {
      res.status(401).json({ success: false, message: ACCOUNT_INVALID_MESSAGE });
      return;
    }
  } catch (error) {
    console.error("Account status check failed:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống, vui lòng thử lại" });
    return;
  }

  req.user = { id: decoded.sub, role: decoded.role, name: decoded.name };
  next();
}
