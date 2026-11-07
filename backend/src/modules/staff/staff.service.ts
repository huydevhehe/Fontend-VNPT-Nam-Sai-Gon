import bcrypt from "bcryptjs";
import { query, run } from "../../database/db.js";
import { ROLES, USER_STATUS } from "../../constants/org.js";
import { HttpError } from "../auth/auth.service.js";

export interface StaffRow {
  id: string;
  code: string;
  name: string;
  role: string;
  territory: string;
  assigned_customers: number;
  monthly_leads: number;
  monthly_contracts: number;
  revenue_executed: number;
  collection_rate: number;
  renewal_rate: number;
  status: string;
  email: string;
}

export interface StaffRecordDto {
  id: string;
  code: string;
  name: string;
  role: string;
  territory: string;
  assignedCustomers: number;
  monthlyLeads: number;
  monthlyContracts: number;
  revenueExecuted: number;
  collectionRate: number;
  renewalRate: number;
  status: string;
  email: string;
}

export interface StaffUpdateInput {
  name?: string;
  role?: string;
  territory?: string;
  status?: string;
  email?: string;
}

export interface StaffCreateInput {
  code: string;
  name: string;
  role: string;
  territory: string;
  email: string;
  password?: string;
}

export interface StaffCreatedDto extends StaffRecordDto {
  /** Chỉ có khi hệ thống tự đặt mật khẩu mặc định cho tài khoản mới. */
  initialPassword?: string;
}

function toStaffRecord(row: StaffRow): StaffRecordDto {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    role: row.role,
    territory: row.territory,
    assignedCustomers: row.assigned_customers,
    monthlyLeads: row.monthly_leads,
    monthlyContracts: row.monthly_contracts,
    revenueExecuted: row.revenue_executed,
    collectionRate: row.collection_rate,
    renewalRate: row.renewal_rate,
    status: row.status,
    email: row.email,
  };
}

const STAFF_ROLES = [ROLES.AM, ROLES.AM_BAN_CHAM, ROLES.ADMIN] as const;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;
const INACTIVE_USER_STATUS = "Ngừng hoạt động";

export class StaffService {
  async getAll(): Promise<StaffRecordDto[]> {
    const rows = await query<StaffRow>("SELECT * FROM staff ORDER BY code ASC");
    return rows.map(toStaffRecord);
  }

  async create(data: StaffCreateInput): Promise<StaffCreatedDto> {
    if (!data.code || !data.name || !data.role) {
      throw new Error("Thiếu thông tin bắt buộc để tạo Nhân viên");
    }

    if (!STAFF_ROLES.includes(data.role as (typeof STAFF_ROLES)[number])) {
      throw new Error("Vai trò không hợp lệ");
    }

    const existing = await query<StaffRow>("SELECT id FROM staff WHERE code = ?", [data.code]);
    if (existing.length) {
      throw new Error("Mã nhân viên đã tồn tại");
    }

    // Tài khoản đăng nhập dùng chính mã nhân viên làm username: kiểm tra trùng
    // trong users TRƯỚC khi tạo staff để không để lại dữ liệu nửa chừng.
    const existingUser = await query<{ id: string }>(
      "SELECT id FROM users WHERE LOWER(username) = LOWER(?)",
      [data.code]
    );
    if (existingUser.length) {
      throw new HttpError(409, "Tên đăng nhập trùng với mã nhân viên đã tồn tại");
    }

    const customPassword =
      typeof data.password === "string" &&
      data.password.length >= MIN_PASSWORD_LENGTH &&
      data.password.length <= MAX_PASSWORD_LENGTH
        ? data.password
        : null;
    const plainPassword = customPassword ?? `${data.code}@Vnpt2026`;
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const id = `STAFF-${Date.now()}`;
    await run(
      "INSERT INTO staff (id, code, name, role, territory, assigned_customers, monthly_leads, monthly_contracts, revenue_executed, collection_rate, renewal_rate, status, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, data.code, data.name, data.role, data.territory, 0, 0, 0, 0, 0, 0, USER_STATUS.ACTIVE, data.email]
    );

    try {
      await run(
        "INSERT INTO users (id, username, password_hash, name, role, email, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          `USR-${data.code}`,
          data.code,
          passwordHash,
          data.name,
          data.role,
          data.email || null,
          USER_STATUS.ACTIVE,
          new Date().toISOString(),
        ]
      );
    } catch (error) {
      // Hoàn tác dòng staff để tránh nhân viên không có tài khoản đăng nhập.
      await run("DELETE FROM staff WHERE id = ?", [id]);
      const stillFree = await query<{ id: string }>(
        "SELECT id FROM users WHERE LOWER(username) = LOWER(?) OR id = ?",
        [data.code, `USR-${data.code}`]
      );
      if (stillFree.length) {
        throw new HttpError(409, "Tên đăng nhập trùng với mã nhân viên đã tồn tại");
      }
      throw error;
    }

    const created = await query<StaffRow>("SELECT * FROM staff WHERE id = ?", [id]);
    const dto: StaffCreatedDto = toStaffRecord(created[0]);
    if (!customPassword) {
      dto.initialPassword = plainPassword;
    }
    return dto;
  }

  async update(id: string, patch: StaffUpdateInput): Promise<StaffRecordDto> {
    const existing = await query<StaffRow>("SELECT * FROM staff WHERE id = ?", [id]);
    if (!existing.length) {
      throw new Error("Không tìm thấy Nhân viên");
    }

    if (patch.role !== undefined && !STAFF_ROLES.includes(patch.role as (typeof STAFF_ROLES)[number])) {
      throw new Error("Vai trò không hợp lệ");
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (patch.name !== undefined) {
      fields.push("name = ?");
      values.push(patch.name);
    }
    if (patch.role !== undefined) {
      fields.push("role = ?");
      values.push(patch.role);
    }
    if (patch.territory !== undefined) {
      fields.push("territory = ?");
      values.push(patch.territory);
    }
    if (patch.status !== undefined) {
      fields.push("status = ?");
      values.push(patch.status);
    }
    if (patch.email !== undefined) {
      fields.push("email = ?");
      values.push(patch.email);
    }

    if (!fields.length) {
      throw new Error("Không có dữ liệu cần cập nhật");
    }

    values.push(id);
    await run(`UPDATE staff SET ${fields.join(", ")} WHERE id = ?`, values);

    // Đồng bộ sang tài khoản đăng nhập (username = mã nhân viên), chỉ động tới
    // tài khoản nhân viên, không bao giờ chạm vào tài khoản CTV.
    const userFields: string[] = [];
    const userValues: any[] = [];
    if (patch.name !== undefined) {
      userFields.push("name = ?");
      userValues.push(patch.name);
    }
    if (patch.role !== undefined) {
      userFields.push("role = ?");
      userValues.push(patch.role);
    }
    if (patch.email !== undefined) {
      userFields.push("email = ?");
      userValues.push(patch.email || null);
    }
    if (patch.status !== undefined) {
      userFields.push("status = ?");
      userValues.push(patch.status === USER_STATUS.ACTIVE ? USER_STATUS.ACTIVE : INACTIVE_USER_STATUS);
    }
    if (userFields.length) {
      await run(
        `UPDATE users SET ${userFields.join(", ")} WHERE username = ? AND role IN (?, ?, ?)`,
        [...userValues, existing[0].code, ...STAFF_ROLES]
      );
    }

    const updated = await query<StaffRow>("SELECT * FROM staff WHERE id = ?", [id]);
    return toStaffRecord(updated[0]);
  }
}
