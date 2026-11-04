import { Router, Request, Response } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { TerritoryService } from "./territory.service.js";

export const territoryRouter = Router();
const territoryService = new TerritoryService();

territoryRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const data = await territoryService.getAll();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

territoryRouter.patch("/:id/households", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { householdCount, quarterCount } = req.body;
    const operator = req.user?.name ?? req.user?.id ?? "Admin";
    const result = await territoryService.updateHouseholds(
      id,
      Number(householdCount),
      quarterCount !== undefined ? Number(quarterCount) : undefined,
      operator
    );
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

