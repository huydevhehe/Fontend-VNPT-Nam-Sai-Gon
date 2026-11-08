import { test } from "node:test";
import assert from "node:assert/strict";
import { maskPhone } from "./ctv.service.js";

test("maskPhone giữ 4 số đầu + 2 số cuối với số 10 chữ số", () => {
  assert.equal(maskPhone("0909123456"), "0909****56");
});

test("maskPhone với 11 chữ số (quốc tế) giữ 4 đầu + 2 cuối, giữa toàn *", () => {
  assert.equal(maskPhone("09091234567"), "0909*****67");
});

test("maskPhone bỏ ký tự không phải số trước khi che (dấu cách, gạch ngang)", () => {
  assert.equal(maskPhone("0909 123 456"), "0909****56");
  assert.equal(maskPhone("0909-123-456"), "0909****56");
});

test("maskPhone với dưới 9 chữ số che hết trừ 2 số cuối", () => {
  assert.equal(maskPhone("12345678"), "******78");
  assert.equal(maskPhone("1234"), "**34");
});

test("maskPhone với rỗng/null trả rỗng", () => {
  assert.equal(maskPhone(""), "");
  assert.equal(maskPhone(null), "");
  assert.equal(maskPhone(undefined), "");
});
