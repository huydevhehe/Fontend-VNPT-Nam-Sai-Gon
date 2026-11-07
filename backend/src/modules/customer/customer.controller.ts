import { Router, Request, Response } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { CustomerService, CustomerServiceError } from "./customer.service.js";

export const customerRouter = Router();
const customerService = new CustomerService();

function sendError(res: Response, error: any) {
  const status = error instanceof CustomerServiceError ? error.status : 500;
  res.status(status).json({ success: false, message: error.message });
}

customerRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { search, group } = req.query;
    const customers = await customerService.getAll(
      typeof search === "string" ? search : undefined,
      typeof group === "string" ? group : undefined
    );
    res.json({ success: true, data: customers });
  } catch (error: any) {
    sendError(res, error);
  }
});

customerRouter.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await customerService.create(req.body);
    res.status(201).json({ success: true, data: result.customer, message: result.message });
  } catch (error: any) {
    sendError(res, error);
  }
});

customerRouter.patch("/:id/transfer", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newStaff, handoverBatch } = req.body ?? {};
    const operator = req.user?.name ?? req.user?.id ?? "Admin";
    const result = await customerService.transfer(id, newStaff, operator, handoverBatch);
    res.json(result);
  } catch (error: any) {
    sendError(res, error);
  }
});
