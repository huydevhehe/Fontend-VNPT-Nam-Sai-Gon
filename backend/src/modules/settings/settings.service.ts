import { query, run } from "../../database/db.js";
import { config } from "../../config/index.js";

const SETTINGS_ID = "default";

export const DEFAULT_PAYMENT_BENEFICIARY = "VNPT thành phố Hồ Chí Minh";
export const DEFAULT_PAYMENT_ACCOUNT_NO = "1058561111";
export const DEFAULT_PAYMENT_BANK_NAME = "TMCP Ngoại Thương Việt Nam – CN TP.HCM. (VietcomBank)";
export const DEFAULT_PAYMENT_SIGNER_NAME = "Lê Văn Thuần";

interface SettingsRow {
  id: string;
  smtp_host: string;
  smtp_port: number | null;
  smtp_user: string;
  smtp_pass: string;
  zalo_oa_id: string;
  zalo_oa_token: string;
  payment_beneficiary?: string | null;
  payment_account_no?: string | null;
  payment_bank_name?: string | null;
  payment_signer_name?: string | null;
}

export interface EffectiveSmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

export interface EffectiveZaloConfig {
  oaId: string;
  oaToken: string;
}

export interface PaymentSettingsConfig {
  paymentBeneficiary: string;
  paymentAccountNo: string;
  paymentBankName: string;
  paymentSignerName: string;
}

export interface SettingsView {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassSet: boolean;
  zaloOaId: string;
  zaloOaTokenSet: boolean;
  paymentBeneficiary: string;
  paymentAccountNo: string;
  paymentBankName: string;
  paymentSignerName: string;
}

async function getRow(): Promise<SettingsRow> {
  const rows = await query<SettingsRow>("SELECT * FROM system_settings WHERE id = ?", [SETTINGS_ID]);
  if (rows[0]) {
    return rows[0];
  }
  await run(
    "INSERT INTO system_settings (id, smtp_host, smtp_port, smtp_user, smtp_pass, zalo_oa_id, zalo_oa_token, payment_beneficiary, payment_account_no, payment_bank_name, payment_signer_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      SETTINGS_ID,
      "",
      null,
      "",
      "",
      "",
      "",
      DEFAULT_PAYMENT_BENEFICIARY,
      DEFAULT_PAYMENT_ACCOUNT_NO,
      DEFAULT_PAYMENT_BANK_NAME,
      DEFAULT_PAYMENT_SIGNER_NAME,
    ]
  );
  return {
    id: SETTINGS_ID,
    smtp_host: "",
    smtp_port: null,
    smtp_user: "",
    smtp_pass: "",
    zalo_oa_id: "",
    zalo_oa_token: "",
    payment_beneficiary: DEFAULT_PAYMENT_BENEFICIARY,
    payment_account_no: DEFAULT_PAYMENT_ACCOUNT_NO,
    payment_bank_name: DEFAULT_PAYMENT_BANK_NAME,
    payment_signer_name: DEFAULT_PAYMENT_SIGNER_NAME,
  };
}

