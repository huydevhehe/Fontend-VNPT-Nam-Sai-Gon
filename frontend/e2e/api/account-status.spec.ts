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
      data: { code, name: "NV H1 Trạng thái", role: "AM", territory: "Khu vực H1", email: `${code.toLowerCase()}@example.com`, password: `${code}@Vnpt2026` },
    });
    expect(create.status()).toBe(201);
    const staff = (await create.json()).data;

    const token = await apiLogin(request, code, `${code}@Vnpt2026`);
    expect((await request.get(`${API_URL}/customers`, { headers: bearer(token) })).status()).toBe(200);

    const patch = await request.patch(`${API_URL}/staff/${staff.id}/status`, {
      headers: bearer(adminToken),
      data: { status: "Ngừng hoạt động", reason: "Nghỉ việc" },
    });
    expect(patch.status()).toBe(200);

    const after = await request.get(`${API_URL}/customers`, { headers: bearer(token) });
    expect(after.status()).toBe(401);
    expect((await after.json()).message).toBe("Tài khoản không còn hiệu lực");
  });

  test("nhân viên bị đổi role sang Admin thì token cũ (vẫn mang role cũ) được xử lý theo role mới trong DB", async ({
    request,
  }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    const code = `NV-ROLE-${Date.now()}`;
    const create = await request.post(`${API_URL}/staff`, {
      headers: bearer(adminToken),
      data: { code, name: "NV Đổi Role", role: "AM", territory: "Khu vực H1", email: `${code.toLowerCase()}@example.com`, password: `${code}@Vnpt2026` },
    });
    expect(create.status()).toBe(201);
    const staff = (await create.json()).data;

    // Lấy token khi còn là AM: chưa có quyền Admin.
    const token = await apiLogin(request, code, `${code}@Vnpt2026`);
    const beforeSettings = await request.get(`${API_URL}/settings`, { headers: bearer(token) });
    expect(beforeSettings.status()).toBe(403);

    // Admin thăng role trong DB lên Admin.
    const patch = await request.patch(`${API_URL}/staff/${staff.id}`, {
      headers: bearer(adminToken),
      data: { role: "Admin" },
    });
    expect(patch.status()).toBe(200);

    // Token CŨ (payload JWT vẫn ghi role AM) phải được middleware tra lại DB và
    // cho qua endpoint chỉ Admin mới được vào — chứng minh DB thắng JWT claim.
    const afterSettings = await request.get(`${API_URL}/settings`, { headers: bearer(token) });
    expect(afterSettings.status()).toBe(200);
  });
});
