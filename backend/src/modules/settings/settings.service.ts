import { query, run } from "../../database/db.js";
import { config } from "../../config/index.js";

const SETTINGS_ID = "default";

interface SettingsRow {
  id: string;
  smtp_host: string;
  smtp_port: number | null;
  smtp_user: string;
  smtp_pass: string;
  zalo_oa_id: string;
  zalo_oa_token: string;
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

export interface SettingsView {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassSet: boolean;
  zaloOaId: string;
  zaloOaTokenSet: boolean;
}

async function getRow(): Promise<SettingsRow> {
  const rows = await query<SettingsRow>("SELECT * FROM system_settings WHERE id = ?", [SETTINGS_ID]);
  if (rows[0]) {
    return rows[0];
  }
  await run(
    "INSERT INTO system_settings (id, smtp_host, smtp_port, smtp_user, smtp_pass, zalo_oa_id, zalo_oa_token) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [SETTINGS_ID, "", null, "", "", "", ""]
  );
  return {
    id: SETTINGS_ID,
    smtp_host: "",
    smtp_port: null,
    smtp_user: "",
    smtp_pass: "",
    zalo_oa_id: "",
    zalo_oa_token: "",
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
  }): Promise<SettingsView> {
    const row = await getRow();

    const next = {
      smtp_host: input.smtpHost ?? row.smtp_host,
      smtp_port: input.smtpPort ?? row.smtp_port,
      smtp_user: input.smtpUser ?? row.smtp_user,
      smtp_pass: input.smtpPass ? input.smtpPass : row.smtp_pass,
      zalo_oa_id: input.zaloOaId ?? row.zalo_oa_id,
      zalo_oa_token: input.zaloOaToken ? input.zaloOaToken : row.zalo_oa_token,
    };

    await run(
      "UPDATE system_settings SET smtp_host = ?, smtp_port = ?, smtp_user = ?, smtp_pass = ?, zalo_oa_id = ?, zalo_oa_token = ? WHERE id = ?",
      [next.smtp_host, next.smtp_port, next.smtp_user, next.smtp_pass, next.zalo_oa_id, next.zalo_oa_token, SETTINGS_ID]
    );

    return SettingsService.getView();
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
