import { query, run } from "./db.js";
import { LEAD_GROUP_RENAMES } from "../constants/org.js";

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
  await ensureColumn("users", "must_change_password", "BOOLEAN DEFAULT FALSE");
  await run("CREATE UNIQUE INDEX IF NOT EXISTS ux_users_referral_code ON users(referral_code)");

  await ensureColumn("renewals", "expiry_date", "TEXT");
  await ensureColumn("renewals", "renewed_at", "TEXT");

  await ensureColumn("customers", "handover_batch", "TEXT");
  await ensureColumn("customers", "handover_date", "TEXT");
  await ensureColumn("customers", "territory_id", "TEXT");
  await ensureColumn("customers", "customer_code", "TEXT");
  await ensureColumn("customers", "status", "TEXT");
  await ensureColumn("customers", "team_id", "TEXT");
  await ensureColumn("customers", "sales_channel", "TEXT");
  await ensureColumn("customers", "contact_name", "TEXT");
  await ensureColumn("customers", "contact_email", "TEXT");
  await ensureColumn("customers", "billing_name", "TEXT");
  await ensureColumn("customers", "billing_phone", "TEXT");
  await ensureColumn("customers", "billing_email", "TEXT");
  await ensureColumn("customers", "note", "TEXT");

  await run(`
    CREATE TABLE IF NOT EXISTS customer_teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      note TEXT,
      created_at TEXT
    )
  `);
  await run(
    "CREATE UNIQUE INDEX IF NOT EXISTS ux_customer_teams_name ON customer_teams(LOWER(name))"
  );

  await run(`
    CREATE TABLE IF NOT EXISTS customer_documents (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      doc_type TEXT NOT NULL,
      original_name TEXT NOT NULL,
      stored_name TEXT NOT NULL,
      mime TEXT,
      size INTEGER,
      uploaded_by TEXT,
      created_at TEXT
    )
  `);

  await ensureColumn("leads", "territory_id", "TEXT");
  await ensureColumn("leads", "referred_by_ctv_id", "TEXT");
  await ensureColumn("leads", "note", "TEXT");

  await ensureColumn("contracts", "territory_id", "TEXT");
  await ensureColumn("contracts", "referred_by_ctv_id", "TEXT");
  await ensureColumn("contracts", "lead_id", "TEXT");
  await ensureColumn("contracts", "am_staff", "TEXT");
  await ensureColumn("contracts", "service_group", "TEXT");
  await ensureColumn("contracts", "service_name", "TEXT");
  await ensureColumn("contracts", "package_name", "TEXT");
  await ensureColumn("contracts", "payment_method", "TEXT");
  await ensureColumn("contracts", "customer_id", "TEXT");
  await ensureColumn("contracts", "tax_code", "TEXT");
  await ensureColumn("contracts", "contract_number", "TEXT");
  await ensureColumn("contracts", "signed_date", "TEXT");
  await ensureColumn("contracts", "collected_amount", "REAL DEFAULT 0");

  await ensureColumn("commissions", "contract_id", "TEXT");
  await ensureColumn("commissions", "ctv_id", "TEXT");
  await ensureColumn("commissions", "note", "TEXT");
  await ensureColumn("commissions", "customer_paid_override", "REAL");
  await ensureColumn("commissions", "paid_out_amount", "REAL DEFAULT 0");
  await ensureColumn("commissions", "paid_out_date", "TEXT");
  await run(
    `CREATE UNIQUE INDEX IF NOT EXISTS ux_commissions_contract_ctv ON commissions(contract_id, ctv_id)
     WHERE contract_id IS NOT NULL AND ctv_id IS NOT NULL`
  );

  await ensureColumn("staff", "hrm_code", "TEXT");
  await ensureColumn("staff", "staff_type", "TEXT");
  await ensureColumn("staff", "phone", "TEXT");
  await ensureColumn("staff", "birth_date", "TEXT");
  await ensureColumn("staff", "personal_email", "TEXT");
  await ensureColumn("staff", "short_name", "TEXT");
  await ensureColumn("staff", "note", "TEXT");
  await ensureColumn("staff", "status_reason", "TEXT");
  await ensureColumn("staff", "status_changed_at", "TEXT");
  await ensureColumn("staff", "status_changed_by", "TEXT");
  await run(`
    CREATE UNIQUE INDEX IF NOT EXISTS ux_staff_hrm_code
    ON staff(hrm_code)
    WHERE hrm_code IS NOT NULL AND hrm_code <> ''
  `);

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

  await run(`
    CREATE TABLE IF NOT EXISTS contract_payments (
      id TEXT PRIMARY KEY,
      contract_id TEXT NOT NULL,
      amount REAL NOT NULL,
      paid_date TEXT NOT NULL,
      note TEXT,
      created_by TEXT,
      created_at TEXT
    )
  `);

  await ensureColumn("system_settings", "payment_beneficiary", "TEXT DEFAULT 'VNPT thành phố Hồ Chí Minh'");
  await ensureColumn("system_settings", "payment_account_no", "TEXT DEFAULT '1058561111'");
  await ensureColumn("system_settings", "payment_bank_name", "TEXT DEFAULT 'TMCP Ngoại Thương Việt Nam – CN TP.HCM. (VietcomBank)'");
  await ensureColumn("system_settings", "payment_signer_name", "TEXT DEFAULT 'Lê Văn Thuần'");

  await run(`
    CREATE TABLE IF NOT EXISTS kpi_formulas (
      kpi_key TEXT PRIMARY KEY,
      segments TEXT NOT NULL,
      updated_by TEXT,
      updated_at TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS kpi_targets (
      id TEXT PRIMARY KEY,
      staff_name TEXT NOT NULL,
      month TEXT NOT NULL,
      kpi_key TEXT NOT NULL,
      target_rate REAL NOT NULL,
      updated_by TEXT,
      updated_at TEXT
    )
  `);
  await run(
    `CREATE UNIQUE INDEX IF NOT EXISTS ux_kpi_targets_staff_month_key ON kpi_targets(staff_name, month, kpi_key)`
  );

  await run(`
    CREATE TABLE IF NOT EXISTS payment_request_exports (
      id TEXT PRIMARY KEY,
      contract_id TEXT NOT NULL,
      doc_number TEXT NOT NULL,
      exported_by TEXT,
      exported_at TEXT
    )
  `);

  await ensureColumn("services", "customer_id", "TEXT");
  await ensureColumn("services", "service_group", "TEXT");
  await ensureColumn("services", "package_name", "TEXT");
  await ensureColumn("services", "payment_type", "TEXT");

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

  await runMigrationOnce("lead_group_rename_v1", async () => {
    for (const [oldName, newName] of Object.entries(LEAD_GROUP_RENAMES)) {
      await run("UPDATE leads SET group_name = ? WHERE group_name = ?", [newName, oldName]);
    }
  });
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

