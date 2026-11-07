import { test } from "node:test";
import assert from "node:assert/strict";
import os from "os";
import path from "path";
import fs from "fs";

const isPostgres = process.env.DB_DRIVER === "postgres";
if (!isPostgres) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "vnpt-schema-ext-"));
  process.env.SQLITE_PATH = path.join(tmpDir, "test.sqlite");
}

const { initDatabase, query, run } = await import("./db.js");

async function columnExists(table: string, column: string): Promise<boolean> {
  if (isPostgres) {
    const rows = await query(
      "SELECT 1 AS ok FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = ? AND column_name = ?",
      [table, column]
    );
    return rows.length > 0;
  }
  const rows = await query<{ name: string }>(`PRAGMA table_info(${table})`);
  return rows.some((r) => r.name === column);
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

  const idx = isPostgres
    ? await query("SELECT 1 AS ok FROM pg_indexes WHERE indexname = ?", ["ux_users_referral_code"])
    : await query("SELECT 1 AS ok FROM sqlite_master WHERE type = 'index' AND name = ?", ["ux_users_referral_code"]);
  assert.equal(idx.length, 1, "unique index ux_users_referral_code should exist");
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
