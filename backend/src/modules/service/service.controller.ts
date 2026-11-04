import { Router, Request, Response } from "express";
import { ServiceService } from "./service.service.js";

export const serviceRouter = Router();
const serviceService = new ServiceService();

// GET /api/services
serviceRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { staff, expiringWithinDays } = req.query;
    const parsedDays =
      expiringWithinDays !== undefined ? Number(expiringWithinDays) : undefined;

    const services = await serviceService.getAll({
      staff: staff as string,
      expiringWithinDays: parsedDays,
    });
    res.json({ success: true, data: services });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
