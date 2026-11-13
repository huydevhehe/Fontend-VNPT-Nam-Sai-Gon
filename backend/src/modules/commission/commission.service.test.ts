import { test } from "node:test";
import assert from "node:assert/strict";

const { initDatabase, query, run } = await import("../../database/db.js");
const { CommissionService } = await import("./commission.service.js");
const { ContractService } = await import("../contract/contract.service.js");

await initDatabase();

const contractService = new ContractService();

/** Tạo một CTV (role CTV) trực tiếp trong DB, trả về id. */
async function createTestCtv(suffix: string | number): Promise<{ id: string; name: string }> {
  const id = `USR-CTV-TEST-${suffix}`;
  const name = `CTV Test ${suffix}`;
  await run(
    "INSERT INTO users (id, username, password_hash, name, role, email, status, referral_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [id, `ctv-test-${suffix}`, "x", name, "CTV", null, "Đang hoạt động", `REF-${suffix}`]
  );
  return { id, name };
}

/** Tạo một đơn hàng (contracts) trực tiếp trong DB, trả về id. */
async function createTestContract(input: {
  id: string;
  transactionCode: string;
  customerName: string;
  totalValue: number;
  referredByCtvId?: string | null;
  amStaff?: string | null;
}): Promise<void> {
  await run(
    `INSERT INTO contracts (
      id, transaction_code, customer_name, subscriber_codes, total_value, channel,
      referred_by_ctv_id, am_staff, collected_amount
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.id,
      input.transactionCode,
      input.customerName,
      JSON.stringify(["TB-TEST"]),
      input.totalValue,
      "Trực tiếp",
      input.referredByCtvId ?? null,
      input.amStaff ?? null,
      0,
    ]
  );
}

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

test("getAll exposes referrer and customer paid from linked order", async () => {
  const suffix = Date.now();
  const ctv = await createTestCtv(`LINKED-${suffix}`);
  const contractId = `CTR-LINKED-${suffix}`;
  await createTestContract({
    id: contractId,
    transactionCode: `GD-LINKED-${suffix}`,
    customerName: `Khách Linked ${suffix}`,
    totalValue: 5000000,
    referredByCtvId: ctv.id,
  });

  await contractService.addPayment(contractId, { amount: 3000000 }, "Admin Test");

  const service = new CommissionService();
  const created = await service.createForContract({
    id: contractId,
    transaction_code: `GD-LINKED-${suffix}`,
    total_value: 5000000,
    referred_by_ctv_id: ctv.id,
  });
  assert.ok(created);

  const all = await service.getAll();
  const row = all.find((c) => c.id === created!.id);
  assert.ok(row, "Không tìm thấy dòng hoa hồng vừa tạo");
  assert.equal(row!.referrerName, ctv.name);
  assert.equal(row!.referrerCode, `REF-LINKED-${suffix}`);
  assert.equal(row!.customerName, `Khách Linked ${suffix}`);
  assert.equal(row!.customerPaid, 3000000);
  assert.equal(row!.customerPaidAuto, 3000000);
  assert.equal(row!.customerPaidOverride, null);
});

test("getAll falls back to transaction_code when contract_id is null", async () => {
  const suffix = Date.now();
  const contractId = `CTR-FALLBACK-${suffix}`;
  const txCode = `GD-FALLBACK-${suffix}`;
  await createTestContract({
    id: contractId,
    transactionCode: txCode,
    customerName: `Khách Fallback ${suffix}`,
    totalValue: 2000000,
    amStaff: null,
  });
  await contractService.addPayment(contractId, { amount: 2000000 }, "Admin Test");

  const comId = `HH-FALLBACK-${suffix}`;
  await run(
    `INSERT INTO commissions (id, recipient_name, type, transaction_code, amount, status, date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [comId, "Nguyễn Thị Tình", "Hoa hồng nội bộ", txCode, 400000, "Chờ chi", "2026-11-10"]
  );
  await run("UPDATE contracts SET am_staff = ? WHERE id = ?", ["Nguyễn Thị Tình", contractId]);

  const service = new CommissionService();
  const all = await service.getAll();
  const row = all.find((c) => c.id === comId);
  assert.ok(row, "Không tìm thấy dòng hoa hồng (fallback theo transaction_code)");
  assert.equal(row!.customerName, `Khách Fallback ${suffix}`);
  assert.equal(row!.customerPaid, 2000000);
  assert.equal(row!.referrerName, "Nguyễn Thị Tình");
});

test("getAll returns null customerPaid when no order matches", async () => {
  const suffix = Date.now();
  const comId = `HH-NOORDER-${suffix}`;
  await run(
    `INSERT INTO commissions (id, recipient_name, type, transaction_code, amount, status, date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [comId, "Đại lý Không Rõ", "Hoa hồng chi kênh", `GD-NOORDER-${suffix}`, 100000, "Chờ chi", "2026-11-10"]
  );

  const service = new CommissionService();
  const all = await service.getAll();
  const row = all.find((c) => c.id === comId);
  assert.ok(row, "Không tìm thấy dòng hoa hồng không gắn đơn hàng");
  assert.equal(row!.customerName, null);
  assert.equal(row!.customerPaidAuto, null);
  assert.equal(row!.customerPaid, null);
  // Hoa hồng chi kênh không có CTV -> người giới thiệu lấy recipient_name.
  assert.equal(row!.referrerName, "Đại lý Không Rõ");
});

test("customerPaid follows new payments until overridden", async () => {
  const suffix = Date.now();
  const ctv = await createTestCtv(`OVERRIDE-${suffix}`);
  const contractId = `CTR-OVERRIDE-${suffix}`;
  await createTestContract({
    id: contractId,
    transactionCode: `GD-OVERRIDE-${suffix}`,
    customerName: `Khách Override ${suffix}`,
    totalValue: 5000000,
    referredByCtvId: ctv.id,
  });

  const service = new CommissionService();
  const created = await service.createForContract({
    id: contractId,
    transaction_code: `GD-OVERRIDE-${suffix}`,
    total_value: 5000000,
    referred_by_ctv_id: ctv.id,
  });
  assert.ok(created);

  await contractService.addPayment(contractId, { amount: 1000000 }, "Admin Test");
  let all = await service.getAll();
  let row = all.find((c) => c.id === created!.id);
  assert.equal(row!.customerPaid, 1000000);

  // Admin ghi đè "khách đã chi" = 1 000 000.
  await run("UPDATE commissions SET customer_paid_override = ? WHERE id = ?", [1000000, created!.id]);

  await contractService.addPayment(contractId, { amount: 2000000 }, "Admin Test");
  all = await service.getAll();
  row = all.find((c) => c.id === created!.id);
  assert.equal(row!.customerPaidAuto, 3000000);
  assert.equal(row!.customerPaid, 1000000);
});
