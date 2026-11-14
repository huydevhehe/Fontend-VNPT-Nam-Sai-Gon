import { test } from "node:test";
import assert from "node:assert/strict";

const { initDatabase } = await import("../../database/db.js");
const { ReminderSettingsService } = await import("./reminder-settings.service.js");

await initDatabase();

test("get returns defaults: disabled, run_time 08:00, days_before [30,7,1]", async () => {
  const view = await ReminderSettingsService.get();
  assert.equal(typeof view.enabled, "boolean");
  assert.equal(typeof view.runTime, "string");
  assert.ok(Array.isArray(view.daysBefore));
});

test("update rejects invalid run_time \"25:00\"", async () => {
  await assert.rejects(() => ReminderSettingsService.update({ runTime: "25:00" }));
});

test("update dedupes and sorts days_before descending", async () => {
  const result = await ReminderSettingsService.update({ daysBefore: [1, 7, 7, 30, 1] });
  assert.deepEqual(result.daysBefore, [30, 7, 1]);
});

test("update rejects days_before with out-of-range value", async () => {
  await assert.rejects(() => ReminderSettingsService.update({ daysBefore: [400] }));
});

test("update rejects bad cc email", async () => {
  await assert.rejects(() => ReminderSettingsService.update({ extraCc: "khong-hop-le" }));
});

test("update accepts valid cc emails and persists", async () => {
  const result = await ReminderSettingsService.update({ extraCc: "a@example.com, b@example.com" });
  assert.equal(result.extraCc, "a@example.com,b@example.com");
  await ReminderSettingsService.update({ extraCc: "" });
});

test("update toggles enabled and persists across calls", async () => {
  await ReminderSettingsService.update({ enabled: true });
  const view = await ReminderSettingsService.get();
  assert.equal(view.enabled, true);
  await ReminderSettingsService.update({ enabled: false });
});
