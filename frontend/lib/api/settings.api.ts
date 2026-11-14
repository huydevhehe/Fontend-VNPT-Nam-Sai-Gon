import { apiFetch } from "./client";

export const SMTP_MODES = ["normal", "domain"] as const;
export type SmtpMode = (typeof SMTP_MODES)[number];

export interface SystemSettings {
  smtpMode: SmtpMode;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassSet: boolean;
  smtpFromName: string;
  smtpFromEmail: string;
  zaloOaId: string;
  zaloOaTokenSet: boolean;
  paymentBeneficiary?: string;
  paymentAccountNo?: string;
  paymentBankName?: string;
  paymentSignerName?: string;
}

export interface UpdateSystemSettingsInput {
  smtpMode?: SmtpMode;
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
}

export interface SmtpOverrideInput {
  smtpMode?: SmtpMode;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpFromName?: string;
  smtpFromEmail?: string;
}

export interface SendTestEmailResult {
  sent: boolean;
  previewUrl?: string;
  error?: string;
}

export function getSystemSettings(): Promise<SystemSettings> {
  return apiFetch<SystemSettings>("/settings");
}

export function updateSystemSettings(
  data: UpdateSystemSettingsInput
): Promise<SystemSettings> {
  return apiFetch<SystemSettings>("/settings", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function sendTestEmail(
  to: string,
  override?: SmtpOverrideInput
): Promise<SendTestEmailResult> {
  return apiFetch<SendTestEmailResult>("/settings/smtp/test", {
    method: "POST",
    body: JSON.stringify({ to, override }),
  });
}
