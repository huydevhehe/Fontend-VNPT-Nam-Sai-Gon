import { Router, Request, Response } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { LeadService } from "./lead.service.js";

export const leadRouter = Router();
const leadService = new LeadService();

// GET /api/leads
leadRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const leads = await leadService.getAll();
    res.json({ success: true, data: leads });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/leads
leadRouter.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { customerName, phone, group, channel, staffName, status, expectedValue, demandDescription } = req.body;

    const lead = await leadService.create({
      customerName,
      phone,
      group,
      channel,
      staffName,
      status,
      expectedValue: Number(expectedValue),
      demandDescription,
    });

    res.status(201).json({ success: true, data: lead });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PATCH /api/leads/:id/status
leadRouter.patch("/:id/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const lead = await leadService.updateStatus(id, status);
    res.json({ success: true, data: lead });
  } catch (error: any) {
    const statusCode = error.message === "Không tìm thấy Lead" ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});
