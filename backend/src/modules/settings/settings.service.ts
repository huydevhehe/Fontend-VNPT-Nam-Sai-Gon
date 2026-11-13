import { query, run } from "../../database/db.js";
import { config } from "../../config/index.js";

const SETTINGS_ID = "default";

export const DEFAULT_PAYMENT_BENEFICIARY = "VNPT thành phố Hồ Chí Minh";
export const DEFAULT_PAYMENT_ACCOUNT_NO = "1058561111";
export const DEFAULT_PAYMENT_BANK_NAME = "TMCP Ngoại Thương Việt Nam – CN TP.HCM. (VietcomBank)";
export const DEFAULT_PAYMENT_SIGNER_NAME = "Lê Văn Thuần";
export const DEFAULT_SMTP_FROM_NAME = "VNPT Nam Sài Gòn";

export const SMTP_MODES = ["normal", "domain"] as const;
export type SmtpMode = (typeof SMTP_MODES)[number];

interface SettingsRow {
  id: string;
  smtp_host: string;
  smtp_port: number | null;
  smtp_user: string;
  smtp_pass: string;
  smtp_mode: string | null;
  smtp_from_name: string | null;
  smtp_from_email: string | null;
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
  fromName: string;
  fromEmail: string;
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
  smtpMode: SmtpMode;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassSet: boolean;
  smtpFromName: string;
  smtpFromEmail: string;
  zaloOaId: string;
  zaloOaTokenSet: boolean;
  paymentBeneficiary: string;
  paymentAccountNo: string;
  paymentBankName: string;
  paymentSignerName: string;
}

function isSmtpMode(value: unknown): value is SmtpMode {
  return typeof value === "string" && (SMTP_MODES as readonly string[]).includes(value);
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
    smtp_mode: "domain",
    smtp_from_name: DEFAULT_SMTP_FROM_NAME,
    smtp_from_email: "",
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
      smtpMode: isSmtpMode(row.smtp_mode) ? row.smtp_mode : "domain",
      smtpHost: row.smtp_host || "",
      smtpPort: row.smtp_port || config.smtp.port,
      smtpUser: row.smtp_user || "",
      smtpPassSet: Boolean(row.smtp_pass),
      smtpFromName: row.smtp_from_name ?? DEFAULT_SMTP_FROM_NAME,
      smtpFromEmail: row.smtp_from_email ?? "",
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
    smtpMode?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
    smtpFromName?: string;
    smtpFromEmail?: string;
    zaloOaId?: string;
    zaloOaToken?: string;
    paymentBeneficiary?: string;
    paymentAccountNo?: string;
    paymentBankName?: string;
    paymentSignerName?: string;
  }): Promise<SettingsView> {
    const row = await getRow();

    if (input.smtpMode !== undefined && !isSmtpMode(input.smtpMode)) {
      throw new Error(`smtpMode không hợp lệ, phải là một trong: ${SMTP_MODES.join(", ")}`);
    }

    const next = {
      smtp_mode: input.smtpMode ?? (isSmtpMode(row.smtp_mode) ? row.smtp_mode : "domain"),
      smtp_host: input.smtpHost ?? row.smtp_host,
      smtp_port: input.smtpPort ?? row.smtp_port,
      smtp_user: input.smtpUser ?? row.smtp_user,
      smtp_pass: input.smtpPass ? input.smtpPass : row.smtp_pass,
      smtp_from_name: input.smtpFromName !== undefined ? input.smtpFromName : (row.smtp_from_name ?? DEFAULT_SMTP_FROM_NAME),
      smtp_from_email: input.smtpFromEmail !== undefined ? input.smtpFromEmail : (row.smtp_from_email ?? ""),
      zalo_oa_id: input.zaloOaId ?? row.zalo_oa_id,
      zalo_oa_token: input.zaloOaToken ? input.zaloOaToken : row.zalo_oa_token,
      payment_beneficiary: input.paymentBeneficiary !== undefined ? input.paymentBeneficiary : (row.payment_beneficiary ?? DEFAULT_PAYMENT_BENEFICIARY),
      payment_account_no: input.paymentAccountNo !== undefined ? input.paymentAccountNo : (row.payment_account_no ?? DEFAULT_PAYMENT_ACCOUNT_NO),
      payment_bank_name: input.paymentBankName !== undefined ? input.paymentBankName : (row.payment_bank_name ?? DEFAULT_PAYMENT_BANK_NAME),
      payment_signer_name: input.paymentSignerName !== undefined ? input.paymentSignerName : (row.payment_signer_name ?? DEFAULT_PAYMENT_SIGNER_NAME),
    };

    await run(
      `UPDATE system_settings SET
        smtp_mode = ?, smtp_host = ?, smtp_port = ?, smtp_user = ?, smtp_pass = ?,
        smtp_from_name = ?, smtp_from_email = ?,
        zalo_oa_id = ?, zalo_oa_token = ?,
        payment_beneficiary = ?, payment_account_no = ?, payment_bank_name = ?, payment_signer_name = ?
      WHERE id = ?`,
      [
        next.smtp_mode,
        next.smtp_host,
        next.smtp_port,
        next.smtp_user,
        next.smtp_pass,
        next.smtp_from_name,
        next.smtp_from_email,
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
      fromName: row.smtp_from_name || DEFAULT_SMTP_FROM_NAME,
      fromEmail: row.smtp_from_email || "",
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
