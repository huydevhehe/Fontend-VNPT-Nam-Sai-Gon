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
    amCaringStaff?: string;
  }) {
    const id = `KH-${Date.now()}`;
    const amStaff = data.amStaff || "Nguyễn Thị Tình";
    // AM chăm sóc (CSKH) là field độc lập với AM bán hàng — chỉ dùng amStaff làm
    // mặc định khi người tạo không chỉ định rõ amCaringStaff, không ép buộc trùng nhau.
    const amCaringStaff = data.amCaringStaff || amStaff;

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
        amStaff,
        amCaringStaff,
      ]
    );

    const rows = await query("SELECT * FROM customers WHERE id = ?", [id]);

    return { success: true, customer: rows[0], message: "Thêm khách hàng thành công" };
  }

  // Điều chuyển AM bán hàng (am_staff). KHÔNG đụng tới am_caring_staff —
  // hai vai trò độc lập, xem transferCaringStaff() để đổi AM chăm sóc (CSKH).
  async transfer(id: string, newStaff: string, operator: string = "Admin") {
    await run("UPDATE customers SET am_staff = ? WHERE id = ?", [newStaff, id]);

    await run(
      "INSERT INTO audit_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
      [
        `LOG-${Date.now()}`,
        operator,
        "Điều chuyển AM phụ trách",
        `Điều chuyển khách hàng ID ${id} sang cho AM bán hàng ${newStaff} phụ trách`,
      ]
    );

    return { success: true, message: `Đã điều chuyển AM phụ trách cho ${newStaff}` };
  }

  // Điều chuyển AM chăm sóc (CSKH, am_caring_staff). Không đụng tới am_staff.
  async transferCaringStaff(id: string, newCaringStaff: string, operator: string = "Admin") {
    await run("UPDATE customers SET am_caring_staff = ? WHERE id = ?", [newCaringStaff, id]);

    await run(
      "INSERT INTO audit_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
      [
        `LOG-${Date.now()}`,
        operator,
        "Điều chuyển AM chăm sóc (CSKH)",
        `Điều chuyển khách hàng ID ${id} sang cho AM chăm sóc ${newCaringStaff} phụ trách`,
      ]
    );

    return { success: true, message: `Đã điều chuyển AM chăm sóc cho ${newCaringStaff}` };
  }
}

