import { Router, Request, Response } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { requireAdmin } from "../../middleware/require-role.js";
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

// POST /api/contracts
contractRouter.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const {
      transactionCode,
      customerName,
      subscriberCodes,
      totalValue,
      channel,
      leadId,
      territoryId,
      amStaff,
      serviceGroup,
      serviceName,
      packageName,
      paymentMethod,
      customerId,
      taxCode,
      contractNumber,
      signedDate,
    } = req.body;

    const contract = await contractService.create({
      transactionCode,
      customerName,
      subscriberCodes,
      totalValue: Number(totalValue),
      channel,
      leadId,
      territoryId,
      amStaff,
      serviceGroup,
      serviceName,
      packageName,
      paymentMethod,
      customerId,
      taxCode,
      contractNumber,
      signedDate,
    });

    res.status(201).json({ success: true, data: contract });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PATCH /api/contracts/:id
contractRouter.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      customerName,
      subscriberCodes,
      totalValue,
      channel,
      leadId,
      territoryId,
      amStaff,
      serviceGroup,
      serviceName,
      packageName,
      paymentMethod,
      customerId,
      taxCode,
      contractNumber,
      signedDate,
    } = req.body;

    const actor = {
      role: (req as any).user?.role || "staff",
      name: (req as any).user?.name,
    };

    const contract = await contractService.updateInfo(
      id,
      {
        customerName,
        subscriberCodes,
        totalValue: totalValue !== undefined ? Number(totalValue) : undefined,
        channel,
        leadId,
        territoryId,
        amStaff,
        serviceGroup,
        serviceName,
        packageName,
        paymentMethod,
        customerId,
        taxCode,
        contractNumber,
        signedDate,
      },
      actor
    );

    res.json({ success: true, data: contract });
  } catch (error: any) {
    if (error.message === "Không có quyền chỉnh sửa đơn hàng này") {
      res.status(403).json({ success: false, message: error.message });
      return;
    }
    const statusCode = error.message === "Không tìm thấy Hợp đồng" ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

// POST /api/contracts/:id/payments
contractRouter.post("/:id/payments", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, paidDate, note } = req.body;
    const actorName = (req as any).user?.name || (req as any).user?.username || "Admin";

    const contract = await contractService.addPayment(
      id,
      {
        amount: Number(amount),
        paidDate,
        note,
      },
      actorName
    );

    res.status(201).json({ success: true, data: contract });
  } catch (error: any) {
    const statusCode = error.message === "Không tìm thấy Hợp đồng" ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

// GET /api/contracts/:id/payments
contractRouter.get("/:id/payments", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payments = await contractService.listPayments(id);
    res.json({ success: true, data: payments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/contracts/payments/:paymentId
contractRouter.delete("/payments/:paymentId", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const contract = await contractService.deletePayment(paymentId);
    res.json({ success: true, data: contract });
  } catch (error: any) {
    const statusCode = error.message === "Không tìm thấy lần thu tiền" ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
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

// POST /api/contracts/:id/payments
contractRouter.post("/:id/payments", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, paidDate, note } = req.body;
    const actorName = (req as any).user?.name || (req as any).user?.username || "Admin";

    const contract = await contractService.addPayment(
      id,
      {
        amount: Number(amount),
        paidDate,
        note,
      },
      actorName
    );

    res.status(201).json({ success: true, data: contract });
  } catch (error: any) {
    const statusCode = error.message === "Không tìm thấy Hợp đồng" ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

// GET /api/contracts/:id/payments
contractRouter.get("/:id/payments", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payments = await contractService.listPayments(id);
    res.json({ success: true, data: payments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/contracts/payments/:paymentId
contractRouter.delete("/payments/:paymentId", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const contract = await contractService.deletePayment(paymentId);
    res.json({ success: true, data: contract });
  } catch (error: any) {
    const statusCode = error.message === "Không tìm thấy lần thu tiền" ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});
