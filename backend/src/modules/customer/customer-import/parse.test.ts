import { test } from "node:test";
import assert from "node:assert/strict";
import * as XLSX from "xlsx";

import { normalizeHeader, parseCustomerSheet, readWorkbookRows } from "./parse.js";

test("normalizeHeader strips accents, underscores and collapses spaces", () => {
  assert.equal(normalizeHeader("TEN_KH"), "ten kh");
  assert.equal(normalizeHeader("Tên khách hàng"), "ten khach hang");
  assert.equal(normalizeHeader("MA_NHANVIEN - AS"), "ma nhanvien as");
  assert.equal(normalizeHeader("  Mã   số  thuế "), "ma so thue");
});

test("parses VNPT territory export headers", () => {
  const { rows, errors } = parseCustomerSheet([
    {
      MST: 317424086,
      TEN_KH: "CONG TY CO PHAN AI WORLD ACADEMY",
      DIACHI: "98, Phường Tân Mỹ",
      MA_NHANVIEN: "VNPT026736",
      "MA_NHANVIEN - AS": "X",
    },
  ]);

  assert.equal(errors.length, 0);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].taxCode, "0317424086");
  assert.equal(rows[0].hrmCode, "VNPT026736");
  assert.equal(rows[0].name, "CONG TY CO PHAN AI WORLD ACADEMY");
  assert.equal(rows[0].address, "98, Phường Tân Mỹ");
});

test("parses Vietnamese headers from customer sheet", () => {
  const { rows, errors } = parseCustomerSheet([
    {
      "Tên khách hàng": "Công ty TNHH So Mot Soft",
      "Mã số thuế": "0101234567",
      "Loại KH": "Tập hiện hữu",
      Nhóm: "NOVA",
    },
  ]);

  assert.equal(errors.length, 0);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, "Công ty TNHH So Mot Soft");
  assert.equal(rows[0].taxCode, "0101234567");
  assert.equal(rows[0].customerType, "Tập hiện hữu");
  assert.equal(rows[0].teamName, "NOVA");
});

test("readWorkbookRows merges two-row headers", () => {
  const aoa = [
    ["Tên khách hàng", "Thông tin liên hệ", "", "", "Thông tin thanh toán", "", ""],
    ["", "Họ tên", "SĐT", "Email", "Họ tên", "SĐT", "Email"],
    ["Công ty ABC", "Chị Diễm", "0983036755", "diem@example.com", "Anh Khải", "0909000000", "khai@example.com"],
  ];
  const sheet = XLSX.utils.aoa_to_sheet(aoa);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Khách hàng");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  const rawRows = readWorkbookRows(buffer);
  const { rows, errors } = parseCustomerSheet(rawRows);

  assert.equal(errors.length, 0);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, "Công ty ABC");
  assert.equal(rows[0].contactName, "Chị Diễm");
  assert.equal(rows[0].phone, "0983036755");
  assert.equal(rows[0].email, "diem@example.com");
  assert.equal(rows[0].billingName, "Anh Khải");
  assert.equal(rows[0].billingPhone, "0909000000");
  assert.equal(rows[0].billingEmail, "khai@example.com");
});

test("reports missing name and skips empty rows", () => {
  const { rows, errors } = parseCustomerSheet([
    { "Tên khách hàng": "", "Mã số thuế": "0101234567" },
    { "Tên khách hàng": "", "Mã số thuế": "" },
    { "Tên khách hàng": "Công ty Hợp lệ" },
  ]);

  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, "Công ty Hợp lệ");
  assert.equal(errors.length, 1);
  assert.equal(errors[0].message, "Thiếu tên khách hàng");
});
