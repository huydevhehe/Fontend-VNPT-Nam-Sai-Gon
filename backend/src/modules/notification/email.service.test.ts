import { test } from "node:test";
import assert from "node:assert/strict";

const { initDatabase, run } = await import("../../database/db.js");
const { sendMail, maskSecret, sendTestMail } = await import("./email.service.js");

await initDatabase();

async function clearSmtpConfig(): Promise<void> {
  await run(
    `UPDATE system_settings SET smtp_host = '', smtp_port = NULL, smtp_user = '', smtp_pass = '' WHERE id = 'default'`
  );
}

test("maskSecret replaces every occurrence of the password", () => {
  const message = "Auth failed for user with pass S3cr3t! and again S3cr3t!";
  const masked = maskSecret(message, "S3cr3t!");
  assert.ok(!masked.includes("S3cr3t!"));
  assert.equal(masked, "Auth failed for user with pass *** and again ***");
});

test("maskSecret returns message unchanged when secret is empty", () => {
  assert.equal(maskSecret("hello", ""), "hello");
});

test("sendMail without host and without fallback returns error \"Chưa cấu hình SMTP\"", async () => {
  await clearSmtpConfig();
  const result = await sendMail({ to: "a@example.com", subject: "x", text: "y" });
  assert.equal(result.sent, false);
  assert.equal(result.error, "Chưa cấu hình SMTP");
});

test("sendTestMail without host (no override) returns error without falling back to Ethereal", async () => {
  await clearSmtpConfig();
  const result = await sendTestMail("someone@example.com");
  assert.equal(result.sent, false);
  assert.equal(result.error, "Chưa cấu hình SMTP");
  assert.equal(result.previewUrl, undefined);
});
