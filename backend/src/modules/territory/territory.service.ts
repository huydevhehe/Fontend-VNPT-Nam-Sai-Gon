import { query, run } from "../../database/db.js";

export class TerritoryService {
  async getAll() {
    return query("SELECT * FROM territories ORDER BY ward_name ASC");
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

