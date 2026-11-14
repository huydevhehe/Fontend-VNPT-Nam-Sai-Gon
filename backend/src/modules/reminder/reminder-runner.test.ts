import { test } from "node:test";
import assert from "node:assert/strict";

const { initDatabase, run, query } = await import("../../database/db.js");
const { findDueDays, ReminderRunner } = await import("./reminder-runner.js");
const { ReminderSettingsService } = await import("./reminder-settings.service.js");

await initDatabase();

// Dọn dữ liệu test của CHÍNH FILE NÀY sau khi toàn bộ test trong file chạy
// xong — nếu không, SVC-TEST-*/STAFF-TEST-* của lần chạy trước (đặc biệt là
// mục tạo ở test cuối cùng) sẽ còn sót lại trong DB test dùng chung và có
// thể bị tính nhầm vào lần chạy sau (vd nếu ngày hết hạn của chúng lại khớp
// mốc nhắc hạn của một test khác).
test.after(async () => {
  await run("DELETE FROM reminder_logs WHERE item_id LIKE 'SVC-TEST-%' OR item_id LIKE 'RMI-TEST-%'");
  await run("DELETE FROM services WHERE id LIKE 'SVC-TEST-%'");
  await run("DELETE FROM staff WHERE id LIKE 'STAFF-TEST-%'");
});

test("findDueDays returns the matching milestone and no catch-up for missed ones", () => {
  assert.equal(findDueDays("2026-11-18", "2026-11-11", [30, 7, 1]), 7);
  assert.equal(findDueDays("2026-11-17", "2026-11-11", [30, 7, 1]), null);
});

async function resetReminderData(): Promise<void> {
  await run("DELETE FROM reminder_logs WHERE item_id LIKE 'SVC-TEST-%' OR item_id LIKE 'RMI-TEST-%'");
  await run("DELETE FROM services WHERE id LIKE 'SVC-TEST-%'");
  await run("DELETE FROM staff WHERE id LIKE 'STAFF-TEST-%'");
}

async function createTestService(
  suffix: string,
  overrides: Partial<{ expirationDate: string; staffName: string; customerName: string }> = {}
): Promise<string> {
  const id = `SVC-TEST-${suffix}`;
  await run(
    `INSERT INTO services (id, customer_name, service_name, service_code, start_date, expiration_date, staff_name)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      overrides.customerName ?? `KH Reminder Test ${suffix}`,
      `Dịch vụ Test ${suffix}`,
      `SUB-TEST-${suffix}`,
      "2026-01-01",
      overrides.expirationDate ?? "2026-11-18",
      overrides.staffName ?? `AM Reminder Test ${suffix}`,
    ]
  );
  return id;
}

async function createTestStaff(suffix: string, email: string | null): Promise<string> {
  const id = `STAFF-TEST-${suffix}`;
  await run(
    `INSERT INTO staff (id, code, name, role, status, email) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, `CODE-TEST-${suffix}`, `AM Reminder Test ${suffix}`, "AM", "Đang hoạt động", email]
  );
  return id;
}

test("run sends once per milestone even if the runner is invoked twice", async () => {
  await resetReminderData();
  const suffix = `once-${Date.now()}`;
  await createTestStaff(suffix, "am-once@example.com");
  const serviceId = await createTestService(suffix, { expirationDate: "2026-11-18" });
  await ReminderSettingsService.update({ notifyStaff: true, notifyCustomer: false, daysBefore: [7], extraCc: "" });

  let sendCount = 0;
  const fakeSend = async () => {
    sendCount += 1;
    return { sent: true };
  };

  await ReminderRunner.run("2026-11-11", { send: fakeSend });
  await ReminderRunner.run("2026-11-11", { send: fakeSend });

  assert.equal(sendCount, 1);
  const logs = await query<{ status: string }>(
    "SELECT status FROM reminder_logs WHERE source = 'service' AND item_id = ?",
    [serviceId]
  );
  assert.equal(logs.filter((l) => l.status === "sent").length, 1);
});

