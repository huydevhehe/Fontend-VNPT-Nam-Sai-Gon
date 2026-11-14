import { Router, Request, Response } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { requireAdmin } from "../../middleware/require-role.js";
import { StaffService } from "./staff.service.js";
import { HttpError } from "../auth/auth.service.js";

export const staffRouter = Router();
const staffService = new StaffService();

// GET /api/staff — dữ liệu nhân sự/doanh thu từng người, yêu cầu đăng nhập
staffRouter.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const month = req.query.month as string | undefined;
    const staff = await staffService.getAll({ status, month });
    res.json({ success: true, data: staff });
  } catch (error: any) {
    const statusCode = error instanceof HttpError ? error.status : 500;
    res.status(statusCode).json({ success: false, message: error.message });
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

// GET /api/staff/:id/references — chỉ Admin được xem số bản ghi tham chiếu
staffRouter.get("/:id/references", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const staff = await staffService.getById(id);
    if (!staff) {
      throw new HttpError(404, "Không tìm thấy Nhân viên");
    }
    const references = await staffService.countReferences(staff.name);
    res.json({ success: true, data: references });
  } catch (error: any) {
    const statusCode = error instanceof HttpError ? error.status : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

// PATCH /api/staff/:id/status — chỉ Admin được đình chỉ / ngừng / mở lại
staffRouter.patch("/:id/status", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body ?? {};
    const updated = await staffService.changeStatus(
      id,
      { status, reason },
      (req as any).user?.name || "Admin"
    );
    res.json({ success: true, data: updated });
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
      } as any,
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
