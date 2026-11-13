import { query, run } from "../../database/db.js";

export class CustomerTeamServiceError extends Error {
  constructor(
    message: string,
    public readonly status: 400 | 404 | 409
  ) {
    super(message);
  }
}

export interface CustomerTeamDto {
  id: string;
  name: string;
  note: string | null;
  createdAt: string | null;
  customerCount: number;
}

function toDto(row: any): CustomerTeamDto {
  return {
    id: row.id,
    name: row.name,
    note: row.note ?? null,
    createdAt: row.created_at ?? null,
    customerCount: Number(row.customer_count ?? 0),
  };
}

export class CustomerTeamService {
  async list(): Promise<CustomerTeamDto[]> {
    const rows = await query<any>(`
      SELECT ct.*, COUNT(c.id) AS customer_count
      FROM customer_teams ct
      LEFT JOIN customers c ON c.team_id = ct.id
      GROUP BY ct.id, ct.name, ct.note, ct.created_at
      ORDER BY ct.name ASC
    `);
    return rows.map(toDto);
  }

  async create(data: { name: string; note?: string }): Promise<CustomerTeamDto> {
    const name = typeof data.name === "string" ? data.name.trim() : "";
    if (!name) {
      throw new CustomerTeamServiceError("Tên team không được để trống", 400);
    }

    const existing = await query("SELECT id FROM customer_teams WHERE LOWER(name) = LOWER(?)", [name]);
    if (existing.length > 0) {
      throw new CustomerTeamServiceError("Team đã tồn tại", 409);
    }

    const id = `TEAM-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    await run("INSERT INTO customer_teams (id, name, note, created_at) VALUES (?, ?, ?, ?)", [
      id,
      name,
      data.note || null,
      new Date().toISOString(),
    ]);

    const rows = await query<any>("SELECT *, 0 AS customer_count FROM customer_teams WHERE id = ?", [id]);
    return toDto(rows[0]);
  }

  async update(id: string, data: { name?: string; note?: string }): Promise<CustomerTeamDto> {
    const existingRows = await query<any>("SELECT * FROM customer_teams WHERE id = ?", [id]);
    if (existingRows.length === 0) {
      throw new CustomerTeamServiceError("Không tìm thấy team", 404);
    }

    const sets: string[] = [];
    const params: any[] = [];

    if (data.name !== undefined) {
      const name = data.name.trim();
      if (!name) {
        throw new CustomerTeamServiceError("Tên team không được để trống", 400);
      }
      const dup = await query("SELECT id FROM customer_teams WHERE LOWER(name) = LOWER(?) AND id <> ?", [
        name,
        id,
      ]);
      if (dup.length > 0) {
        throw new CustomerTeamServiceError("Team đã tồn tại", 409);
      }
      sets.push("name = ?");
      params.push(name);
    }

    if (data.note !== undefined) {
      sets.push("note = ?");
      params.push(data.note || null);
    }

    if (sets.length > 0) {
      params.push(id);
      await run(`UPDATE customer_teams SET ${sets.join(", ")} WHERE id = ?`, params);
    }

    const rows = await query<any>(
      `SELECT ct.*, COUNT(c.id) AS customer_count
       FROM customer_teams ct
       LEFT JOIN customers c ON c.team_id = ct.id
       WHERE ct.id = ?
       GROUP BY ct.id, ct.name, ct.note, ct.created_at`,
      [id]
    );
    return toDto(rows[0]);
  }

  async remove(id: string): Promise<void> {
    const existingRows = await query<any>("SELECT * FROM customer_teams WHERE id = ?", [id]);
    if (existingRows.length === 0) {
      throw new CustomerTeamServiceError("Không tìm thấy team", 404);
    }

    const countRows = await query<{ count: string }>(
      "SELECT COUNT(*) AS count FROM customers WHERE team_id = ?",
      [id]
    );
    const count = Number(countRows[0]?.count ?? 0);
    if (count > 0) {
      throw new CustomerTeamServiceError(
        `Team còn ${count} khách hàng, hãy chuyển khách sang team khác trước`,
        409
      );
    }

    await run("DELETE FROM customer_teams WHERE id = ?", [id]);
  }
}
