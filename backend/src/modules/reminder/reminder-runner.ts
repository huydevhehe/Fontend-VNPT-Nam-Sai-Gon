import { query, run } from "../../database/db.js";
import { todayVn } from "../../utils/date-vn.js";
import { sendMail, type SendMailResult } from "../notification/email.service.js";
import { ReminderSettingsService } from "./reminder-settings.service.js";

export interface DueItem {
  source: "service" | "file";
  itemId: string;
  daysBefore: number;
  expiryDate: string;
  title: string;
  customerName: string;
  subscriberCode: string;
  staffName: string | null;
  recipients: string[];
}

export interface RunResult {
  sent: number;
  failed: number;
  skipped: number;
}

type SendFn = (msg: { to: string | string[]; subject: string; text: string; html?: string }) => Promise<SendMailResult>;

/**
 * Trả về mốc `d` trong `daysBefore` nếu `expiryDate - today === d` (đúng
 * bằng), ngược lại `null`. Không gửi bù mốc đã lỡ (Review Focus #2): nếu
 * server tắt đúng hôm còn 7 ngày, hôm sau còn 6 ngày sẽ KHÔNG gửi bù mốc 7.
 */
export function findDueDays(expiryDate: string, today: string, daysBefore: number[]): number | null {
  const expiry = new Date(`${expiryDate}T00:00:00Z`).getTime();
  const base = new Date(`${today}T00:00:00Z`).getTime();
  if (Number.isNaN(expiry) || Number.isNaN(base)) {
    return null;
  }
  const diffDays = Math.round((expiry - base) / (24 * 60 * 60 * 1000));
  return daysBefore.includes(diffDays) ? diffDays : null;
}

interface ServiceRow {
  id: string;
  customer_id: string | null;
  customer_name: string;
  service_name: string;
  service_code: string;
  expiration_date: string;
  staff_name: string;
}

interface ReminderItemRow {
  id: string;
  batch_id: string;
  title: string | null;
  customer_name: string | null;
  subscriber_code: string | null;
  expiry_date: string;
  recipient_email: string | null;
  staff_name: string | null;
}

async function findStaffEmail(staffName: string | null): Promise<string | null> {
  if (!staffName) return null;
  const rows = await query<{ email: string | null }>("SELECT email FROM staff WHERE name = ?", [staffName.trim()]);
  const email = rows[0]?.email;
  return email && email.trim() ? email.trim() : null;
}

/**
 * Ưu tiên tra theo `customer_id` (chính xác, có từ Đợt 7) — chỉ so theo tên
 * (TRIM, có thể gán nhầm khi 2 khách trùng tên) khi dịch vụ cũ chưa có
 * `customer_id` (chưa backfill được, xem Review Focus #5 dot-07.md).
 */
async function findCustomerEmails(customerId: string | null, customerName: string | null): Promise<string[]> {
  const rows = customerId
    ? await query<{ contact_email: string | null; billing_email: string | null }>(
        "SELECT contact_email, billing_email FROM customers WHERE id = ? LIMIT 1",
        [customerId]
      )
    : customerName
      ? await query<{ contact_email: string | null; billing_email: string | null }>(
          "SELECT contact_email, billing_email FROM customers WHERE TRIM(name) = TRIM(?) LIMIT 1",
          [customerName]
        )
      : [];
  const row = rows[0];
  if (!row) return [];
  const emails: string[] = [];
  if (row.contact_email && row.contact_email.trim()) emails.push(row.contact_email.trim());
  if (row.billing_email && row.billing_email.trim()) emails.push(row.billing_email.trim());
  return emails;
}

function splitExtraCc(extraCc: string): string[] {
  return extraCc
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e.length > 0);
}

async function alreadySent(source: string, itemId: string, daysBefore: number): Promise<boolean> {
  const rows = await query<{ id: string }>(
    "SELECT id FROM reminder_logs WHERE source = ? AND item_id = ? AND days_before = ? AND status = 'sent'",
    [source, itemId, daysBefore]
  );
  return rows.length > 0;
}

async function logResult(entry: {
  source: "service" | "file";
  itemId: string;
  daysBefore: number;
  recipients: string[];
  status: "sent" | "failed" | "skipped_no_smtp" | "skipped_no_recipient";
  error?: string;
}): Promise<void> {
  const id = `RMLOG-${entry.source}-${entry.itemId}-${entry.daysBefore}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  await run(
    `INSERT INTO reminder_logs (id, source, item_id, days_before, recipients, status, error, sent_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      entry.source,
      entry.itemId,
      entry.daysBefore,
      entry.recipients.join(","),
      entry.status,
      entry.error ?? null,
      new Date().toISOString(),
    ]
  );
}

