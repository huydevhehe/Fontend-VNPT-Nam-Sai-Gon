import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { ReminderSettingsService } from "./reminder-settings.service.js";
import { ReminderRunner } from "./reminder-runner.js";
import { ReminderImportService } from "./reminder-import.service.js";
import { query } from "../../database/db.js";
import { todayVn } from "../../utils/date-vn.js";

export const reminderRouter = Router();

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

// GET /api/reminders/settings
reminderRouter.get("/settings", async (_req: Request, res: Response) => {
  try {
    const view = await ReminderSettingsService.get();
    res.json({ success: true, data: view });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/reminders/settings
reminderRouter.put("/settings", async (req: Request, res: Response) => {
  try {
    const { enabled, runTime, daysBefore, notifyStaff, notifyCustomer, extraCc } = req.body ?? {};
    const view = await ReminderSettingsService.update({
      enabled,
      runTime,
      daysBefore,
      notifyStaff,
      notifyCustomer,
      extraCc,
    });
    res.json({ success: true, data: view });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/reminders/run-now — chạy ngay, bỏ qua giờ cấu hình nhưng vẫn
// không gửi trùng (khóa duy nhất trong reminder_logs).
reminderRouter.post("/run-now", async (_req: Request, res: Response) => {
  try {
    const result = await ReminderRunner.run(todayVn(), { force: true });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reminders/logs?limit=200
reminderRouter.get("/logs", async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 200, 1), 1000);
    const rows = await query(
      "SELECT * FROM reminder_logs ORDER BY sent_at DESC LIMIT ?",
      [limit]
    );
    res.json({ success: true, data: rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/reminders/files/inspect — đọc file, trả về sheet/headers/5 dòng mẫu, KHÔNG lưu gì.
reminderRouter.post("/files/inspect", handleUpload, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "Vui lòng đính kèm file Excel (.xlsx)" });
      return;
    }
    const result = ReminderImportService.inspectFile(req.file.buffer);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/reminders/files/import — nhập đợt nhắc hạn mới từ file + cấu hình cột.
reminderRouter.post("/files/import", handleUpload, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "Vui lòng đính kèm file Excel (.xlsx)" });
      return;
    }
    const { name, daysBefore, columns } = req.body ?? {};
    const parsedDaysBefore = typeof daysBefore === "string" ? JSON.parse(daysBefore) : daysBefore;
    const parsedColumns = typeof columns === "string" ? JSON.parse(columns) : columns;
    const operator = req.user?.name ?? req.user?.id ?? "Admin";

    const result = await ReminderImportService.importFile(req.file.buffer, req.file.originalname, {
      name: name || "Đợt nhắc hạn",
      daysBefore: parsedDaysBefore,
      columns: parsedColumns,
      importedBy: operator,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/reminders/files — danh sách đợt nhắc hạn từ file.
reminderRouter.get("/files", async (_req: Request, res: Response) => {
  try {
    const batches = await ReminderImportService.listBatches();
    res.json({ success: true, data: batches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/reminders/files/:batchId
reminderRouter.patch("/files/:batchId", async (req: Request, res: Response) => {
  try {
    const { enabled, daysBefore, name } = req.body ?? {};
    await ReminderImportService.updateBatch(req.params.batchId, { enabled, daysBefore, name });
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/reminders/files/:batchId — xóa đợt + mục của đợt; log giữ nguyên.
reminderRouter.delete("/files/:batchId", async (req: Request, res: Response) => {
  try {
    await ReminderImportService.deleteBatch(req.params.batchId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});
