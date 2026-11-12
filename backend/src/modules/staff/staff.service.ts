import bcrypt from "bcryptjs";
import { query, run } from "../../database/db.js";
import { ROLES, USER_STATUS, STAFF_TYPES, INACTIVE_USER_STATUS } from "../../constants/org.js";
import { HttpError } from "../auth/auth.service.js";

export function deriveShortName(fullName: string): string {
  const trimmed = (fullName || "").trim();
  if (!trimmed) return "";
  const words = trimmed.split(/\s+/);
  const lastWord = words[words.length - 1];
  return lastWord
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase();
}

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
  hrm_code?: string | null;
  staff_type?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  personal_email?: string | null;
  short_name?: string | null;
  note?: string | null;
  status_reason?: string | null;
  status_changed_at?: string | null;
  status_changed_by?: string | null;
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
  username: string;
  hrmCode: string | null;
  staffType: string | null;
  phone: string | null;
  birthDate: string | null;
  personalEmail: string | null;
  shortName: string | null;
  note: string | null;
  statusReason?: string | null;
  statusChangedAt?: string | null;
  statusChangedBy?: string | null;
}

export interface StaffUpdateInput {
  name?: string;
  role?: string;
  territory?: string;
  status?: string;
  email?: string;
  hrmCode?: string | null;
  staffType?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  personalEmail?: string | null;
  shortName?: string | null;
  note?: string | null;
}

export interface StaffCreateInput {
  code: string;
  name: string;
  role: string;
  territory?: string;
  email?: string;
  hrmCode?: string;
  staffType?: string;
  phone?: string;
  birthDate?: string;
  personalEmail?: string;
  shortName?: string;
  note?: string;
  password: string;
  mustChangePassword?: boolean;
}

export interface StaffCreatedDto extends StaffRecordDto {
  /** Chỉ có khi hệ thống tự đặt mật khẩu mặc định cho tài khoản mới (không dùng ở Đợt 2). */
  initialPassword?: string;
}

function toStaffRecord(row: StaffRow): StaffRecordDto {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    role: row.role,
    territory: row.territory ?? "",
    assignedCustomers: row.assigned_customers ?? 0,
    monthlyLeads: row.monthly_leads ?? 0,
    monthlyContracts: row.monthly_contracts ?? 0,
    revenueExecuted: row.revenue_executed ?? 0,
    collectionRate: row.collection_rate ?? 0,
    renewalRate: row.renewal_rate ?? 0,
    status: row.status,
    email: row.email ?? "",
    username: row.code,
    hrmCode: row.hrm_code ?? null,
    staffType: row.staff_type ?? null,
    phone: row.phone ?? null,
    birthDate: row.birth_date ?? null,
    personalEmail: row.personal_email ?? null,
    shortName: row.short_name ?? null,
    note: row.note ?? null,
    statusReason: row.status_reason ?? null,
    statusChangedAt: row.status_changed_at ?? null,
    statusChangedBy: row.status_changed_by ?? null,
  };
}

