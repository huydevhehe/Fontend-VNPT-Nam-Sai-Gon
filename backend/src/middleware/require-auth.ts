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

/**
 * Tra lại trạng thái VÀ role hiện tại trong DB (không tin role ghi trong JWT):
 * StaffService.update có thể đổi role (ví dụ demote/thăng chức) mà không bắt
 * đăng nhập lại, nên token cũ phải được đánh giá theo quyền MỚI NHẤT.
 */
async function loadAccountState(
  userId: string
): Promise<{ active: boolean; role: string | null }> {
  const rows = await query<{ status: string | null; role: string | null }>(
    "SELECT status, role FROM users WHERE id = ?",
    [userId]
  );
  if (!rows.length) {
    return { active: false, role: null };
  }
  const status = rows[0].status;
  return { active: !status || status === USER_STATUS.ACTIVE, role: rows[0].role };
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

  let state: { active: boolean; role: string | null };
  try {
    state = await loadAccountState(decoded.sub);
  } catch (error) {
    console.error("Account status check failed:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống, vui lòng thử lại" });
    return;
  }

  if (!state.active || !state.role) {
    res.status(401).json({ success: false, message: ACCOUNT_INVALID_MESSAGE });
    return;
  }

  // role lấy từ DB, không phải từ claim trong JWT: tài khoản bị đổi role sau
  // khi token đã phát hành phải được xử lý theo quyền hiện tại, không phải
  // quyền lúc đăng nhập.
  req.user = { id: decoded.sub, role: state.role, name: decoded.name };
  next();
}
