import { test } from "node:test";
import assert from "node:assert/strict";

const { initDatabase, run, query } = await import("../../database/db.js");
const { applySchemaExtensions } = await import("../../database/schema-extensions.js");
const { RANDOM_STAFF_TOKEN } = await import("../../constants/org.js");
const { LeadService, LeadServiceError } = await import("./lead.service.js");

await initDatabase();

test("create accepts new lead group names", async () => {
  const service = new LeadService();
  const suffix = Date.now();
  const result = await service.create({
    customerName: `KH Lead Test ${suffix}`,
    phone: `090${String(suffix).slice(-7)}`,
    group: "Lead bán chéo DV",
    channel: "Online",
    staffName: "Nguyễn Thị Tình",
    expectedValue: 1000000,
  });

  assert.equal(result.group, "Lead bán chéo DV");
});

test("create rejects old lead group names", async () => {
  const service = new LeadService();
  const suffix = Date.now();

  await assert.rejects(
    async () => {
      await service.create({
        customerName: `KH Lead Old ${suffix}`,
        phone: `090${String(suffix).slice(-7)}`,
        group: "Khách hàng mới",
        channel: "Online",
        staffName: "Nguyễn Thị Tình",
        expectedValue: 1000000,
      });
    },
    (err: any) => {
      assert.ok(err instanceof LeadServiceError);
      assert.equal(err.message, "Nhóm cơ hội không hợp lệ");
      return true;
    }
  );
});

test("lead_group_rename_v1 migrates existing rows", async () => {
  const suffix = Date.now();
  const testLeadId = `LEAD-MIGRATE-${suffix}`;

  await run(
    `INSERT INTO leads (id, customer_name, phone, group_name, channel, staff_name, status, expected_value)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [testLeadId, `KH Test Migrate ${suffix}`, `091${String(suffix).slice(-7)}`, "Gia hạn dịch vụ", "Online", "Nguyễn Thị Tình", "Mới tiếp nhận", 0]
  );

  await run("DELETE FROM schema_migrations_state WHERE key = 'lead_group_rename_v1'");

  await applySchemaExtensions();

  const rows = await query<{ group_name: string }>("SELECT group_name FROM leads WHERE id = ?", [testLeadId]);
  assert.equal(rows[0]?.group_name, "Lead gia hạn");
});

test("create without expectedValue stores 0", async () => {
  const service = new LeadService();
  const suffix = Date.now();
  const lead = await service.create({
    customerName: `KH Không Giá Trị ${suffix}`,
    phone: `090${String(suffix).slice(-7)}`,
    group: "Lead KH mới",
    channel: "Online",
    staffName: "Nguyễn Thị Tình",
  });

  assert.equal(lead.expectedValue, 0);
});

test("create with RANDOM_STAFF_TOKEN picks an active AM", async () => {
  const suffix = Date.now();
  const amName1 = `AM Active A ${suffix}`;
  const amName2 = `AM Active B ${suffix}`;

  await run(
    "INSERT INTO staff (id, name, code, role, status) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)",
    [
      `STF-ACT-1-${suffix}`, amName1, `CODE-ACT-1-${suffix}`, "AM", "Đang hoạt động",
      `STF-ACT-2-${suffix}`, amName2, `CODE-ACT-2-${suffix}`, "AM", "Đang hoạt động",
    ]
  );

  const service = new LeadService({ random: () => 0 });
  const lead = await service.create({
    customerName: `KH Random Test ${suffix}`,
    phone: `090${String(suffix).slice(-7)}`,
    group: "Lead KH mới",
    channel: "Online",
    staffName: RANDOM_STAFF_TOKEN,
  });

  const activeAmRows = await query<{ name: string }>(
    "SELECT name FROM staff WHERE status = 'Đang hoạt động' AND role IN ('AM', 'AM Bán chăm') ORDER BY name"
  );
  assert.equal(lead.staffName, activeAmRows[0].name);
});

test("create with RANDOM_STAFF_TOKEN never picks inactive staff", async () => {
  const suffix = Date.now();
  const inactiveStaffName = `AM Inactive ${suffix}`;

  await run(
    "INSERT INTO staff (id, name, code, role, status) VALUES (?, ?, ?, ?, ?)",
    [`STF-INACT-${suffix}`, inactiveStaffName, `CODE-INACT-${suffix}`, "AM", "Nghỉ việc"]
  );

  const service = new LeadService();
  const lead = await service.create({
    customerName: `KH Inactive Test ${suffix}`,
    phone: `090${String(suffix).slice(-7)}`,
    group: "Lead KH mới",
    channel: "Online",
    staffName: RANDOM_STAFF_TOKEN,
  });

  assert.notEqual(lead.staffName, inactiveStaffName);
});

test("create rejects unknown staffName", async () => {
  const service = new LeadService();
  const suffix = Date.now();

  await assert.rejects(
    async () => {
      await service.create({
        customerName: `KH Unknown Staff ${suffix}`,
        phone: `090${String(suffix).slice(-7)}`,
        group: "Lead KH mới",
        channel: "Online",
        staffName: "Tên Nhân Viên Hoàn Toàn Không Tồn Tại 999",
      });
    },
    (err: any) => {
      assert.ok(err instanceof LeadServiceError);
      assert.equal(err.message, "Nhân viên không tồn tại");
      assert.equal(err.status, 400);
      return true;
    }
  );
});
