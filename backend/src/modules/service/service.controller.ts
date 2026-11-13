import { Router, Request, Response } from "express";
import { requireAdmin } from "../../middleware/require-role.js";
import { ServiceService, ServiceServiceError } from "./service.service.js";

export const serviceRouter = Router();
const serviceService = new ServiceService();

function sendError(res: Response, error: any) {
  const status = error instanceof ServiceServiceError ? error.status : 500;
  res.status(status).json({ success: false, message: error.message });
}

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

// POST /api/services
serviceRouter.post("/", async (req: Request, res: Response) => {
  try {
    const service = await serviceService.create(req.body ?? {});
    res.status(201).json({ success: true, data: service });
  } catch (error: any) {
    sendError(res, error);
  }
});

// PATCH /api/services/:id
serviceRouter.patch("/:id", async (req: Request, res: Response) => {
  try {
    const service = await serviceService.update(req.params.id, req.body ?? {});
    res.json({ success: true, data: service });
  } catch (error: any) {
    sendError(res, error);
  }
});

// DELETE /api/services/:id — chỉ Admin
serviceRouter.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    await serviceService.remove(req.params.id);
    res.json({ success: true, message: "Đã xóa dịch vụ" });
  } catch (error: any) {
    sendError(res, error);
  }
});
