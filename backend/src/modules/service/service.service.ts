import { query } from "../../database/db.js";

export interface ServiceRow {
  id: string;
  customer_name: string;
  service_name: string;
  service_code: string;
  start_date: string;
  expiration_date: string;
  staff_name: string;
}

export interface ServiceRecordDto {
  id: string;
  customerName: string;
  serviceName: string;
  serviceCode: string;
  startDate: string;
  expirationDate: string;
  daysRemaining: number;
  staffName: string;
  isExpired: boolean;
}

function toServiceRecord(row: ServiceRow): ServiceRecordDto {
  const daysRemaining = Math.ceil(
    (new Date(row.expiration_date).getTime() - new Date().getTime()) / 86400000
  );

  return {
    id: row.id,
    customerName: row.customer_name,
    serviceName: row.service_name,
    serviceCode: row.service_code,
    startDate: row.start_date,
    expirationDate: row.expiration_date,
    daysRemaining,
    staffName: row.staff_name,
    isExpired: daysRemaining < 0,
  };
}

export class ServiceService {
  async getAll(filters: { staff?: string; expiringWithinDays?: number }): Promise<ServiceRecordDto[]> {
    let sql = "SELECT * FROM services WHERE 1=1";
    const params: any[] = [];

    if (filters.staff && filters.staff !== "all") {
      sql += " AND staff_name = ?";
      params.push(filters.staff);
    }

    sql += " ORDER BY expiration_date ASC";
    const rows = await query<ServiceRow>(sql, params);
    let records = rows.map(toServiceRecord);

    if (typeof filters.expiringWithinDays === "number" && !Number.isNaN(filters.expiringWithinDays)) {
      records = records.filter((r) => r.daysRemaining <= filters.expiringWithinDays!);
    }

    return records;
  }
}
