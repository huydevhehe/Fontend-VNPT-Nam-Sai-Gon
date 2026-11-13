import { test } from "node:test";
import assert from "node:assert/strict";

const { initDatabase, query } = await import("../../../database/db.js");
const { CustomerImportService } = await import("./customer-import.service.js");
const { CustomerService } = await import("../customer.service.js");

await initDatabase();

const importService = new CustomerImportService();
const customerService = new CustomerService();

function makeRow(overrides: Partial<Record<string, string | number>> = {}) {
  return {
    rowNumber: 2,
    name: "",
    taxCode: "",
    customerCode: "",
    customerType: "",
    phone: "",
    email: "",
    address: "",
    hrmCode: "",
    staffNameInFile: "",
    contactName: "",
    billingName: "",
    billingPhone: "",
    billingEmail: "",
    teamName: "",
    salesChannel: "",
    note: "",
    ...overrides,
  } as any;
}

test("create inserts KH địa bàn with territory and staff", async () => {
  const suffix = Date.now();
  const row = makeRow({
    name: `Công ty Commit Create ${suffix}`,
    taxCode: `317${String(suffix).slice(-6)}`, // 9 chữ số -> normalizeTaxCode thêm số 0 đầu
  });

  const result = await importService.commit(
    {
      territoryId: null,
      handoverBatch: `DOT-TEST-${suffix}`,
      decisions: [{ row, action: "create", staffName: "Nguyễn Thị Tình" }],
    },
    "Admin Test"
  );

  assert.equal(result.created, 1);
  assert.equal(result.errors.length, 0);

  const rows = await query<any>("SELECT * FROM customers WHERE name = ?", [row.name]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].customer_group, "Tập hiện hữu");
  assert.equal(rows[0].am_caring_staff, "Nguyễn Thị Tình");
  assert.equal(rows[0].identity_code, `0317${String(suffix).slice(-6)}`);
});

test("normalizes tax code before insert", async () => {
  const suffix = Date.now();
  const digits = `110${String(suffix).slice(-6)}`; // 9 chữ số, không trùng giữa các lần chạy
  const row = makeRow({
    name: `Công ty Commit MST ${suffix}`,
    taxCode: `${digits}.0`, // dạng lỗi Excel
  });

  await importService.commit(
    { territoryId: null, decisions: [{ row, action: "create" }] },
    "Admin Test"
  );

  const rows = await query<any>("SELECT identity_code FROM customers WHERE name = ?", [row.name]);
  assert.equal(rows[0].identity_code, `0${digits}`);
});

test("keep_old leaves existing untouched", async () => {
  const suffix = Date.now();
  const created = await customerService.create({
    name: `Công ty Commit KeepOld ${suffix}`,
    type: "Doanh nghiệp",
    customerGroup: "Tập hiện hữu",
    phone: `0909${String(suffix).slice(-6)}`,
  });

  const row = makeRow({ name: "TÊN KHÁC HOÀN TOÀN", phone: created.customer.phone });

  const result = await importService.commit(
    {
      territoryId: null,
      decisions: [{ row, action: "keep_old", targetCustomerId: created.customer.id }],
    },
    "Admin Test"
  );

  assert.equal(result.kept, 1);
  assert.equal(result.updated, 0);

  const rows = await query<any>("SELECT * FROM customers WHERE id = ?", [created.customer.id]);
  assert.equal(rows[0].name, created.customer.name);
});

test("use_new overwrites only non-empty fields", async () => {
  const suffix = Date.now();
  const created = await customerService.create({
    name: `Công ty Commit UseNew ${suffix}`,
    type: "Doanh nghiệp",
    customerGroup: "Tập hiện hữu",
    phone: `0908${String(suffix).slice(-6)}`,
    address: "Địa chỉ cũ giữ nguyên",
  });

  const row = makeRow({
    name: `Công ty Commit UseNew Mới ${suffix}`,
    phone: created.customer.phone,
    address: "", // rỗng -> không được xóa địa chỉ cũ
    note: "Ghi chú mới từ file import",
  });

  const result = await importService.commit(
    {
      territoryId: null,
      decisions: [
        { row, action: "use_new", targetCustomerId: created.customer.id, staffName: "Nguyễn Thị Tình" },
      ],
    },
    "Admin Test"
  );

  assert.equal(result.updated, 1);
  assert.equal(result.errors.length, 0);

  const rows = await query<any>("SELECT * FROM customers WHERE id = ?", [created.customer.id]);
  assert.equal(rows[0].name, row.name);
  assert.equal(rows[0].address, "Địa chỉ cũ giữ nguyên");
  assert.equal(rows[0].note, "Ghi chú mới từ file import");
  assert.equal(rows[0].am_caring_staff, "Nguyễn Thị Tình");
});

test("use_new on PTM customer requires customerGroup, sets PTM địa bàn when chosen", async () => {
  const suffix = Date.now();
  const created = await customerService.create({
    name: `Công ty Commit PTM ${suffix}`,
    type: "Doanh nghiệp",
    customerGroup: "Tự phát triển",
    phone: `0907${String(suffix).slice(-6)}`,
  });

  const row = makeRow({ name: `Công ty Commit PTM Mới ${suffix}`, phone: created.customer.phone });

  const missingGroupResult = await importService.commit(
    {
      territoryId: null,
      decisions: [{ row, action: "use_new", targetCustomerId: created.customer.id }],
    },
    "Admin Test"
  );
  assert.equal(missingGroupResult.updated, 0);
  assert.equal(missingGroupResult.errors.length, 1);

  const withGroupResult = await importService.commit(
    {
      territoryId: null,
      decisions: [
        {
          row,
          action: "use_new",
          targetCustomerId: created.customer.id,
          customerGroup: "PTM địa bàn",
        },
      ],
    },
    "Admin Test"
  );
  assert.equal(withGroupResult.updated, 1);

  const rows = await query<any>("SELECT customer_group FROM customers WHERE id = ?", [created.customer.id]);
  assert.equal(rows[0].customer_group, "PTM địa bàn");
});

test("create fails for row that became duplicate after preview", async () => {
  const suffix = Date.now();
  const taxCode = `030${String(suffix).slice(-6)}`;

  // Giả lập: khách cùng MST vừa được tạo bởi người khác giữa preview và commit.
  await customerService.create({
    name: `Công ty Vừa Được Tạo ${suffix}`,
    type: "Doanh nghiệp",
    customerGroup: "Tập hiện hữu",
    identityCode: taxCode,
  });

  const row = makeRow({ name: `Công ty Import Trễ ${suffix}`, taxCode });

  const result = await importService.commit(
    { territoryId: null, decisions: [{ row, action: "create" }] },
    "Admin Test"
  );

  assert.equal(result.created, 0);
  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0].message, /trùng/);
});
