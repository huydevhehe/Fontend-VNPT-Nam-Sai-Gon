import { Router, Request, Response } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
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
staffRouter.post("/", requireAuth, async (req: Request, res: Response) => {
  if (req.user?.role !== "Admin") {
    res.status(403).json({ success: false, message: "Chỉ Admin được phép tạo Nhân viên" });
    return;
  }

  try {
    const { code, name, role, territory, email, password } = req.body;
    const staff = await staffService.create({ code, name, role, territory, email, password });
    res.status(201).json({ success: true, data: staff });
  } catch (error: any) {
    const statusCode = error instanceof HttpError ? error.status : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

// PATCH /api/staff/:id — chỉ Admin được cập nhật
staffRouter.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  if (req.user?.role !== "Admin") {
    res.status(403).json({ success: false, message: "Chỉ Admin được phép cập nhật Nhân viên" });
    return;
  }

  try {
    const { id } = req.params;
    const { name, role, territory, status, email } = req.body;

    const staff = await staffService.update(id, { name, role, territory, status, email });
    res.json({ success: true, data: staff });
  } catch (error: any) {
    const statusCode = error.message === "Không tìm thấy Nhân viên" ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});
