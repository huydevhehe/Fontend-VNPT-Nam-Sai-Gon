import { test } from "node:test";
import assert from "node:assert/strict";

const { initDatabase, run, query } = await import("../../database/db.js");
const { RenewalService } = await import("./renewal.service.js");
const { parseExcelDate } = await import("../../utils/excel-date.js");
const { todayVn } = await import("../../utils/date-vn.js");

await initDatabase();

test("parseExcelDate handles serial numbers, dd/mm/yyyy, yyyy-mm-dd and garbage", () => {
  assert.equal(parseExcelDate(45962), "2025-11-01");
  assert.equal(parseExcelDate("05/11/2026"), "2026-11-05");
  assert.equal(parseExcelDate("2026-11-05"), "2026-11-05");
  assert.equal(parseExcelDate("rác"), null);
  assert.equal(parseExcelDate(""), null);
  assert.equal(parseExcelDate(undefined), null);
  assert.equal(parseExcelDate(null), null);
  assert.equal(parseExcelDate("32/13/2026"), null);
});

async function createTestRenewal(suffix: string | number, overrides: Partial<{
  status: string;
  expiryDate: string | null;
  renewedAt: string | null;
}> = {}): Promise<string> {
  const id = `RN-TEST-${suffix}`;
  await run(
    `INSERT INTO renewals (
      id, transaction_code, subscriber_code, customer_name, payment_code,
      installation_address, staff_name, term_amount, duration_months,
      cohort, status, expiry_date, renewed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      `GD-TEST-${suffix}`,
      `SUB-TEST-${suffix}`,
      `KH Renewal Test ${suffix}`,
      `PC-TEST-${suffix}`,
      "Địa chỉ test",
      "AM Renewal Test",
      100000,
      12,
      "THÁNG T",
      overrides.status ?? "Chưa xử lý",
      overrides.expiryDate ?? null,
      overrides.renewedAt ?? null,
    ]
  );
  return id;
}

test("updateStatus to Hoàn thành sets renewed_at to today when it was NULL", async () => {
  const service = new RenewalService();
  const suffix = Date.now();
  const id = await createTestRenewal(suffix, { status: "Chưa xử lý", renewedAt: null });

  await service.updateStatus(id, "Hoàn thành", undefined, "Admin");

  const rows = await query<{ renewed_at: string | null }>("SELECT renewed_at FROM renewals WHERE id = ?", [id]);
  assert.equal(rows[0].renewed_at, todayVn());
});

test("updateStatus away from Hoàn thành clears renewed_at", async () => {
  const service = new RenewalService();
  const suffix = `${Date.now()}-clear`;
  const id = await createTestRenewal(suffix, { status: "Hoàn thành", renewedAt: "2026-10-05" });

  await service.updateStatus(id, "Chưa xử lý", undefined, "Admin");

  const rows = await query<{ renewed_at: string | null }>("SELECT renewed_at FROM renewals WHERE id = ?", [id]);
  assert.equal(rows[0].renewed_at, null);
});

test("updateStatus keeps renewed_at untouched when staying outside Hoàn thành", async () => {
  const service = new RenewalService();
  const suffix = `${Date.now()}-noop`;
  const id = await createTestRenewal(suffix, { status: "Chưa xử lý", renewedAt: null });

  await service.updateStatus(id, "Khách hẹn thanh toán", undefined, "Admin");

  const rows = await query<{ renewed_at: string | null }>("SELECT renewed_at FROM renewals WHERE id = ?", [id]);
  assert.equal(rows[0].renewed_at, null);
});

test("importExcel reads expiry date column with accented/unaccented aliases", async () => {
  const XLSX = await import("xlsx");
  const service = new RenewalService();
  const suffix = Date.now();

  const rows = [
    {
      "TÊN NHÂN VIÊN CHĂM": "AM Import Expiry Test",
      "MA_THANH TOÁN": `PC-EXP-${suffix}`,
      "MA_THUÊ BAO": `SUB-EXP-${suffix}`,
      "TEN_THUÊ BAO": `KH Expiry ${suffix}`,
      "MÃ GIAO DỊCH": `GD-EXP-${suffix}`,
      "THÁNG T": 100000,
      "NGAY HET HAN": "05/11/2026",
    },
  ];
  const sheet = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "GIA HẠN");
  const buffer = XLSX.write(wb, { type: "buffer" }) as Buffer;

  await service.importExcel(buffer, "THÁNG T", "Admin");

  const created = await query<{ expiry_date: string | null }>(
    "SELECT expiry_date FROM renewals WHERE transaction_code = ?",
    [`GD-EXP-${suffix}`]
  );
  assert.equal(created.length, 1);
  assert.equal(created[0].expiry_date, "2026-11-05");
});

test("Admin updateDates sets expiry and renewed dates manually", async () => {
  const service = new RenewalService();
  const suffix = `${Date.now()}-dates`;
  const id = await createTestRenewal(suffix);

  const updated = await service.updateDates(id, { expiryDate: "2026-12-31", renewedAt: "2027-01-03" });
  assert.equal(updated.expiry_date, "2026-12-31");
  assert.equal(updated.renewed_at, "2027-01-03");

  const cleared = await service.updateDates(id, { expiryDate: null, renewedAt: null });
  assert.equal(cleared.expiry_date, null);
  assert.equal(cleared.renewed_at, null);

  await assert.rejects(() => service.updateDates(id, { expiryDate: "31/12/2026" }), /ngày/i);
});
