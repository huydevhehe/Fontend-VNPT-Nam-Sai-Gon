import { Router, Request, Response } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { requireAdmin } from "../../middleware/require-role.js";
import { TerritoryService, TerritoryServiceError } from "./territory.service.js";

export const territoryRouter = Router();
const territoryService = new TerritoryService();

async function handle(res: Response, status: number, action: () => Promise<unknown>) {
  try {
    const data = await action();
    res.status(status).json({ success: true, data });
  } catch (error: any) {
    const code = error instanceof TerritoryServiceError ? error.status : 500;
    if (code === 500) {
      console.error("Territory module error:", error);
    }
    res.status(code).json({ success: false, message: error.message });
  }
}

territoryRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const data = await territoryService.getAll();
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Territory module error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Các path /officials/... và /quarters/... phải khai báo TRƯỚC /:id/... để không bị bắt nhầm.
territoryRouter.patch("/officials/:officialId", requireAdmin, (req: Request, res: Response) =>
  handle(res, 200, () => territoryService.updateOfficial(String(req.params.officialId), req.body ?? {}))
);

territoryRouter.delete("/officials/:officialId", requireAdmin, (req: Request, res: Response) =>
  handle(res, 200, () => territoryService.deleteOfficial(String(req.params.officialId)))
);

territoryRouter.patch("/quarters/:quarterId", requireAdmin, (req: Request, res: Response) =>
  handle(res, 200, () => territoryService.updateQuarter(String(req.params.quarterId), req.body ?? {}))
);

territoryRouter.delete("/quarters/:quarterId", requireAdmin, (req: Request, res: Response) =>
  handle(res, 200, () => territoryService.deleteQuarter(String(req.params.quarterId)))
);

territoryRouter.get("/:id/detail", (req: Request, res: Response) =>
  handle(res, 200, () => territoryService.getDetail(String(req.params.id)))
);

territoryRouter.post("/:id/officials", requireAdmin, (req: Request, res: Response) =>
  handle(res, 201, () => territoryService.createOfficial(String(req.params.id), req.body ?? {}))
);

territoryRouter.post("/:id/quarters", requireAdmin, (req: Request, res: Response) =>
  handle(res, 201, () => territoryService.createQuarter(String(req.params.id), req.body ?? {}))
);

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
