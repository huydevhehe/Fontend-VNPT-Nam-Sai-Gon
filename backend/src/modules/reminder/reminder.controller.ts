import { Router, Request, Response } from "express";
import { ReminderSettingsService } from "./reminder-settings.service.js";
import { ReminderRunner } from "./reminder-runner.js";
import { query } from "../../database/db.js";
import { todayVn } from "../../utils/date-vn.js";

export const reminderRouter = Router();

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
