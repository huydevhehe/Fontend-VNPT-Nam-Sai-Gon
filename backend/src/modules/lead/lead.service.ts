import { query, run } from "../../database/db.js";

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
}

const DEFAULT_LEAD_STATUS = "Mới tiếp nhận";

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
  };
}

export class LeadService {
  async getAll(): Promise<LeadRecordDto[]> {
    const rows = await query<LeadRow>("SELECT * FROM leads ORDER BY created_at DESC");
    return rows.map(toLeadRecord);
  }

  async create(data: CreateLeadInput): Promise<LeadRecordDto> {
    if (!data.customerName || !data.phone || !data.group || !data.channel || !data.staffName) {
      throw new Error("Thiếu thông tin bắt buộc để tạo Lead");
    }

    if (typeof data.expectedValue !== "number" || Number.isNaN(data.expectedValue)) {
      throw new Error("Giá trị dự kiến phải là một số hợp lệ");
    }

    if (data.expectedValue < 0) {
      throw new Error("Giá trị dự kiến không được âm");
    }

    const id = `LEAD-${Date.now()}`;
    await run(
      `INSERT INTO leads (
        id, customer_name, phone, group_name, channel, staff_name,
        status, expected_value, demand_description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      ]
    );

    const created = await query<LeadRow>("SELECT * FROM leads WHERE id = ?", [id]);
    return toLeadRecord(created[0]);
  }

  async updateStatus(id: string, status: string): Promise<LeadRecordDto> {
    if (!status) {
      throw new Error("Thiếu trạng thái cần cập nhật");
    }

    const existing = await query<LeadRow>("SELECT * FROM leads WHERE id = ?", [id]);
    if (!existing.length) {
      throw new Error("Không tìm thấy Lead");
    }

    await run(
      "UPDATE leads SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, id]
    );

    const updated = await query<LeadRow>("SELECT * FROM leads WHERE id = ?", [id]);
    return toLeadRecord(updated[0]);
  }
}
