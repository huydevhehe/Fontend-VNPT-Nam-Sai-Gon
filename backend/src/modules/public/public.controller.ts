import { Router, Request, Response } from "express";
import { createRateLimiter } from "../../middleware/rate-limit.js";
import { PublicService, PublicValidationError } from "./public.service.js";

// Giới hạn gửi form liên hệ: tối đa 5 lần mỗi 10 phút trên mỗi IP.
export const LEAD_RATE_LIMIT_MAX = 5;
export const LEAD_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

export const publicRouter = Router();
const service = new PublicService();

const leadRateLimit = createRateLimiter({
  max: LEAD_RATE_LIMIT_MAX,
  windowMs: LEAD_RATE_LIMIT_WINDOW_MS,
  message: "Bạn gửi quá nhiều lần, vui lòng thử lại sau ít phút",
});

// Tra mã giới thiệu: tối đa 60 lần mỗi 10 phút trên mỗi IP (chống dò mã).
const refLookupRateLimit = createRateLimiter({
  max: 60,
  windowMs: 10 * 60 * 1000,
  message: "Bạn thao tác quá nhiều lần, vui lòng thử lại sau ít phút",
});

// POST /api/public/leads
publicRouter.post("/leads", leadRateLimit, async (req: Request, res: Response) => {
  const body = req.body && typeof req.body === "object" ? req.body : {};

  // Honeypot: bot điền ô ẩn "website" → giả vờ thành công, không lưu.
  if (body.website) {
    res.status(201).json({ success: true, data: { message: "Đã ghi nhận" } });
    return;
  }

  try {
    await service.createLead({
      name: body.name,
      phone: body.phone,
      demand: body.demand,
      refCode: body.refCode,
    });
    res.status(201).json({ success: true, data: { message: "Đã ghi nhận" } });
  } catch (error) {
    if (error instanceof PublicValidationError) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    console.error("Public lead creation failed:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống, vui lòng thử lại" });
  }
});

// GET /api/public/ref/:code
publicRouter.get("/ref/:code", refLookupRateLimit, async (req: Request, res: Response) => {
  try {
    const valid = await service.isValidRefCode(req.params.code);
    res.json({ success: true, data: { valid } });
  } catch (error) {
    console.error("Public ref lookup failed:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống, vui lòng thử lại" });
  }
});
