import { query, run } from "../../database/db.js";
import { SERVICE_GROUPS, PAYMENT_METHODS } from "../../constants/org.js";
import { todayVn } from "../../utils/date-vn.js";

export interface ServiceRow {
  id: string;
  customer_name: string;
  service_name: string;
  service_code: string;
  start_date: string;
  expiration_date: string;
  staff_name: string;
  customer_id?: string | null;
  service_group?: string | null;
  package_name?: string | null;
  payment_type?: string | null;
}

export interface ServiceRecordDto {
  id: string;
  customerName: string;
  serviceName: string;
  serviceCode: string;
  startDate: string;
  expirationDate: string;
  daysRemaining: number;
  staffName: string;
  isExpired: boolean;
  customerId: string | null;
  serviceGroup: string | null;
  packageName: string | null;
  paymentType: string | null;
}

export class ServiceServiceError extends Error {
  constructor(
    message: string,
    public readonly status: 400 | 404
  ) {
    super(message);
  }
}

function toServiceRecord(row: ServiceRow): ServiceRecordDto {
  const daysRemaining = Math.ceil(
    (new Date(row.expiration_date).getTime() - new Date().getTime()) / 86400000
  );

  return {
    id: row.id,
    customerName: row.customer_name,
    serviceName: row.service_name,
    serviceCode: row.service_code,
    startDate: row.start_date,
    expirationDate: row.expiration_date,
    daysRemaining,
    staffName: row.staff_name,
    isExpired: daysRemaining < 0,
    customerId: row.customer_id ?? null,
    serviceGroup: row.service_group ?? null,
    packageName: row.package_name ?? null,
    paymentType: row.payment_type ?? null,
  };
}

function isValidServiceGroup(v: unknown): v is (typeof SERVICE_GROUPS)[number] {
  return typeof v === "string" && (SERVICE_GROUPS as readonly string[]).includes(v);
}

function isValidPaymentType(v: unknown): v is (typeof PAYMENT_METHODS)[number] {
  return typeof v === "string" && (PAYMENT_METHODS as readonly string[]).includes(v);
}

/**
 * Cập nhật lại tóm tắt dịch vụ trên bảng customers (cột `services` nối tên
 * dịch vụ bằng ", ", `nearest_expiration` = ngày hết hạn sớm nhất còn hiệu
 * lực từ hôm nay) để bảng danh sách khách hàng cũ (dòng 1 `customers`) vẫn
 * hiển thị đúng sau khi thêm/sửa/xóa dịch vụ của khách.
 */
async function refreshCustomerSummary(customerId: string): Promise<void> {
  const rows = await query<{ service_name: string; expiration_date: string }>(
    "SELECT service_name, expiration_date FROM services WHERE customer_id = ? ORDER BY expiration_date ASC",
    [customerId]
  );

  const servicesJoined = rows.map((r) => r.service_name).join(", ");
  const today = todayVn();
  const nearest = rows.find((r) => r.expiration_date >= today);

  await run("UPDATE customers SET services = ?, nearest_expiration = ? WHERE id = ?", [
    servicesJoined || null,
    nearest ? nearest.expiration_date : null,
    customerId,
  ]);
}

export interface CreateServiceInput {
  customerId: string;
  serviceGroup: string;
  serviceName: string;
  packageName?: string;
  serviceCode: string;
  paymentType: string;
  startDate: string;
  expirationDate: string;
  staffName?: string;
}

export class ServiceService {
  async getAll(filters: { staff?: string; expiringWithinDays?: number }): Promise<ServiceRecordDto[]> {
    let sql = "SELECT * FROM services WHERE 1=1";
    const params: any[] = [];

    if (filters.staff && filters.staff !== "all") {
      sql += " AND staff_name = ?";
      params.push(filters.staff);
    }

    sql += " ORDER BY expiration_date ASC";
    const rows = await query<ServiceRow>(sql, params);
    let records = rows.map(toServiceRecord);

    if (typeof filters.expiringWithinDays === "number" && !Number.isNaN(filters.expiringWithinDays)) {
      records = records.filter((r) => r.daysRemaining <= filters.expiringWithinDays!);
    }

    return records;
  }

  async listByCustomer(customerId: string): Promise<ServiceRecordDto[]> {
    const rows = await query<ServiceRow>(
      "SELECT * FROM services WHERE customer_id = ? ORDER BY expiration_date ASC",
      [customerId]
    );
    return rows.map(toServiceRecord);
  }

