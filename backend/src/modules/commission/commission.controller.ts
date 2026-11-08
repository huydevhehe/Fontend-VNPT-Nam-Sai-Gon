import { Router, Request, Response } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { requireAdmin } from "../../middleware/require-role.js";
import { CommissionService } from "./commission.service.js";

export const commissionRouter = Router();
const commissionService = new CommissionService();

// GET /api/commissions
commissionRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const commissions = await commissionService.getAll();
    res.json({ success: true, data: commissions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/commissions/:id/status
commissionRouter.patch("/:id/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const commission = await commissionService.updateStatus(id, status);
    res.json({ success: true, data: commission });
  } catch (error: any) {
    const statusCode = error.message === "Không tìm thấy Hoa hồng" ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

// PATCH /api/commissions/:id/amount — chỉ Admin được sửa số tiền hoa hồng.
commissionRouter.patch("/:id/amount", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, note } = req.body ?? {};

    if (typeof amount !== "number" || Number.isNaN(amount) || amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Số tiền hoa hồng không hợp lệ (phải là số >= 0)",
      });
    }

    const commission = await commissionService.updateAmount(id, amount, note ?? null);
    res.json({ success: true, data: commission });
  } catch (error: any) {
    const statusCode = error.message === "Không tìm thấy Hoa hồng" ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});
