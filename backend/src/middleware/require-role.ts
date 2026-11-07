import { Request, Response, NextFunction } from "express";

const ROLE_ADMIN = "Admin";
const ROLE_CTV = "CTV";

function forbidden(res: Response): void {
  res.status(403).json({ success: false, message: "Không có quyền truy cập" });
}

// Các middleware dưới đây chạy SAU requireAuth (cần req.user).

/** Nhân viên nội bộ: mọi role đăng nhập hợp lệ trừ CTV. */
export function requireStaff(req: Request, res: Response, next: NextFunction): void {
  const role = req.user?.role;
  if (!role || role === ROLE_CTV) {
    forbidden(res);
    return;
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== ROLE_ADMIN) {
    forbidden(res);
    return;
  }
  next();
}

export function requireCtv(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== ROLE_CTV) {
    forbidden(res);
    return;
  }
  next();
}
