import { Router, Request, Response } from "express";
import { CtvAccountsService } from "./ctv-accounts.service.js";
import { HttpError } from "../auth/auth.service.js";

// Đã được server.ts bảo vệ bằng requireAuth + requireAdmin.
export const ctvAccountsRouter = Router();
const service = new CtvAccountsService();

function sendError(res: Response, error: unknown): void {
  if (error instanceof HttpError) {
    res.status(error.status).json({ success: false, message: error.message });
    return;
  }
  res.status(500).json({ success: false, message: "Lỗi hệ thống, vui lòng thử lại" });
}

// GET /api/ctv-accounts?status=
ctvAccountsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const data = await service.list(status);
    res.json({ success: true, data });
  } catch (error) {
    sendError(res, error);
  }
});

// POST /api/ctv-accounts — Admin tạo trực tiếp tài khoản CTV
ctvAccountsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const adminName = req.user?.name || req.user?.id || "Admin";
    const data = await service.createByAdmin(req.body, adminName);
    res.status(201).json({ success: true, data });
  } catch (error) {
    sendError(res, error);
  }
});

// PATCH /api/ctv-accounts/:id/approve
ctvAccountsRouter.patch("/:id/approve", async (req: Request, res: Response) => {
  try {
    const data = await service.approve(req.params.id, req.user?.name || req.user?.id || "Admin");
    res.json({ success: true, data });
  } catch (error) {
    sendError(res, error);
  }
});

// PATCH /api/ctv-accounts/:id/reject
ctvAccountsRouter.patch("/:id/reject", async (req: Request, res: Response) => {
  try {
    const data = await service.reject(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    sendError(res, error);
  }
});
