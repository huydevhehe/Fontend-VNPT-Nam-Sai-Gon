import { test } from "node:test";
import assert from "node:assert/strict";

const { initDatabase, run, query } = await import("../../database/db.js");
const { CustomerService } = await import("./customer.service.js");

await initDatabase();

test("importBatch with mode 'append' creates new customer and updates existing customer", async () => {
  const service = new CustomerService();
  const suffix = Date.now();
  const territoryId = `WARD-TEST-APPEND-${suffix}`;
  const staffName = `AM-Batch-Test-${suffix}`;

  // Chuẩn bị địa bàn và nhân viên
  await run("INSERT INTO territories (id, ward_name) VALUES (?, ?)", [
    territoryId,
    `Phường Test Append ${suffix}`,
  ]);
  await run(
    "INSERT INTO staff (id, name, code, role, status) VALUES (?, ?, ?, ?, ?)",
    [`STF-${suffix}`, staffName, `NV-${suffix}`, "AM Bán chăm", "Đang hoạt động"]
  );

  // Tạo sẵn 1 khách hàng cũ
  const existingId = `KH-EXT-${suffix}`;
  const existingIdCode = `MST-EXT-${suffix}`;
  const existingPhone = `091${String(suffix).slice(-7)}`;
  const newPhone = `098${String(suffix).slice(-7)}`;

  await run(
    `INSERT INTO customers (
      id, name, identity_code, type, customer_group, phone, territory_id, am_caring_staff, handover_batch
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      existingId,
      "Doanh Nghiệp Đã Có",
      existingIdCode,
      "Doanh nghiệp",
      "Tập hiện hữu",
      existingPhone,
      territoryId,
      "AM Cũ",
      "DOT-CU",
    ]
  );

  // Gọi importBatch với 1 khách cũ và 1 khách mới
  const result = await service.importBatch({
    territoryId,
    amCaringStaff: staffName,
    handoverBatch: `DOT-APPEND-${suffix}`,
    mode: "append",
    customers: [
      {
        identityCode: existingIdCode,
        name: "Doanh Nghiệp Đã Có Cập Nhật",
        phone: existingPhone,
      },
      {
        identityCode: `MST-NEW-${suffix}`,
        name: "Doanh Nghiệp Mới Hoàn Toàn",
        phone: newPhone,
        services: "Metronet, Chữ ký số",
      },
    ],
  });

  assert.equal(result.createdCount, 1);
  assert.equal(result.updatedCount, 1);
  assert.equal(result.clearedCount, 0);
  assert.equal(result.totalProcessed, 2);

  // Kiểm tra khách cũ đã được cập nhật am_caring_staff và handover_batch
  const [updatedRow] = await query<any>("SELECT * FROM customers WHERE id = ?", [existingId]);
  assert.equal(updatedRow.am_caring_staff, staffName);
  assert.equal(updatedRow.handover_batch, `DOT-APPEND-${suffix}`);

  // Kiểm tra khách mới được tạo đúng
  const [newRow] = await query<any>("SELECT * FROM customers WHERE identity_code = ?", [
    `MST-NEW-${suffix}`,
  ]);
  assert.ok(newRow);
  assert.equal(newRow.name, "Doanh Nghiệp Mới Hoàn Toàn");
  assert.equal(newRow.customer_group, "Tập hiện hữu");
  assert.equal(newRow.am_caring_staff, staffName);
  assert.equal(newRow.handover_batch, `DOT-APPEND-${suffix}`);
  assert.equal(newRow.territory_id, territoryId);
});

test("importBatch with mode 'replace' clears am_caring_staff of unmentioned customers in same territory only", async () => {
  const service = new CustomerService();
  const suffix = Date.now();
  const terr1 = `WARD-REP-1-${suffix}`;
  const terr2 = `WARD-REP-2-${suffix}`;
  const staffName = `AM-Batch-Rep-${suffix}`;

  await run("INSERT INTO territories (id, ward_name) VALUES (?, ?)", [
    terr1,
    `Phường Rep 1 ${suffix}`,
  ]);
  await run("INSERT INTO territories (id, ward_name) VALUES (?, ?)", [
    terr2,
    `Phường Rep 2 ${suffix}`,
  ]);
  await run(
    "INSERT INTO staff (id, name, code, role, status) VALUES (?, ?, ?, ?, ?)",
    [`STF-REP-${suffix}`, staffName, `NV-REP-${suffix}`, "AM Bán chăm", "Đang hoạt động"]
  );

  // Khách A ở Phường 1 (sẽ bị gỡ vì không có trong batch mới)
  const khA = `KH-A-${suffix}`;
  await run(
    `INSERT INTO customers (id, name, identity_code, type, customer_group, territory_id, am_caring_staff)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [khA, "Khách A Phường 1", `MST-A-${suffix}`, "Doanh nghiệp", "Tập hiện hữu", terr1, "AM Cũ"]
  );

  // Khách B ở Phường 1 (sẽ được giữ và cập nhật vì có trong batch)
  const khB = `KH-B-${suffix}`;
  const khBCode = `MST-B-${suffix}`;
  await run(
    `INSERT INTO customers (id, name, identity_code, type, customer_group, territory_id, am_caring_staff)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [khB, "Khách B Phường 1", khBCode, "Doanh nghiệp", "Tập hiện hữu", terr1, "AM Cũ"]
  );

  // Khách C ở Phường 2 (thuộc địa bàn khác, KHÔNG được bị ảnh hưởng)
  const khC = `KH-C-${suffix}`;
  await run(
    `INSERT INTO customers (id, name, identity_code, type, customer_group, territory_id, am_caring_staff)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [khC, "Khách C Phường 2", `MST-C-${suffix}`, "Doanh nghiệp", "Tập hiện hữu", terr2, "AM Không Đổi"]
  );

  // Chạy replace cho Phường 1 chỉ chứa Khách B
  const result = await service.importBatch({
    territoryId: terr1,
    amCaringStaff: staffName,
    handoverBatch: `DOT-REP-${suffix}`,
    mode: "replace",
    customers: [
      {
        identityCode: khBCode,
        name: "Khách B Phường 1 Cập Nhật",
      },
    ],
  });

  assert.equal(result.updatedCount, 1);
  assert.equal(result.clearedCount, 1); // Khách A bị gỡ

  // Khách A: am_caring_staff bị gỡ về null
  const [rowA] = await query<any>("SELECT am_caring_staff FROM customers WHERE id = ?", [khA]);
  assert.equal(rowA.am_caring_staff, null);

  // Khách B: am_caring_staff được đổi sang staff mới
  const [rowB] = await query<any>("SELECT am_caring_staff, handover_batch FROM customers WHERE id = ?", [khB]);
  assert.equal(rowB.am_caring_staff, staffName);
  assert.equal(rowB.handover_batch, `DOT-REP-${suffix}`);

  // Khách C: ở địa bàn khác, am_caring_staff vẫn nguyên
  const [rowC] = await query<any>("SELECT am_caring_staff FROM customers WHERE id = ?", [khC]);
  assert.equal(rowC.am_caring_staff, "AM Không Đổi");
});

