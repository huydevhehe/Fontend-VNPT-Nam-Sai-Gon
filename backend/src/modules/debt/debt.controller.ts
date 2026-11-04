import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { requireAuth } from "../../middleware/require-auth.js";
import { DebtService } from "./debt.service.js";

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
debtRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { month, staff, status } = req.query;
    const debts = await debtService.getAll({
      month: month as string,
      staff: staff as string,
      status: status as string,
    });
    res.json({ success: true, data: debts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/debts/import
debtRouter.post("/import", requireAuth, handleUpload, async (req: Request, res: Response): Promise<void> => {
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
debtRouter.patch("/:id/gach-no", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, documentRef } = req.body;
    const operator = req.user?.name ?? req.user?.id ?? "Admin";
    const result = await debtService.gachNo(id, Number(amount), documentRef, operator);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