const STAFF_ROLES = [ROLES.AM, ROLES.AM_BAN_CHAM, ROLES.ADMIN] as const;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class StaffService {
  async getAll(): Promise<StaffRecordDto[]> {
    const rows = await query<StaffRow>("SELECT * FROM staff ORDER BY code ASC");
    return rows.map(toStaffRecord);
  }

  async create(data: StaffCreateInput): Promise<StaffCreatedDto> {
    const code = typeof data.code === "string" ? data.code.trim() : "";
    const name = typeof data.name === "string" ? data.name.trim() : "";
    const role = typeof data.role === "string" ? data.role.trim() : "";

    if (!code || !name || !role) {
      throw new HttpError(400, "Thiếu thông tin bắt buộc để tạo Nhân viên");
    }

    if (!STAFF_ROLES.includes(role as (typeof STAFF_ROLES)[number])) {
      throw new HttpError(400, "Vai trò không hợp lệ");
    }

    const password = typeof data.password === "string" ? data.password : "";
    if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
      throw new HttpError(400, "Mật khẩu phải từ 8 đến 72 ký tự");
    }

    const staffType = data.staffType ? String(data.staffType).trim() : null;
    if (staffType && !(STAFF_TYPES as readonly string[]).includes(staffType)) {
      throw new HttpError(400, "Loại nhân viên không hợp lệ");
    }

    const birthDate = data.birthDate ? String(data.birthDate).trim() : null;
    if (birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      throw new HttpError(400, "Ngày sinh không hợp lệ (định dạng YYYY-MM-DD)");
    }

    const email = data.email ? String(data.email).trim() : "";
    if (email && !EMAIL_REGEX.test(email)) {
      throw new HttpError(400, "Email VNPT không hợp lệ");
    }

    const personalEmail = data.personalEmail ? String(data.personalEmail).trim() : null;
    if (personalEmail && !EMAIL_REGEX.test(personalEmail)) {
      throw new HttpError(400, "Email cá nhân không hợp lệ");
    }

    const hrmCode = data.hrmCode ? String(data.hrmCode).trim() : null;
    if (hrmCode) {
      const existingHrm = await query<{ id: string }>(
        "SELECT id FROM staff WHERE hrm_code = ?",
        [hrmCode]
      );
      if (existingHrm.length > 0) {
        throw new HttpError(409, "Mã HRM đã được dùng cho nhân viên khác");
      }
    }

    const existing = await query<StaffRow>("SELECT id FROM staff WHERE code = ?", [code]);
    if (existing.length) {
      throw new HttpError(409, "Mã nhân viên đã tồn tại");
    }

    const existingUser = await query<{ id: string }>(
      "SELECT id FROM users WHERE LOWER(username) = LOWER(?)",
      [code]
    );
    if (existingUser.length) {
      throw new HttpError(409, "Tên đăng nhập trùng với mã nhân viên đã tồn tại");
    }

    const shortName = data.shortName && String(data.shortName).trim()
      ? String(data.shortName).trim()
      : deriveShortName(name);

    const passwordHash = await bcrypt.hash(password, 10);
    const mustChangePassword = data.mustChangePassword !== false;

    const id = `STAFF-${Date.now()}`;
    await run(
      `INSERT INTO staff (
        id, code, name, role, territory, assigned_customers, monthly_leads, monthly_contracts,
        revenue_executed, collection_rate, renewal_rate, status, email,
        hrm_code, staff_type, phone, birth_date, personal_email, short_name, note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        code,
        name,
        role,
        data.territory || "",
        0,
        0,
        0,
        0,
        0,
        0,
        USER_STATUS.ACTIVE,
        email,
        hrmCode,
        staffType,
        data.phone ? String(data.phone).trim() : null,
        birthDate,
        personalEmail,
        shortName,
        data.note ? String(data.note).trim() : null,
      ]
    );

    try {
      await run(
        "INSERT INTO users (id, username, password_hash, name, role, email, status, created_at, must_change_password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          `USR-${code}`,
          code,
          passwordHash,
          name,
          role,
          email || null,
          USER_STATUS.ACTIVE,
          new Date().toISOString(),
          mustChangePassword,
        ]
      );
    } catch (error) {
      await run("DELETE FROM staff WHERE id = ?", [id]);
      const stillFree = await query<{ id: string }>(
        "SELECT id FROM users WHERE LOWER(username) = LOWER(?) OR id = ?",
        [code, `USR-${code}`]
      );
      if (stillFree.length) {
        throw new HttpError(409, "Tên đăng nhập trùng với mã nhân viên đã tồn tại");
      }
      throw error;
    }

    const created = await query<StaffRow>("SELECT * FROM staff WHERE id = ?", [id]);
    return toStaffRecord(created[0]);
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

    if (patch.hrmCode !== undefined) {
      const hrmCode = patch.hrmCode ? String(patch.hrmCode).trim() : null;
      if (hrmCode) {
        const dup = await query<{ id: string }>(
          "SELECT id FROM staff WHERE hrm_code = ? AND id <> ?",
          [hrmCode, id]
        );
        if (dup.length) {
          throw new HttpError(409, "Mã HRM đã được dùng cho nhân viên khác");
        }
      }
      fields.push("hrm_code = ?");
      values.push(hrmCode);
    }

    if (patch.staffType !== undefined) {
      const staffType = patch.staffType ? String(patch.staffType).trim() : null;
      if (staffType && !(STAFF_TYPES as readonly string[]).includes(staffType)) {
        throw new HttpError(400, "Loại nhân viên không hợp lệ");
      }
      fields.push("staff_type = ?");
      values.push(staffType);
    }

    if (patch.phone !== undefined) {
      fields.push("phone = ?");
      values.push(patch.phone ? String(patch.phone).trim() : null);
    }

    if (patch.birthDate !== undefined) {
      const birthDate = patch.birthDate ? String(patch.birthDate).trim() : null;
      if (birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
        throw new HttpError(400, "Ngày sinh không hợp lệ (định dạng YYYY-MM-DD)");
      }
      fields.push("birth_date = ?");
      values.push(birthDate);
    }

    if (patch.personalEmail !== undefined) {
      const personalEmail = patch.personalEmail ? String(patch.personalEmail).trim() : null;
      if (personalEmail && !EMAIL_REGEX.test(personalEmail)) {
        throw new HttpError(400, "Email cá nhân không hợp lệ");
      }
      fields.push("personal_email = ?");
      values.push(personalEmail);
    }

    if (patch.shortName !== undefined) {
      fields.push("short_name = ?");
      values.push(patch.shortName ? String(patch.shortName).trim() : null);
    }

    if (patch.note !== undefined) {
      fields.push("note = ?");
      values.push(patch.note ? String(patch.note).trim() : null);
    }

    if (!fields.length) {
      throw new Error("Không có dữ liệu cần cập nhật");
    }

    values.push(id);
    await run(`UPDATE staff SET ${fields.join(", ")} WHERE id = ?`, values);

    // Đồng bộ sang tài khoản đăng nhập (username = mã nhân viên)
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

