import { query, run } from "../../database/db.js";

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

export class StaffService {
  async getAll(): Promise<StaffRecordDto[]> {
    const rows = await query<StaffRow>("SELECT * FROM staff ORDER BY code ASC");
    return rows.map(toStaffRecord);
  }

  async update(id: string, patch: StaffUpdateInput): Promise<StaffRecordDto> {
    const existing = await query<StaffRow>("SELECT * FROM staff WHERE id = ?", [id]);
    if (!existing.length) {
      throw new Error("Không tìm thấy Nhân viên");
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

    const updated = await query<StaffRow>("SELECT * FROM staff WHERE id = ?", [id]);
    return toStaffRecord(updated[0]);
  }
}
