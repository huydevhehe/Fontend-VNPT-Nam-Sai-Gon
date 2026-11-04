import { Router, Request, Response } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { CustomerService } from "./customer.service.js";

export const customerRouter = Router();
const customerService = new CustomerService();

customerRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const customers = await customerService.getAll(search as string);
    res.json({ success: true, data: customers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

customerRouter.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await customerService.create(req.body);
    res.status(201).json({ success: true, data: { id: result.id }, message: result.message });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

customerRouter.patch("/:id/transfer", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newStaff } = req.body;
    const operator = req.user?.name ?? req.user?.id ?? "Admin";
    const result = await customerService.transfer(id, newStaff, operator);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