test("run logs skipped_no_recipient when AM has no email, and still sends other items", async () => {
  await resetReminderData();
  const suffixNoEmail = `norecipient-${Date.now()}-a`;
  const suffixWithEmail = `withrecipient-${Date.now()}-b`;
  await createTestStaff(suffixNoEmail, null);
  await createTestStaff(suffixWithEmail, "has-email@example.com");
  const serviceNoEmail = await createTestService(suffixNoEmail, {
    expirationDate: "2026-11-18",
    staffName: `AM Reminder Test ${suffixNoEmail}`,
  });
  const serviceWithEmail = await createTestService(suffixWithEmail, {
    expirationDate: "2026-11-18",
    staffName: `AM Reminder Test ${suffixWithEmail}`,
  });
  await ReminderSettingsService.update({ notifyStaff: true, notifyCustomer: false, daysBefore: [7], extraCc: "" });

  const sentTo: unknown[] = [];
  const fakeSend = async (msg: { to: unknown }) => {
    sentTo.push(msg.to);
    return { sent: true };
  };

  const result = await ReminderRunner.run("2026-11-11", { send: fakeSend });

  const noEmailLog = await query<{ status: string }>(
    "SELECT status FROM reminder_logs WHERE source = 'service' AND item_id = ?",
    [serviceNoEmail]
  );
  const withEmailLog = await query<{ status: string }>(
    "SELECT status FROM reminder_logs WHERE source = 'service' AND item_id = ?",
    [serviceWithEmail]
  );
  assert.equal(noEmailLog[0]?.status, "skipped_no_recipient");
  assert.equal(withEmailLog[0]?.status, "sent");
  assert.equal(result.sent >= 1, true);
  assert.equal(result.skipped >= 1, true);
});

test("run logs skipped_no_smtp when sendMail reports no host configured", async () => {
  await resetReminderData();
  const suffix = `nosmtp-${Date.now()}`;
  await createTestStaff(suffix, "am-nosmtp@example.com");
  const serviceId = await createTestService(suffix, { expirationDate: "2026-11-18" });
  await ReminderSettingsService.update({ notifyStaff: true, notifyCustomer: false, daysBefore: [7], extraCc: "" });

  const fakeSend = async () => ({ sent: false, error: "Chưa cấu hình SMTP" });

  const result = await ReminderRunner.run("2026-11-11", { send: fakeSend });

  const log = await query<{ status: string }>(
    "SELECT status FROM reminder_logs WHERE source = 'service' AND item_id = ?",
    [serviceId]
  );
  assert.equal(log[0]?.status, "skipped_no_smtp");
  assert.equal(result.skipped, 1);
});

test("one failed send does not stop others from being sent", async () => {
  await resetReminderData();
  const suffixFail = `fail-${Date.now()}`;
  const suffixOk = `ok-${Date.now()}`;
  await createTestStaff(suffixFail, "fail@example.com");
  await createTestStaff(suffixOk, "ok@example.com");
  // 'fail' sorts after 'ok' alphabetically by id suffix timing differences are fine since id includes suffix.
  const serviceFail = await createTestService(suffixFail, {
    expirationDate: "2026-11-18",
    staffName: `AM Reminder Test ${suffixFail}`,
  });
  const serviceOk = await createTestService(suffixOk, {
    expirationDate: "2026-11-18",
    staffName: `AM Reminder Test ${suffixOk}`,
  });
  await ReminderSettingsService.update({ notifyStaff: true, notifyCustomer: false, daysBefore: [7], extraCc: "" });

  const fakeSend = async (msg: { to: unknown }) => {
    const recipients = Array.isArray(msg.to) ? msg.to : [msg.to];
    if (recipients.includes("fail@example.com")) {
      throw new Error("Lỗi SMTP giả lập");
    }
    return { sent: true };
  };

  const result = await ReminderRunner.run("2026-11-11", { send: fakeSend });

  const failLog = await query<{ status: string }>(
    "SELECT status FROM reminder_logs WHERE source = 'service' AND item_id = ?",
    [serviceFail]
  );
  const okLog = await query<{ status: string }>(
    "SELECT status FROM reminder_logs WHERE source = 'service' AND item_id = ?",
    [serviceOk]
  );
  assert.equal(failLog[0]?.status, "failed");
  assert.equal(okLog[0]?.status, "sent");
  assert.equal(result.sent, 1);
  assert.equal(result.failed, 1);
});
