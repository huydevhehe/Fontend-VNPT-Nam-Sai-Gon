import { Router, Request, Response } from "express";
import multer from "multer";
import { requireAuth } from "../../middleware/require-auth.js";
import { RenewalService } from "./renewal.service.js";

const upload = multer({ storage: multer.memoryStorage() });
export const renewalRouter = Router();
const renewalService = new RenewalService();

// GET /api/renewals
renewalRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { cohort, staff, status } = req.query;
    const renewals = await renewalService.getAll({
      cohort: cohort as string,
      staff: staff as string,
      status: status as string,
    });
    res.json({ success: true, data: renewals });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/renewals/import
renewalRouter.post("/import", requireAuth, upload.single("file"), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "Vui lòng đính kèm file Excel (.xlsx)" });
      return;
    }

    const cohort = (req.body.cohort as string) || "THÁNG T";
    const operator = (req.body.operator as string) || "Admin";

    const result = await renewalService.importExcel(req.file.buffer, cohort, operator);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/renewals/:id/status
renewalRouter.patch("/:id/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, failureReason, operator } = req.body;
    const result = await renewalService.updateStatus(id, status, failureReason, operator);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

