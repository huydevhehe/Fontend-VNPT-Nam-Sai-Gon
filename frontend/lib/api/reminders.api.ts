import { apiFetch, apiFetchRaw } from "./client";

export interface ReminderSettings {
  enabled: boolean;
  runTime: string;
  daysBefore: number[];
  notifyStaff: boolean;
  notifyCustomer: boolean;
  extraCc: string;
  lastRunDate: string | null;
}

export interface UpdateReminderSettingsInput {
  enabled?: boolean;
  runTime?: string;
  daysBefore?: number[];
  notifyStaff?: boolean;
  notifyCustomer?: boolean;
  extraCc?: string;
}

export function getReminderSettings(): Promise<ReminderSettings> {
  return apiFetch<ReminderSettings>("/reminders/settings");
}

export function updateReminderSettings(
  input: UpdateReminderSettingsInput
): Promise<ReminderSettings> {
  return apiFetch<ReminderSettings>("/reminders/settings", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export interface RunNowResult {
  sent: number;
  failed: number;
  skipped: number;
}

export function runReminderNow(): Promise<RunNowResult> {
  return apiFetch<RunNowResult>("/reminders/run-now", { method: "POST" });
}

export interface ReminderLog {
  id: string;
  source: "service" | "file";
  item_id: string;
  days_before: number;
  recipients: string | null;
  status: string;
  error: string | null;
  sent_at: string;
}

export function getReminderLogs(limit = 200): Promise<ReminderLog[]> {
  return apiFetch<ReminderLog[]>(`/reminders/logs?limit=${limit}`);
}

export interface ReminderBatchSummary {
  id: string;
  name: string;
  fileName: string | null;
  daysBefore: number[];
  enabled: boolean;
  itemCount: number;
  nearestExpiryDate: string | null;
  importedBy: string | null;
  importedAt: string | null;
}

export function getReminderBatches(): Promise<ReminderBatchSummary[]> {
  return apiFetch<ReminderBatchSummary[]>("/reminders/files");
}

export interface InspectReminderFileResult {
  sheetName: string;
  headers: string[];
  sampleRows: Record<string, unknown>[];
}

export async function inspectReminderFile(file: File): Promise<InspectReminderFileResult> {
  const formData = new FormData();
  formData.append("file", file);
  const payload = await apiFetchRaw<
    { success: true; data: InspectReminderFileResult } | { success: false; message: string }
  >("/reminders/files/inspect", { method: "POST", body: formData });
  if (!payload.success) {
    throw new Error(payload.message || "Đọc file thất bại");
  }
  return payload.data;
}

export interface ImportReminderColumns {
  expiryDate: string;
  title?: string;
  customerName?: string;
  subscriberCode?: string;
  recipientEmail?: string;
  staffName?: string;
}

export interface ImportReminderFileResult {
  batchId: string;
  imported: number;
  errors: { rowNumber: number; message: string }[];
}

export async function importReminderFile(
  file: File,
  name: string,
  daysBefore: number[],
  columns: ImportReminderColumns
): Promise<ImportReminderFileResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name);
  formData.append("daysBefore", JSON.stringify(daysBefore));
  formData.append("columns", JSON.stringify(columns));
  const payload = await apiFetchRaw<
    { success: true; data: ImportReminderFileResult } | { success: false; message: string }
  >("/reminders/files/import", { method: "POST", body: formData });
  if (!payload.success) {
    throw new Error(payload.message || "Import thất bại");
  }
  return payload.data;
}

export function updateReminderBatch(
  batchId: string,
  patch: { enabled?: boolean; daysBefore?: number[]; name?: string }
): Promise<void> {
  return apiFetch<void>(`/reminders/files/${batchId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function deleteReminderBatch(batchId: string): Promise<void> {
  return apiFetch<void>(`/reminders/files/${batchId}`, { method: "DELETE" });
}
