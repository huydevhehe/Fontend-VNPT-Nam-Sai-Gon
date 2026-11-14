import { test } from "node:test";
import assert from "node:assert/strict";

const { initDatabase } = await import("../../database/db.js");
const { SettingsService, DEFAULT_PAYMENT_BENEFICIARY, DEFAULT_PAYMENT_ACCOUNT_NO, DEFAULT_PAYMENT_BANK_NAME, DEFAULT_PAYMENT_SIGNER_NAME } = await import("./settings.service.js");

await initDatabase();

test("SettingsService.getView returns default payment settings when not customized", async () => {
  const view = await SettingsService.getView();
  assert.equal(typeof view.paymentBeneficiary, "string");
  assert.equal(typeof view.paymentAccountNo, "string");
  assert.equal(typeof view.paymentBankName, "string");
  assert.equal(typeof view.paymentSignerName, "string");
  assert.ok(view.paymentBeneficiary.length > 0);
  assert.ok(view.paymentAccountNo.length > 0);
});

test("SettingsService.update updates payment settings and getPaymentConfig reflects them", async () => {
  const custom = {
    paymentBeneficiary: "VNPT TP.HCM - TTKD Nam Sài Gòn",
    paymentAccountNo: "999888777",
    paymentBankName: "BIDV Chi nhánh Nam Sài Gòn",
    paymentSignerName: "Nguyễn Văn Test",
  };

  const updatedView = await SettingsService.update(custom);
  assert.equal(updatedView.paymentBeneficiary, custom.paymentBeneficiary);
  assert.equal(updatedView.paymentAccountNo, custom.paymentAccountNo);
  assert.equal(updatedView.paymentBankName, custom.paymentBankName);
  assert.equal(updatedView.paymentSignerName, custom.paymentSignerName);

  const config = await SettingsService.getPaymentConfig();
  assert.equal(config.paymentBeneficiary, custom.paymentBeneficiary);
  assert.equal(config.paymentAccountNo, custom.paymentAccountNo);
  assert.equal(config.paymentBankName, custom.paymentBankName);
  assert.equal(config.paymentSignerName, custom.paymentSignerName);

  // Restore defaults
  await SettingsService.update({
    paymentBeneficiary: DEFAULT_PAYMENT_BENEFICIARY,
    paymentAccountNo: DEFAULT_PAYMENT_ACCOUNT_NO,
    paymentBankName: DEFAULT_PAYMENT_BANK_NAME,
    paymentSignerName: DEFAULT_PAYMENT_SIGNER_NAME,
  });
});
