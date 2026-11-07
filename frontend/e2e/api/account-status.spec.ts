import { expect, test } from "@playwright/test";
import { ADMIN, AM, API_URL, apiLogin, bearer, createApprovedCtv } from "./helpers";

test.describe("requireAuth kiểm tra lại trạng thái tài khoản", () => {
  test("token Admin và AM đang hoạt động vẫn trả 200", async ({ request }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    const amToken = await apiLogin(request, AM.username, AM.password);
    expect((await request.get(`${API_URL}/auth/me`, { headers: bearer(adminToken) })).status()).toBe(200);
    expect((await request.get(`${API_URL}/auth/me`, { headers: bearer(amToken) })).status()).toBe(200);
    expect((await request.get(`${API_URL}/customers`, { headers: bearer(amToken) })).status()).toBe(200);
  });

  test("CTV đã duyệt dùng được token, bị Admin từ chối thì token cũ trả 401", async ({ request }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    const ctv = await createApprovedCtv(request, adminToken);

    const before = await request.get(`${API_URL}/ctv/me`, { headers: bearer(ctv.token) });
    expect(before.status()).toBe(200);

    const rejectRes = await request.patch(`${API_URL}/ctv-accounts/${ctv.id}/reject`, {
      headers: bearer(adminToken),
    });
    expect(rejectRes.status()).toBe(200);

    const after = await request.get(`${API_URL}/ctv/me`, { headers: bearer(ctv.token) });
    expect(after.status()).toBe(401);
    const body = await after.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe("Tài khoản không còn hiệu lực");
  });

  test("nhân viên bị Admin đặt Ngừng hoạt động thì token cũ trả 401", async ({ request }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    const code = `NV-H1-${Date.now()}`;
    const create = await request.post(`${API_URL}/staff`, {
      headers: bearer(adminToken),
      data: { code, name: "NV H1 Trạng thái", role: "AM", territory: "Khu vực H1", email: `${code.toLowerCase()}@example.com` },
    });
    expect(create.status()).toBe(201);
    const staff = (await create.json()).data;

    const token = await apiLogin(request, code, `${code}@Vnpt2026`);
    expect((await request.get(`${API_URL}/customers`, { headers: bearer(token) })).status()).toBe(200);

    const patch = await request.patch(`${API_URL}/staff/${staff.id}`, {
      headers: bearer(adminToken),
      data: { status: "Ngừng hoạt động" },
    });
    expect(patch.status()).toBe(200);

    const after = await request.get(`${API_URL}/customers`, { headers: bearer(token) });
    expect(after.status()).toBe(401);
    expect((await after.json()).message).toBe("Tài khoản không còn hiệu lực");
  });
});
