import { test } from "node:test";
import assert from "node:assert/strict";
import { numberToVietnameseWords } from "./vn-number-words.js";

test("numberToVietnameseWords converts amounts according to spec", () => {
  // Required spec cases
  assert.equal(
    numberToVietnameseWords(5940000),
    "Năm triệu, chín trăm bốn mươi nghìn đồng"
  );
  assert.equal(numberToVietnameseWords(0), "Không đồng");
  assert.equal(numberToVietnameseWords(105), "Một trăm linh năm đồng");
  assert.equal(numberToVietnameseWords(15000), "Mười lăm nghìn đồng");
  assert.equal(numberToVietnameseWords(21000), "Hai mươi mốt nghìn đồng");
  assert.equal(
    numberToVietnameseWords(1005000),
    "Một triệu, không trăm linh năm nghìn đồng"
  );
  assert.equal(numberToVietnameseWords(1000000000), "Một tỷ đồng");
  assert.equal(
    numberToVietnameseWords(2500000000),
    "Hai tỷ, năm trăm triệu đồng"
  );
  assert.equal(numberToVietnameseWords(11000), "Mười một nghìn đồng");
  assert.equal(numberToVietnameseWords(24000), "Hai mươi tư nghìn đồng");
  assert.equal(numberToVietnameseWords(25000), "Hai mươi lăm nghìn đồng");
});

test("numberToVietnameseWords rounds decimal values to nearest dong", () => {
  assert.equal(numberToVietnameseWords(104.6), "Một trăm linh năm đồng");
  assert.equal(numberToVietnameseWords(105.4), "Một trăm linh năm đồng");
});

test("numberToVietnameseWords throws on negative, NaN, and invalid values", () => {
  assert.throws(() => numberToVietnameseWords(-1), /hợp lệ|invalid/i);
  assert.throws(() => numberToVietnameseWords(-50000), /hợp lệ|invalid/i);
  assert.throws(() => numberToVietnameseWords(NaN), /hợp lệ|invalid/i);
  assert.throws(() => numberToVietnameseWords(Infinity), /hợp lệ|invalid/i);
  assert.throws(() => numberToVietnameseWords(-Infinity), /hợp lệ|invalid/i);
});
