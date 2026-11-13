import { query, run } from "../../database/db.js";

const SETTINGS_ID = "default";
const RUN_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const DEFAULT_DAYS_BEFORE = [30, 7, 1];
export const DEFAULT_RUN_TIME = "08:00";

interface ReminderSettingsRow {
  id: string;
  enabled: boolean;
  run_time: string;
  days_before: string;
  notify_staff: boolean;
  notify_customer: boolean;
  extra_cc: string;
  last_run_date: string | null;
  updated_at: string | null;
}

export interface ReminderSettingsView {
  enabled: boolean;
  runTime: string;
  daysBefore: number[];
  notifyStaff: boolean;
  notifyCustomer: boolean;
  extraCc: string;
  lastRunDate: string | null;
}

export interface ReminderSettingsUpdateInput {
  enabled?: boolean;
  runTime?: string;
  daysBefore?: number[];
  notifyStaff?: boolean;
  notifyCustomer?: boolean;
  extraCc?: string;
}

function parseDaysBefore(raw: string): number[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((n) => typeof n === "number");
    }
  } catch {
    // ignore, fall through to default
  }
  return DEFAULT_DAYS_BEFORE;
}

function toView(row: ReminderSettingsRow): ReminderSettingsView {
  return {
    enabled: Boolean(row.enabled),
    runTime: row.run_time || DEFAULT_RUN_TIME,
    daysBefore: parseDaysBefore(row.days_before),
    notifyStaff: Boolean(row.notify_staff),
    notifyCustomer: Boolean(row.notify_customer),
    extraCc: row.extra_cc || "",
    lastRunDate: row.last_run_date ?? null,
  };
}

async function getRow(): Promise<ReminderSettingsRow> {
  const rows = await query<ReminderSettingsRow>("SELECT * FROM reminder_settings WHERE id = ?", [SETTINGS_ID]);
  if (rows[0]) {
    return rows[0];
  }
  const now = new Date().toISOString();
  await run(
    `INSERT INTO reminder_settings (id, enabled, run_time, days_before, notify_staff, notify_customer, extra_cc, last_run_date, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [SETTINGS_ID, false, DEFAULT_RUN_TIME, JSON.stringify(DEFAULT_DAYS_BEFORE), true, false, "", null, now]
  );
  return {
    id: SETTINGS_ID,
    enabled: false,
    run_time: DEFAULT_RUN_TIME,
    days_before: JSON.stringify(DEFAULT_DAYS_BEFORE),
    notify_staff: true,
    notify_customer: false,
    extra_cc: "",
    last_run_date: null,
    updated_at: now,
  };
}

/** Validate + chuẩn hoá danh sách số ngày nhắc trước: nguyên 0–365, không trùng, tối đa 10, sắp giảm dần. */
export function normalizeDaysBefore(input: unknown): number[] {
  if (!Array.isArray(input)) {
    throw new Error("daysBefore phải là một mảng số nguyên");
  }
  if (input.length === 0) {
    throw new Error("daysBefore phải có ít nhất 1 giá trị");
  }
  if (input.length > 10) {
    throw new Error("daysBefore tối đa 10 giá trị");
  }
  const numbers = input.map((v) => {
    const n = Number(v);
    if (!Number.isInteger(n) || n < 0 || n > 365) {
      throw new Error(`Giá trị daysBefore không hợp lệ: ${v} (phải là số nguyên 0–365)`);
    }
    return n;
  });
  const unique = Array.from(new Set(numbers));
  return unique.sort((a, b) => b - a);
}

/** Validate danh sách email CC cách nhau bởi dấu phẩy. */
export function normalizeExtraCc(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return "";
  }
  const emails = trimmed
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e.length > 0);
  for (const email of emails) {
    if (!EMAIL_PATTERN.test(email)) {
      throw new Error(`Email CC không hợp lệ: ${email}`);
    }
  }
  return emails.join(",");
}

export const ReminderSettingsService = {
  async get(): Promise<ReminderSettingsView> {
    const row = await getRow();
    return toView(row);
  },

  async update(patch: ReminderSettingsUpdateInput): Promise<ReminderSettingsView> {
    const row = await getRow();
    const current = toView(row);

    if (patch.runTime !== undefined && !RUN_TIME_PATTERN.test(patch.runTime)) {
      throw new Error(`Giờ chạy không hợp lệ: ${patch.runTime} (phải dạng HH:MM, 00:00–23:59)`);
    }

    const daysBefore = patch.daysBefore !== undefined ? normalizeDaysBefore(patch.daysBefore) : current.daysBefore;
    const extraCc = patch.extraCc !== undefined ? normalizeExtraCc(patch.extraCc) : current.extraCc;

    const next = {
      enabled: patch.enabled !== undefined ? patch.enabled : current.enabled,
      run_time: patch.runTime !== undefined ? patch.runTime : current.runTime,
      days_before: JSON.stringify(daysBefore),
      notify_staff: patch.notifyStaff !== undefined ? patch.notifyStaff : current.notifyStaff,
      notify_customer: patch.notifyCustomer !== undefined ? patch.notifyCustomer : current.notifyCustomer,
      extra_cc: extraCc,
    };

    await run(
      `UPDATE reminder_settings SET
        enabled = ?, run_time = ?, days_before = ?, notify_staff = ?, notify_customer = ?, extra_cc = ?, updated_at = ?
       WHERE id = ?`,
      [
        next.enabled,
        next.run_time,
        next.days_before,
        next.notify_staff,
        next.notify_customer,
        next.extra_cc,
        new Date().toISOString(),
        SETTINGS_ID,
      ]
    );

    return ReminderSettingsService.get();
  },

  /** Dùng bởi reminder-runner: cập nhật last_run_date sau khi chạy xong một lượt. */
  async markRunToday(today: string): Promise<void> {
    await getRow(); // đảm bảo luôn có hàng trước khi update
    await run("UPDATE reminder_settings SET last_run_date = ? WHERE id = ?", [today, SETTINGS_ID]);
  },
};