/**
 * Chạy một hàm migration duy nhất một lần dựa trên key.
 * Trả về true nếu lần này có chạy fn, false nếu key đã được áp dụng trước đó.
 * Chỉ đánh dấu thành công nếu fn chạy không ném lỗi.
 */
export async function runMigrationOnce(
  key: string,
  fn: () => Promise<void>
): Promise<boolean> {
  if (await isMigrationApplied(key)) {
    return false;
  }
  await fn();
  await markMigrationApplied(key);
  return true;
}

// Chạy sau seed: chỉ điền các giá trị còn NULL, không ghi đè dữ liệu đã gán tay.
// Chỉ chạy MỘT LẦN (đánh dấu bằng schema_migrations_state) để một giá trị
// NULL mà admin chủ động gán (gỡ phường) không bị điền lại ở lần khởi động
// server sau.
export async function backfillRelations(): Promise<void> {
  await runMigrationOnce(TERRITORY_BACKFILL_KEY, async () => {
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
  });

  await runMigrationOnce("contracts_am_staff_backfill_v1", async () => {
    await run(`
      UPDATE contracts
      SET am_staff = (
        SELECT l.staff_name
        FROM leads l
        WHERE l.id = contracts.lead_id
        LIMIT 1
      )
      WHERE lead_id IS NOT NULL AND am_staff IS NULL
    `);
  });

  await runMigrationOnce("contract_payments_backfill_v1", async () => {
    const paidContracts = await query<{
      id: string;
      total_value: number;
      updated_at: string;
      created_at: string;
    }>(
      `SELECT c.id, c.total_value, c.updated_at, c.created_at
       FROM contracts c
       LEFT JOIN contract_payments p ON p.contract_id = c.id
       WHERE c.payment_status = 'Đã thanh toán' AND p.id IS NULL`
    );

    for (const c of paidContracts) {
      const paymentId = `PAY-BF-${c.id}`;
      const rawDate: any = c.updated_at || c.created_at || new Date().toISOString();
      const dateStr = (rawDate instanceof Date ? rawDate.toISOString() : String(rawDate)).slice(0, 10);
      const nowStr = new Date().toISOString();
      await run(
        `INSERT INTO contract_payments (id, contract_id, amount, paid_date, note, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [paymentId, c.id, c.total_value, dateStr, "Backfill thanh toán tự động", "System Backfill", nowStr]
      );
      await run("UPDATE contracts SET collected_amount = ? WHERE id = ?", [c.total_value, c.id]);
    }
  });

  // Dịch vụ cũ (seed) chỉ có customer_name, không có customer_id. Chỉ gán khi
  // ĐÚNG 1 khách có name trùng khớp chính xác — tên trùng 0 hoặc >1 khách thì
  // để NULL, không gán bừa (Review Focus #5, dot-07.md).
  await runMigrationOnce("services_customer_id_backfill_v1", backfillServiceCustomerIds);
}

/**
 * Logic thật của migration một-lần `services_customer_id_backfill_v1`, tách
 * riêng (không gói trong `runMigrationOnce`) để test gọi lại được nhiều lần
 * mà không bị khoá bởi `schema_migrations_state` (migration đã tự chạy một
 * lần khi `initDatabase()` khởi động, trước khi test tạo thêm dữ liệu).
 */
export async function backfillServiceCustomerIds(): Promise<void> {
  await run(`
    UPDATE services s
    SET customer_id = (
      SELECT c.id FROM customers c WHERE c.name = s.customer_name
    )
    WHERE s.customer_id IS NULL
      AND (SELECT COUNT(*) FROM customers c2 WHERE c2.name = s.customer_name) = 1
  `);
}
