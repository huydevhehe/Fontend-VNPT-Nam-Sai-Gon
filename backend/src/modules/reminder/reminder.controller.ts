import { Router, Request, Response } from "express";
import { ReminderSettingsService } from "./reminder-settings.service.js";

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