export const SettingsService = {
  // Giá trị hiển thị cho CMS — KHÔNG trả plaintext mật khẩu/token, chỉ báo đã set hay chưa.
  async getView(): Promise<SettingsView> {
    const row = await getRow();
    return {
      smtpHost: row.smtp_host || "",
      smtpPort: row.smtp_port || config.smtp.port,
      smtpUser: row.smtp_user || "",
      smtpPassSet: Boolean(row.smtp_pass),
      zaloOaId: row.zalo_oa_id || "",
      zaloOaTokenSet: Boolean(row.zalo_oa_token),
      paymentBeneficiary: row.payment_beneficiary ?? DEFAULT_PAYMENT_BENEFICIARY,
      paymentAccountNo: row.payment_account_no ?? DEFAULT_PAYMENT_ACCOUNT_NO,
      paymentBankName: row.payment_bank_name ?? DEFAULT_PAYMENT_BANK_NAME,
      paymentSignerName: row.payment_signer_name ?? DEFAULT_PAYMENT_SIGNER_NAME,
    };
  },

  // Cập nhật: field mật khẩu/token chỉ ghi đè khi FE gửi giá trị non-empty,
  // để trống nghĩa là "giữ nguyên giá trị cũ" (không hiện lại plaintext trên FE).
  async update(input: {
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
    zaloOaId?: string;
    zaloOaToken?: string;
    paymentBeneficiary?: string;
    paymentAccountNo?: string;
    paymentBankName?: string;
    paymentSignerName?: string;
  }): Promise<SettingsView> {
    const row = await getRow();

    const next = {
      smtp_host: input.smtpHost ?? row.smtp_host,
      smtp_port: input.smtpPort ?? row.smtp_port,
      smtp_user: input.smtpUser ?? row.smtp_user,
      smtp_pass: input.smtpPass ? input.smtpPass : row.smtp_pass,
      zalo_oa_id: input.zaloOaId ?? row.zalo_oa_id,
      zalo_oa_token: input.zaloOaToken ? input.zaloOaToken : row.zalo_oa_token,
      payment_beneficiary: input.paymentBeneficiary !== undefined ? input.paymentBeneficiary : (row.payment_beneficiary ?? DEFAULT_PAYMENT_BENEFICIARY),
      payment_account_no: input.paymentAccountNo !== undefined ? input.paymentAccountNo : (row.payment_account_no ?? DEFAULT_PAYMENT_ACCOUNT_NO),
      payment_bank_name: input.paymentBankName !== undefined ? input.paymentBankName : (row.payment_bank_name ?? DEFAULT_PAYMENT_BANK_NAME),
      payment_signer_name: input.paymentSignerName !== undefined ? input.paymentSignerName : (row.payment_signer_name ?? DEFAULT_PAYMENT_SIGNER_NAME),
    };

    await run(
      "UPDATE system_settings SET smtp_host = ?, smtp_port = ?, smtp_user = ?, smtp_pass = ?, zalo_oa_id = ?, zalo_oa_token = ?, payment_beneficiary = ?, payment_account_no = ?, payment_bank_name = ?, payment_signer_name = ? WHERE id = ?",
      [
        next.smtp_host,
        next.smtp_port,
        next.smtp_user,
        next.smtp_pass,
        next.zalo_oa_id,
        next.zalo_oa_token,
        next.payment_beneficiary,
        next.payment_account_no,
        next.payment_bank_name,
        next.payment_signer_name,
        SETTINGS_ID,
      ]
    );

    return SettingsService.getView();
  },

  async getPaymentConfig(): Promise<PaymentSettingsConfig> {
    const row = await getRow();
    return {
      paymentBeneficiary: row.payment_beneficiary ?? DEFAULT_PAYMENT_BENEFICIARY,
      paymentAccountNo: row.payment_account_no ?? DEFAULT_PAYMENT_ACCOUNT_NO,
      paymentBankName: row.payment_bank_name ?? DEFAULT_PAYMENT_BANK_NAME,
      paymentSignerName: row.payment_signer_name ?? DEFAULT_PAYMENT_SIGNER_NAME,
    };
  },

  // Dùng bởi email.service / zalo.service: giá trị trong DB (nếu admin đã nhập qua CMS)
  // được ưu tiên hơn biến môi trường; rỗng thì rơi về .env như cũ.
  async getEffectiveSmtp(): Promise<EffectiveSmtpConfig> {
    const row = await getRow();
    return {
      host: row.smtp_host || config.smtp.host,
      port: row.smtp_port || config.smtp.port,
      user: row.smtp_user || config.smtp.user,
      pass: row.smtp_pass || config.smtp.pass,
    };
  },

  async getEffectiveZalo(): Promise<EffectiveZaloConfig> {
    const row = await getRow();
    return {
      oaId: row.zalo_oa_id || config.zalo.oaId,
      oaToken: row.zalo_oa_token || config.zalo.oaToken,
    };
  },
};
