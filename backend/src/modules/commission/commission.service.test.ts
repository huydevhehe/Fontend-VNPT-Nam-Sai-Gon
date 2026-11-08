import { test } from "node:test";
import assert from "node:assert/strict";

const { initDatabase, run } = await import("../../database/db.js");
const { CommissionService } = await import("./commission.service.js");

await initDatabase();

test("createForContract rethrows a non-unique constraint violation instead of swallowing it", async () => {
  const suffix = Date.now();
  const ctvId = `USR-CTV-TEST-NULLNAME-${suffix}`;
  // Tạo CTV với name NULL để lần INSERT commissions vi phạm NOT NULL trên
  // recipient_name — một lỗi constraint KHÁC với unique index
  // (contract_id, ctv_id), phải được ném lại, không được coi là "đã tồn tại".
  await run(
    "INSERT INTO users (id, username, password_hash, name, role, email, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [ctvId, `ctv-test-nullname-${suffix}`, "x", null, "CTV", null, "Đang hoạt động"]
  );

  const service = new CommissionService();
  await assert.rejects(() =>
    service.createForContract({
      id: `CTR-TEST-NULLNAME-${suffix}`,
      transaction_code: `GD-TEST-NULLNAME-${suffix}`,
      total_value: 1000000,
      referred_by_ctv_id: ctvId,
    })
  );
});

test("updateAmount updates amount and note, preserving other fields", async () => {
  const service = new CommissionService();
  const id = `HH-TEST-AMOUNT-${Date.now()}`;
  await run(
    `INSERT INTO commissions (id, recipient_name, type, transaction_code, amount, status, date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, "CTV Test", "Hoa hồng CTV", "GD-TEST-1", 100000, "Chờ chi", "2026-11-08"]
  );

  const updated = await (service as any).updateAmount(id, 250000, "Áp dụng mức 25% gói Fiber");
  assert.equal(updated.amount, 250000);
  assert.equal(updated.note, "Áp dụng mức 25% gói Fiber");
  assert.equal(updated.recipientName, "CTV Test");
  assert.equal(updated.status, "Chờ chi");
});

test("updateAmount throws when amount < 0", async () => {
  const service = new CommissionService();
  await assert.rejects(
    () => (service as any).updateAmount("HH-NONEXISTENT", -50000, null),
    /hợp lệ/
  );
});

test("updateAmount throws not found when id does not exist", async () => {
  const service = new CommissionService();
  await assert.rejects(
    () => (service as any).updateAmount("HH-NONEXISTENT-XYZ", 150000, null),
    /Không tìm thấy Hoa hồng/
  );
});
