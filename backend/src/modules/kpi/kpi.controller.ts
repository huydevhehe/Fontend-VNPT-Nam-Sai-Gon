import { Router, Request, Response } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { requireAdmin } from "../../middleware/require-role.js";
import { HttpError } from "../auth/auth.service.js";
import { KpiService, assertKpiKey } from "./kpi.service.js";

export const kpiRouter = Router();
const kpiService = new KpiService();

// GET /api/kpi/formulas — mọi nhân viên đã đăng nhập xem được
kpiRouter.get("/formulas", requireAuth, async (_req: Request, res: Response) => {
  try {
    const formulas = await kpiService.getFormulas();
    res.json({ success: true, data: formulas });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/kpi/formulas/:key — Admin
kpiRouter.put("/formulas/:key", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const key = assertKpiKey(req.params.key);
    const admin = req.user?.name ?? req.user?.id ?? "Admin";
    const segments = req.body?.segments;
    if (!Array.isArray(segments)) {
      throw new HttpError(400, "Thiếu danh sách khoảng (segments)");
    }
    const saved = await kpiService.saveFormula(key, segments, admin);
    res.json({ success: true, data: saved });
  } catch (error: any) {
    const statusCode = error instanceof HttpError ? error.status : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

// POST /api/kpi/formulas/:key/reset — Admin
kpiRouter.post("/formulas/:key/reset", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const key = assertKpiKey(req.params.key);
    const reset = await kpiService.resetFormula(key);
    res.json({ success: true, data: reset });
  } catch (error: any) {
    const statusCode = error instanceof HttpError ? error.status : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});
