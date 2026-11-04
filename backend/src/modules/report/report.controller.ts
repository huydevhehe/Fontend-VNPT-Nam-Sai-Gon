import { Router, Request, Response } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { ReportService } from "./report.service.js";

export const reportRouter = Router();
const reportService = new ReportService();

// GET /api/reports/audit-logs — chỉ Admin được xem Nhật ký hệ thống
reportRouter.get("/audit-logs", requireAuth, async (req: Request, res: Response) => {
  if (req.user?.role !== "Admin") {
    res.status(403).json({ success: false, message: "Chỉ Admin được phép xem Nhật ký hệ thống" });
    return;
  }

  try {
    const logs = await reportService.getAuditLogs();
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reports/summary — số liệu báo cáo tổng hợp, yêu cầu đăng nhập
reportRouter.get("/summary", requireAuth, async (_req: Request, res: Response) => {
  try {
    const summary = await reportService.getSummary();
    res.json({ success: true, data: summary });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
