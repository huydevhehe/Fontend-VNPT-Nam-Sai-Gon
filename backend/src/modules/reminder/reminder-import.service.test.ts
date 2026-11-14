import { test } from "node:test";
import assert from "node:assert/strict";
import * as XLSX from "xlsx";

const { initDatabase, query } = await import("../../database/db.js");
const { ReminderImportService } = await import("./reminder-import.service.js");
const { ReminderRunner } = await import("./reminder-runner.js");

await initDatabase();

function buildWorkbookBuffer(rows: Record<string, unknown>[]): Buffer {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

test("import maps chosen columns and parses mixed date formats (serial, dd/mm/yyyy, garbage)", async () => {
  const suffix = `mix-${Date.now()}`;
  const rows = [
    { "Tên": `Mục A ${suffix}`, "Ngày hết hạn": 45962, "Email": "a@example.com" },
    { "Tên": `Mục B ${suffix}`, "Ngày hết hạn": "05/11/2026", "Email": "b@example.com" },
    { "Tên": `Mục C ${suffix}`, "Ngày hết hạn": "rác dữ liệu", "Email": "c@example.com" },
  ];
  const buffer = buildWorkbookBuffer(rows);

  const result = await ReminderImportService.importFile(buffer, "test.xlsx", {
    name: `Batch ${suffix}`,
    daysBefore: [10, 3],
    columns: { expiryDate: "Ngày hết hạn", title: "Tên", recipientEmail: "Email" },
  });

  assert.equal(result.imported, 2);
  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0].message, /Không đọc được ngày/);

  const items = await query<{ expiry_date: string }>(
    "SELECT expiry_date FROM reminder_items WHERE batch_id = ? ORDER BY expiry_date",
    [result.batchId]
  );
  assert.equal(items.length, 2);

  // Dọn đợt vừa tạo: để batch này "enabled" sót lại trong DB test dùng chung
  // sẽ bị collectDue() của test khác (reminder-runner.test.ts) tính nhầm vào
  // nếu sau này có ngày hết hạn khớp mốc nhắc của test đó.
  await ReminderImportService.deleteBatch(result.batchId);
});

test("import reports rows with unreadable dates and does not insert them", async () => {
  const suffix = `bad-${Date.now()}`;
  const rows = [
    { "Ngày": "", "Tên": `Mục ${suffix}` },
  ];
  const buffer = buildWorkbookBuffer(rows);

  const result = await ReminderImportService.importFile(buffer, "bad.xlsx", {
    name: `Batch ${suffix}`,
    daysBefore: [7],
    columns: { expiryDate: "Ngày", title: "Tên" },
  });

  assert.equal(result.imported, 0);
  assert.equal(result.errors.length, 1);

  await ReminderImportService.deleteBatch(result.batchId);
});

test("disabled batch is ignored by collectDue", async () => {
  const suffix = `disabled-${Date.now()}`;
  const rows = [{ "Ngày": "18/11/2026", "Tên": `Mục ${suffix}`, "Email": "x@example.com" }];
  const buffer = buildWorkbookBuffer(rows);

  const result = await ReminderImportService.importFile(buffer, "disable.xlsx", {
    name: `Batch ${suffix}`,
    daysBefore: [7],
    columns: { expiryDate: "Ngày", title: "Tên", recipientEmail: "Email" },
  });

  await ReminderImportService.updateBatch(result.batchId, { enabled: false });

  const dueItems = await ReminderRunner.collectDue("2026-11-11");
  const found = dueItems.find((item) => item.source === "file" && item.customerName === "" && item.title === `Mục ${suffix}`);
  assert.equal(found, undefined);

  await ReminderImportService.deleteBatch(result.batchId);
});

test("delete batch removes its items", async () => {
  const suffix = `delete-${Date.now()}`;
  const rows = [{ "Ngày": "18/11/2026", "Tên": `Mục ${suffix}` }];
  const buffer = buildWorkbookBuffer(rows);

  const result = await ReminderImportService.importFile(buffer, "delete.xlsx", {
    name: `Batch ${suffix}`,
    daysBefore: [7],
    columns: { expiryDate: "Ngày", title: "Tên" },
  });

  await ReminderImportService.deleteBatch(result.batchId);

  const items = await query<{ id: string }>("SELECT id FROM reminder_items WHERE batch_id = ?", [result.batchId]);
  const batches = await query<{ id: string }>("SELECT id FROM reminder_batches WHERE id = ?", [result.batchId]);
  assert.equal(items.length, 0);
  assert.equal(batches.length, 0);
});
