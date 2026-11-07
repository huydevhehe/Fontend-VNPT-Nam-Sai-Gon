import { query, run } from "../../database/db.js";
import { CUSTOMER_GROUPS } from "../../constants/org.js";

const GROUP_LABEL: Record<string, string> = {
  "Tự phát triển": "KH PTM",
  "Tập hiện hữu": "KHDN chăm",
};

export class CustomerServiceError extends Error {
  constructor(
    message: string,
    public readonly status: 400 | 404
  ) {
    super(message);
  }
}

function isValidGroup(group: unknown): group is (typeof CUSTOMER_GROUPS)[number] {
  return typeof group === "string" && (CUSTOMER_GROUPS as readonly string[]).includes(group);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export class CustomerService {
  async getAll(search?: string, group?: string) {
    if (group !== undefined && group !== "" && !isValidGroup(group)) {
      throw new CustomerServiceError("Nhóm khách hàng không hợp lệ", 400);
    }

    let sql = "SELECT * FROM customers WHERE 1=1";
    const params: any[] = [];

    if (search) {
      sql += " AND (name LIKE ? OR identity_code LIKE ? OR phone LIKE ?)";
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern);
    }

    if (group) {
      sql += " AND customer_group = ?";
      params.push(group);
    }

    sql += " ORDER BY created_at DESC";
    return query(sql, params);
  }

  async create(data: {
    name: string;
    identityCode?: string;
    type: string;
    customerGroup: string;
    phone?: string;
    address?: string;
    services?: string;
    amStaff?: string;
    handoverBatch?: string;
  }) {
    if (!isValidGroup(data.customerGroup)) {
      throw new CustomerServiceError("Nhóm khách hàng không hợp lệ", 400);
    }

    const handoverBatch =
      typeof data.handoverBatch === "string" ? data.handoverBatch.trim() : "";

    const id = `KH-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    await run(
      `INSERT INTO customers (
        id, name, identity_code, type, customer_group, phone, address, services, am_staff, am_caring_staff,
        handover_batch, handover_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.identityCode || null,
        data.type,
        data.customerGroup,
        data.phone || null,
        data.address || null,
        data.services || "Internet Fiber",
        data.amStaff || "Nguyễn Thị Tình",
        data.amStaff || "Nguyễn Thị Tình",
        handoverBatch || null,
        handoverBatch ? today() : null,
      ]
    );

    const rows = await query("SELECT * FROM customers WHERE id = ?", [id]);

    return { success: true, customer: rows[0], message: "Thêm khách hàng thành công" };
  }

  /**
   * KH PTM: chỉ đổi người chăm (giữ người phát triển `am_staff`).
   * KHDN chăm: đổi cả người phát triển và người chăm.
   */
  async transfer(
    id: string,
    newStaff: string,
    operator: string = "Admin",
    handoverBatch?: string
  ) {
    const staffName = typeof newStaff === "string" ? newStaff.trim() : "";
    if (!staffName) {
      throw new CustomerServiceError("Vui lòng chọn nhân viên phụ trách mới", 400);
    }

    const customers = await query<any>("SELECT * FROM customers WHERE id = ?", [id]);
    const customer = customers[0];
    if (!customer) {
      throw new CustomerServiceError("Không tìm thấy Khách hàng", 404);
    }

    const staffRows = await query<any>("SELECT id FROM staff WHERE name = ?", [staffName]);
    if (staffRows.length === 0) {
      throw new CustomerServiceError("Nhân viên phụ trách mới không tồn tại", 400);
    }

    const batch = typeof handoverBatch === "string" ? handoverBatch.trim() : "";
    const isCareGroup = customer.customer_group === "Tập hiện hữu";
    const oldCaring = customer.am_caring_staff || customer.am_staff || "(chưa có)";

    const sets: string[] = ["am_caring_staff = ?"];
    const params: any[] = [staffName];
    if (isCareGroup) {
      sets.push("am_staff = ?");
      params.push(staffName);
    }
    if (batch) {
      sets.push("handover_batch = ?", "handover_date = ?");
      params.push(batch, today());
    }
    params.push(id);
    await run(`UPDATE customers SET ${sets.join(", ")} WHERE id = ?`, params);

    const groupLabel = GROUP_LABEL[customer.customer_group] ?? customer.customer_group;
    await run(
      'INSERT INTO audit_logs (id, "user", action, details) VALUES (?, ?, ?, ?)',
      [
        `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        operator,
        "Điều chuyển khách hàng",
        `Điều chuyển KH ${id} (${groupLabel}): ${oldCaring} → ${staffName}${
          batch ? `, đợt ${batch}` : ""
        }`,
      ]
    );

    return { success: true, message: `Đã điều chuyển khách hàng cho ${staffName}` };
  }
}
