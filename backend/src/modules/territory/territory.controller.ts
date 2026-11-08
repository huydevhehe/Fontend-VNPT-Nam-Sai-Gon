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

// PATCH /api/territories/:id/stats — cập nhật dân số, số trường theo cấp, doanh thu
territoryRouter.patch("/:id/stats", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { population, schoolMamnon, schoolTieuhoc, schoolThcs, schoolThpt, revenue } = req.body;
    const operator = req.user?.name ?? req.user?.id ?? "Admin";
    const toNum = (v: unknown) => (v === undefined || v === null || v === "" ? undefined : Number(v));
    const updated = await territoryService.updateStats(
      id,
      {
        population: toNum(population),
        schoolMamnon: toNum(schoolMamnon),
        schoolTieuhoc: toNum(schoolTieuhoc),
        schoolThcs: toNum(schoolThcs),
        schoolThpt: toNum(schoolThpt),
        revenue: toNum(revenue),
      },
      operator
    );
    res.json({ success: true, data: updated });
  } catch (error: any) {
    const statusCode = error.message === "Không tìm thấy địa bàn" ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

// GET /api/territories/:id/contacts — danh sách đầu mối nhân sự của 1 phường
// (đã khoá requireAuth — route này ban đầu mở công khai, vá lại cho nhất
// quán với phần còn lại của module.)
territoryRouter.get("/:id/contacts", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await territoryService.getWardContacts(id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/territories/:id/contacts — thêm đầu mối nhân sự
territoryRouter.post("/:id/contacts", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { unit, department, fullName, position, phone, amInCharge } = req.body;
    const operator = req.user?.name ?? req.user?.id ?? "Admin";
    const created = await territoryService.createWardContact(
      id,
      { unit, department, fullName, position, phone, amInCharge },
      operator
    );
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PATCH /api/territories/contacts/:contactId — sửa đầu mối nhân sự
territoryRouter.patch("/contacts/:contactId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { contactId } = req.params;
    const { unit, department, fullName, position, phone, amInCharge } = req.body;
    const operator = req.user?.name ?? req.user?.id ?? "Admin";
    const updated = await territoryService.updateWardContact(
      contactId,
      { unit, department, fullName, position, phone, amInCharge },
      operator
    );
    res.json({ success: true, data: updated });
  } catch (error: any) {
    const statusCode = error.message === "Không tìm thấy đầu mối" ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

// DELETE /api/territories/contacts/:contactId — xóa đầu mối nhân sự
territoryRouter.delete("/contacts/:contactId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { contactId } = req.params;
    const operator = req.user?.name ?? req.user?.id ?? "Admin";
    const result = await territoryService.deleteWardContact(contactId, operator);
    res.json(result);
  } catch (error: any) {
    const statusCode = error.message === "Không tìm thấy đầu mối" ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});
