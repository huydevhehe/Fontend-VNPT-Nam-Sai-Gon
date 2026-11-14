import { Router, Request, Response } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { SettingsService } from "./settings.service.js";
import { sendTestMail } from "../notification/email.service.js";

export const settingsRouter = Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    const {
      smtpMode,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      smtpFromName,
      smtpFromEmail,
      zaloOaId,
      zaloOaToken,
      paymentBeneficiary,
      paymentAccountNo,
      paymentBankName,
      paymentSignerName,
    } = req.body;
    const view = await SettingsService.update({
      smtpMode,
      smtpHost,
      smtpPort: smtpPort !== undefined && smtpPort !== "" ? Number(smtpPort) : undefined,
      smtpUser,
      smtpPass,
      smtpFromName,
      smtpFromEmail,
      zaloOaId,
      zaloOaToken,
      paymentBeneficiary,
      paymentAccountNo,
      paymentBankName,
      paymentSignerName,
    });
    res.json({ success: true, data: view });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/settings/smtp/test — chỉ Admin, gửi thử tới một email bất kỳ.
// Có `override` thì dùng cấu hình đang nhập trên form (chưa Lưu); không có
// host (đã lưu hoặc override) → 400 rõ ràng, không rơi về Ethereal.
settingsRouter.post("/smtp/test", requireAuth, async (req: Request, res: Response) => {
  if (req.user?.role !== "Admin") {
    res.status(403).json({ success: false, message: "Chỉ Admin được phép gửi thử email" });
    return;
  }

  try {
    const { to, override } = req.body ?? {};
    if (typeof to !== "string" || !EMAIL_PATTERN.test(to.trim())) {
      res.status(400).json({ success: false, message: "Địa chỉ email \"Gửi thử tới\" không hợp lệ" });
      return;
    }

    const normalizedOverride = override
      ? {
          smtpMode: override.smtpMode,
          smtpHost: override.smtpHost,
          smtpPort:
            override.smtpPort !== undefined && override.smtpPort !== ""
              ? Number(override.smtpPort)
              : undefined,
          smtpUser: override.smtpUser,
          smtpPass: override.smtpPass,
          smtpFromName: override.smtpFromName,
          smtpFromEmail: override.smtpFromEmail,
        }
      : undefined;

    const result = await sendTestMail(to.trim(), normalizedOverride);
    if (!result.sent) {
      res.status(400).json({ success: false, message: result.error || "Gửi thử thất bại", data: result });
      return;
    }
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});
