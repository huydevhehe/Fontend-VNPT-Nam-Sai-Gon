import { test } from "node:test";
import assert from "node:assert/strict";

const { initDatabase, query, run } = await import("./db.js");
const { ensureColumn, runMigrationOnce } = await import("./schema-extensions.js");

async function columnExists(table: string, column: string): Promise<boolean> {
  const rows = await query(
    "SELECT 1 AS ok FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = ? AND column_name = ?",
    [table, column]
  );
  return rows.length > 0;
}

const EXPECTED_COLUMNS: Record<string, string[]> = {
  users: ["phone", "referral_code", "approved_at", "approved_by", "created_at"],
  customers: ["handover_batch", "handover_date"],
  leads: ["territory_id", "referred_by_ctv_id"],
  contracts: ["territory_id", "referred_by_ctv_id", "lead_id"],
  commissions: ["contract_id", "ctv_id"],
  ward_officials: ["id", "territory_id", "unit", "position", "full_name", "phone", "created_at"],
  quarters: [
    "id",
    "territory_id",
    "name",
    "head_name",
    "secretary_name",
    "mttq_name",
    "household_count",
    "population",
    "created_at",
  ],
  system_settings: [
    "payment_beneficiary",
    "payment_account_no",
    "payment_bank_name",
    "payment_signer_name",
  ],
};

async function count(table: string): Promise<number> {
  const rows = await query<{ c: number | string }>(`SELECT COUNT(*) AS c FROM ${table}`);
  return Number(rows[0].c);
}

async function leadTerritory(id: string): Promise<string | null> {
  const rows = await query<{ territory_id: string | null }>("SELECT territory_id FROM leads WHERE id = ?", [id]);
  return rows[0]?.territory_id ?? null;
}

test("initDatabase adds all new columns and tables, and is idempotent", async () => {
  await initDatabase();
  const leadsBefore = await count("leads");
  const contractsBefore = await count("contracts");
  const officialsBefore = await count("ward_officials");
  const quartersBefore = await count("quarters");

  for (const [table, columns] of Object.entries(EXPECTED_COLUMNS)) {
    for (const column of columns) {
      assert.equal(await columnExists(table, column), true, `${table}.${column} should exist`);
    }
  }

  await initDatabase();
  assert.equal(await count("leads"), leadsBefore);
  assert.equal(await count("contracts"), contractsBefore);
  assert.equal(await count("ward_officials"), officialsBefore);
  assert.equal(await count("quarters"), quartersBefore);

  const idx = await query("SELECT 1 AS ok FROM pg_indexes WHERE indexname = ?", [
    "ux_users_referral_code",
  ]);
  assert.equal(idx.length, 1, "unique index ux_users_referral_code should exist");

  const commissionsIdx = await query("SELECT 1 AS ok FROM pg_indexes WHERE indexname = ?", [
    "ux_commissions_contract_ctv",
  ]);
  assert.equal(commissionsIdx.length, 1, "unique index ux_commissions_contract_ctv should exist");
});

test("ensureColumn rejects an invalid table identifier", async () => {
  await assert.rejects(() => ensureColumn("Users;", "x", "TEXT"));
});

test("backfill derives territory_id for leads and contracts", async () => {
  await initDatabase();
  assert.equal(await leadTerritory("LEAD-01"), "TB-01");
  const rows = await query<{ territory_id: string | null }>("SELECT territory_id FROM contracts WHERE id = ?", ["CTR-01"]);
  assert.equal(rows[0]?.territory_id, "TB-01");
});

test("backfill does not overwrite a manually assigned territory_id", async () => {
  await initDatabase();
  await run("UPDATE leads SET territory_id = 'TB-02' WHERE id = 'LEAD-01'");
  await initDatabase();
  assert.equal(await leadTerritory("LEAD-01"), "TB-02");
  await run("UPDATE leads SET territory_id = 'TB-01' WHERE id = 'LEAD-01'");
});

test("backfill runs only once: a deliberately cleared territory_id stays NULL across restarts", async () => {
  await initDatabase();
  assert.equal(await leadTerritory("LEAD-01"), "TB-01");

  // Giả lập PATCH /leads/:id/assignment với territoryId: null (admin chủ động
  // bỏ gán phường).
  await run("UPDATE leads SET territory_id = NULL WHERE id = 'LEAD-01'");
  assert.equal(await leadTerritory("LEAD-01"), null);

  // Khởi động lại server (initDatabase chạy lại backfillRelations): giá trị
  // NULL chủ động phải giữ nguyên, không bị điền lại.
  await initDatabase();
  assert.equal(await leadTerritory("LEAD-01"), null);

  await run("UPDATE leads SET territory_id = 'TB-01' WHERE id = 'LEAD-01'");
});

test("runMigrationOnce runs fn only once per key", async () => {
  await initDatabase();
  const key = `test_once_${Date.now()}`;
  let count = 0;
  const fn = async () => {
    count += 1;
  };

  const first = await runMigrationOnce(key, fn);
  assert.equal(first, true);
  assert.equal(count, 1);

  const second = await runMigrationOnce(key, fn);
  assert.equal(second, false);
  assert.equal(count, 1);
});

test("runMigrationOnce does not mark key when fn throws", async () => {
  await initDatabase();
  const key = `test_fail_${Date.now()}`;
  const failingFn = async () => {
    throw new Error("migration failed");
  };

  await assert.rejects(async () => {
    await runMigrationOnce(key, failingFn);
  }, /migration failed/);

  let executed = false;
  const normalFn = async () => {
    executed = true;
  };

  const retry = await runMigrationOnce(key, normalFn);
  assert.equal(retry, true);
  assert.equal(executed, true);
});
