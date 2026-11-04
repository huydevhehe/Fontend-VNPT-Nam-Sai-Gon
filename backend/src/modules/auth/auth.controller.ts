import { Router, Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { requireAuth } from "../../middleware/require-auth.js";

export const authRouter = Router();
const authService = new AuthService();

// POST /api/auth/login
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ success: false, message: "Vui lòng nhập tên đăng nhập và mật khẩu" });
      return;
    }

    const result = await authService.login(username, password);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message });
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
