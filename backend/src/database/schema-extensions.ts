import { query, run } from "./db.js";

const IDENTIFIER_PATTERN = /^[a-z_]+$/;

function assertIdentifier(value: string, kind: string): void {
  if (!IDENTIFIER_PATTERN.test(value)) {
    throw new Error(`Invalid ${kind} identifier: ${value}`);
  }
}

// Thêm cột nếu chưa có (Postgres: ADD COLUMN IF NOT EXISTS).
export async function ensureColumn(table: string, column: string, ddlType: string): Promise<void> {
  assertIdentifier(table, "table");
  assertIdentifier(column, "column");
  await run(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${ddlType}`);
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
  await run(
    `CREATE UNIQUE INDEX IF NOT EXISTS ux_commissions_contract_ctv ON commissions(contract_id, ctv_id)
     WHERE contract_id IS NOT NULL AND ctv_id IS NOT NULL`
  );

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

  // Bảng đánh dấu migration một-lần, do file này sở hữu. Dùng để tránh
  // backfillRelations() chạy lại mỗi lần khởi động server và điền lại giá trị
  // territory_id mà admin đã chủ động gỡ (PATCH /leads/:id/assignment với
  // territoryId: null).
  await run(`
    CREATE TABLE IF NOT EXISTS schema_migrations_state (
      key TEXT PRIMARY KEY,
      applied_at TEXT
    )
  `);
}

const TERRITORY_BACKFILL_KEY = "territory_backfill_v1";

async function isMigrationApplied(key: string): Promise<boolean> {
  const rows = await query<{ key: string }>(
    "SELECT key FROM schema_migrations_state WHERE key = ?",
    [key]
  );
  return rows.length > 0;
}

async function markMigrationApplied(key: string): Promise<void> {
  await run("INSERT INTO schema_migrations_state (key, applied_at) VALUES (?, ?)", [
    key,
    new Date().toISOString(),
  ]);
}

// Chạy sau seed: chỉ điền các giá trị còn NULL, không ghi đè dữ liệu đã gán tay.
// Chỉ chạy MỘT LẦN (đánh dấu bằng schema_migrations_state) để một giá trị
// NULL mà admin chủ động gán (gỡ phường) không bị điền lại ở lần khởi động
// server sau.
export async function backfillRelations(): Promise<void> {
  if (await isMigrationApplied(TERRITORY_BACKFILL_KEY)) {
    return;
  }

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
      ORDER BY l.id
      LIMIT 1
    )
    WHERE territory_id IS NULL
  `);

  await markMigrationApplied(TERRITORY_BACKFILL_KEY);
}
