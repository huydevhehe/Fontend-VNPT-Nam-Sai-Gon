import { query, run } from "../../database/db.js";

export class TerritoryService {
  async getAll() {
    return query("SELECT * FROM territories ORDER BY ward_name ASC");
  }

  async updateHouseholds(id: string, householdCount: number, quarterCount?: number, operator: string = "Admin") {
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

