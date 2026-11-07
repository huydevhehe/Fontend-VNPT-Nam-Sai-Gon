import { query, run } from "../../database/db.js";
import { WARD_UNITS } from "../../constants/org.js";

export class TerritoryServiceError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "TerritoryServiceError";
  }
}

const MAX_NAME_LENGTH = 100;
const MAX_PHONE_LENGTH = 30;

function badRequest(message: string): TerritoryServiceError {
  return new TerritoryServiceError(message, 400);
}

function notFound(message: string): TerritoryServiceError {
  return new TerritoryServiceError(message, 404);
}

function requireText(value: unknown, label: string, max: number): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw badRequest(`${label} không được để trống`);
  }
  const text = value.trim();
  if (text.length > max) {
    throw badRequest(`${label} tối đa ${max} ký tự`);
  }
  return text;
}

function optionalText(value: unknown, label: string, max: number): string {
  if (value === undefined || value === null || value === "") {
    return "";
  }
  if (typeof value !== "string") {
    throw badRequest(`${label} không hợp lệ`);
  }
  const text = value.trim();
  if (text.length > max) {
    throw badRequest(`${label} tối đa ${max} ký tự`);
  }
  return text;
}

function nonNegativeInt(value: unknown, label: string): number {
  if (typeof value === "string" && value.trim() === "") {
    throw badRequest(`${label} phải là số nguyên không âm`);
  }
  const n = typeof value === "number" || typeof value === "string" ? Number(value) : NaN;
  if (!Number.isInteger(n) || n < 0) {
    throw badRequest(`${label} phải là số nguyên không âm`);
  }
  return n;
}

export interface OfficialInput {
  unit?: unknown;
  position?: unknown;
  fullName?: unknown;
  phone?: unknown;
}

export interface QuarterInput {
  name?: unknown;
  headName?: unknown;
  secretaryName?: unknown;
  mttqName?: unknown;
  householdCount?: unknown;
  population?: unknown;
}

function mapOfficial(row: any) {
  return {
    id: row.id,
    territoryId: row.territory_id,
    unit: row.unit,
    position: row.position,
    fullName: row.full_name,
    phone: row.phone || "",
  };
}

function mapQuarter(row: any) {
  return {
    id: row.id,
    territoryId: row.territory_id,
    name: row.name,
    headName: row.head_name || "",
    secretaryName: row.secretary_name || "",
    mttqName: row.mttq_name || "",
    householdCount: Number(row.household_count) || 0,
    population: Number(row.population) || 0,
  };
}

let idCounter = 0;
function newId(prefix: string): string {
  idCounter = (idCounter + 1) % 1000;
  return `${prefix}-${Date.now()}-${idCounter}-${Math.random().toString(36).slice(2, 6)}`;
}

export class TerritoryService {
  async getAll() {
    return query("SELECT * FROM territories ORDER BY ward_name ASC");
  }