function formatDateVn(dateStr: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return dateStr;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

function buildEmailContent(item: DueItem): { subject: string; text: string; html: string } {
  const subject = `[VNPT NSG] Dịch vụ ${item.title} của ${item.customerName} hết hạn ngày ${formatDateVn(item.expiryDate)} (còn ${item.daysBefore} ngày)`;
  const text = [
    `Dịch vụ: ${item.title}`,
    `Khách hàng: ${item.customerName}`,
    `Mã thuê bao: ${item.subscriberCode || "(không có)"}`,
    `AM phụ trách: ${item.staffName || "(chưa gán)"}`,
    `Ngày hết hạn: ${formatDateVn(item.expiryDate)} (còn ${item.daysBefore} ngày)`,
  ].join("\n");
  const html = `
    <p>Dịch vụ: <strong>${item.title}</strong></p>
    <p>Khách hàng: ${item.customerName}</p>
    <p>Mã thuê bao: ${item.subscriberCode || "(không có)"}</p>
    <p>AM phụ trách: ${item.staffName || "(chưa gán)"}</p>
    <p>Ngày hết hạn: <strong>${formatDateVn(item.expiryDate)}</strong> (còn ${item.daysBefore} ngày)</p>
  `;
  return { subject, text, html };
}

export const ReminderRunner = {
  /** Thu thập toàn bộ mục đến hạn hôm nay (chưa lọc mục đã gửi) từ 2 nguồn: services và reminder_items (file). */
  async collectDue(today: string): Promise<DueItem[]> {
    const settings = await ReminderSettingsService.get();
    const extraCc = splitExtraCc(settings.extraCc);
    const items: DueItem[] = [];

    // Nguồn "service"
    const services = await query<ServiceRow>(
      "SELECT id, customer_id, customer_name, service_name, service_code, expiration_date, staff_name FROM services"
    );
    for (const svc of services) {
      const daysBefore = findDueDays(svc.expiration_date, today, settings.daysBefore);
      if (daysBefore === null) continue;

      const recipients: string[] = [];
      if (settings.notifyStaff) {
        const staffEmail = await findStaffEmail(svc.staff_name);
        if (staffEmail) recipients.push(staffEmail);
      }
      if (settings.notifyCustomer) {
        const customerEmails = await findCustomerEmails(svc.customer_id, svc.customer_name);
        recipients.push(...customerEmails);
      }
      recipients.push(...extraCc);

      items.push({
        source: "service",
        itemId: svc.id,
        daysBefore,
        expiryDate: svc.expiration_date,
        title: svc.service_name,
        customerName: svc.customer_name,
        subscriberCode: svc.service_code,
        staffName: svc.staff_name || null,
        recipients: Array.from(new Set(recipients)),
      });
    }

    // Nguồn "file" — chỉ đợt đang bật (enabled = true)
    const batches = await query<{ id: string; days_before: string }>(
      "SELECT id, days_before FROM reminder_batches WHERE enabled = TRUE"
    );
    for (const batch of batches) {
      let batchDaysBefore: number[];
      try {
        const parsed = JSON.parse(batch.days_before);
        batchDaysBefore = Array.isArray(parsed) ? parsed.filter((n) => typeof n === "number") : [];
      } catch {
        batchDaysBefore = [];
      }
      if (batchDaysBefore.length === 0) continue;

      const rows = await query<ReminderItemRow>(
        "SELECT id, batch_id, title, customer_name, subscriber_code, expiry_date, recipient_email, staff_name FROM reminder_items WHERE batch_id = ?",
        [batch.id]
      );
      for (const row of rows) {
        const daysBefore = findDueDays(row.expiry_date, today, batchDaysBefore);
        if (daysBefore === null) continue;

        const recipients: string[] = [];
        if (row.recipient_email && row.recipient_email.trim()) {
          recipients.push(row.recipient_email.trim());
        } else {
          const staffEmail = await findStaffEmail(row.staff_name);
          if (staffEmail) recipients.push(staffEmail);
        }
        recipients.push(...extraCc);

        items.push({
          source: "file",
          itemId: row.id,
          daysBefore,
          expiryDate: row.expiry_date,
          title: row.title || "(không có tên)",
          customerName: row.customer_name || "",
          subscriberCode: row.subscriber_code || "",
          staffName: row.staff_name || null,
          recipients: Array.from(new Set(recipients)),
        });
      }
    }

    return items;
  },

  /**
   * Chạy một lượt nhắc hạn: bỏ mục đã có log 'sent' cùng khóa (source, itemId,
   * daysBefore), gửi từng mục còn lại (lỗi 1 mục không dừng cả lượt), ghi log,
   * cập nhật last_run_date = today. Không có SMTP host → mọi mục log
   * 'skipped_no_smtp'.
   */
  async run(today: string, opts?: { force?: boolean; send?: SendFn }): Promise<RunResult> {
    const send: SendFn = opts?.send ?? ((msg) => sendMail(msg));

    const dueItems = await this.collectDue(today);
    const result: RunResult = { sent: 0, failed: 0, skipped: 0 };

    for (const item of dueItems) {
      if (await alreadySent(item.source, item.itemId, item.daysBefore)) {
        continue;
      }

      if (item.recipients.length === 0) {
        await logResult({
          source: item.source,
          itemId: item.itemId,
          daysBefore: item.daysBefore,
          recipients: [],
          status: "skipped_no_recipient",
        });
        result.skipped += 1;
        continue;
      }

      const { subject, text, html } = buildEmailContent(item);
      try {
        const sendResult = await send({ to: item.recipients, subject, text, html });
        if (sendResult.sent) {
          await logResult({
            source: item.source,
            itemId: item.itemId,
            daysBefore: item.daysBefore,
            recipients: item.recipients,
            status: "sent",
          });
          result.sent += 1;
        } else if (sendResult.error === "Chưa cấu hình SMTP") {
          await logResult({
            source: item.source,
            itemId: item.itemId,
            daysBefore: item.daysBefore,
            recipients: item.recipients,
            status: "skipped_no_smtp",
            error: sendResult.error,
          });
          result.skipped += 1;
        } else {
          await logResult({
            source: item.source,
            itemId: item.itemId,
            daysBefore: item.daysBefore,
            recipients: item.recipients,
            status: "failed",
            error: sendResult.error,
          });
          result.failed += 1;
        }
      } catch (error) {
        await logResult({
          source: item.source,
          itemId: item.itemId,
          daysBefore: item.daysBefore,
          recipients: item.recipients,
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
        });
        result.failed += 1;
      }
    }

    await ReminderSettingsService.markRunToday(today);
    return result;
  },
};
