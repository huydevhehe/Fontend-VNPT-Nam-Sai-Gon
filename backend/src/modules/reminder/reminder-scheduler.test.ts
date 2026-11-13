import { test } from "node:test";
import assert from "node:assert/strict";

const { initDatabase, run } = await import("../../database/db.js");
const { reminderSchedulerTick } = await import("./reminder-scheduler.js");
const { ReminderSettingsService } = await import("./reminder-settings.service.js");

await initDatabase();

test("scheduler tick runs the reminder job only once per day after run_time", async () => {
  await ReminderSettingsService.update({ enabled: true, runTime: "08:00", daysBefore: [30, 7, 1] });
  await run("UPDATE reminder_settings SET last_run_date = NULL WHERE id = 'default'");

  // Giả ngày giờ VN bằng cách build Date UTC tương ứng 07:59 / 08:05 / 08:15 giờ VN (UTC+7).
  const makeVnTime = (hour: number, minute: number): Date => {
    // 2026-11-11 HH:MM giờ VN = (HH-7):MM UTC cùng ngày (HH>=7).
    return new Date(Date.UTC(2026, 10, 11, hour - 7, minute, 0));
  };

  let runCount = 0;
  const runnerModule = await import("./reminder-runner.js");
  const originalRun = runnerModule.ReminderRunner.run;
  runnerModule.ReminderRunner.run = async (...args: Parameters<typeof originalRun>) => {
    runCount += 1;
    return originalRun.apply(runnerModule.ReminderRunner, args);
  };

  try {
    await reminderSchedulerTick(() => makeVnTime(7, 59));
    await reminderSchedulerTick(() => makeVnTime(8, 5));
    await reminderSchedulerTick(() => makeVnTime(8, 15));

    assert.equal(runCount, 1);
  } finally {
    runnerModule.ReminderRunner.run = originalRun;
    await ReminderSettingsService.update({ enabled: false });
  }
});

test("scheduler tick does nothing when disabled", async () => {
  await ReminderSettingsService.update({ enabled: false });
  await run("UPDATE reminder_settings SET last_run_date = NULL WHERE id = 'default'");

  let runCount = 0;
  const runnerModule = await import("./reminder-runner.js");
  const originalRun = runnerModule.ReminderRunner.run;
  runnerModule.ReminderRunner.run = async (...args: Parameters<typeof originalRun>) => {
    runCount += 1;
    return originalRun.apply(runnerModule.ReminderRunner, args);
  };

  try {
    await reminderSchedulerTick(() => new Date());
    assert.equal(runCount, 0);
  } finally {
    runnerModule.ReminderRunner.run = originalRun;
  }
});