  async updateHouseholds(id: string, householdCount: number, quarterCount?: number, operator: string = "Admin") {
    if (Number.isNaN(householdCount) || householdCount < 0) {
      throw new Error("Số hộ dân không được âm");
    }
    if (quarterCount !== undefined && (Number.isNaN(quarterCount) || quarterCount < 0)) {
      throw new Error("Số hộ đạt chuẩn khu phố văn hóa không được âm");
    }

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

  private async requireTerritory(id: string) {
    const rows = await query("SELECT * FROM territories WHERE id = ?", [id]);
    if (rows.length === 0) {
      throw notFound("Không tìm thấy địa bàn");
    }
    return rows[0];
  }

  async getDetail(id: string) {
    const t = await this.requireTerritory(id);

    const officialRows = await query(
      "SELECT * FROM ward_officials WHERE territory_id = ? ORDER BY created_at ASC, id ASC",
      [id]
    );
    const quarterRows = await query(
      "SELECT * FROM quarters WHERE territory_id = ? ORDER BY created_at ASC, id ASC",
      [id]
    );
    const leadRows = await query(
      "SELECT id, customer_name, status, expected_value, channel, staff_name FROM leads WHERE territory_id = ? ORDER BY created_at DESC, id ASC",
      [id]
    );
    const contractRows = await query(
      "SELECT id, transaction_code, customer_name, total_value, deployment_status, payment_status FROM contracts WHERE territory_id = ? ORDER BY created_at DESC, id ASC",
      [id]
    );

    const officials = officialRows.map(mapOfficial);
    const quarters = quarterRows.map(mapQuarter);
    const leads = leadRows.map((r: any) => ({
      id: r.id,
      customerName: r.customer_name,
      status: r.status,
      expectedValue: Number(r.expected_value) || 0,
      channel: r.channel,
      staffName: r.staff_name,
    }));
    const contracts = contractRows.map((r: any) => ({
      id: r.id,
      transactionCode: r.transaction_code,
      customerName: r.customer_name,
      totalValue: Number(r.total_value) || 0,
      deploymentStatus: r.deployment_status,
      paymentStatus: r.payment_status,
    }));

    return {
      territory: {
        id: t.id,
        wardName: t.ward_name,
        quarterCount: Number(t.quarter_count) || 0,
        householdCount: Number(t.household_count) || 0,
        opportunityCount: Number(t.opportunity_count) || 0,
        deployedCount: Number(t.deployed_count) || 0,
        staffName: t.staff_name || "",
      },
      officials,
      quarters,
      leads,
      contracts,
      totals: {
        quarterCount: quarters.length,
        householdCount: quarters.reduce((sum: number, q: { householdCount: number }) => sum + q.householdCount, 0),
        population: quarters.reduce((sum: number, q: { population: number }) => sum + q.population, 0),
        leadCount: leads.length,
        contractCount: contracts.length,
        contractValue: contracts.reduce((sum: number, c: { totalValue: number }) => sum + c.totalValue, 0),
      },
    };
  }

  async createOfficial(territoryId: string, input: OfficialInput) {
    const unit = requireText(input.unit, "Đơn vị", MAX_NAME_LENGTH);
    const position = requireText(input.position, "Chức vụ", MAX_NAME_LENGTH);
    const valid = WARD_UNITS.some((u) => u.unit === unit && u.positions.includes(position));
    if (!valid) {
      throw badRequest("Đơn vị hoặc chức vụ không hợp lệ");
    }
    const fullName = requireText(input.fullName, "Họ tên", MAX_NAME_LENGTH);
    const phone = optionalText(input.phone, "Số điện thoại", MAX_PHONE_LENGTH);

    await this.requireTerritory(territoryId);

    const id = newId("WO");
    await run(
      "INSERT INTO ward_officials (id, territory_id, unit, position, full_name, phone, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, territoryId, unit, position, fullName, phone || null, new Date().toISOString()]
    );
    return mapOfficial({ id, territory_id: territoryId, unit, position, full_name: fullName, phone });
  }

  async updateOfficial(officialId: string, input: OfficialInput) {
    const rows = await query("SELECT * FROM ward_officials WHERE id = ?", [officialId]);
    if (rows.length === 0) {
      throw notFound("Không tìm thấy cán bộ");
    }
    const current = rows[0];
    const fullName =
      input.fullName === undefined ? current.full_name : requireText(input.fullName, "Họ tên", MAX_NAME_LENGTH);
    const phone =
      input.phone === undefined ? current.phone || "" : optionalText(input.phone, "Số điện thoại", MAX_PHONE_LENGTH);

    await run("UPDATE ward_officials SET full_name = ?, phone = ? WHERE id = ?", [fullName, phone || null, officialId]);
    return mapOfficial({ ...current, full_name: fullName, phone });
  }

  async deleteOfficial(officialId: string) {
    const rows = await query("SELECT id FROM ward_officials WHERE id = ?", [officialId]);
    if (rows.length === 0) {
      throw notFound("Không tìm thấy cán bộ");
    }
    await run("DELETE FROM ward_officials WHERE id = ?", [officialId]);
    return { id: officialId };
  }

  async createQuarter(territoryId: string, input: QuarterInput) {
    const name = requireText(input.name, "Tên khu phố", MAX_NAME_LENGTH);
    const headName = optionalText(input.headName, "Trưởng khu phố", MAX_NAME_LENGTH);
    const secretaryName = optionalText(input.secretaryName, "Bí thư", MAX_NAME_LENGTH);
    const mttqName = optionalText(input.mttqName, "MTTQ", MAX_NAME_LENGTH);
    const householdCount = input.householdCount === undefined ? 0 : nonNegativeInt(input.householdCount, "Số hộ dân");
    const population = input.population === undefined ? 0 : nonNegativeInt(input.population, "Số dân");

    await this.requireTerritory(territoryId);

    const id = newId("QT");
    await run(
      "INSERT INTO quarters (id, territory_id, name, head_name, secretary_name, mttq_name, household_count, population, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, territoryId, name, headName || null, secretaryName || null, mttqName || null, householdCount, population, new Date().toISOString()]
    );
    return mapQuarter({
      id,
      territory_id: territoryId,
      name,
      head_name: headName,
      secretary_name: secretaryName,
      mttq_name: mttqName,
      household_count: householdCount,
      population,
    });
  }

  async updateQuarter(quarterId: string, input: QuarterInput) {
    const rows = await query("SELECT * FROM quarters WHERE id = ?", [quarterId]);
    if (rows.length === 0) {
      throw notFound("Không tìm thấy khu phố");
    }
    const current = rows[0];

    const name = input.name === undefined ? current.name : requireText(input.name, "Tên khu phố", MAX_NAME_LENGTH);
    const headName =
      input.headName === undefined ? current.head_name || "" : optionalText(input.headName, "Trưởng khu phố", MAX_NAME_LENGTH);
    const secretaryName =
      input.secretaryName === undefined ? current.secretary_name || "" : optionalText(input.secretaryName, "Bí thư", MAX_NAME_LENGTH);
    const mttqName =
      input.mttqName === undefined ? current.mttq_name || "" : optionalText(input.mttqName, "MTTQ", MAX_NAME_LENGTH);
    const householdCount =
      input.householdCount === undefined ? Number(current.household_count) || 0 : nonNegativeInt(input.householdCount, "Số hộ dân");
    const population =
      input.population === undefined ? Number(current.population) || 0 : nonNegativeInt(input.population, "Số dân");

    await run(
      "UPDATE quarters SET name = ?, head_name = ?, secretary_name = ?, mttq_name = ?, household_count = ?, population = ? WHERE id = ?",
      [name, headName || null, secretaryName || null, mttqName || null, householdCount, population, quarterId]
    );
    return mapQuarter({
      ...current,
      name,
      head_name: headName,
      secretary_name: secretaryName,
      mttq_name: mttqName,
      household_count: householdCount,
      population,
    });
  }

  async deleteQuarter(quarterId: string) {
    const rows = await query("SELECT id FROM quarters WHERE id = ?", [quarterId]);
    if (rows.length === 0) {
      throw notFound("Không tìm thấy khu phố");
    }
    await run("DELETE FROM quarters WHERE id = ?", [quarterId]);
    return { id: quarterId };
  }
}
