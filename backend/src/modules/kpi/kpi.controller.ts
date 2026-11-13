import { Router, Request, Response } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { requireAdmin } from "../../middleware/require-role.js";
import { resolveActorName } from "../../middleware/actor.js";
import { ROLES } from "../../constants/org.js";
import { HttpError } from "../auth/auth.service.js";
import { KpiService, assertKpiKey } from "./kpi.service.js";

const MONTH_PATTERN = /^\d{4}-\d{2}$/;

function assertMonth(value: string): string {
  if (!MONTH_PATTERN.test(value)) {
    throw new HttpError(400, "Tháng phải theo định dạng YYYY-MM");
  }
  return value;
}

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

// GET /api/kpi/targets/:month — không phải Admin chỉ thấy chỉ tiêu của chính mình
kpiRouter.get("/targets/:month", requireAuth, async (req: Request, res: Response) => {
  try {
    const month = assertMonth(req.params.month);
    const targets = await kpiService.getTargets(month);
    if (req.user?.role === ROLES.ADMIN) {
      res.json({ success: true, data: targets });
      return;
    }
    const actorName = (await resolveActorName(req)) ?? "";
    res.json({
      success: true,
      data: targets.filter((t) => t.staffName.trim() === actorName.trim()),
    });
  } catch (error: any) {
    const statusCode = error instanceof HttpError ? error.status : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

// PUT /api/kpi/targets/:month — Admin nhập/sửa chỉ tiêu theo tháng
kpiRouter.put("/targets/:month", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const month = assertMonth(req.params.month);
    const admin = req.user?.name ?? req.user?.id ?? "Admin";
    const items = req.body?.items;
    if (!Array.isArray(items)) {
      throw new HttpError(400, "Thiếu danh sách chỉ tiêu (items)");
    }
    const normalized = items.map((item: { staffName?: unknown; kpiKey?: unknown; targetRate?: unknown }) => ({
      staffName: String(item.staffName ?? ""),
      kpiKey: assertKpiKey(String(item.kpiKey ?? "")),
      targetRate: Number(item.targetRate),
    }));
    const saved = await kpiService.upsertTargets(month, normalized, admin);
    res.json({ success: true, data: saved });
  } catch (error: any) {
    const statusCode = error instanceof HttpError ? error.status : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

// GET /api/kpi/performance?month=YYYY-MM — không phải Admin chỉ thấy dòng của chính mình
kpiRouter.get("/performance", requireAuth, async (req: Request, res: Response) => {
  try {
    const month = assertMonth(String(req.query.month ?? ""));
    const role = req.user?.role ?? "";
    const actorName = role === ROLES.ADMIN ? "" : ((await resolveActorName(req)) ?? "\u0000__NO_STAFF__\u0000");
    const rows = await kpiService.getPerformance(month, { role, name: actorName });
    res.json({ success: true, data: rows });
  } catch (error: any) {
    const statusCode = error instanceof HttpError ? error.status : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});
