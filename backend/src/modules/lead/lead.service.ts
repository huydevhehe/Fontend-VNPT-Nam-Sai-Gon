import { query, run } from "../../database/db.js";
import { LEAD_CHANNELS, LEAD_GROUPS, ROLES, USER_STATUS } from "../../constants/org.js";

export class LeadServiceError extends Error {
  constructor(
    message: string,
    public readonly status: 400 | 404
  ) {
    super(message);
  }
}

export interface LeadRow {
  id: string;
  customer_name: string;
  phone: string;
  group_name: string;
  channel: string;
  staff_name: string;
  status: string;
  expected_value: number;
  demand_description: string;
  territory_id: string | null;
  referred_by_ctv_id: string | null;
  referred_by_ctv_name: string | null;
}

export interface LeadRecordDto {
  id: string;
  customerName: string;
  phone: string;
  group: string;
  channel: string;
  staffName: string;
  status: string;
  expectedValue: number;
  demandDescription: string;
  territoryId: string | null;
  referredByCtvId: string | null;
  referredByCtvName: string | null;
}

export interface CreateLeadInput {
  customerName: string;
  phone: string;
  group: string;
  channel: string;
  staffName: string;
  status?: string;
  expectedValue: number;
  demandDescription?: string;
  territoryId?: string | null;
  referredByCtvId?: string | null;
}

export interface LeadAssignmentInput {
  staffName?: string;
  territoryId?: string | null;
}

export interface CtvOptionDto {
  id: string;
  name: string;
  referralCode: string;
}

const DEFAULT_LEAD_STATUS = "Mới tiếp nhận";
const CTV_CHANNEL = "CTV giới thiệu";

const LEAD_STATUSES = [
  "Mới tiếp nhận",
  "Đã liên hệ",
  "Đang tư vấn",
  "Chốt thành công",
  "Thất bại",
] as const;

const LEAD_SELECT = `SELECT l.*, u.name AS referred_by_ctv_name
  FROM leads l
  LEFT JOIN users u ON u.id = l.referred_by_ctv_id`;

function toLeadRecord(row: LeadRow): LeadRecordDto {
  return {
    id: row.id,
    customerName: row.customer_name,
    phone: row.phone,
    group: row.group_name,
    channel: row.channel,
    staffName: row.staff_name,
    status: row.status,
    expectedValue: row.expected_value,
    demandDescription: row.demand_description,
    territoryId: row.territory_id ?? null,
    referredByCtvId: row.referred_by_ctv_id ?? null,
    referredByCtvName: row.referred_by_ctv_name ?? null,
  };
}

async function findLeadById(id: string): Promise<LeadRecordDto | null> {
  const rows = await query<LeadRow>(`${LEAD_SELECT} WHERE l.id = ?`, [id]);
  return rows.length ? toLeadRecord(rows[0]) : null;
}

async function assertTerritoryExists(territoryId: string): Promise<void> {
  const rows = await query("SELECT id FROM territories WHERE id = ?", [territoryId]);
  if (!rows.length) {
    throw new LeadServiceError("Phường không tồn tại", 400);
  }
}

export class LeadService {
  async getAll(): Promise<LeadRecordDto[]> {
    const rows = await query<LeadRow>(`${LEAD_SELECT} ORDER BY l.created_at DESC`);
    return rows.map(toLeadRecord);
  }

  async getCtvOptions(): Promise<CtvOptionDto[]> {
    const rows = await query<{ id: string; name: string; referral_code: string | null }>(
      "SELECT id, name, referral_code FROM users WHERE role = ? AND status = ? ORDER BY name",
      [ROLES.CTV, USER_STATUS.ACTIVE]
    );
    return rows.map((r) => ({ id: r.id, name: r.name, referralCode: r.referral_code ?? "" }));
  }

