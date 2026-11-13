import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { requireAuth } from "../../middleware/require-auth.js";
import { requireAdmin } from "../../middleware/require-role.js";
import { resolveActorName } from "../../middleware/actor.js";
import { ROLES } from "../../constants/org.js";
import { HttpError } from "../auth/auth.service.js";
import { DebtService } from "./debt.service.js";

/** Giá trị chắc chắn không khớp bất kỳ `staff_name` nào — dùng khi không xác định được tên nhân viên hiện tại. */
const NO_MATCH_STAFF = "\u0000__NO_STAFF__\u0000";

const ALLOWED_EXCEL_MIMES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];
const ALLOWED_EXCEL_EXT = /\.(xlsx|xls)$/i;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const isAllowedMime = ALLOWED_EXCEL_MIMES.includes(file.mimetype);
    const isAllowedExt = ALLOWED_EXCEL_EXT.test(file.originalname);
    if (isAllowedMime || isAllowedExt) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file Excel .xlsx/.xls"));
    }
  },
});

function handleUpload(req: Request, res: Response, next: NextFunction) {
  upload.single("file")(req, res, (err: unknown) => {
    if (err) {
      const message = err instanceof Error ? err.message : "Lỗi upload file";
      res.status(400).json({ success: false, message });
      return;
    }
    next();
  });
}

export const debtRouter = Router();
const debtService = new DebtService();

// GET /api/debts
// Không phải Admin: ép staff = tên của người gọi (ép ở tầng API, không chỉ
// ẩn ở UI) — tham số `?staff=...` của client bị bỏ qua hoàn toàn.
debtRouter.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { month, status } = req.query;
    let staffFilter = req.query.staff as string | undefined;
    if (req.user?.role !== ROLES.ADMIN) {
      staffFilter = (await resolveActorName(req)) ?? NO_MATCH_STAFF;
    }
    const debts = await debtService.getAll({
      month: month as string,
      staff: staffFilter,
      status: status as string,
    });
    res.json({ success: true, data: debts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/debts — Admin thêm nợ lẻ (ngoài luồng import Excel)
debtRouter.post("/", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const operator = req.user?.name ?? req.user?.id ?? "Admin";
    const created = await debtService.createSingle(req.body ?? {}, operator);
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    const statusCode = error instanceof HttpError ? error.status : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

// POST /api/debts/import — chỉ Admin
debtRouter.post("/import", requireAuth, requireAdmin, handleUpload, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "Vui lòng đính kèm file Excel (.xlsx)" });
      return;
    }

    const month = (req.body.month as string) || "2026-10";
    const operator = req.user?.name ?? req.user?.id ?? "Admin";

    const result = await debtService.importExcel(req.file.buffer, month, operator);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/debts/:id/gach-no
debtRouter.patch("/:id/gach-no", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (req.user?.role !== ROLES.ADMIN) {
      const existing = await debtService.getById(id);
      const actorName = await resolveActorName(req);
      if (!existing || existing.staff_name.trim() !== (actorName ?? "").trim()) {
        res.status(403).json({ success: false, message: "Bạn chỉ được xử lý dữ liệu của mình" });
        return;
      }
    }
    const { amount, documentRef } = req.body;
    const operator = req.user?.name ?? req.user?.id ?? "Admin";
    const result = await debtService.gachNo(id, Number(amount), documentRef, operator);
    res.json(result);
  } catch (error: any) {
    const statusCode = error instanceof HttpError ? error.status : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

