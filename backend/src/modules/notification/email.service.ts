import nodemailer, { type Transporter } from "nodemailer";
import { SettingsService } from "../settings/settings.service.js";

export interface SendEmailResult {
  sent: boolean;
  previewUrl?: string;
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

export const EmailService = {
  async sendServiceExpiryAlert(
    to: string,
    serviceName: string,
    expirationDate: string
  ): Promise<SendEmailResult> {
    const subject = `Thông báo sắp hết hạn dịch vụ: ${serviceName}`;
    const text = `Dịch vụ "${serviceName}" của khách hàng sẽ hết hạn vào ngày ${expirationDate}. Vui lòng liên hệ khách hàng để gia hạn.`;

    try {
      // Ưu tiên cấu hình SMTP admin nhập qua CMS (bảng system_settings), rơi về .env nếu chưa nhập.
      const smtp = await SettingsService.getEffectiveSmtp();
      const usingRealSmtp = Boolean(smtp.host);

      if (usingRealSmtp) {
        const transporter = getRealTransport(smtp);
        await transporter.sendMail({
          from: smtp.user || "crm-vnpt-nam-sai-gon@example.com",
          to,
          subject,
          text,
        });
        return { sent: true };
      }

      const { transporter, user } = await getTestTransport();
      const info = await transporter.sendMail({
        from: user,
        to: user,
        subject,
        text,
      });
      const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      console.log(`[Email] Chưa cấu hình SMTP_HOST thật — đã gửi mail test qua Ethereal. Preview: ${previewUrl}`);
      return { sent: true, previewUrl };
    } catch (error) {
      console.warn("[Email] Gửi mail thất bại:", error);
      return { sent: false };
    }
  },
};
