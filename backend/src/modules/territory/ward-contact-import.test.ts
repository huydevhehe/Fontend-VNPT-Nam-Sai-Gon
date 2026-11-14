import { test } from "node:test";
import assert from "node:assert/strict";

const { parseWardContactRows } = await import("./ward-contact-import.js");
const { initDatabase, query } = await import("../../database/db.js");
const { TerritoryService } = await import("./territory.service.js");

await initDatabase();

test("parseWardContactRows maps sheet headers and skips blank rows", () => {
  const rows = [
    {
      "Tên Phường": "Cầu Ông Lãnh",
      "Đơn vị": "Trạm Y tế",
      "Phòng ban": "Hành chính nhân sự",
      "Họ tên": "",
      "Chức": "Trưởng phòng",
    },
    { STT: 2 },
    {},
  ];

  const { items, skipped } = parseWardContactRows(rows);

  assert.equal(items.length, 1);
  assert.equal(skipped, 2);
  assert.deepEqual(items[0], {
    rowNumber: 2,
    wardName: "Cầu Ông Lãnh",
    unit: "Trạm Y tế",
    department: "Hành chính nhân sự",
    fullName: "",
    position: "Trưởng phòng",
    phone: "",
    amInCharge: "",
  });
});

test("parseWardContactRows matches headers regardless of case/diacritics and accepts 'Chức vụ'", () => {
  const rows = [
    {
      "TÊN PHƯỜNG": "Hiệp Phước",
      "đơn vị": "UBND",
      "PHÒNG BAN": "Hành chính",
      "họ Tên": "Nguyễn Văn A",
      "Chức vụ": "Chủ tịch",
      "sđt": "0909000111",
      "AM Phụ Trách": "AM Test",
    },
  ];

  const { items, skipped } = parseWardContactRows(rows);

  assert.equal(skipped, 0);
  assert.equal(items.length, 1);
  assert.equal(items[0].wardName, "Hiệp Phước");
  assert.equal(items[0].position, "Chủ tịch");
  assert.equal(items[0].phone, "0909000111");
  assert.equal(items[0].amInCharge, "AM Test");
});

test("parseWardContactRows skips rows with ward name but no unit and no position", () => {
  const rows = [{ "Tên Phường": "Cầu Ông Lãnh", "Họ tên": "Chỉ có tên" }];
  const { items, skipped } = parseWardContactRows(rows);
  assert.equal(items.length, 0);
  assert.equal(skipped, 1);
});

test("importWardContacts matches ward by normalized name", async () => {
  const service = new TerritoryService();
  const suffix = Date.now();
  const territory = await service.createTerritory({ wardName: `Cầu Ông Lãnh Test ${suffix}` });

  const result = await service.importWardContacts(
    [
      {
        rowNumber: 2,
        wardName: `  phuong cau ong lanh test ${suffix}  `,
        unit: "UBND",
        department: "Hành chính",
        fullName: "",
        position: "Chủ tịch",
        phone: "",
        amInCharge: "",
      },
    ],
    { autoCreateWards: false },
    "Admin"
  );

  assert.equal(result.errors.length, 0);
  assert.equal(result.created, 1);
  assert.equal(result.duplicates, 0);

  const contacts = await query<any>("SELECT * FROM ward_contacts WHERE territory_id = ?", [territory.id]);
  assert.equal(contacts.length, 1);
  assert.equal(contacts[0].position, "Chủ tịch");
});

test("importWardContacts reports unknown ward when autoCreate off", async () => {
  const service = new TerritoryService();
  const suffix = Date.now();

  const result = await service.importWardContacts(
    [
      {
        rowNumber: 5,
        wardName: `Phường Không Tồn Tại ${suffix}`,
        unit: "UBND",
        department: "Hành chính",
        fullName: "",
        position: "Chủ tịch",
        phone: "",
        amInCharge: "",
      },
    ],
    { autoCreateWards: false },
    "Admin"
  );

  assert.equal(result.created, 0);
  assert.equal(result.errors.length, 1);
  assert.equal(result.errors[0].rowNumber, 5);
  assert.equal(result.createdWards.length, 0);
});

test("importWardContacts creates ward when autoCreate on", async () => {
  const service = new TerritoryService();
  const suffix = Date.now();
  const wardName = `Phường Tự Tạo ${suffix}`;

  const result = await service.importWardContacts(
    [
      {
        rowNumber: 3,
        wardName,
        unit: "UBND",
        department: "Hành chính",
        fullName: "",
        position: "Chủ tịch",
        phone: "",
        amInCharge: "",
      },
    ],
    { autoCreateWards: true },
    "Admin"
  );

  assert.equal(result.errors.length, 0);
  assert.equal(result.created, 1);
  assert.equal(result.createdWards.length, 1);
  assert.equal(result.createdWards[0], wardName);

  const territories = await query<any>("SELECT * FROM territories WHERE ward_name = ?", [wardName]);
  assert.equal(territories.length, 1);
});

test("importWardContacts is idempotent when run twice", async () => {
  const service = new TerritoryService();
  const suffix = Date.now();
  const wardName = `Phường Import Lại ${suffix}`;

  const items = [
    {
      rowNumber: 2,
      wardName,
      unit: "UBND",
      department: "Hành chính",
      fullName: "Nguyễn Văn A",
      position: "Chủ tịch",
      phone: "0909000111",
      amInCharge: "",
    },
    {
      rowNumber: 3,
      wardName,
      unit: "Trạm Y tế",
      department: "Khám bệnh",
      fullName: "",
      position: "Trưởng trạm",
      phone: "",
      amInCharge: "",
    },
  ];

  const first = await service.importWardContacts(items, { autoCreateWards: true }, "Admin");
  assert.equal(first.created, 2);
  assert.equal(first.duplicates, 0);

  const second = await service.importWardContacts(items, { autoCreateWards: true }, "Admin");
  assert.equal(second.created, 0);
  assert.equal(second.duplicates, 2);

  const territories = await query<any>("SELECT * FROM territories WHERE ward_name = ?", [wardName]);
  assert.equal(territories.length, 1);
  const contacts = await query<any>("SELECT * FROM ward_contacts WHERE territory_id = ?", [territories[0].id]);
  assert.equal(contacts.length, 2);
});

test("importWardContacts skips row with missing required fields and reports error", async () => {
  const service = new TerritoryService();
  const suffix = Date.now();
  const wardName = `Phường Thiếu Trường ${suffix}`;

  const result = await service.importWardContacts(
    [
      {
        rowNumber: 2,
        wardName,
        unit: "",
        department: "",
        fullName: "",
        position: "",
        phone: "",
        amInCharge: "",
      },
    ],
    { autoCreateWards: true },
    "Admin"
  );

  assert.equal(result.created, 0);
  assert.equal(result.errors.length, 1);
  assert.equal(result.errors[0].rowNumber, 2);
});
