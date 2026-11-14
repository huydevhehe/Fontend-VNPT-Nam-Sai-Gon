import nodemailer, { type Transporter } from "nodemailer";
import { SettingsService, type EffectiveSmtpConfig } from "../settings/settings.service.js";

export interface SendEmailResult {
  sent: boolean;
  previewUrl?: string;
}

export interface SendMailResult {
  sent: boolean;
  previewUrl?: string;
  error?: string;
}

export interface SendMailMessage {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}

export interface SmtpOverride {
  smtpMode?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpFromName?: string;
  smtpFromEmail?: string;
}

let cachedTestTransport: { transporter: Transporter; user: string } | null = null;

async function getTestTransport(): Promise<{ transporter: Transporter; user: string }> {
  if (cachedTestTransport) {
    return cachedTestTransport;
  }

  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  cachedTestTransport = { transporter, user: testAccount.user };
  return cachedTestTransport;
}

function getRealTransport(smtp: { host: string; port: number; user: string; pass: string }): Transporter {
  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: smtp.user
      ? {
          user: smtp.user,
          pass: smtp.pass,
        }
      : undefined,
  });
}

/** Thay mọi lần xuất hiện của `secret` trong `message` bằng "***" — dùng để không lộ mật khẩu SMTP qua thông báo lỗi. */
export function maskSecret(message: string, secret: string): string {
  if (!secret) {
    return message;
  }
  return message.split(secret).join("***");
}

function errorMessage(error: unknown, secretToMask: string): string {
  const raw = error instanceof Error ? error.message : String(error);
  return maskSecret(raw, secretToMask);
}

async function sendViaSmtp(
  smtp: EffectiveSmtpConfig,
  msg: SendMailMessage,
  allowTestFallback: boolean
): Promise<SendMailResult> {
  const hasHost = Boolean(smtp.host);

  if (!hasHost) {
    if (allowTestFallback) {
      try {
        const { transporter, user } = await getTestTransport();
        const info = await transporter.sendMail({
          from: user,
          to: user,
          subject: msg.subject,
          text: msg.text,
          html: msg.html,
        });
        const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
        console.log(`[Email] Chưa cấu hình SMTP thật — đã gửi mail test qua Ethereal. Preview: ${previewUrl}`);
        return { sent: true, previewUrl };
      } catch (error) {
        return { sent: false, error: errorMessage(error, smtp.pass) };
      }
    }
    return { sent: false, error: "Chưa cấu hình SMTP" };
  }

  try {
    const transporter = getRealTransport(smtp);
    const fromEmail = smtp.fromEmail || smtp.user;
    const from = smtp.fromName ? `"${smtp.fromName}" <${fromEmail}>` : fromEmail;
    await transporter.sendMail({
      from,
      to: msg.to,
      subject: msg.subject,
      text: msg.text,
      html: msg.html,
    });
    return { sent: true };
  } catch (error) {
    return { sent: false, error: errorMessage(error, smtp.pass) };
  }
}

/**
 * Gửi mail dùng cấu hình SMTP đã lưu trong `system_settings`.
 * `allowTestFallback` mặc định `false`: chưa cấu hình host → báo lỗi rõ ràng,
 * KHÔNG rơi về Ethereal (tránh ảo tưởng "đã gửi" cho mail thật tới khách/nhân viên).
 */
export async function sendMail(
  msg: SendMailMessage,
  opts?: { allowTestFallback?: boolean }
): Promise<SendMailResult> {
  const smtp = await SettingsService.getEffectiveSmtp();
  return sendViaSmtp(smtp, msg, opts?.allowTestFallback ?? false);
}

/**
 * Gửi thử tới một email bất kỳ. Nếu `override` được cung cấp (form Cài đặt
 * hệ thống đang nhập nhưng chưa Lưu), dùng cấu hình đó; `smtpPass` trống thì
 * lấy mật khẩu đã lưu trong DB. Không bao giờ rơi về Ethereal.
 */
export async function sendTestMail(to: string, override?: SmtpOverride): Promise<SendMailResult> {
  const saved = await SettingsService.getEffectiveSmtp();
  const smtp: EffectiveSmtpConfig = override
    ? {
        host: override.smtpHost ?? "",
        port: override.smtpPort ?? saved.port,
        user: override.smtpUser ?? "",
        pass: override.smtpPass ? override.smtpPass : saved.pass,
        fromName: override.smtpFromName ?? saved.fromName,
        fromEmail: override.smtpFromEmail ?? saved.fromEmail,
      }
    : saved;

  return sendViaSmtp(
    smtp,
    {
      to,
      subject: "Email thử nghiệm cấu hình SMTP — VNPT CRM Nam Sài Gòn",
      text: "Đây là email thử nghiệm cấu hình SMTP từ hệ thống VNPT CRM Nam Sài Gòn. Nếu bạn nhận được email này, cấu hình SMTP đã hoạt động.",
      html: "<p>Đây là email thử nghiệm cấu hình SMTP từ hệ thống <strong>VNPT CRM Nam Sài Gòn</strong>. Nếu bạn nhận được email này, cấu hình SMTP đã hoạt động.</p>",
    },
    false
  );
}

export const EmailService = {
  async sendServiceExpiryAlert(
    to: string,
    serviceName: string,
    expirationDate: string
  ): Promise<SendEmailResult> {
    const subject = `Thông báo sắp hết hạn dịch vụ: ${serviceName}`;
    const text = `Dịch vụ "${serviceName}" của khách hàng sẽ hết hạn vào ngày ${expirationDate}. Vui lòng liên hệ khách hàng để gia hạn.`;

    try {
      const result = await sendMail({ to, subject, text }, { allowTestFallback: true });
      return { sent: result.sent, previewUrl: result.previewUrl };
    } catch (error) {
      console.warn("[Email] Gửi mail thất bại:", error);
      return { sent: false };
    }
  },
};
