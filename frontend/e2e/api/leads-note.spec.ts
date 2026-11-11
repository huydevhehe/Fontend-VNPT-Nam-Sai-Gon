import { expect, test } from "@playwright/test";
import { ADMIN, AM, API_URL, apiLogin, bearer } from "./helpers";

test.describe("API Cập nhật ghi chú Lead (PATCH /api/leads/:id/note)", () => {
  let adminToken: string;
  let amToken: string;
  let leadId: string;

  test.beforeAll(async ({ request }) => {
    adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    amToken = await apiLogin(request, AM.username, AM.password);

    // Tạo một lead mẫu bằng admin
    const createRes = await request.post(`${API_URL}/leads`, {
      headers: bearer(adminToken),
      data: {
        customerName: `KH Lead Note API ${Date.now()}`,
        phone: "0901234567",
        group: "Lead KH mới",
        channel: "Online",
        staffName: "Nguyễn Thị Tình",
      },
    });
    expect(createRes.status()).toBe(201);
    const body = await createRes.json();
    leadId = body.data.id;
  });

  test("yêu cầu xác thực: không có token trả về 401", async ({ request }) => {
    const res = await request.patch(`${API_URL}/leads/${leadId}/note`, {
      data: { note: "Ghi chú không token" },
    });
    expect(res.status()).toBe(401);
  });

  test("AM cập nhật ghi chú thành công (200)", async ({ request }) => {
    const res = await request.patch(`${API_URL}/leads/${leadId}/note`, {
      headers: bearer(amToken),
      data: { note: "AM ghi chú: KH hẹn gọi lại vào sáng mai" },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.note).toBe("AM ghi chú: KH hẹn gọi lại vào sáng mai");
  });
});
