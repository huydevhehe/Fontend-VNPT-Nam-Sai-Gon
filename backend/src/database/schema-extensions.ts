import { config } from "../config/index.js";
import { query, run } from "./db.js";

const IDENTIFIER_PATTERN = /^[a-z_]+$/;

function assertIdentifier(value: string, kind: string): void {
  if (!IDENTIFIER_PATTERN.test(value)) {
    throw new Error(`Invalid ${kind} identifier: ${value}`);
  }
}

// Thêm cột nếu chưa có. SQLite không hỗ trợ ADD COLUMN IF NOT EXISTS nên
// kiểm tra bằng PRAGMA table_info; Postgres dùng cú pháp IF NOT EXISTS.
export async function ensureColumn(table: string, column: string, ddlType: string): Promise<void> {
  assertIdentifier(table, "table");
  assertIdentifier(column, "column");

  if (config.dbDriver === "postgres") {
    await run(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${ddlType}`);
    return;
  }

  const columns = await query<{ name: string }>(`PRAGMA table_info(${table})`);
  if (columns.some((c) => c.name === column)) {
    return;
  }
  await run(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddlType}`);
}

// Chạy trước seed: chỉ thêm cột/bảng/index, không đụng dữ liệu.
export async function applySchemaExtensions(): Promise<void> {
  await ensureColumn("users", "phone", "TEXT");
  await ensureColumn("users", "referral_code", "TEXT");
  await ensureColumn("users", "approved_at", "TEXT");
  await ensureColumn("users", "approved_by", "TEXT");
  await ensureColumn("users", "created_at", "TEXT");
  await run("CREATE UNIQUE INDEX IF NOT EXISTS ux_users_referral_code ON users(referral_code)");

  await ensureColumn("customers", "handover_batch", "TEXT");
  await ensureColumn("customers", "handover_date", "TEXT");

  await ensureColumn("leads", "territory_id", "TEXT");
  await ensureColumn("leads", "referred_by_ctv_id", "TEXT");

  await ensureColumn("contracts", "territory_id", "TEXT");
  await ensureColumn("contracts", "referred_by_ctv_id", "TEXT");
  await ensureColumn("contracts", "lead_id", "TEXT");

  await ensureColumn("commissions", "contract_id", "TEXT");
  await ensureColumn("commissions", "ctv_id", "TEXT");

  await run(`
    CREATE TABLE IF NOT EXISTS ward_officials (
      id TEXT PRIMARY KEY,
      territory_id TEXT NOT NULL,
      unit TEXT NOT NULL,
      position TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      created_at TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS quarters (
      id TEXT PRIMARY KEY,
      territory_id TEXT NOT NULL,
      name TEXT NOT NULL,
      head_name TEXT,
      secretary_name TEXT,
      mttq_name TEXT,
      household_count INTEGER DEFAULT 0,
      population INTEGER DEFAULT 0,
      created_at TEXT
    )
  `);
}

// Chạy sau seed: chỉ điền các giá trị còn NULL, không ghi đè dữ liệu đã gán tay.
export async function backfillRelations(): Promise<void> {
  await run(`
    UPDATE leads
    SET territory_id = (
      SELECT t.id
      FROM staff s
      JOIN territories t ON t.ward_name = s.territory
      WHERE s.name = leads.staff_name
      LIMIT 1
    )
    WHERE territory_id IS NULL
  `);

  await run(`
    UPDATE contracts
    SET territory_id = (
      SELECT l.territory_id
      FROM leads l
      WHERE l.customer_name = contracts.customer_name
        AND l.territory_id IS NOT NULL
      LIMIT 1
    )
    WHERE territory_id IS NULL
  `);
}
