import { test } from "node:test";
import assert from "node:assert/strict";

const { initDatabase, run } = await import("../../database/db.js");
const { applySchemaExtensions } = await import("../../database/schema-extensions.js");
const { computeStaffRevenue, ZERO_STAFF_REVENUE } = await import("./staff-revenue.service.js");
const { StaffService } = await import("./staff.service.js");
const { HttpError } = await import("../auth/auth.service.js");

await initDatabase();
await applySchemaExtensions();

interface InsertContractOptions {
  id: string;
  staffName: string;
  totalValue: number;
  deploymentStatus?: string;
  signedDate?: string | null;
  createdAt?: string;
}

async function insertContract(opts: InsertContractOptions): Promise<void> {
  await run(
    `INSERT INTO contracts (
      id, transaction_code, customer_name, subscriber_codes, total_value, channel,
      deployment_status, am_staff, signed_date, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      opts.id,
      opts.id,
      "KH Rev Test",
      JSON.stringify(["SUB-1"]),
      opts.totalValue,
      "Trực tiếp",
      opts.deploymentStatus ?? "Chưa triển khai",
      opts.staffName,
      opts.signedDate ?? null,
      opts.createdAt ?? new Date().toISOString(),
    ]
  );
}

interface InsertPaymentOptions {
  id: string;
  contractId: string;
  amount: number;
  paidDate: string;
}

async function insertPayment(opts: InsertPaymentOptions): Promise<void> {
  await run(
    `INSERT INTO contract_payments (id, contract_id, amount, paid_date, created_at) VALUES (?, ?, ?, ?, ?)`,
    [opts.id, opts.contractId, opts.amount, opts.paidDate, new Date().toISOString()]
  );
}

test("closed counts order value by signed month and excludes cancelled", async () => {
  const suffix = Date.now();
  const staffName = `Rev Test Closed ${suffix}`;
  await insertContract({ id: `CT-A-${suffix}`, staffName, totalValue: 10_000_000, signedDate: "2026-10-05" });
  await insertContract({ id: `CT-B-${suffix}`, staffName, totalValue: 5_000_000, signedDate: "2026-10-20" });
  await insertContract({
    id: `CT-C-${suffix}`,
    staffName,
    totalValue: 7_000_000,
    signedDate: "2026-10-12",
    deploymentStatus: "Hủy",
  });
  await insertContract({ id: `CT-D-${suffix}`, staffName, totalValue: 3_000_000, signedDate: "2026-09-15" });

  const map = await computeStaffRevenue("2026-10");
  const rev = map.get(staffName);
  assert.ok(rev, "phải có doanh thu cho nhân viên test");
  assert.equal(rev!.closedMonth, 15_000_000);
  assert.equal(rev!.closedTotal, 18_000_000);
});

test("closedTotal excludes months after selected month", async () => {
  const suffix = Date.now();
  const staffName = `Rev Test Future ${suffix}`;
  await insertContract({ id: `CT-E-${suffix}`, staffName, totalValue: 10_000_000, signedDate: "2026-10-05" });
  await insertContract({ id: `CT-F-${suffix}`, staffName, totalValue: 5_000_000, signedDate: "2026-10-20" });
  // Đơn tháng sau (11) không được cộng vào tổng lũy kế của tháng 10
  await insertContract({ id: `CT-G-${suffix}`, staffName, totalValue: 9_000_000, signedDate: "2026-11-02" });

  const map = await computeStaffRevenue("2026-10");
  const rev = map.get(staffName);
  assert.ok(rev);
  assert.equal(rev!.closedMonth, 15_000_000);
  assert.equal(rev!.closedTotal, 15_000_000);
});

test("collected uses payment dates", async () => {
  const suffix = Date.now();
  const staffName = `Rev Test Collected ${suffix}`;
  const contractId = `CT-PAY-${suffix}`;
  await insertContract({ id: contractId, staffName, totalValue: 20_000_000, signedDate: "2026-10-01" });
  await insertPayment({ id: `PAY-A-${suffix}`, contractId, amount: 2_000_000, paidDate: "2026-10-05" });
  await insertPayment({ id: `PAY-B-${suffix}`, contractId, amount: 1_000_000, paidDate: "2026-09-20" });

  const map = await computeStaffRevenue("2026-10");
  const rev = map.get(staffName);
  assert.ok(rev);
  assert.equal(rev!.collectedMonth, 2_000_000);
  assert.equal(rev!.collectedTotal, 3_000_000);
});

test("order created late night in Vietnam belongs to that month (not shifted by UTC)", async () => {
  const suffix = Date.now();
  const staffName = `Rev Test Timezone ${suffix}`;
  // 2026-10-31T16:30:00Z = 2026-10-31 23:30 giờ VN (UTC+7) — vẫn thuộc tháng 10,
  // không phải tháng 11 nếu tính nhầm theo UTC (ngày sẽ là 31, giờ không đổi tháng ở case
  // này, nhưng kiểm tra để chắc công thức dùng giờ VN, không phải toISOString().slice(0,7)).
  await insertContract({
    id: `CT-TZ-${suffix}`,
    staffName,
    totalValue: 4_000_000,
    signedDate: null,
    createdAt: "2026-10-31T16:30:00Z",
  });

  const map = await computeStaffRevenue("2026-10");
  const rev = map.get(staffName);
  assert.ok(rev, "đơn phải thuộc tháng 10 theo giờ VN");
  assert.equal(rev!.closedMonth, 4_000_000);

  const mapNov = await computeStaffRevenue("2026-11");
  assert.equal(mapNov.get(staffName)?.closedMonth ?? 0, 0);
});

test("staff without orders gets zeros via StaffService.getAll", async () => {
  const staffService = new StaffService();
  const suffix = Date.now();
  const code = `NV-REV-ZERO-${suffix}`;
  const name = `NV Rev Zero ${suffix}`;

  const staff = await staffService.create({
    code,
    name,
    role: "AM",
    territory: "Phường Tân Phong",
    email: `revzero_${suffix}@vnpt.vn`,
    password: "Password@123",
  });

  const list = await staffService.getAll({ month: "2026-10" });
  const found = list.find((s) => s.id === staff.id);
  assert.ok(found, "nhân viên mới tạo phải có trong danh sách");
  assert.deepEqual(found!.revenue, ZERO_STAFF_REVENUE);
});

test("StaffService.getAll attaches revenue computed from orders", async () => {
  const staffService = new StaffService();
  const suffix = Date.now();
  const code = `NV-REV-${suffix}`;
  const name = `NV Doanh Thu ${suffix}`;

  const staff = await staffService.create({
    code,
    name,
    role: "AM",
    territory: "Phường Tân Phong",
    email: `rev_${suffix}@vnpt.vn`,
    password: "Password@123",
  });

  const contractId = `CT-STAFF-${suffix}`;
  await insertContract({ id: contractId, staffName: name, totalValue: 6_000_000, signedDate: "2026-10-10" });
  await insertPayment({ id: `PAY-STAFF-${suffix}`, contractId, amount: 1_500_000, paidDate: "2026-10-12" });

  const list = await staffService.getAll({ month: "2026-10" });
  const found = list.find((s) => s.id === staff.id);
  assert.ok(found);
  assert.equal(found!.revenue.closedMonth, 6_000_000);
  assert.equal(found!.revenue.closedTotal, 6_000_000);
  assert.equal(found!.revenue.collectedMonth, 1_500_000);
  assert.equal(found!.revenue.collectedTotal, 1_500_000);
});

test("getAll rejects bad month format", async () => {
  const staffService = new StaffService();
  await assert.rejects(
    async () => {
      await staffService.getAll({ month: "2026/10" });
    },
    (err: any) => {
      assert.ok(err instanceof HttpError);
      assert.equal(err.status, 400);
      return true;
    }
  );
});