test("importBatch rolls back transaction entirely if any record is invalid", async () => {
  const service = new CustomerService();
  const suffix = Date.now();
  const territoryId = `WARD-ERR-${suffix}`;
  const staffName = `AM-Batch-Err-${suffix}`;

  await run("INSERT INTO territories (id, ward_name) VALUES (?, ?)", [
    territoryId,
    `Phường Err ${suffix}`,
  ]);
  await run(
    "INSERT INTO staff (id, name, code, role, status) VALUES (?, ?, ?, ?, ?)",
    [`STF-ERR-${suffix}`, staffName, `NV-ERR-${suffix}`, "AM Bán chăm", "Đang hoạt động"]
  );

  const newCode = `MST-VALID-BEFORE-ERR-${suffix}`;

  await assert.rejects(
    () =>
      service.importBatch({
        territoryId,
        amCaringStaff: staffName,
        handoverBatch: `DOT-ERR-${suffix}`,
        mode: "append",
        customers: [
          {
            identityCode: newCode,
            name: "Khách Hàng Hợp Lệ 1",
          },
          {
            identityCode: `MST-INVALID-${suffix}`,
            name: "", // Tên rỗng -> sẽ ném CustomerServiceError
          },
        ],
      }),
    /Tên khách hàng không được để trống/
  );

  // Kiểm tra không có bản ghi nào bị ghi dở dang
  const rows = await query<any>("SELECT * FROM customers WHERE identity_code = ?", [newCode]);
  assert.equal(rows.length, 0);
});
