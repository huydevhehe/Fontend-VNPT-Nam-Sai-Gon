import { Router, Request, Response } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { ContractService } from "./contract.service.js";

export const contractRouter = Router();
const contractService = new ContractService();

// GET /api/contracts
contractRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const contracts = await contractService.getAll();
    res.json({ success: true, data: contracts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/contracts/:id/status
contractRouter.patch("/:id/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { deploymentStatus, paymentStatus, documentStatus, totalValue } = req.body;

    const contract = await contractService.updateStatus(id, {
      deploymentStatus,
      paymentStatus,
      documentStatus,
      totalValue: totalValue !== undefined ? Number(totalValue) : undefined,
    });

    res.json({ success: true, data: contract });
  } catch (error: any) {
    const statusCode = error.message === "Không tìm thấy Hợp đồng" ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});
