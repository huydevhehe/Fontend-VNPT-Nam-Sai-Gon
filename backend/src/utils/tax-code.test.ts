import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeTaxCode } from "./tax-code.js";

test("normalizeTaxCode thêm số 0 đầu khi Excel làm mất (9 số -> 10 số)", () => {
  assert.equal(normalizeTaxCode("317424086"), "0317424086");
  assert.equal(normalizeTaxCode(317424086), "0317424086");
});

test("normalizeTaxCode bỏ đuôi .0 do Excel ép kiểu float", () => {
  assert.equal(normalizeTaxCode("1101303612.0"), "1101303612");
});

test("normalizeTaxCode bỏ tab/khoảng trắng đầu cuối", () => {
  assert.equal(normalizeTaxCode("0302802063\t"), "0302802063");
  assert.equal(normalizeTaxCode("  0302802063  "), "0302802063");
});

test("normalizeTaxCode giữ nguyên CCCD cá nhân 12 số", () => {
  assert.equal(normalizeTaxCode("079201012345"), "079201012345");
});

test("normalizeTaxCode giữ nguyên MST dạng chi nhánh có gạch nối", () => {
  assert.equal(normalizeTaxCode("0101234567-001"), "0101234567-001");
});

test("normalizeTaxCode trả rỗng cho null/undefined/chuỗi rỗng", () => {
  assert.equal(normalizeTaxCode(null), "");
  assert.equal(normalizeTaxCode(undefined), "");
  assert.equal(normalizeTaxCode(""), "");
  assert.equal(normalizeTaxCode("   "), "");
});