  async create(input: CreateServiceInput): Promise<ServiceRecordDto> {
    if (!isValidServiceGroup(input.serviceGroup)) {
      throw new ServiceServiceError("Nhóm dịch vụ không hợp lệ", 400);
    }
    if (!isValidPaymentType(input.paymentType)) {
      throw new ServiceServiceError("Hình thức thanh toán không hợp lệ", 400);
    }
    if (!input.serviceName || !input.serviceName.trim()) {
      throw new ServiceServiceError("Tên dịch vụ không được để trống", 400);
    }
    if (!input.startDate || !input.expirationDate) {
      throw new ServiceServiceError("Vui lòng nhập ngày bắt đầu và ngày kết thúc", 400);
    }
    if (input.expirationDate < input.startDate) {
      throw new ServiceServiceError("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu", 400);
    }

    const customerRows = await query<any>("SELECT * FROM customers WHERE id = ?", [input.customerId]);
    if (customerRows.length === 0) {
      throw new ServiceServiceError("Không tìm thấy khách hàng", 404);
    }
    const customer = customerRows[0];

    const id = `SRV-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const staffName = input.staffName || customer.am_caring_staff || customer.am_staff || "";

    await run(
      `INSERT INTO services (
        id, customer_name, service_name, service_code, start_date, expiration_date, staff_name,
        customer_id, service_group, package_name, payment_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        customer.name,
        input.serviceName.trim(),
        input.serviceCode || "",
        input.startDate,
        input.expirationDate,
        staffName,
        input.customerId,
        input.serviceGroup,
        input.packageName || null,
        input.paymentType,
      ]
    );

    await refreshCustomerSummary(input.customerId);

    const rows = await query<ServiceRow>("SELECT * FROM services WHERE id = ?", [id]);
    return toServiceRecord(rows[0]);
  }

  async update(id: string, patch: Partial<CreateServiceInput>): Promise<ServiceRecordDto> {
    const existingRows = await query<ServiceRow>("SELECT * FROM services WHERE id = ?", [id]);
    if (existingRows.length === 0) {
      throw new ServiceServiceError("Không tìm thấy dịch vụ", 404);
    }
    const existing = existingRows[0];

    if (patch.serviceGroup !== undefined && !isValidServiceGroup(patch.serviceGroup)) {
      throw new ServiceServiceError("Nhóm dịch vụ không hợp lệ", 400);
    }
    if (patch.paymentType !== undefined && !isValidPaymentType(patch.paymentType)) {
      throw new ServiceServiceError("Hình thức thanh toán không hợp lệ", 400);
    }

    const startDate = patch.startDate ?? existing.start_date;
    const expirationDate = patch.expirationDate ?? existing.expiration_date;
    if (expirationDate < startDate) {
      throw new ServiceServiceError("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu", 400);
    }

    const fieldMap: Record<keyof CreateServiceInput, string> = {
      customerId: "customer_id",
      serviceGroup: "service_group",
      serviceName: "service_name",
      packageName: "package_name",
      serviceCode: "service_code",
      paymentType: "payment_type",
      startDate: "start_date",
      expirationDate: "expiration_date",
      staffName: "staff_name",
    };

    const sets: string[] = [];
    const params: any[] = [];
    for (const [key, column] of Object.entries(fieldMap) as [keyof CreateServiceInput, string][]) {
      if (key in patch) {
        sets.push(`${column} = ?`);
        params.push((patch as any)[key] ?? null);
      }
    }

    if (sets.length > 0) {
      params.push(id);
      await run(`UPDATE services SET ${sets.join(", ")} WHERE id = ?`, params);
    }

    const affectedCustomerId = patch.customerId ?? existing.customer_id;
    if (affectedCustomerId) {
      await refreshCustomerSummary(affectedCustomerId);
    }

    const rows = await query<ServiceRow>("SELECT * FROM services WHERE id = ?", [id]);
    return toServiceRecord(rows[0]);
  }

  async remove(id: string): Promise<void> {
    const rows = await query<ServiceRow>("SELECT * FROM services WHERE id = ?", [id]);
    if (rows.length === 0) {
      throw new ServiceServiceError("Không tìm thấy dịch vụ", 404);
    }
    const customerId = rows[0].customer_id;

    await run("DELETE FROM services WHERE id = ?", [id]);

    if (customerId) {
      await refreshCustomerSummary(customerId);
    }
  }
}
