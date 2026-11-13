import test from "node:test";
import assert from "node:assert/strict";
import { initDatabase, query, run } from "../../database/db.js";
import { applySchemaExtensions, backfillRelations } from "../../database/schema-extensions.js";
import { ContractService } from "./contract.service.js";

await initDatabase();
await applySchemaExtensions();

const service = new ContractService();

async function resetTestData() {
  await run("DELETE FROM contracts");
  await run("DELETE FROM leads");
  await run("DELETE FROM staff");
  await run("DELETE FROM customers");
}

test("create copies AM from lead when amStaff is missing", async () => {
  await resetTestData();
  await run(
    "INSERT INTO staff (id, code, name, role, territory, status) VALUES (?, ?, ?, ?, ?, ?)",
    ["S-1", "NV001", "Nguyễn Văn AM", "AM", "Phường 1", "ACTIVE"]
  );
  await run(
    "INSERT INTO leads (id, customer_name, phone, group_name, channel, staff_name) VALUES (?, ?, ?, ?, ?, ?)",
    ["L-1", "Khách Hàng A", "0901234567", "Khách hàng cá nhân", "Trực tiếp", "Nguyễn Văn AM"]
  );

  const order = await service.create({
    transactionCode: "GD-001",
    customerName: "Khách Hàng A",
    subscriberCodes: ["TB01"],
    totalValue: 5000000,
    channel: "Trực tiếp",
    leadId: "L-1",
    serviceGroup: "BRCĐ",
    paymentMethod: "Trả trước",
  });

  assert.equal(order.amStaff, "Nguyễn Văn AM");
  assert.equal(order.serviceGroup, "BRCĐ");
  assert.equal(order.paymentMethod, "Trả trước");
});

test("create rejects unknown serviceGroup", async () => {
  await resetTestData();
  await assert.rejects(
    async () => {
      await service.create({
        transactionCode: "GD-002",
        customerName: "Khách Hàng B",
        subscriberCodes: ["TB02"],
        totalValue: 1000000,
        channel: "Trực tiếp",
        serviceGroup: "InvalidGroup" as any,
      });
    },
    { message: "Nhóm dịch vụ không hợp lệ" }
  );
});

test("create rejects unknown paymentMethod", async () => {
  await resetTestData();
  await assert.rejects(
    async () => {
      await service.create({
        transactionCode: "GD-003",
        customerName: "Khách Hàng C",
        subscriberCodes: ["TB03"],
        totalValue: 1000000,
        channel: "Trực tiếp",
        serviceGroup: "BRCĐ",
        paymentMethod: "InvalidMethod" as any,
      });
    },
    { message: "Hình thức thanh toán không hợp lệ" }
  );
});

test("create fills taxCode from customer if customerId provided and taxCode empty", async () => {
  await resetTestData();
  await run(
    "INSERT INTO customers (id, name, identity_code, type, customer_group) VALUES (?, ?, ?, ?, ?)",
    ["C-1", "Công Ty ABC", "0319653211", "Doanh nghiệp", "KHDN"]
  );

  const order = await service.create({
    transactionCode: "GD-004",
    customerName: "Công Ty ABC",
    subscriberCodes: ["TB04"],
    totalValue: 2000000,
    channel: "Trực tiếp",
    customerId: "C-1",
    serviceGroup: "CNTT",
    paymentMethod: "Trả trước",
  });

  assert.equal(order.customerId, "C-1");
  assert.equal(order.taxCode, "0319653211");
});

test("updateInfo by other AM returns 403 forbidden", async () => {
  await resetTestData();
  await run(
    "INSERT INTO staff (id, code, name, role, territory, status) VALUES (?, ?, ?, ?, ?, ?)",
    ["S-1", "NV001", "AM Khoa", "AM", "Phường 1", "ACTIVE"]
  );
  await run(
    "INSERT INTO staff (id, code, name, role, territory, status) VALUES (?, ?, ?, ?, ?, ?)",
    ["S-2", "NV002", "AM Tuấn", "AM", "Phường 2", "ACTIVE"]
  );

  const order = await service.create({
    transactionCode: "GD-005",
    customerName: "Khách Hàng D",
    subscriberCodes: ["TB05"],
    totalValue: 3000000,
    channel: "Trực tiếp",
    amStaff: "AM Khoa",
    serviceGroup: "Di động",
    paymentMethod: "Trả hàng tháng",
  });

  await assert.rejects(
    async () => {
      await service.updateInfo(
        order.id,
        { packageName: "Gói Mới" },
        { role: "staff", name: "AM Tuấn" }
      );
    },
    { message: "Không có quyền chỉnh sửa đơn hàng này" }
  );
});

test("updateInfo by admin changes package and method", async () => {
  await resetTestData();
  await run(
    "INSERT INTO staff (id, code, name, role, territory, status) VALUES (?, ?, ?, ?, ?, ?)",
    ["S-1", "NV001", "AM Khoa", "AM", "Phường 1", "ACTIVE"]
  );

  const order = await service.create({
    transactionCode: "GD-006",
    customerName: "Khách Hàng E",
    subscriberCodes: ["TB06"],
    totalValue: 3000000,
    channel: "Trực tiếp",
    amStaff: "AM Khoa",
    serviceGroup: "Di động",
    paymentMethod: "Trả hàng tháng",
  });

  const updated = await service.updateInfo(
    order.id,
    {
      packageName: "Gói Doanh Nghiệp VIP",
      paymentMethod: "Trả trước",
      contractNumber: "20261023/0319653211/VNPT.NSG/VNPT026696",
    },
    { role: "admin", name: "Admin" }
  );

  assert.equal(updated.packageName, "Gói Doanh Nghiệp VIP");
  assert.equal(updated.paymentMethod, "Trả trước");
  assert.equal(updated.contractNumber, "20261023/0319653211/VNPT.NSG/VNPT026696");
});

test("backfill sets am_staff from lead for contracts having lead_id but am_staff null", async () => {
  await resetTestData();
  await run(
    "INSERT INTO staff (id, code, name, role, territory, status) VALUES (?, ?, ?, ?, ?, ?)",
    ["S-1", "NV001", "AM Lan", "AM", "Phường 1", "ACTIVE"]
  );
  await run(
    "INSERT INTO leads (id, customer_name, phone, group_name, channel, staff_name) VALUES (?, ?, ?, ?, ?, ?)",
    ["L-2", "Khách Hàng F", "0901234568", "Khách hàng cá nhân", "Trực tiếp", "AM Lan"]
  );

  const id = "HD-BACKFILL-1";
  await run(
    `INSERT INTO contracts (
      id, transaction_code, customer_name, subscriber_codes, total_value, channel,
      deployment_status, payment_status, document_status, has_revenue, lead_id, am_staff
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      "GD-BF-1",
      "Khách Hàng F",
      JSON.stringify(["TB-BF"]),
      1000000,
      "Trực tiếp",
      "Chưa triển khai",
      "Chưa thanh toán",
      "Soạn thảo",
      0,
      "L-2",
      null,
    ]
  );

  await run("DELETE FROM schema_migrations_state WHERE key = 'contracts_am_staff_backfill_v1'");
  await backfillRelations();

  const rows = await query<{ am_staff: string }>("SELECT am_staff FROM contracts WHERE id = ?", [id]);
  assert.equal(rows[0].am_staff, "AM Lan");
});
