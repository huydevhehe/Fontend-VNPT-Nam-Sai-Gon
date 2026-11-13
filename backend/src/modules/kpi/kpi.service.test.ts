import { test } from "node:test";
import assert from "node:assert/strict";

const { initDatabase, run } = await import("../../database/db.js");
const { KpiService, ghttDeadline } = await import("./kpi.service.js");

await initDatabase();

test("ghttDeadline computes YYYY-MM-05 of month + offset, including December rollover", () => {
  assert.equal(ghttDeadline("2026-12", 1), "2027-01-05");
  assert.equal(ghttDeadline("2026-12", 2), "2027-02-05");
  assert.equal(ghttDeadline("2026-10", 1), "2026-11-05");
});

async function createTestStaff(name: string): Promise<void> {
  await run("INSERT INTO staff (id, name, code, role, status) VALUES (?, ?, ?, ?, ?)", [
    `STF-KPI-${name}`,
    name,
    `NV-KPI-${name}`,
    "AM",
    "Đang hoạt động",
  ]);
}

test("thu ngay completion uses target", async () => {
  const suffix = Date.now();
  const staffName = `AM KPI ThuNgay ${suffix}`;
  await createTestStaff(staffName);

  await run(
    `INSERT INTO debts (id, staff_name, service_group, payment_code, subscriber_code, customer_name, immediate_debt, collected_amount, status, month)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [`DEBT-KPI-${suffix}`, staffName, "BRCĐ", "PC", "SUB", "KH", 100_000_000, 99_000_000, "Nợ cước", "2026-10"]
  );

  const service = new KpiService();
  await service.upsertTargets("2026-10", [{ staffName, kpiKey: "thu_ngay", targetRate: 1.0 }], "Admin");

  const rows = await service.getPerformance("2026-10", { role: "Admin", name: "Admin" });
  const row = rows.find((r) => r.staffName === staffName);
  assert.ok(row, "phải có dòng cho nhân viên test");
  assert.equal(row!.thuNgay.actualRate, 0.99);
  assert.equal(row!.thuNgay.targetRate, 1.0);
  assert.equal(row!.thuNgay.completion, 0.99);
  assert.equal(row!.thuNgay.score, 2.5);
});

test("ghtt counts renewals by expiry month and deadline", async () => {
  const suffix = `${Date.now()}-ghtt`;
  const staffName = `AM KPI Ghtt ${suffix}`;
  await createTestStaff(staffName);

  // 10 gia hạn hết hạn tháng 10/2026: 8 renewed <= 2026-11-05, 1 renewed 2026-11-20, 1 chưa xử lý.
  for (let i = 0; i < 8; i++) {
    await run(
      `INSERT INTO renewals (id, transaction_code, subscriber_code, customer_name, staff_name, cohort, status, expiry_date, renewed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [`RN-KPI-${suffix}-ontime-${i}`, `GD-KPI-${suffix}-ontime-${i}`, `SUB-${i}`, "KH", staffName, "THÁNG T", "Hoàn thành", "2026-10-15", "2026-11-03"]
    );
  }
  await run(
    `INSERT INTO renewals (id, transaction_code, subscriber_code, customer_name, staff_name, cohort, status, expiry_date, renewed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [`RN-KPI-${suffix}-late`, `GD-KPI-${suffix}-late`, `SUB-late`, "KH", staffName, "THÁNG T", "Hoàn thành", "2026-10-20", "2026-11-20"]
  );
  await run(
    `INSERT INTO renewals (id, transaction_code, subscriber_code, customer_name, staff_name, cohort, status, expiry_date, renewed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [`RN-KPI-${suffix}-pending`, `GD-KPI-${suffix}-pending`, `SUB-pending`, "KH", staffName, "THÁNG T", "Chưa xử lý", "2026-10-25", null]
  );

  const service = new KpiService();
  const rows = await service.getPerformance("2026-10", { role: "Admin", name: "Admin" });
  const row = rows.find((r) => r.staffName === staffName);
  assert.ok(row, "phải có dòng cho nhân viên test");

  assert.equal(row!.ghttT.denominator, 10);
  assert.equal(row!.ghttT.numerator, 8);
  assert.equal(row!.ghttT.actualRate, 0.8);
  assert.equal(row!.ghttT.targetRate, 0.8); // mặc định
  assert.equal(row!.ghttT.completion, 1);
  assert.equal(row!.ghttT.score, 5);

  assert.equal(row!.ghttT1.denominator, 10);
  assert.equal(row!.ghttT1.numerator, 9); // thêm dòng "late" (2026-11-20 <= 2026-12-05)
  assert.equal(row!.ghttT1.actualRate, 0.9);
  assert.equal(row!.ghttT1.targetRate, 0.9); // mặc định
  assert.equal(row!.ghttT1.completion, 1);
  assert.equal(row!.ghttT1.score, 5);
});

test("missing thu ngay target gives null score even with data", async () => {
  const suffix = `${Date.now()}-notarget`;
  const staffName = `AM KPI NoTarget ${suffix}`;
  await createTestStaff(staffName);

  await run(
    `INSERT INTO debts (id, staff_name, service_group, payment_code, subscriber_code, customer_name, immediate_debt, collected_amount, status, month)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [`DEBT-KPI-${suffix}`, staffName, "BRCĐ", "PC", "SUB", "KH", 100_000, 90_000, "Nợ cước", "2026-10"]
  );

  const service = new KpiService();
  const rows = await service.getPerformance("2026-10", { role: "Admin", name: "Admin" });
  const row = rows.find((r) => r.staffName === staffName);
  assert.ok(row);
  assert.equal(row!.thuNgay.targetRate, null);
  assert.equal(row!.thuNgay.completion, null);
  assert.equal(row!.thuNgay.score, null);
  // actualRate vẫn tính được vì có dữ liệu (mẫu số > 0)
  assert.equal(row!.thuNgay.actualRate, 0.9);
});

test("zero denominator gives null rate", async () => {
  const suffix = `${Date.now()}-zero`;
  const staffName = `AM KPI Zero ${suffix}`;
  await createTestStaff(staffName);

  const service = new KpiService();
  const rows = await service.getPerformance("2026-10", { role: "Admin", name: "Admin" });
  const row = rows.find((r) => r.staffName === staffName);
  assert.ok(row, "staff đang hoạt động vẫn phải có dòng dù không có dữ liệu");
  assert.equal(row!.thuNgay.denominator, 0);
  assert.equal(row!.thuNgay.actualRate, null);
  assert.equal(row!.thuNgay.score, null);
  assert.equal(row!.ghttT.denominator, 0);
  assert.equal(row!.ghttT.actualRate, null);
});

test("non-admin sees only own row", async () => {
  const suffix = `${Date.now()}-scope`;
  const staffNameA = `AM KPI ScopeA ${suffix}`;
  const staffNameB = `AM KPI ScopeB ${suffix}`;
  await createTestStaff(staffNameA);
  await createTestStaff(staffNameB);

  const service = new KpiService();
  const rows = await service.getPerformance("2026-10", { role: "AM", name: staffNameA });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].staffName, staffNameA);
});

test("upsertTargets validates range and staff existence", async () => {
  const suffix = `${Date.now()}-validate`;
  const staffName = `AM KPI Validate ${suffix}`;
  await createTestStaff(staffName);

  const service = new KpiService();
  await assert.rejects(
    () => service.upsertTargets("2026-10", [{ staffName, kpiKey: "ghtt_t", targetRate: 0 }], "Admin"),
    /chỉ tiêu/i
  );
  await assert.rejects(
    () => service.upsertTargets("2026-10", [{ staffName, kpiKey: "ghtt_t", targetRate: 2.5 }], "Admin"),
    /chỉ tiêu/i
  );
  await assert.rejects(
    () =>
      service.upsertTargets(
        "2026-10",
        [{ staffName: `Không tồn tại ${suffix}`, kpiKey: "ghtt_t", targetRate: 0.9 }],
        "Admin"
      ),
    /nhân viên/i
  );

  const saved = await service.upsertTargets(
    "2026-10",
    [{ staffName, kpiKey: "ghtt_t", targetRate: 0.85 }],
    "Admin"
  );
  assert.equal(saved.length, 1);
  assert.equal(saved[0].targetRate, 0.85);
});
