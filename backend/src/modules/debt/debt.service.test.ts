import { test } from "node:test";
import assert from "node:assert/strict";

const { initDatabase, run, query } = await import("../../database/db.js");
const { DebtService } = await import("./debt.service.js");

await initDatabase();

async function createTestStaff(suffix: string | number): Promise<string> {
  const name = `AM Debt Test ${suffix}`;
  await run("INSERT INTO staff (id, name, code, role, status) VALUES (?, ?, ?, ?, ?)", [
    `STF-DEBT-TEST-${suffix}`,
    name,
    `NV-DEBT-TEST-${suffix}`,
    "AM",
    "Đang hoạt động",
  ]);
  return name;
}

test("createSingle validates month and amounts", async () => {
  const service = new DebtService();
  const suffix = Date.now();
  const staffName = await createTestStaff(suffix);

  const base = {
    staffName,
    serviceGroup: "BRCĐ",
    paymentCode: `PC-${suffix}`,
    subscriberCode: `SUB-${suffix}`,
    customerName: `Khách hàng nợ lẻ ${suffix}`,
    installationAddress: "123 Đường Test",
    immediateDebt: 1_000_000,
    cumulativeDebt: 500_000,
    month: "2026-10",
  };

  // Tháng sai định dạng
  await assert.rejects(
    () => service.createSingle({ ...base, month: "10/2026" }, "Admin"),
    /tháng/i
  );

  // Số tiền âm
  await assert.rejects(
    () => service.createSingle({ ...base, immediateDebt: -1 }, "Admin"),
    /âm/i
  );
  await assert.rejects(
    () => service.createSingle({ ...base, cumulativeDebt: -1 }, "Admin"),
    /âm/i
  );

  // Nhân viên không tồn tại
  await assert.rejects(
    () => service.createSingle({ ...base, staffName: `Không tồn tại ${suffix}` }, "Admin"),
    /nhân viên/i
  );

  // Hợp lệ
  const created = await service.createSingle(base, "Admin");
  assert.equal(created.staff_name, staffName);
  assert.equal(created.status, "Nợ cước");
  assert.equal(Number(created.immediate_debt), 1_000_000);
  assert.equal(Number(created.cumulative_debt), 500_000);
  assert.equal(created.month, "2026-10");

  const rows = await query<{ id: string }>("SELECT id FROM debts WHERE subscriber_code = ?", [
    base.subscriberCode,
  ]);
  assert.equal(rows.length, 1);
});

test("getAll filters by staff and month", async () => {
  const service = new DebtService();
  const suffix = `${Date.now()}-filter`;
  const staffName = await createTestStaff(suffix);

  await service.createSingle(
    {
      staffName,
      serviceGroup: "BRCĐ",
      paymentCode: `PC-${suffix}`,
      subscriberCode: `SUB-${suffix}`,
      customerName: `KH filter ${suffix}`,
      immediateDebt: 100,
      cumulativeDebt: 0,
      month: "2026-11",
    },
    "Admin"
  );

  const rows = await service.getAll({ staff: staffName, month: "2026-11" });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].staff_name, staffName);

  const otherMonth = await service.getAll({ staff: staffName, month: "2026-01" });
  assert.equal(otherMonth.length, 0);
});
