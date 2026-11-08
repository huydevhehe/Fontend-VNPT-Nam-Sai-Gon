import { Router, Request, Response } from "express";
import { AuthService, HttpError } from "./auth.service.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { createFailureLimiter, createRateLimiter } from "../../middleware/rate-limit.js";

export const authRouter = Router();
const authService = new AuthService();

// Đăng ký CTV: tối đa 10 lần mỗi giờ trên mỗi IP.
const registerRateLimit = createRateLimiter({
  max: 10,
  windowMs: 60 * 60 * 1000,
  message: "Bạn đăng ký quá nhiều lần, vui lòng thử lại sau",
});

// Key theo (IP, username) thay vì chỉ IP: nhiều tài khoản khác nhau đăng
// nhập từ cùng một IP (mạng văn phòng dùng NAT) không bị tính chung vào một
// hạn mức — chỉ brute-force nhắm vào ĐÚNG MỘT tài khoản mới bị chặn. Body
// thiếu/không hợp lệ username thì vẫn giới hạn theo IP để không bỏ lọt
// request dị dạng; username luôn được chuẩn hoá (trim + lowercase) để không
// bị bypass bằng khác biệt hoa/thường hoặc khoảng trắng.
function loginRateLimitKey(req: Request): string {
  const ip = req.ip || "unknown";
  const rawUsername = req.body?.username;
  if (typeof rawUsername !== "string") {
    return ip;
  }
  const username = rawUsername.trim().toLowerCase();
  if (!username) {
    return ip;
  }
  return `${ip}:${username}`;
}

const LOGIN_RATE_LIMIT_MESSAGE = "Bạn đăng nhập sai quá nhiều lần, vui lòng thử lại sau ít phút";

// Đăng nhập: tối đa 10 lần SAI mỗi 15 phút trên mỗi (IP, username) — chặn
// brute-force đoán mật khẩu mặc định nhân viên <mã NV>@Vnpt2026. Chỉ các lần
// đăng nhập SAI (401 "Tên đăng nhập hoặc mật khẩu không đúng") mới tính vào
// hạn mức: đăng nhập ĐÚNG (dù lặp lại nhiều lần — nhiều nhân viên cùng một
// mạng văn phòng, hoặc một tài khoản đăng nhập nhiều thiết bị) không bị tính,
// nên không khoá nhầm người dùng hợp lệ. Tài khoản Chờ duyệt/Từ chối/Ngừng
// hoạt động (403, mật khẩu đã đúng) cũng không tính vào hạn mức này.
const loginFailureLimiter = createFailureLimiter({
  max: 10,
  windowMs: 15 * 60 * 1000,
});

// POST /api/auth/login
authRouter.post("/login", async (req: Request, res: Response) => {
  const rateLimitKey = loginRateLimitKey(req);
  if (loginFailureLimiter.isBlocked(rateLimitKey)) {
    res.status(429).json({ success: false, message: LOGIN_RATE_LIMIT_MESSAGE });
    return;
  }

  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ success: false, message: "Vui lòng nhập tên đăng nhập và mật khẩu" });
      return;
    }

    const result = await authService.login(username, password);
    res.json({ success: true, data: result });
  } catch (error: any) {
    if (error instanceof HttpError) {
      if (error.status === 401) {
        loginFailureLimiter.recordFailure(rateLimitKey);
      }
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: "Không thể đăng nhập, vui lòng thử lại" });
  }
});

// POST /api/auth/register-ctv — CTV tự đăng ký, trạng thái "Chờ duyệt", không trả token
authRouter.post("/register-ctv", registerRateLimit, async (req: Request, res: Response) => {
  try {
    const result = await authService.registerCtv(req.body ?? {});
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    if (error instanceof HttpError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: "Không thể đăng ký, vui lòng thử lại" });
  }
});

// GET /api/auth/me
authRouter.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await authService.getById(req.user!.id);
    if (!user) {
      res.status(401).json({ success: false, message: "Không tìm thấy người dùng" });
      return;
    }
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/change-password — đổi mật khẩu (requireAuth)
authRouter.post("/change-password", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Chưa đăng nhập" });
      return;
    }
    const { currentPassword, newPassword } = req.body ?? {};
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới" });
      return;
    }
    await authService.changePassword(userId, currentPassword, newPassword);
    res.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (error: any) {
    if (error instanceof HttpError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    res.status(400).json({ success: false, message: error.message || "Không thể đổi mật khẩu" });
  }
});
