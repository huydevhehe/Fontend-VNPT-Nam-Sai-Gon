import { query, run, transaction } from "../../database/db.js";
import { CUSTOMER_GROUPS, LEAD_CHANNELS } from "../../constants/org.js";
import { normalizeTaxCode } from "../../utils/tax-code.js";

const GROUP_LABEL: Record<string, string> = {
  "Tự phát triển": "KH PTM",
  "Tập hiện hữu": "KH địa bàn",
  "PTM địa bàn": "PTM địa bàn",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: unknown): boolean {
  return typeof email === "string" && EMAIL_PATTERN.test(email);
}

function isValidChannel(channel: unknown): boolean {
  return typeof channel === "string" && (LEAD_CHANNELS as readonly string[]).includes(channel);
}

export interface BatchCustomerItem {
  identityCode?: string;
  phone?: string;
  name: string;
  type?: string;
  address?: string;
  services?: string;
}

export interface CustomerBatchInput {
  territoryId: string;
  amCaringStaff: string;
  handoverBatch: string;
  mode: "append" | "replace";
  customers: BatchCustomerItem[];
}

export interface CustomerBatchResult {
  createdCount: number;
  updatedCount: number;
  clearedCount: number;
  totalProcessed: number;
}

export class CustomerServiceError extends Error {
  constructor(
    message: string,
    public readonly status: 400 | 403 | 404
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

    let sql = `
      SELECT c.*, t.ward_name AS territory_name, ct.name AS team_name
      FROM customers c
      LEFT JOIN territories t ON t.id = c.territory_id
      LEFT JOIN customer_teams ct ON ct.id = c.team_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      sql += " AND (c.name LIKE ? OR c.identity_code LIKE ? OR c.phone LIKE ?)";
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern);
    }

    if (group) {
      sql += " AND c.customer_group = ?";
      params.push(group);
    }

    sql += " ORDER BY c.created_at DESC";
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
    amCaringStaff?: string;
    handoverBatch?: string;
    territoryId?: string;
    customerCode?: string;
    status?: string;
    teamId?: string;
    salesChannel?: string;
    contactName?: string;
    contactEmail?: string;
    billingName?: string;
    billingPhone?: string;
    billingEmail?: string;
    note?: string;
  }) {
    if (!isValidGroup(data.customerGroup)) {
      throw new CustomerServiceError("Nhóm khách hàng không hợp lệ", 400);
    }
    if (data.salesChannel && !isValidChannel(data.salesChannel)) {
      throw new CustomerServiceError("Kênh bán không hợp lệ", 400);
    }
    if (data.contactEmail && !isValidEmail(data.contactEmail)) {
      throw new CustomerServiceError("Email liên hệ không hợp lệ", 400);
    }
    if (data.billingEmail && !isValidEmail(data.billingEmail)) {
      throw new CustomerServiceError("Email thanh toán không hợp lệ", 400);
    }
    if (data.teamId) {
      const teamRows = await query("SELECT id FROM customer_teams WHERE id = ?", [data.teamId]);
      if (teamRows.length === 0) {
        throw new CustomerServiceError("Team không tồn tại", 400);
      }
    }

    const handoverBatch =
      typeof data.handoverBatch === "string" ? data.handoverBatch.trim() : "";

    const id = `KH-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const amStaff = data.amStaff || "Nguyễn Thị Tình";
    // AM chăm sóc (CSKH) là field độc lập với AM bán hàng — chỉ dùng amStaff làm
    // mặc định khi người tạo không chỉ định rõ amCaringStaff, không ép buộc trùng nhau.
    const amCaringStaff = data.amCaringStaff || amStaff;
    const identityCode = data.identityCode ? normalizeTaxCode(data.identityCode) : "";

    await run(
      `INSERT INTO customers (
        id, name, identity_code, type, customer_group, phone, address, services, am_staff, am_caring_staff,
        handover_batch, handover_date, territory_id, customer_code, status, team_id, sales_channel,
        contact_name, contact_email, billing_name, billing_phone, billing_email, note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        identityCode || null,
        data.type,
        data.customerGroup,
        data.phone || null,
        data.address || null,
        data.services || "Internet Fiber",
        amStaff,
        amCaringStaff,
        handoverBatch || null,
        handoverBatch ? today() : null,
        data.territoryId || null,
        data.customerCode || null,
        data.status || null,
        data.teamId || null,
        data.salesChannel || null,
        data.contactName || null,
        data.contactEmail || null,
        data.billingName || null,
        data.billingPhone || null,
        data.billingEmail || null,
        data.note || null,
      ]
    );

    const rows = await query("SELECT * FROM customers WHERE id = ?", [id]);

    return { success: true, customer: rows[0], message: "Thêm khách hàng thành công" };
  }

  /** Lấy 1 khách hàng kèm tên địa bàn (join territories); 404 nếu không có. */
  async getById(id: string) {
    const rows = await query<any>(
      `SELECT c.*, t.ward_name AS territory_name, ct.name AS team_name
       FROM customers c
       LEFT JOIN territories t ON t.id = c.territory_id
       LEFT JOIN customer_teams ct ON ct.id = c.team_id
       WHERE c.id = ?`,
      [id]
    );
    if (rows.length === 0) {
      throw new CustomerServiceError("Không tìm thấy khách hàng", 404);
    }
    return rows[0];
  }

  /**
   * Sửa thông tin khách hàng. KHÔNG cho đổi am_staff/am_caring_staff qua route
   * này (đã có route điều chuyển riêng, admin-only). Admin sửa được mọi khách;
   * AM chỉ sửa được khách mình đang phụ trách (am_staff hoặc am_caring_staff
   * khớp tên người gọi, so sánh đã trim).
   */
  async update(
    id: string,
    patch: Record<string, unknown>,
    operator: { name: string; role: string }
  ) {
    const existingRows = await query<any>("SELECT * FROM customers WHERE id = ?", [id]);
    if (existingRows.length === 0) {
      throw new CustomerServiceError("Không tìm thấy khách hàng", 404);
    }
    const existing = existingRows[0];

    if (operator.role !== "Admin") {
      const actor = (operator.name || "").trim();
      const isOwner =
        (existing.am_staff || "").trim() === actor || (existing.am_caring_staff || "").trim() === actor;
      if (!isOwner) {
        throw new CustomerServiceError("Bạn chỉ được sửa khách hàng mình đang phụ trách", 403);
      }
    }

    if ("amStaff" in patch || "amCaringStaff" in patch) {
      throw new CustomerServiceError(
        "Không thể đổi AM phụ trách qua route này, dùng điều chuyển",
        400
      );
    }

    const fieldMap: Record<string, string> = {
      name: "name",
      identityCode: "identity_code",
      type: "type",
      customerGroup: "customer_group",
      phone: "phone",
      address: "address",
      territoryId: "territory_id",
      customerCode: "customer_code",
      status: "status",
      teamId: "team_id",
      salesChannel: "sales_channel",
      contactName: "contact_name",
      contactEmail: "contact_email",
      billingName: "billing_name",
      billingPhone: "billing_phone",
      billingEmail: "billing_email",
      note: "note",
    };

    if (patch.customerGroup !== undefined && !isValidGroup(patch.customerGroup)) {
      throw new CustomerServiceError("Nhóm khách hàng không hợp lệ", 400);
    }
    if (patch.salesChannel !== undefined && patch.salesChannel && !isValidChannel(patch.salesChannel)) {
      throw new CustomerServiceError("Kênh bán không hợp lệ", 400);
    }
    if (patch.contactEmail !== undefined && patch.contactEmail && !isValidEmail(patch.contactEmail)) {
      throw new CustomerServiceError("Email liên hệ không hợp lệ", 400);
    }
    if (patch.billingEmail !== undefined && patch.billingEmail && !isValidEmail(patch.billingEmail)) {
      throw new CustomerServiceError("Email thanh toán không hợp lệ", 400);
    }
    if (patch.identityCode !== undefined && patch.identityCode) {
      patch.identityCode = normalizeTaxCode(patch.identityCode);
    }
    if (patch.teamId !== undefined && patch.teamId) {
      const teamRows = await query("SELECT id FROM customer_teams WHERE id = ?", [patch.teamId]);
      if (teamRows.length === 0) {
        throw new CustomerServiceError("Team không tồn tại", 400);
      }
    }

    const sets: string[] = [];
    const params: any[] = [];
    for (const [key, column] of Object.entries(fieldMap)) {
      if (key in patch) {
        sets.push(`${column} = ?`);
        params.push(patch[key] ?? null);
      }
    }

    if (sets.length === 0) {
      return existing;
    }

    params.push(id);
    await run(`UPDATE customers SET ${sets.join(", ")} WHERE id = ?`, params);

    await this.logTransfer(
      id,
      operator.name || "Admin",
      "Sửa thông tin khách hàng",
      `Sửa khách ${id}: cập nhật ${Object.keys(patch).join(", ")}`
    );

    const updatedRows = await query<any>("SELECT * FROM customers WHERE id = ?", [id]);
    return updatedRows[0];
  }

  /** Gán (hoặc gỡ, teamId = null) team cho nhiều khách hàng cùng lúc; trả về số khách đã cập nhật. */
  async assignTeam(customerIds: string[], teamId: string | null): Promise<number> {
    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      throw new CustomerServiceError("Vui lòng chọn ít nhất 1 khách hàng", 400);
    }
    if (teamId) {
      const teamRows = await query("SELECT id FROM customer_teams WHERE id = ?", [teamId]);
      if (teamRows.length === 0) {
        throw new CustomerServiceError("Team không tồn tại", 400);
      }
    }

    let updated = 0;
    for (const customerId of customerIds) {
      const result = await run("UPDATE customers SET team_id = ? WHERE id = ?", [
        teamId || null,
        customerId,
      ]);
      updated += result.changes;
    }
    return updated;
  }

  private async loadForTransfer(id: string, newStaff: unknown) {
    const staffName = typeof newStaff === "string" ? newStaff.trim() : "";
    if (!staffName) {
      throw new CustomerServiceError("Vui lòng chọn nhân viên phụ trách mới", 400);
    }

    const customers = await query<any>("SELECT * FROM customers WHERE id = ?", [id]);
    const customer = customers[0];
    if (!customer) {
      throw new CustomerServiceError("Không tìm thấy Khách hàng", 404);
    }

    const staffRows = await query<any>("SELECT id, status FROM staff WHERE name = ?", [staffName]);
    if (staffRows.length === 0) {
      throw new CustomerServiceError("Nhân viên phụ trách mới không tồn tại", 400);
    }
    if (staffRows[0].status && staffRows[0].status !== "Đang hoạt động") {
      throw new CustomerServiceError("Nhân viên đang bị đình chỉ hoặc đã ngừng hoạt động", 400);
    }

    return { customer, staffName };
  }

  private async logTransfer(id: string, operator: string, action: string, details: string) {
    await run(
      'INSERT INTO audit_logs (id, "user", action, details) VALUES (?, ?, ?, ?)',
      [`LOG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, operator, action, details]
    );
  }

  // Điều chuyển AM bán hàng (am_staff) — người phát triển ban đầu. KHÔNG đụng
  // tới am_caring_staff; hai vai trò độc lập, xem transferCaringStaff() để
  // đổi AM chăm sóc (CSKH). Theo quyết định của Khoa, FE chỉ hiện nút này cho
  // khách KHDN chăm — KH PTM giữ nguyên người phát triển.
  async transfer(id: string, newStaff: string, operator: string = "Admin") {
    const { customer, staffName } = await this.loadForTransfer(id, newStaff);
    await run("UPDATE customers SET am_staff = ? WHERE id = ?", [staffName, id]);

    const groupLabel = GROUP_LABEL[customer.customer_group] ?? customer.customer_group;
    await this.logTransfer(
      id,
      operator,
      "Điều chuyển AM phụ trách",
      `Điều chuyển KH ${id} (${groupLabel}): ${customer.am_staff || "(chưa có)"} → ${staffName}`
    );

    return { success: true, message: `Đã điều chuyển AM phụ trách cho ${staffName}` };
  }

  // Điều chuyển AM chăm sóc (CSKH, am_caring_staff). Không đụng tới am_staff.
  // Áp dụng cho mọi khách; đây là hành động "bàn giao" nên nhận kèm đợt giao.
  async transferCaringStaff(
    id: string,
    newCaringStaff: string,
    operator: string = "Admin",
    handoverBatch?: string
  ) {
    const { customer, staffName } = await this.loadForTransfer(id, newCaringStaff);
    const batch = typeof handoverBatch === "string" ? handoverBatch.trim() : "";

    const sets: string[] = ["am_caring_staff = ?"];
    const params: any[] = [staffName];
    if (batch) {
      sets.push("handover_batch = ?", "handover_date = ?");
      params.push(batch, today());
    }
    params.push(id);
    await run(`UPDATE customers SET ${sets.join(", ")} WHERE id = ?`, params);

    const groupLabel = GROUP_LABEL[customer.customer_group] ?? customer.customer_group;
    const oldCaring = customer.am_caring_staff || customer.am_staff || "(chưa có)";
    await this.logTransfer(
      id,
      operator,
      "Điều chuyển AM chăm sóc (CSKH)",
      `Điều chuyển KH ${id} (${groupLabel}): ${oldCaring} → ${staffName}${
        batch ? `, đợt ${batch}` : ""
      }`
    );

    return { success: true, message: `Đã điều chuyển AM chăm sóc cho ${staffName}` };
  }

  async importBatch(
    payload: CustomerBatchInput,
    operator: string = "Admin"
  ): Promise<CustomerBatchResult> {
    const { territoryId, amCaringStaff, handoverBatch, mode, customers } = payload ?? {};

    if (!territoryId) {
      throw new CustomerServiceError("Vui lòng chọn Địa bàn / Phường", 400);
    }
    const terrRows = await query("SELECT id FROM territories WHERE id = ?", [territoryId]);
    if (terrRows.length === 0) {
      throw new CustomerServiceError("Địa bàn không tồn tại", 404);
    }

    if (!amCaringStaff || typeof amCaringStaff !== "string") {
      throw new CustomerServiceError("Vui lòng chọn AM chăm sóc (CSKH)", 400);
    }
    const staffRows = await query<any>("SELECT id, status FROM staff WHERE name = ?", [amCaringStaff.trim()]);
    if (staffRows.length === 0) {
      throw new CustomerServiceError("Nhân viên phụ trách chăm sóc không tồn tại", 400);
    }
    if (staffRows[0].status && staffRows[0].status !== "Đang hoạt động") {
      throw new CustomerServiceError("Nhân viên đang bị đình chỉ hoặc đã ngừng hoạt động", 400);
    }

    const batch = typeof handoverBatch === "string" ? handoverBatch.trim() : "";
    if (!batch) {
      throw new CustomerServiceError("Vui lòng nhập mã đợt giao", 400);
    }

    if (mode !== "append" && mode !== "replace") {
      throw new CustomerServiceError("Chế độ nhập không hợp lệ (phải là append hoặc replace)", 400);
    }

    if (!Array.isArray(customers) || customers.length === 0) {
      throw new CustomerServiceError("Danh sách khách hàng không được để trống", 400);
    }

    return transaction(async (tx) => {
      let createdCount = 0;
      let updatedCount = 0;
      let clearedCount = 0;
      const touchedCustomerIds = new Set<string>();

      for (let i = 0; i < customers.length; i++) {
        const item = customers[i];
        const name = typeof item.name === "string" ? item.name.trim() : "";
        if (!name) {
          throw new CustomerServiceError(`Dòng ${i + 1}: Tên khách hàng không được để trống`, 400);
        }

        const idCode = typeof item.identityCode === "string" ? item.identityCode.trim() : "";
        const phone = typeof item.phone === "string" ? item.phone.trim() : "";

        // Tìm khách đã tồn tại: ưu tiên identityCode rồi đến phone
        let existing: any = null;
        if (idCode) {
          const rows = await tx.query("SELECT * FROM customers WHERE identity_code = ?", [idCode]);
          if (rows.length > 0) existing = rows[0];
        }
        if (!existing && phone) {
          const rows = await tx.query("SELECT * FROM customers WHERE phone = ?", [phone]);
          if (rows.length > 0) existing = rows[0];
        }

        if (existing) {
          await tx.run(
            `UPDATE customers SET 
              am_caring_staff = ?,
              handover_batch = ?,
              handover_date = ?,
              territory_id = ?
            WHERE id = ?`,
            [amCaringStaff.trim(), batch, today(), territoryId, existing.id]
          );
          touchedCustomerIds.add(existing.id);
          updatedCount++;
        } else {
          const newId = `KH-B-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`;
          await tx.run(
            `INSERT INTO customers (
              id, name, identity_code, type, customer_group, phone, address, services,
              am_staff, am_caring_staff, handover_batch, handover_date, territory_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              newId,
              name,
              idCode || null,
              item.type || "Doanh nghiệp",
              "Tập hiện hữu",
              phone || null,
              item.address || null,
              item.services || "Internet Fiber",
              amCaringStaff.trim(),
              amCaringStaff.trim(),
              batch,
              today(),
              territoryId,
            ]
          );
          touchedCustomerIds.add(newId);
          createdCount++;
        }
      }

      // Nếu mode === "replace": xác lập lại tập — gỡ người chăm sóc của khách cũ cùng territoryId
      if (mode === "replace") {
        const terrOld = await tx.query<any>(
          "SELECT id FROM customers WHERE territory_id = ? AND customer_group = 'Tập hiện hữu'",
          [territoryId]
        );
        for (const row of terrOld) {
          if (!touchedCustomerIds.has(row.id)) {
            await tx.run(
              "UPDATE customers SET am_caring_staff = NULL WHERE id = ?",
              [row.id]
            );
            clearedCount++;
          }
        }
      }

      // Ghi audit log
      await tx.run(
        'INSERT INTO audit_logs (id, "user", action, details) VALUES (?, ?, ?, ?)',
        [
          `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          operator,
          `Nhập đợt KHDN chăm (${mode})`,
          `Đợt: ${batch}, Phường: ${territoryId}, AM chăm sóc: ${amCaringStaff.trim()}. Tạo mới: ${createdCount}, Cập nhật: ${updatedCount}, Xác lập lại (gỡ gán cũ): ${clearedCount}`,
        ]
      );

      return {
        createdCount,
        updatedCount,
        clearedCount,
        totalProcessed: customers.length,
      };
    });
  }
}
