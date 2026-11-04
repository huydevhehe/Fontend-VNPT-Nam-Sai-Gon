import { query, run } from "../../database/db.js";

export class CustomerService {
  async getAll(search?: string) {
    let sql = "SELECT * FROM customers WHERE 1=1";
    const params: any[] = [];

    if (search) {
      sql += " AND (name LIKE ? OR identity_code LIKE ? OR phone LIKE ?)";
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern);
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
  }) {
    const id = `KH-${Date.now()}`;
    await run(
      `INSERT INTO customers (
        id, name, identity_code, type, customer_group, phone, address, services, am_staff, am_caring_staff
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      ]
    );

    const rows = await query("SELECT * FROM customers WHERE id = ?", [id]);

    return { success: true, customer: rows[0], message: "Thêm khách hàng thành công" };
  }

  async transfer(id: string, newStaff: string, operator: string = "Admin") {
    await run(
      "UPDATE customers SET am_staff = ?, am_caring_staff = ? WHERE id = ?",
      [newStaff, newStaff, id]
    );

    await run(
      "INSERT INTO audit_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
      [
        `LOG-${Date.now()}`,
        operator,
        "Điều chuyển khách hàng",
        `Điều chuyển khách hàng ID ${id} sang cho nhân viên ${newStaff} phụ trách`,
      ]
    );

    return { success: true, message: `Đã điều chuyển khách hàng cho ${newStaff}` };
  }
}

