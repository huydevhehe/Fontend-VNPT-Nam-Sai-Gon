import { expect, test } from "@playwright/test";
import { ADMIN, AM, API_URL, apiLogin, bearer } from "./helpers";

test.describe("API Quản lý Nhân viên (POST /api/staff)", () => {
  let adminToken: string;
  let amToken: string;

  test.beforeAll(async ({ request }) => {
    adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    amToken = await apiLogin(request, AM.username, AM.password);
  });

  test("admin POST thiếu password bị từ chối 400", async ({ request }) => {
    const suffix = Date.now();
    const res = await request.post(`${API_URL}/staff`, {
      headers: bearer(adminToken),
      data: {
        code: `NV-NOPASS-${suffix}`,
        name: `Nhân viên test no pass ${suffix}`,
        role: "AM",
        territory: "Phường Tân Phong",
        email: `nopass_${suffix}@vnpt.vn`,
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain("Mật khẩu phải từ 8 đến 72 ký tự");
  });

  test("admin POST đủ trường → 201, đăng nhập được bằng code/password và yêu cầu đổi mật khẩu", async ({
    request,
  }) => {
    const suffix = Date.now();
    const code = `NV-E2E-${suffix}`;
    const password = "Password@12345";

    const createRes = await request.post(`${API_URL}/staff`, {
      headers: bearer(adminToken),
      data: {
        code,
        name: `Nhân viên E2E ${suffix}`,
        role: "AM",
        territory: "Phường Tân Phong",
        email: `e2e_${suffix}@vnpt.vn`,
        password,
        mustChangePassword: true,
      },
    });

    expect(createRes.status()).toBe(201);
    const createBody = await createRes.json();
    expect(createBody.success).toBe(true);
    expect(createBody.data.code).toBe(code);
    expect(createBody.data.username).toBe(code);

    // Đăng nhập bằng code / password mới tạo
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { username: code, password },
    });
    expect(loginRes.status()).toBe(200);
    const loginBody = await loginRes.json();
    expect(loginBody.success).toBe(true);
    expect(loginBody.data.user.mustChangePassword).toBe(true);
    expect(loginBody.data.user.name).toBe(`Nhân viên E2E ${suffix}`);
    expect(loginBody.data.user.role).toBe("AM");
  });

  test("AM POST tạo nhân viên bị từ chối 403", async ({ request }) => {
    const suffix = Date.now();
    const res = await request.post(`${API_URL}/staff`, {
      headers: bearer(amToken),
      data: {
        code: `NV-AM-FORBID-${suffix}`,
        name: `Nhân viên cấm ${suffix}`,
        role: "AM",
        territory: "Phường Tân Phong",
        email: `forbid_${suffix}@vnpt.vn`,
        password: "Password@123",
      },
    });

    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
  });
});
