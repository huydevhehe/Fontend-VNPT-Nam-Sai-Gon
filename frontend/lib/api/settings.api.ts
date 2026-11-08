import { apiFetch } from "./client";

export interface SystemSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassSet: boolean;
  zaloOaId: string;
  zaloOaTokenSet: boolean;
}

export interface UpdateSystemSettingsInput {
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  zaloOaId?: string;
  zaloOaToken?: string;
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
