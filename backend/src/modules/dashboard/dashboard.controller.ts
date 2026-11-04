import { Router, Request, Response } from "express";
import { DashboardService } from "./dashboard.service.js";

export const dashboardRouter = Router();
const dashboardService = new DashboardService();

dashboardRouter.get("/stats", async (req: Request, res: Response) => {
  try {
    const { month } = req.query;
    const stats = await dashboardService.getLiveStats(month as string);
    res.json({ success: true, ...stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

