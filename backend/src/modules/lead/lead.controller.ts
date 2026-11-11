import { Router, Request, Response } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { LeadService, LeadServiceError } from "./lead.service.js";

export const leadRouter = Router();
const leadService = new LeadService();

function sendError(res: Response, error: any, fallbackStatus: number) {
  const status = error instanceof LeadServiceError ? error.status : fallbackStatus;
  res.status(status).json({ success: false, message: error.message });
}

// GET /api/leads
leadRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const leads = await leadService.getAll();
    res.json({ success: true, data: leads });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/leads/ctv-options (khai báo trước mọi route /:id)
leadRouter.get("/ctv-options", async (_req: Request, res: Response) => {
  try {
    const options = await leadService.getCtvOptions();
    res.json({ success: true, data: options });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/leads
leadRouter.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const {
      customerName,
      phone,
      group,
      channel,
      staffName,
      status,
      expectedValue,
      demandDescription,
      territoryId,
      referredByCtvId,
      note,
    } = req.body ?? {};

    const lead = await leadService.create({
      customerName,
      phone,
      group,
      channel,
      staffName,
      status,
      expectedValue: expectedValue !== undefined ? Number(expectedValue) : undefined,
      demandDescription,
      territoryId,
      referredByCtvId,
      note,
    });

    res.status(201).json({ success: true, data: lead });
  } catch (error: any) {
    sendError(res, error, 400);
  }
});

// PATCH /api/leads/:id/status
leadRouter.patch("/:id/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body ?? {};

    const lead = await leadService.updateStatus(id, status);
    res.json({ success: true, data: lead });
  } catch (error: any) {
    sendError(res, error, 400);
  }
});

// PATCH /api/leads/:id/assignment
leadRouter.patch("/:id/assignment", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { staffName, territoryId } = req.body ?? {};

    const lead = await leadService.assign(id, { staffName, territoryId });
    res.json({ success: true, data: lead });
  } catch (error: any) {
    sendError(res, error, 400);
  }
});

// PATCH /api/leads/:id/note
leadRouter.patch("/:id/note", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { note } = req.body ?? {};

    const lead = await leadService.updateNote(id, typeof note === "string" ? note : "");
    res.json({ success: true, data: lead });
  } catch (error: any) {
    sendError(res, error, 400);
  }
});
