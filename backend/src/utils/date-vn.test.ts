import { test } from "node:test";
import assert from "node:assert/strict";
import { todayVn, currentMonthVn } from "./date-vn.js";

test("todayVn converts UTC evening to next day in Vietnam", () => {
  assert.equal(todayVn(new Date("2026-11-10T18:30:00Z")), "2026-11-11");
  assert.equal(currentMonthVn(new Date("2026-11-30T17:30:00Z")), "2026-12");
});
