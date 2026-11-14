import { Router, Request, Response } from "express";
import { requireAdmin } from "../../middleware/require-role.js";
import { CustomerTeamService, CustomerTeamServiceError } from "./customer-team.service.js";

export const customerTeamRouter = Router();
const customerTeamService = new CustomerTeamService();

function sendError(res: Response, error: any) {
  const status = error instanceof CustomerTeamServiceError ? error.status : 500;
  res.status(status).json({ success: false, message: error.message });
}

// GET /api/customer-teams — mọi nhân viên đã đăng nhập đều xem được (chọn Team khi tạo khách).
customerTeamRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const teams = await customerTeamService.list();
    res.json({ success: true, data: teams });
  } catch (error: any) {
    sendError(res, error);
  }
});

customerTeamRouter.post("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const team = await customerTeamService.create(req.body ?? {});
    res.status(201).json({ success: true, data: team });
  } catch (error: any) {
    sendError(res, error);
  }
});

customerTeamRouter.patch("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const team = await customerTeamService.update(req.params.id, req.body ?? {});
    res.json({ success: true, data: team });
  } catch (error: any) {
    sendError(res, error);
  }
});

customerTeamRouter.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    await customerTeamService.remove(req.params.id);
    res.json({ success: true, message: "Đã xóa team" });
  } catch (error: any) {
    sendError(res, error);
  }
});
