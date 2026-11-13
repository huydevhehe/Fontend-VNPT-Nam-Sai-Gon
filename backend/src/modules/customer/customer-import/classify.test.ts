import { test } from "node:test";
import assert from "node:assert/strict";

import { classifyRows, type ExistingCustomer } from "./classify.js";
import type { ImportRow } from "./parse.js";

function makeRow(overrides: Partial<ImportRow>): ImportRow {
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
  };
}

function makeExisting(overrides: Partial<ExistingCustomer>): ExistingCustomer {
  return {
    id: "KH-1",
    name: "",
    identity_code: null,
    customer_code: null,
    phone: null,
    billing_phone: null,
    contact_email: null,
    billing_email: null,
    customer_group: "Tập hiện hữu",
    am_caring_staff: null,
    territory_id: null,
    ...overrides,
  };
}

test("marks row duplicate by tax code and lists matched field MST/CCCD", () => {
  const existing = [makeExisting({ id: "KH-1", name: "Công ty A", identity_code: "0317424086" })];
  const row = makeRow({ rowNumber: 2, name: "Công ty A Mới", taxCode: "0317424086" });

  const [classified] = classifyRows([row], existing, new Map(), null);

  assert.equal(classified.status, "duplicate");
  assert.equal(classified.matches.length, 1);
  assert.equal(classified.matches[0].customerId, "KH-1");
  assert.deepEqual(classified.matches[0].matchedFields, ["MST/CCCD"]);
});

test("marks duplicate by normalized name", () => {
  const existing = [makeExisting({ id: "KH-2", name: "CÔNG TY TNHH SO MOT SOFT" })];
  const row = makeRow({ rowNumber: 2, name: "Công ty TNHH So Mot Soft" });

  const [classified] = classifyRows([row], existing, new Map(), null);

  assert.equal(classified.status, "duplicate");
  assert.equal(classified.matches[0].customerId, "KH-2");
  assert.deepEqual(classified.matches[0].matchedFields, ["Tên"]);
});

test("marks duplicate by phone across phone and billing_phone", () => {
  const existing = [makeExisting({ id: "KH-3", name: "Công ty B", billing_phone: "0983036755" })];
  const row = makeRow({ rowNumber: 2, name: "Công ty B Mới", phone: "0983036755" });

  const [classified] = classifyRows([row], existing, new Map(), null);

  assert.equal(classified.status, "duplicate");
  assert.deepEqual(classified.matches[0].matchedFields, ["SĐT"]);
});

test("empty values never match", () => {
  const existing = [makeExisting({ id: "KH-4", name: "Công ty C" })];
  const row = makeRow({ rowNumber: 2, name: "Công ty D" });

  const [classified] = classifyRows([row], existing, new Map(), null);

  assert.equal(classified.status, "new");
  assert.equal(classified.matches.length, 0);
});

test("flags ptmConflict when existing customer is Tự phát triển", () => {
  const existing = [
    makeExisting({ id: "KH-5", name: "Công ty PTM", identity_code: "0101234567", customer_group: "Tự phát triển" }),
  ];
  const row = makeRow({ rowNumber: 2, name: "Công ty PTM Mới", taxCode: "0101234567" });

  const [classified] = classifyRows([row], existing, new Map(), null);

  assert.equal(classified.status, "duplicate");
  assert.equal(classified.ptmConflict, true);
});

test("detects duplicate inside the same file with matchedRowNumber", () => {
  const rowA = makeRow({ rowNumber: 2, name: "Công ty E", taxCode: "0309999999" });
  const rowB = makeRow({ rowNumber: 3, name: "Công ty E Lặp", taxCode: "0309999999" });

  const [classifiedA, classifiedB] = classifyRows([rowA, rowB], [], new Map(), null);

  assert.equal(classifiedA.status, "duplicate");
  assert.equal(classifiedA.matches[0].matchedRowNumber, 3);
  assert.equal(classifiedB.status, "duplicate");
  assert.equal(classifiedB.matches[0].matchedRowNumber, 2);
});

test("four companies sharing contact phone are all duplicates", () => {
  const rows = [2, 3, 4, 5].map((n) =>
    makeRow({ rowNumber: n, name: `Công ty ${n}`, billingPhone: "0983036755" })
  );

  const classified = classifyRows(rows, [], new Map(), null);

  assert.equal(classified.length, 4);
  for (const c of classified) {
    assert.equal(c.status, "duplicate", `dòng ${c.row.rowNumber} phải là duplicate`);
  }
});

test("resolves staff from hrm code else default staff else null with note", () => {
  const staffByHrm = new Map([["VNPT026736", "Nguyễn Văn A"]]);

  const [matched] = classifyRows(
    [makeRow({ rowNumber: 2, name: "Công ty F", hrmCode: "VNPT026736" })],
    [],
    staffByHrm,
    "Nguyễn Thị Tình"
  );
  assert.equal(matched.resolvedStaffName, "Nguyễn Văn A");
  assert.equal(matched.notes.length, 0);

  const [fallbackDefault] = classifyRows(
    [makeRow({ rowNumber: 2, name: "Công ty G", hrmCode: "VNPT_UNKNOWN" })],
    [],
    staffByHrm,
    "Nguyễn Thị Tình"
  );
  assert.equal(fallbackDefault.resolvedStaffName, "Nguyễn Thị Tình");

  const [noStaff] = classifyRows(
    [makeRow({ rowNumber: 2, name: "Công ty H", hrmCode: "VNPT_UNKNOWN" })],
    [],
    staffByHrm,
    null
  );
  assert.equal(noStaff.resolvedStaffName, null);
  assert.ok(noStaff.notes.length > 0);
});

test("classifies 5000 rows against 5000 customers under 1 second", () => {
  const rows: ImportRow[] = [];
  for (let i = 0; i < 5000; i++) {
    rows.push(
      makeRow({
        rowNumber: i + 2,
        name: `Công ty Hiệu Năng ${i}`,
        taxCode: `01${String(i).padStart(8, "0")}`,
      })
    );
  }
  const existing: ExistingCustomer[] = [];
  for (let i = 0; i < 5000; i++) {
    existing.push(
      makeExisting({
        id: `KH-PERF-${i}`,
        name: `Công ty Cũ ${i}`,
        identity_code: `99${String(i).padStart(8, "0")}`,
      })
    );
  }

  const start = performance.now();
  const classified = classifyRows(rows, existing, new Map(), null);
  const elapsed = performance.now() - start;

  assert.equal(classified.length, 5000);
  assert.ok(elapsed < 1000, `Chạy mất ${elapsed}ms, phải dưới 1000ms`);
});
