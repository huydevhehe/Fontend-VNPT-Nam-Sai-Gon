import { Router, Request, Response } from "express";
import { PublicService, PublicValidationError } from "./public.service.js";

// Giới hạn gửi form liên hệ: tối đa 5 lần mỗi 10 phút trên mỗi IP.
export const LEAD_RATE_LIMIT_MAX = 5;
export const LEAD_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_SWEEP_THRESHOLD = 1000;

export const publicRouter = Router();
const service = new PublicService();

const hits = new Map<string, number[]>();

function sweepExpired(now: number): void {
  for (const [ip, times] of hits) {
    if (times.every((t) => now - t >= LEAD_RATE_LIMIT_WINDOW_MS)) {
      hits.delete(ip);
    }
  }
}

/** Ghi nhận một lần gọi; trả true nếu IP đã vượt giới hạn. */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (hits.size > RATE_LIMIT_SWEEP_THRESHOLD) {
    sweepExpired(now);
  }
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < LEAD_RATE_LIMIT_WINDOW_MS);
  if (recent.length >= LEAD_RATE_LIMIT_MAX) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

// POST /api/public/leads
publicRouter.post("/leads", async (req: Request, res: Response) => {
  if (isRateLimited(req.ip || "unknown")) {
    res.status(429).json({ success: false, message: "Bạn gửi quá nhiều lần, vui lòng thử lại sau ít phút" });
    return;
  }

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
publicRouter.get("/ref/:code", async (req: Request, res: Response) => {
  try {
    const valid = await service.isValidRefCode(req.params.code);
    res.json({ success: true, data: { valid } });
  } catch (error) {
    console.error("Public ref lookup failed:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống, vui lòng thử lại" });
  }
});
