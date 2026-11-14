import * as XLSX from "xlsx";
import { query, run } from "../../database/db.js";
import { parseExcelDate } from "../../utils/excel-date.js";
import { normalizeDaysBefore } from "./reminder-settings.service.js";

export interface InspectFileResult {
  sheetName: string;
  headers: string[];
  sampleRows: Record<string, unknown>[];
}

export interface ImportColumnsMap {
  expiryDate: string;
  title?: string;
  customerName?: string;
  subscriberCode?: string;
  recipientEmail?: string;
  staffName?: string;
}

export interface ImportFileOptions {
  name: string;
  daysBefore: number[];
  columns: ImportColumnsMap;
  importedBy?: string;
}

export interface ImportFileResult {
  batchId: string;
  imported: number;
  errors: { rowNumber: number; message: string }[];
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

function readFirstSheet(fileBuffer: Buffer): { sheetName: string; rows: Record<string, unknown>[]; headers: string[] } {
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  const headerRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
  const headers = ((headerRows[0] as unknown[]) || []).map((h) => String(h ?? "").trim()).filter((h) => h.length > 0);
  return { sheetName, rows, headers };
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const ReminderImportService = {
  inspectFile(fileBuffer: Buffer): InspectFileResult {
    const { sheetName, rows, headers } = readFirstSheet(fileBuffer);
    return {
      sheetName,
      headers,
      sampleRows: rows.slice(0, 5),
    };
  },

  async importFile(fileBuffer: Buffer, fileName: string | undefined, options: ImportFileOptions): Promise<ImportFileResult> {
    const { rows } = readFirstSheet(fileBuffer);
    if (!options.columns.expiryDate) {
      throw new Error("Phải chọn cột ngày hết hạn");
    }
    const daysBefore = normalizeDaysBefore(options.daysBefore);

    const batchId = newId("RMB");
    const errors: { rowNumber: number; message: string }[] = [];
    const itemsToInsert: Array<{
      id: string;
      title: string | null;
      customerName: string | null;
      subscriberCode: string | null;
      expiryDate: string;
      recipientEmail: string | null;
      staffName: string | null;
      extra: string;
    }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // dòng 1 là header
      const rawExpiry = row[options.columns.expiryDate];
      const expiryDate = parseExcelDate(rawExpiry);
      if (!expiryDate) {
        errors.push({ rowNumber, message: `Không đọc được ngày hết hạn: "${String(rawExpiry ?? "")}"` });
        continue;
      }

      let staffName: string | null = options.columns.staffName
        ? String(row[options.columns.staffName] ?? "").trim() || null
        : null;
      if (staffName) {
        const staffRows = await query<{ name: string }>("SELECT name FROM staff WHERE name = ?", [staffName]);
        if (staffRows.length === 0) {
          errors.push({ rowNumber, message: `Không tìm thấy nhân viên "${staffName}" — đã import, bỏ trống AM` });
          staffName = null;
        }
      }

      const rest: Record<string, unknown> = {};
      const usedColumns = new Set(
        [
          options.columns.expiryDate,
          options.columns.title,
          options.columns.customerName,
          options.columns.subscriberCode,
          options.columns.recipientEmail,
          options.columns.staffName,
        ].filter(Boolean)
      );
      for (const key of Object.keys(row)) {
        if (!usedColumns.has(key)) {
          rest[key] = row[key];
        }
      }

      itemsToInsert.push({
        id: newId("RMI"),
        title: options.columns.title ? String(row[options.columns.title] ?? "").trim() || null : null,
        customerName: options.columns.customerName ? String(row[options.columns.customerName] ?? "").trim() || null : null,
        subscriberCode: options.columns.subscriberCode
          ? String(row[options.columns.subscriberCode] ?? "").trim() || null
          : null,
        expiryDate,
        recipientEmail: options.columns.recipientEmail
          ? String(row[options.columns.recipientEmail] ?? "").trim() || null
          : null,
        staffName,
        extra: JSON.stringify(rest),
      });
    }

    await run(
      `INSERT INTO reminder_batches (id, name, file_name, days_before, enabled, imported_by, imported_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [batchId, options.name, fileName ?? null, JSON.stringify(daysBefore), true, options.importedBy ?? null, new Date().toISOString()]
    );

    for (const item of itemsToInsert) {
      await run(
        `INSERT INTO reminder_items (id, batch_id, title, customer_name, subscriber_code, expiry_date, recipient_email, staff_name, extra)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          batchId,
          item.title,
          item.customerName,
          item.subscriberCode,
          item.expiryDate,
          item.recipientEmail,
          item.staffName,
          item.extra,
        ]
      );
    }

    return { batchId, imported: itemsToInsert.length, errors };
  },

  async listBatches(): Promise<ReminderBatchSummary[]> {
    const batches = await query<{
      id: string;
      name: string;
      file_name: string | null;
      days_before: string;
      enabled: boolean;
      imported_by: string | null;
      imported_at: string | null;
    }>("SELECT * FROM reminder_batches ORDER BY imported_at DESC");

    const summaries: ReminderBatchSummary[] = [];
    for (const batch of batches) {
      const itemStats = await query<{ count: number; nearest: string | null }>(
        "SELECT COUNT(*) as count, MIN(expiry_date) as nearest FROM reminder_items WHERE batch_id = ?",
        [batch.id]
      );
      let daysBefore: number[] = [];
      try {
        const parsed = JSON.parse(batch.days_before);
        daysBefore = Array.isArray(parsed) ? parsed : [];
      } catch {
        daysBefore = [];
      }
      summaries.push({
        id: batch.id,
        name: batch.name,
        fileName: batch.file_name,
        daysBefore,
        enabled: Boolean(batch.enabled),
        itemCount: Number(itemStats[0]?.count ?? 0),
        nearestExpiryDate: itemStats[0]?.nearest ?? null,
        importedBy: batch.imported_by,
        importedAt: batch.imported_at,
      });
    }
    return summaries;
  },

  async updateBatch(
    batchId: string,
    patch: { enabled?: boolean; daysBefore?: number[]; name?: string }
  ): Promise<void> {
    const rows = await query<{ id: string; name: string; days_before: string; enabled: boolean }>(
      "SELECT id, name, days_before, enabled FROM reminder_batches WHERE id = ?",
      [batchId]
    );
    const existing = rows[0];
    if (!existing) {
      throw new Error("Không tìm thấy đợt nhắc hạn");
    }

    const nextEnabled = patch.enabled !== undefined ? patch.enabled : existing.enabled;
    const nextName = patch.name !== undefined ? patch.name : existing.name;
    const nextDaysBefore = patch.daysBefore !== undefined ? normalizeDaysBefore(patch.daysBefore) : JSON.parse(existing.days_before);

    await run(
      "UPDATE reminder_batches SET enabled = ?, name = ?, days_before = ? WHERE id = ?",
      [nextEnabled, nextName, JSON.stringify(nextDaysBefore), batchId]
    );
  },

  async deleteBatch(batchId: string): Promise<void> {
    await run("DELETE FROM reminder_items WHERE batch_id = ?", [batchId]);
    await run("DELETE FROM reminder_batches WHERE id = ?", [batchId]);
  },
};
