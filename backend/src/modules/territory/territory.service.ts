import { query, run } from "../../database/db.js";
import { WARD_UNITS } from "../../constants/org.js";
import { normalizeWardName } from "./ward-name.js";

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

function conflict(message: string): TerritoryServiceError {
  return new TerritoryServiceError(message, 409);
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

export interface WardContactInput {
  unit: string;
  department: string;
  fullName: string;
  position: string;
  phone?: string;
  amInCharge?: string;
}

export interface CreateTerritoryInput {
  wardName: string;
  staffName?: string;
}

export interface WardStatsInput {
  population?: number;
  schoolMamnon?: number;
  schoolTieuhoc?: number;
  schoolThcs?: number;
  schoolThpt?: number;
  revenue?: number;
}

export class TerritoryService {
  async getAll() {
    return query("SELECT * FROM territories ORDER BY ward_name ASC");
  }

  async createTerritory(input: CreateTerritoryInput, operator: string = "Admin") {
    if (typeof input.wardName !== "string" || input.wardName.trim() === "") {
      throw badRequest("Tên phường không được để trống");
    }
    const wardName = input.wardName.trim();
    if (wardName.length < 2 || wardName.length > MAX_NAME_LENGTH) {
      throw badRequest("Tên phường phải từ 2 đến 100 ký tự");
    }

    const normalizedNew = normalizeWardName(wardName);
    const existingWards = await query<{ ward_name: string }>("SELECT ward_name FROM territories");
    const isDuplicate = existingWards.some(
      (row) => normalizeWardName(row.ward_name) === normalizedNew
    );
    if (isDuplicate) {
      throw conflict("Phường đã tồn tại");
    }

    let staffName = "";
    if (input.staffName !== undefined && input.staffName !== null && input.staffName !== "") {
      if (typeof input.staffName !== "string") {
        throw badRequest("Nhân viên phụ trách không hợp lệ");
      }
      staffName = input.staffName.trim();
      const staffRows = await query<{ id: string }>("SELECT id FROM staff WHERE name = ?", [staffName]);
      if (!staffRows.length) {
        throw badRequest("Nhân viên phụ trách không tồn tại");
      }
    }

    const id = `TB-${Date.now()}`;
    await run(
      "INSERT INTO territories (id, ward_name, staff_name) VALUES (?, ?, ?)",
      [id, wardName, staffName || null]
    );

    await run(
      'INSERT INTO audit_logs (id, "user", action, details) VALUES (?, ?, ?, ?)',
      [`LOG-${Date.now()}`, operator, "Tạo phường", `Tạo phường ${wardName} (ID ${id})`]
    );

    const created = await query<any>("SELECT * FROM territories WHERE id = ?", [id]);
    const row = created[0];
    return {
      id: row.id,
      wardName: row.ward_name,
      staffName: row.staff_name || "",
    };
  }

  async updateStats(id: string, stats: WardStatsInput, operator: string = "Admin") {
    const existing = await query("SELECT id FROM territories WHERE id = ?", [id]);
    if (!existing.length) {
      throw new Error("Không tìm thấy địa bàn");
    }

    const columnByField: Record<keyof WardStatsInput, string> = {
      population: "population",
      schoolMamnon: "school_mamnon",
      schoolTieuhoc: "school_tieuhoc",
      schoolThcs: "school_thcs",
      schoolThpt: "school_thpt",
      revenue: "revenue",
    };

    const fields: string[] = [];
    const values: any[] = [];

    for (const key of Object.keys(columnByField) as (keyof WardStatsInput)[]) {
      const value = stats[key];
      if (value === undefined) continue;
      if (Number.isNaN(value) || value < 0) {
        throw new Error("Giá trị thống kê không hợp lệ (không được âm)");
      }
      fields.push(`${columnByField[key]} = ?`);
      values.push(value);
    }

    if (!fields.length) {
      throw new Error("Không có dữ liệu cần cập nhật");
    }

    values.push(id);
    await run(`UPDATE territories SET ${fields.join(", ")} WHERE id = ?`, values);

    await run(
      'INSERT INTO audit_logs (id, "user", action, details) VALUES (?, ?, ?, ?)',
      [`LOG-${Date.now()}`, operator, "Cập nhật chỉ số địa bàn", `Cập nhật địa bàn ID ${id}: ${JSON.stringify(stats)}`]
    );

    const updated = await query("SELECT * FROM territories WHERE id = ?", [id]);
    return updated[0];
  }

  async getWardContacts(territoryId: string) {
    return query(
      "SELECT * FROM ward_contacts WHERE territory_id = ? ORDER BY unit ASC, department ASC, full_name ASC",
      [territoryId]
    );
  }

  private async assertNoDuplicateContact(
    territoryId: string,
    data: WardContactInput,
    excludeId?: string
  ) {
    if (data.phone) {
      const byPhone = await query<{ id: string }>(
        "SELECT id FROM ward_contacts WHERE territory_id = ? AND phone = ? AND phone != ''",
        [territoryId, data.phone]
      );
      if (byPhone.some((row) => row.id !== excludeId)) {
        throw new Error("Trùng dữ liệu: số điện thoại này đã có trong danh sách đầu mối của phường");
      }
    }

    const byIdentity = await query<{ id: string }>(
      "SELECT id FROM ward_contacts WHERE territory_id = ? AND unit = ? AND department = ? AND full_name = ? AND position = ?",
      [territoryId, data.unit, data.department, data.fullName, data.position]
    );
    if (byIdentity.some((row) => row.id !== excludeId)) {
      throw new Error("Trùng dữ liệu: người này đã có đúng đơn vị/phòng ban/chức vụ trong phường");
    }
  }

  private async assertKnownStaff(staffName: string): Promise<void> {
    const rows = await query<{ id: string }>("SELECT id FROM staff WHERE name = ?", [staffName]);
    if (!rows.length) {
      throw new Error("AM phụ trách không tồn tại");
    }
  }

  async createWardContact(territoryId: string, data: WardContactInput, operator: string = "Admin") {
    if (!data.unit || !data.department || !data.position) {
      throw new Error("Thiếu thông tin bắt buộc (Đơn vị, Phòng ban, Chức vụ)");
    }

    const territoryExists = await query("SELECT id FROM territories WHERE id = ?", [territoryId]);
    if (!territoryExists.length) {
      throw new Error("Không tìm thấy địa bàn");
    }

    const fullName = data.fullName || "";
    const phone = data.phone || "";
    const amInCharge = data.amInCharge || "";
    if (amInCharge) {
      await this.assertKnownStaff(amInCharge);
    }

    const normalized: WardContactInput = { ...data, fullName, phone, amInCharge };
    await this.assertNoDuplicateContact(territoryId, normalized);

    const id = `WARDC-${Date.now()}`;
    await run(
      "INSERT INTO ward_contacts (id, territory_id, unit, department, full_name, position, phone, am_in_charge) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id, territoryId, data.unit, data.department, fullName, data.position, phone, amInCharge]
    );

    await run(
      'INSERT INTO audit_logs (id, "user", action, details) VALUES (?, ?, ?, ?)',
      [`LOG-${Date.now()}`, operator, "Thêm đầu mối phường", `Thêm ${fullName || data.position} (${data.position}) vào địa bàn ID ${territoryId}`]
    );

    const created = await query("SELECT * FROM ward_contacts WHERE id = ?", [id]);
    return created[0];
  }

  async updateWardContact(contactId: string, patch: Partial<WardContactInput>, operator: string = "Admin") {
    const existingRows = await query<any>("SELECT * FROM ward_contacts WHERE id = ?", [contactId]);
    const existing = existingRows[0];
    if (!existing) {
      throw new Error("Không tìm thấy đầu mối");
    }

    const merged: WardContactInput = {
      unit: patch.unit ?? existing.unit,
      department: patch.department ?? existing.department,
      fullName: patch.fullName ?? existing.full_name ?? "",
      position: patch.position ?? existing.position,
      phone: patch.phone ?? existing.phone ?? "",
      amInCharge: patch.amInCharge ?? existing.am_in_charge ?? "",
    };

    if (!merged.unit || !merged.department || !merged.position) {
      throw new Error("Thiếu thông tin bắt buộc (Đơn vị, Phòng ban, Chức vụ)");
    }
    if (merged.amInCharge) {
      await this.assertKnownStaff(merged.amInCharge);
    }

    await this.assertNoDuplicateContact(existing.territory_id, merged, contactId);

    await run(
      "UPDATE ward_contacts SET unit = ?, department = ?, full_name = ?, position = ?, phone = ?, am_in_charge = ? WHERE id = ?",
      [merged.unit, merged.department, merged.fullName, merged.position, merged.phone || "", merged.amInCharge || "", contactId]
    );

    await run(
      'INSERT INTO audit_logs (id, "user", action, details) VALUES (?, ?, ?, ?)',
      [`LOG-${Date.now()}`, operator, "Cập nhật đầu mối phường", `Cập nhật đầu mối ID ${contactId}`]
    );

    const updated = await query("SELECT * FROM ward_contacts WHERE id = ?", [contactId]);
    return updated[0];
  }

  async deleteWardContact(contactId: string, operator: string = "Admin") {
    const existing = await query("SELECT id FROM ward_contacts WHERE id = ?", [contactId]);
    if (!existing.length) {
      throw new Error("Không tìm thấy đầu mối");
    }

    await run("DELETE FROM ward_contacts WHERE id = ?", [contactId]);

    await run(
      'INSERT INTO audit_logs (id, "user", action, details) VALUES (?, ?, ?, ?)',
      [`LOG-${Date.now()}`, operator, "Xóa đầu mối phường", `Xóa đầu mối ID ${contactId}`]
    );

    return { success: true, message: "Xóa đầu mối thành công" };
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
      'INSERT INTO audit_logs (id, "user", action, details) VALUES (?, ?, ?, ?)',
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
        leadershipContact: t.leadership_contact || "",
        population: Number(t.population) || 0,
        schoolMamnon: Number(t.school_mamnon) || 0,
        schoolTieuhoc: Number(t.school_tieuhoc) || 0,
        schoolThcs: Number(t.school_thcs) || 0,
        schoolThpt: Number(t.school_thpt) || 0,
        revenue: Number(t.revenue) || 0,
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
