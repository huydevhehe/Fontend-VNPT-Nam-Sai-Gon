import { query, run } from "../../database/db.js";

export interface WardContactInput {
  unit: string;
  department: string;
  fullName: string;
  position: string;
  phone?: string;
  amInCharge?: string;
}

export interface WardStatsInput {
  population?: number;
  schoolMamnon?: number;
  schoolTieuhoc?: number;
  schoolThcs?: number;
  schoolThpt?: number;
  revenue?: number;
}

export class TerritoryService {
  async getAll() {
    return query("SELECT * FROM territories ORDER BY ward_name ASC");
  }

  async updateStats(id: string, stats: WardStatsInput, operator: string = "Admin") {
    const existing = await query("SELECT id FROM territories WHERE id = ?", [id]);
    if (!existing.length) {
      throw new Error("Không tìm thấy địa bàn");
    }

    const columnByField: Record<keyof WardStatsInput, string> = {
      population: "population",
      schoolMamnon: "school_mamnon",
      schoolTieuhoc: "school_tieuhoc",
      schoolThcs: "school_thcs",
      schoolThpt: "school_thpt",
      revenue: "revenue",
    };

    const fields: string[] = [];
    const values: any[] = [];

    for (const key of Object.keys(columnByField) as (keyof WardStatsInput)[]) {
      const value = stats[key];
      if (value === undefined) continue;
      if (Number.isNaN(value) || value < 0) {
        throw new Error("Giá trị thống kê không hợp lệ (không được âm)");
      }
      fields.push(`${columnByField[key]} = ?`);
      values.push(value);
    }

    if (!fields.length) {
      throw new Error("Không có dữ liệu cần cập nhật");
    }

    values.push(id);
    await run(`UPDATE territories SET ${fields.join(", ")} WHERE id = ?`, values);

    await run(
      "INSERT INTO audit_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
      [`LOG-${Date.now()}`, operator, "Cập nhật chỉ số địa bàn", `Cập nhật địa bàn ID ${id}: ${JSON.stringify(stats)}`]
    );

    const updated = await query("SELECT * FROM territories WHERE id = ?", [id]);
    return updated[0];
  }

  async getWardContacts(territoryId: string) {
    return query(
      "SELECT * FROM ward_contacts WHERE territory_id = ? ORDER BY unit ASC, department ASC, full_name ASC",
      [territoryId]
    );
  }

  private async assertNoDuplicateContact(
    territoryId: string,
    data: WardContactInput,
    excludeId?: string
  ) {
    if (data.phone) {
      const byPhone = await query<{ id: string }>(
        "SELECT id FROM ward_contacts WHERE territory_id = ? AND phone = ? AND phone != ''",
        [territoryId, data.phone]
      );
      if (byPhone.some((row) => row.id !== excludeId)) {
        throw new Error("Trùng dữ liệu: số điện thoại này đã có trong danh sách đầu mối của phường");
      }
    }

    const byIdentity = await query<{ id: string }>(
      "SELECT id FROM ward_contacts WHERE territory_id = ? AND unit = ? AND department = ? AND full_name = ? AND position = ?",
      [territoryId, data.unit, data.department, data.fullName, data.position]
    );
    if (byIdentity.some((row) => row.id !== excludeId)) {
      throw new Error("Trùng dữ liệu: người này đã có đúng đơn vị/phòng ban/chức vụ trong phường");
    }
  }

  async createWardContact(territoryId: string, data: WardContactInput, operator: string = "Admin") {
    if (!data.unit || !data.department || !data.fullName || !data.position) {
      throw new Error("Thiếu thông tin bắt buộc (Đơn vị, Phòng ban, Họ tên, Chức vụ)");
    }

    const territoryExists = await query("SELECT id FROM territories WHERE id = ?", [territoryId]);
    if (!territoryExists.length) {
      throw new Error("Không tìm thấy địa bàn");
    }

    await this.assertNoDuplicateContact(territoryId, data);

    const id = `WARDC-${Date.now()}`;
    await run(
      "INSERT INTO ward_contacts (id, territory_id, unit, department, full_name, position, phone, am_in_charge) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id, territoryId, data.unit, data.department, data.fullName, data.position, data.phone || "", data.amInCharge || ""]
    );

    await run(
      "INSERT INTO audit_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
      [`LOG-${Date.now()}`, operator, "Thêm đầu mối phường", `Thêm ${data.fullName} (${data.position}) vào địa bàn ID ${territoryId}`]
    );

    const created = await query("SELECT * FROM ward_contacts WHERE id = ?", [id]);
    return created[0];
  }

  async updateWardContact(contactId: string, patch: Partial<WardContactInput>, operator: string = "Admin") {
    const existingRows = await query<any>("SELECT * FROM ward_contacts WHERE id = ?", [contactId]);
    const existing = existingRows[0];
    if (!existing) {
      throw new Error("Không tìm thấy đầu mối");
    }

    const merged: WardContactInput = {
      unit: patch.unit ?? existing.unit,
      department: patch.department ?? existing.department,
      fullName: patch.fullName ?? existing.full_name,
      position: patch.position ?? existing.position,
      phone: patch.phone ?? existing.phone,
      amInCharge: patch.amInCharge ?? existing.am_in_charge,
    };

    await this.assertNoDuplicateContact(existing.territory_id, merged, contactId);

    await run(
      "UPDATE ward_contacts SET unit = ?, department = ?, full_name = ?, position = ?, phone = ?, am_in_charge = ? WHERE id = ?",
      [merged.unit, merged.department, merged.fullName, merged.position, merged.phone || "", merged.amInCharge || "", contactId]
    );

    await run(
      "INSERT INTO audit_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
      [`LOG-${Date.now()}`, operator, "Cập nhật đầu mối phường", `Cập nhật đầu mối ID ${contactId}`]
    );

    const updated = await query("SELECT * FROM ward_contacts WHERE id = ?", [contactId]);
    return updated[0];
  }

  async deleteWardContact(contactId: string, operator: string = "Admin") {
    const existing = await query("SELECT id FROM ward_contacts WHERE id = ?", [contactId]);
    if (!existing.length) {
      throw new Error("Không tìm thấy đầu mối");
    }

    await run("DELETE FROM ward_contacts WHERE id = ?", [contactId]);

    await run(
      "INSERT INTO audit_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
      [`LOG-${Date.now()}`, operator, "Xóa đầu mối phường", `Xóa đầu mối ID ${contactId}`]
    );

    return { success: true, message: "Xóa đầu mối thành công" };
  }

  async updateHouseholds(id: string, householdCount: number, quarterCount?: number, operator: string = "Admin") {
    if (Number.isNaN(householdCount) || householdCount < 0) {
      throw new Error("Số hộ dân không được âm");
    }
    if (quarterCount !== undefined && (Number.isNaN(quarterCount) || quarterCount < 0)) {
      throw new Error("Số hộ đạt chuẩn khu phố văn hóa không được âm");
    }

    let sql = "UPDATE territories SET household_count = ?";
    const params: any[] = [householdCount];

    if (quarterCount !== undefined) {
      sql += ", quarter_count = ?";
      params.push(quarterCount);
    }
    sql += " WHERE id = ?";
    params.push(id);

    await run(sql, params);

    await run(
      "INSERT INTO audit_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
      [
        `LOG-${Date.now()}`,
        operator,
        "Cập nhật số hộ dân",
        `Cập nhật địa bàn ID ${id}: số hộ = ${householdCount}`,
      ]
    );

    return { success: true, message: "Cập nhật địa bàn thành công" };
  }
}

