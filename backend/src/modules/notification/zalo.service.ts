import { config } from "../../config/index.js";

export interface SendZaloMessageResult {
  sent: boolean;
  reason?: string;
}

export const ZaloService = {
  async sendZaloMessage(
    phone: string,
    templateId: string,
    params: Record<string, string>
  ): Promise<SendZaloMessageResult> {
    if (!config.zalo.oaToken) {
      console.log("[Zalo] Chưa cấu hình ZALO_OA_TOKEN — bỏ qua gửi thật");
      console.log(`[Zalo] (mock) Sẽ gửi tới ${phone}, template=${templateId}, params=${JSON.stringify(params)}`);
      return { sent: false, reason: "not_configured" };
    }

    // Chưa có tài khoản/token Zalo OA thật để kiểm thử — không gọi network thật ở đây.
    console.warn("[Zalo] Đã có ZALO_OA_TOKEN nhưng chưa triển khai gọi API Zalo OA thật.");
    return { sent: false, reason: "not_implemented" };
  },
};
