import { test } from "node:test";
import assert from "node:assert/strict";

const { initDatabase, run, query } = await import("../../database/db.js");
const { applySchemaExtensions } = await import("../../database/schema-extensions.js");
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
