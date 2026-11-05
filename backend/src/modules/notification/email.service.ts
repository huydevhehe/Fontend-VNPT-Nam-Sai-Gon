import nodemailer, { type Transporter } from "nodemailer";
import { config } from "../../config/index.js";

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

function getRealTransport(): Transporter {
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: config.smtp.user
      ? {
          user: config.smtp.user,
          pass: config.smtp.pass,
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
      const usingRealSmtp = Boolean(config.smtp.host);

      if (usingRealSmtp) {
        const transporter = getRealTransport();
        await transporter.sendMail({
          from: config.smtp.user || "crm-vnpt-nam-sai-gon@example.com",
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
