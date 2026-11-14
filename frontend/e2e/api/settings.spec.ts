import { expect, test } from "@playwright/test";
import { ADMIN, AM, API_URL, apiLogin, bearer } from "./helpers";

test.describe("API Cài đặt hệ thống — Email SMTP (Đợt 10 - Task 1)", () => {
  test.describe.configure({ mode: "serial" });

  let adminToken: string;
  let amToken: string;

  test.beforeAll(async ({ request }) => {
    adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    amToken = await apiLogin(request, AM.username, AM.password);
  });

  test("GET /settings không có trường mật khẩu dạng chuỗi", async ({ request }) => {
    const res = await request.get(`${API_URL}/settings`, { headers: bearer(adminToken) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data).not.toHaveProperty("smtpPass");
    expect(typeof body.data.smtpPassSet).toBe("boolean");
    expect(typeof body.data.smtpMode).toBe("string");
  });

  test("AM gọi POST /settings/smtp/test → 403", async ({ request }) => {
    const res = await request.post(`${API_URL}/settings/smtp/test`, {
      headers: bearer(amToken),
      data: { to: "someone@example.com" },
    });
    expect(res.status()).toBe(403);
  });

  test("Admin gọi gửi thử với email không hợp lệ → 400", async ({ request }) => {
    const res = await request.post(`${API_URL}/settings/smtp/test`, {
      headers: bearer(adminToken),
      data: { to: "khong-phai-email" },
    });
    expect(res.status()).toBe(400);
  });

  test("Admin gọi gửi thử khi chưa có host (chưa cấu hình) → 400", async ({ request }) => {
    const res = await request.post(`${API_URL}/settings/smtp/test`, {
      headers: bearer(adminToken),
      data: { to: "someone@example.com", override: { smtpHost: "" } },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain("Chưa cấu hình SMTP");
  });

  test("Admin PUT /settings với smtpMode không hợp lệ → 400", async ({ request }) => {
    const res = await request.put(`${API_URL}/settings`, {
      headers: bearer(adminToken),
      data: { smtpMode: "khong-ton-tai" },
    });
    expect(res.status()).toBe(400);
  });

  test("Admin PUT /settings lưu smtpMode=normal rồi đọc lại đúng giá trị", async ({ request }) => {
    const putRes = await request.put(`${API_URL}/settings`, {
      headers: bearer(adminToken),
      data: { smtpMode: "normal", smtpFromName: "VNPT Test" },
    });
    expect(putRes.status()).toBe(200);
    const putBody = await putRes.json();
    expect(putBody.data.smtpMode).toBe("normal");
    expect(putBody.data.smtpFromName).toBe("VNPT Test");

    const getRes = await request.get(`${API_URL}/settings`, { headers: bearer(adminToken) });
    const getBody = await getRes.json();
    expect(getBody.data.smtpMode).toBe("normal");

    // Khôi phục lại domain để không ảnh hưởng các test khác chạy sau.
    await request.put(`${API_URL}/settings`, {
      headers: bearer(adminToken),
      data: { smtpMode: "domain" },
    });
  });
});
