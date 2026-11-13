import { Router, Request, Response } from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import { requireAuth } from "../../middleware/require-auth.js";
import { requireAdmin } from "../../middleware/require-role.js";
import { CustomerService, CustomerServiceError } from "./customer.service.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

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

// PATCH /api/customers/team — gán/gỡ team cho nhiều khách cùng lúc (chỉ Admin).
// Đặt TRƯỚC "/:id" để không bị route "/:id" (id="team") nuốt mất.
customerRouter.patch("/team", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { customerIds, teamId } = req.body ?? {};
    const updated = await customerService.assignTeam(customerIds, teamId ?? null);
    res.json({ success: true, data: { updated } });
  } catch (error: any) {
    sendError(res, error);
  }
});

customerRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const customer = await customerService.getById(req.params.id);
    res.json({ success: true, data: customer });
  } catch (error: any) {
    sendError(res, error);
  }
});

customerRouter.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const operator = { name: req.user?.name ?? req.user?.id ?? "Admin", role: req.user?.role ?? "" };
    const updated = await customerService.update(id, req.body ?? {}, operator);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    sendError(res, error);
  }
});

customerRouter.patch("/:id/transfer", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newStaff } = req.body ?? {};
    const operator = req.user?.name ?? req.user?.id ?? "Admin";
    const result = await customerService.transfer(id, newStaff, operator);
    res.json(result);
  } catch (error: any) {
    sendError(res, error);
  }
});

customerRouter.patch("/:id/transfer-caring", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newCaringStaff, handoverBatch } = req.body ?? {};
    const operator = req.user?.name ?? req.user?.id ?? "Admin";
    const result = await customerService.transferCaringStaff(id, newCaringStaff, operator, handoverBatch);
    res.json(result);
  } catch (error: any) {
    sendError(res, error);
  }
});

// POST /api/customers/batches — nhập / xác lập lại tập KHDN chăm theo đợt (chỉ Admin, payload JSON)
customerRouter.post("/batches", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const operator = req.user?.name ?? req.user?.id ?? "Admin";
    const result = await customerService.importBatch(req.body, operator);
    res.status(200).json({
      success: true,
      data: result,
      message: `Đã xử lý ${result.totalProcessed} khách hàng: tạo mới ${result.createdCount}, cập nhật ${result.updatedCount}, gỡ gán cũ ${result.clearedCount}`,
    });
  } catch (error: any) {
    sendError(res, error);
  }
});

// POST /api/customers/batches/upload — upload file Excel đợt KHDN chăm (chỉ Admin)
customerRouter.post(
  "/batches/upload",
  requireAuth,
  requireAdmin,
  upload.single("file"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: "Vui lòng đính kèm file Excel (.xlsx / .xls)" });
        return;
      }
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        res.status(400).json({ success: false, message: "File Excel không có sheet nào" });
        return;
      }
      const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets[sheetName]);
      if (!rawRows || rawRows.length === 0) {
        res.status(400).json({ success: false, message: "File Excel rỗng" });
        return;
      }

      const customers = rawRows
        .map((row) => {
          const keys = Object.keys(row);
          const findVal = (keywords: string[]) => {
            const key = keys.find((k) => {
              const norm = k.toLowerCase().trim();
              return keywords.some((kw) => norm.includes(kw));
            });
            return key ? String(row[key] ?? "").trim() : "";
          };

          const name = findVal(["tên khách", "tên kh", "tên doanh nghiệp", "khách hàng", "name"]);
          const identityCode = findVal(["mã số thuế", "mst", "cccd", "cmnd", "identity", "mã định danh"]);
          const phone = findVal(["số điện thoại", "sđt", "điện thoại", "phone", "tel"]);
          const address = findVal(["địa chỉ", "đ/c", "address"]);
          const services = findVal(["dịch vụ", "services", "gói"]);
          const type = findVal(["loại", "type"]) || "Doanh nghiệp";

          return {
            name,
            identityCode: identityCode || undefined,
            phone: phone || undefined,
            address: address || undefined,
            services: services || undefined,
            type,
          };
        })
        .filter((c) => Boolean(c.name));

      if (customers.length === 0) {
        res.status(400).json({
          success: false,
          message: "Không tìm thấy dòng khách hàng hợp lệ (cần cột Tên khách hàng)",
        });
        return;
      }

      const { territoryId, amCaringStaff, handoverBatch, mode } = req.body ?? {};
      const operator = req.user?.name ?? req.user?.id ?? "Admin";

      const result = await customerService.importBatch(
        {
          territoryId,
          amCaringStaff,
          handoverBatch,
          mode,
          customers,
        },
        operator
      );

      res.status(200).json({
        success: true,
        data: result,
        message: `Đã xử lý ${result.totalProcessed} khách hàng: tạo mới ${result.createdCount}, cập nhật ${result.updatedCount}, gỡ gán cũ ${result.clearedCount}`,
      });
    } catch (error: any) {
      sendError(res, error);
    }
  }
);