  async create(data: CreateLeadInput): Promise<LeadRecordDto> {
    if (!data.customerName || !data.phone || !data.group || !data.channel || !data.staffName) {
      throw new LeadServiceError("Thiếu thông tin bắt buộc để tạo Lead", 400);
    }

    if (!(LEAD_CHANNELS as readonly string[]).includes(data.channel)) {
      throw new LeadServiceError("Kênh phát triển không hợp lệ", 400);
    }

    if (!(LEAD_GROUPS as readonly string[]).includes(data.group)) {
      throw new LeadServiceError("Nhóm cơ hội không hợp lệ", 400);
    }

    if (typeof data.expectedValue !== "number" || Number.isNaN(data.expectedValue)) {
      throw new LeadServiceError("Giá trị dự kiến phải là một số hợp lệ", 400);
    }

    if (data.expectedValue < 0) {
      throw new LeadServiceError("Giá trị dự kiến không được âm", 400);
    }

    if (data.status !== undefined && !LEAD_STATUSES.includes(data.status as (typeof LEAD_STATUSES)[number])) {
      throw new LeadServiceError("Trạng thái không hợp lệ", 400);
    }

    const referredByCtvId = data.referredByCtvId ? String(data.referredByCtvId) : null;
    if (data.channel === CTV_CHANNEL) {
      if (!referredByCtvId) {
        throw new LeadServiceError("Kênh CTV giới thiệu phải chọn Cộng tác viên", 400);
      }
      const ctv = await query<{ id: string }>(
        "SELECT id FROM users WHERE id = ? AND role = ? AND status = ?",
        [referredByCtvId, ROLES.CTV, USER_STATUS.ACTIVE]
      );
      if (!ctv.length) {
        throw new LeadServiceError("Cộng tác viên không tồn tại hoặc chưa được duyệt", 400);
      }
    } else if (referredByCtvId) {
      throw new LeadServiceError("Chỉ lead kênh CTV giới thiệu mới gắn Cộng tác viên", 400);
    }

    const territoryId = data.territoryId ? String(data.territoryId) : null;
    if (territoryId) {
      await assertTerritoryExists(territoryId);
    }

    const id = `LEAD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await run(
      `INSERT INTO leads (
        id, customer_name, phone, group_name, channel, staff_name,
        status, expected_value, demand_description, territory_id, referred_by_ctv_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.customerName,
        data.phone,
        data.group,
        data.channel,
        data.staffName,
        data.status || DEFAULT_LEAD_STATUS,
        data.expectedValue,
        data.demandDescription || "",
        territoryId,
        referredByCtvId,
      ]
    );

    return (await findLeadById(id))!;
  }

  async updateStatus(id: string, status: string): Promise<LeadRecordDto> {
    if (!status) {
      throw new LeadServiceError("Thiếu trạng thái cần cập nhật", 400);
    }

    if (!LEAD_STATUSES.includes(status as (typeof LEAD_STATUSES)[number])) {
      throw new LeadServiceError("Trạng thái không hợp lệ", 400);
    }

    const existing = await query("SELECT id FROM leads WHERE id = ?", [id]);
    if (!existing.length) {
      throw new LeadServiceError("Không tìm thấy Lead", 404);
    }

    await run(
      "UPDATE leads SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, id]
    );

    return (await findLeadById(id))!;
  }

  async assign(id: string, input: LeadAssignmentInput): Promise<LeadRecordDto> {
    const hasStaff = input.staffName !== undefined;
    const hasTerritory = input.territoryId !== undefined;
    if (!hasStaff && !hasTerritory) {
      throw new LeadServiceError("Thiếu thông tin phân công (nhân viên hoặc phường)", 400);
    }

    const existing = await query("SELECT id FROM leads WHERE id = ?", [id]);
    if (!existing.length) {
      throw new LeadServiceError("Không tìm thấy Lead", 404);
    }

    const sets: string[] = [];
    const params: any[] = [];

    if (hasStaff) {
      const staffName = typeof input.staffName === "string" ? input.staffName.trim() : "";
      if (!staffName) {
        throw new LeadServiceError("Tên nhân viên không được để trống", 400);
      }
      const staff = await query("SELECT id FROM staff WHERE name = ?", [staffName]);
      if (!staff.length) {
        throw new LeadServiceError("Nhân viên không tồn tại", 400);
      }
      sets.push("staff_name = ?");
      params.push(staffName);
    }

    if (hasTerritory) {
      if (input.territoryId === null || input.territoryId === "") {
        sets.push("territory_id = ?");
        params.push(null);
      } else {
        const territoryId = String(input.territoryId);
        await assertTerritoryExists(territoryId);
        sets.push("territory_id = ?");
        params.push(territoryId);
      }
    }

    await run(
      `UPDATE leads SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...params, id]
    );

    return (await findLeadById(id))!;
  }
}
