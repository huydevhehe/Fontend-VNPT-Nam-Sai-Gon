import { Router, Request, Response } from "express";
import multer from "multer";
import { DebtService } from "./debt.service.js";

const upload = multer({ storage: multer.memoryStorage() });
export const debtRouter = Router();
const debtService = new DebtService();

// GET /api/debts
debtRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { month, staff, status } = req.query;
    const debts = await debtService.getAll({
      month: month as string,
      staff: staff as string,
      status: status as string,
    });
    res.json({ success: true, data: debts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/debts/import
debtRouter.post("/import", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "Vui lòng đính kèm file Excel (.xlsx)" });
      return;
    }

    const month = (req.body.month as string) || "2026-10";
    const operator = (req.body.operator as string) || "Admin";

    const result = await debtService.importExcel(req.file.buffer, month, operator);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/debts/:id/gach-no
debtRouter.patch("/:id/gach-no", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, documentRef, operator } = req.body;
    const result = await debtService.gachNo(id, Number(amount), documentRef, operator);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

