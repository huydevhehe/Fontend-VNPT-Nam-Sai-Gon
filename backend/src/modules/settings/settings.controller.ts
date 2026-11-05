import { Router, Request, Response } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { SettingsService } from "./settings.service.js";

export const settingsRouter = Router();

// GET /api/settings — chỉ Admin được xem cấu hình SMTP/Zalo hiện tại
settingsRouter.get("/", requireAuth, async (req: Request, res: Response) => {
  if (req.user?.role !== "Admin") {
    res.status(403).json({ success: false, message: "Chỉ Admin được phép xem Cài đặt hệ thống" });
    return;
  }

  try {
    const view = await SettingsService.getView();
    res.json({ success: true, data: view });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/settings — chỉ Admin được cập nhật cấu hình SMTP/Zalo
settingsRouter.put("/", requireAuth, async (req: Request, res: Response) => {
  if (req.user?.role !== "Admin") {
    res.status(403).json({ success: false, message: "Chỉ Admin được phép cập nhật Cài đặt hệ thống" });
    return;
  }

  try {
    const { smtpHost, smtpPort, smtpUser, smtpPass, zaloOaId, zaloOaToken } = req.body;
    const view = await SettingsService.update({
      smtpHost,
      smtpPort: smtpPort !== undefined && smtpPort !== "" ? Number(smtpPort) : undefined,
      smtpUser,
      smtpPass,
      zaloOaId,
      zaloOaToken,
    });
    res.json({ success: true, data: view });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});
