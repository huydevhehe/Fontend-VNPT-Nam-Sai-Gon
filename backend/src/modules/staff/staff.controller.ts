import { Router, Request, Response } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { requireAdmin } from "../../middleware/require-role.js";
import { StaffService } from "./staff.service.js";
import { HttpError } from "../auth/auth.service.js";

export const staffRouter = Router();
const staffService = new StaffService();

// GET /api/staff — dữ liệu nhân sự/doanh thu từng người, yêu cầu đăng nhập
staffRouter.get("/", requireAuth, async (_req: Request, res: Response) => {
  try {
    const staff = await staffService.getAll();
    res.json({ success: true, data: staff });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/staff — chỉ Admin được tạo mới
staffRouter.post("/", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      code,
      name,
      role,
      territory,
      email,
      hrmCode,
      staffType,
      phone,
      birthDate,
      personalEmail,
      shortName,
      note,
      password,
      mustChangePassword,
    } = req.body ?? {};

    const staff = await staffService.create({
      code,
      name,
      role,
      territory,
      email,
      hrmCode,
      staffType,
      phone,
      birthDate,
      personalEmail,
      shortName,
      note,
      password,
      mustChangePassword,
    });
    res.status(201).json({ success: true, data: staff });
  } catch (error: any) {
    const statusCode = error instanceof HttpError ? error.status : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

// PATCH /api/staff/:id — chỉ Admin được cập nhật
staffRouter.patch("/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      role,
      territory,
      status,
      email,
      hrmCode,
      staffType,
      phone,
      birthDate,
      personalEmail,
      shortName,
      note,
    } = req.body ?? {};

    const staff = await staffService.update(
      id,
      {
        name,
        role,
        territory,
        status,
        email,
        hrmCode,
        staffType,
        phone,
        birthDate,
        personalEmail,
        shortName,
        note,
      },
      (req as any).user?.name
    );
    res.json({ success: true, data: staff });
  } catch (error: any) {
    const statusCode =
      error instanceof HttpError
        ? error.status
        : error.message === "Không tìm thấy Nhân viên"
        ? 404
        : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

// PATCH /api/staff/:id/password — chỉ Admin được đặt lại mật khẩu
staffRouter.patch("/:id/password", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { password, mustChangePassword } = req.body ?? {};
    await staffService.resetPassword(
      id,
      password,
      mustChangePassword !== undefined ? Boolean(mustChangePassword) : true,
      (req as any).user?.name
    );
    res.json({ success: true, message: "Đặt lại mật khẩu thành công" });
  } catch (error: any) {
    const statusCode =
      error instanceof HttpError
        ? error.status
        : error.message === "Không tìm thấy Nhân viên"
        ? 404
        : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});
