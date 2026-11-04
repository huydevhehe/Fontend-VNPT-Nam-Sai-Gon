import { Router, Request, Response } from "express";
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

territoryRouter.patch("/:id/households", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { householdCount, quarterCount, operator } = req.body;
    const result = await territoryService.updateHouseholds(
      id,
      Number(householdCount),
      quarterCount !== undefined ? Number(quarterCount) : undefined,
      operator
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

