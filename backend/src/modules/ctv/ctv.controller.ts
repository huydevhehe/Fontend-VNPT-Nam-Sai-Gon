import { Router, Request, Response } from "express";
import { CtvService } from "./ctv.service.js";
import { HttpError } from "../auth/auth.service.js";

// Đã được server.ts bảo vệ bằng requireAuth + requireCtv.
// Mọi handler chỉ dùng id lấy từ JWT (req.user.id); query/body (kể cả ctvId) bị bỏ qua.
export const ctvRouter = Router();
const service = new CtvService();

function sendError(res: Response, error: unknown): void {
  if (error instanceof HttpError) {
    res.status(error.status).json({ success: false, message: error.message });
    return;
  }
  res.status(500).json({ success: false, message: "Lỗi hệ thống, vui lòng thử lại" });
}

function handler(load: (ctvId: string) => Promise<unknown>) {
  return async (req: Request, res: Response) => {
    try {
      const ctvId = req.user?.id;
      if (!ctvId) {
        res.status(401).json({ success: false, message: "Chưa đăng nhập" });
        return;
      }
      res.json({ success: true, data: await load(ctvId) });
    } catch (error) {
      sendError(res, error);
    }
  };
}

// GET /api/ctv/me
ctvRouter.get("/me", handler((id) => service.getProfile(id)));
// GET /api/ctv/summary
ctvRouter.get("/summary", handler((id) => service.getSummary(id)));
// GET /api/ctv/leads
ctvRouter.get("/leads", handler((id) => service.getLeads(id)));
// GET /api/ctv/contracts
ctvRouter.get("/contracts", handler((id) => service.getContracts(id)));
// GET /api/ctv/commissions
ctvRouter.get("/commissions", handler((id) => service.getCommissions(id)));
