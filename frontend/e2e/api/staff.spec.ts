import { expect, test } from "@playwright/test";
import { ADMIN, AM, API_URL, apiLogin, bearer } from "./helpers";

test.describe("API Quản lý Nhân viên (POST /api/staff)", () => {
  test.describe.configure({ mode: "serial" });

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

  test("admin đổi tên nhân viên dây chuyền cập nhật sang leads", async ({ request }) => {
    const suffix = Date.now();
    const oldName = `NV Gốc ${suffix}`;
    const newName = `NV Đổi ${suffix}`;
    const code = `NV-CASCADE-${suffix}`;

    const createStaffRes = await request.post(`${API_URL}/staff`, {
      headers: bearer(adminToken),
      data: {
        code,
        name: oldName,
        role: "AM",
        territory: "Phường Tân Phong",
        email: `cascade_${suffix}@vnpt.vn`,
        password: "Password@123",
      },
    });
    expect(createStaffRes.status()).toBe(201);
    const staffId = (await createStaffRes.json()).data.id;

    // Tạo lead gán cho nhân viên này
    const createLeadRes = await request.post(`${API_URL}/leads`, {
      headers: bearer(adminToken),
      data: {
        customerName: `KH Lead Cascade ${suffix}`,
        phone: "0909999888",
        group: "Lead KH mới",
        channel: "Online",
        staffName: oldName,
      },
    });
    expect(createLeadRes.status()).toBe(201);
    const leadId = (await createLeadRes.json()).data.id;

    // Admin đổi tên nhân viên
    const patchRes = await request.patch(`${API_URL}/staff/${staffId}`, {
      headers: bearer(adminToken),
      data: { name: newName },
    });
    expect(patchRes.status()).toBe(200);

    // Kiểm tra lead mang tên mới
    const leadsRes = await request.get(`${API_URL}/leads`, { headers: bearer(adminToken) });
    expect(leadsRes.status()).toBe(200);
    const leadsList: Array<{ id: string; staffName: string }> = (await leadsRes.json()).data;
    const targetLead = leadsList.find((l) => l.id === leadId);
    expect(targetLead).toBeDefined();
    expect(targetLead?.staffName).toBe(newName);
  });

  test("AM gọi PATCH /api/staff/:id/password bị từ chối 403", async ({ request }) => {
    const suffix = Date.now();
    const createStaffRes = await request.post(`${API_URL}/staff`, {
      headers: bearer(adminToken),
      data: {
        code: `NV-PW-AM-${suffix}`,
        name: `NV Pass AM ${suffix}`,
        role: "AM",
        territory: "Phường Tân Phong",
        email: `pw_am_${suffix}@vnpt.vn`,
        password: "Password@123",
      },
    });
    expect(createStaffRes.status()).toBe(201);
    const staffId = (await createStaffRes.json()).data.id;

    const res = await request.patch(`${API_URL}/staff/${staffId}/password`, {
      headers: bearer(amToken),
      data: { password: "NewPassword@456" },
    });
    expect(res.status()).toBe(403);
  });

  test("admin gọi PATCH /api/staff/:id/password → 200, nhân viên đăng nhập được bằng mật khẩu mới", async ({
    request,
  }) => {
    const suffix = Date.now();
    const code = `NV-RST-API-${suffix}`;
    const oldPassword = "OldPassword@123";
    const newPassword = "NewSecretPassword@456";

    const createStaffRes = await request.post(`${API_URL}/staff`, {
      headers: bearer(adminToken),
      data: {
        code,
        name: `NV Reset API ${suffix}`,
        role: "AM",
        territory: "Phường Tân Phong",
        email: `rst_api_${suffix}@vnpt.vn`,
        password: oldPassword,
      },
    });
    expect(createStaffRes.status()).toBe(201);
    const staffId = (await createStaffRes.json()).data.id;

    // Reset password
    const resetRes = await request.patch(`${API_URL}/staff/${staffId}/password`, {
      headers: bearer(adminToken),
      data: { password: newPassword, mustChangePassword: true },
    });
    expect(resetRes.status()).toBe(200);

    // Mật khẩu cũ không đăng nhập được nữa
    const oldLogin = await request.post(`${API_URL}/auth/login`, {
      data: { username: code, password: oldPassword },
    });
    expect(oldLogin.status()).toBe(401);

    // Mật khẩu mới đăng nhập thành công và cờ mustChangePassword = true
    const newLogin = await request.post(`${API_URL}/auth/login`, {
      data: { username: code, password: newPassword },
    });
    expect(newLogin.status()).toBe(200);
    const body = await newLogin.json();
    expect(body.data.user.mustChangePassword).toBe(true);
  });

  test("đăng nhập bằng NV test lấy token → admin đình chỉ → token cũ trả 401; admin mở lại → đăng nhập lại được", async ({
    request,
  }) => {
    const suffix = Date.now();
    const code = `NV-STAT-${suffix}`;
    const password = "Password@123";

    const createStaffRes = await request.post(`${API_URL}/staff`, {
      headers: bearer(adminToken),
      data: {
        code,
        name: `NV Status Test ${suffix}`,
        role: "AM",
        territory: "Phường Tân Phong",
        email: `stat_${suffix}@vnpt.vn`,
        password,
      },
    });
    expect(createStaffRes.status()).toBe(201);
    const staffId = (await createStaffRes.json()).data.id;

    // Staff đăng nhập lấy token
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { username: code, password },
    });
    expect(loginRes.status()).toBe(200);
    const staffToken = (await loginRes.json()).data.token;

    // Token hợp lệ
    const meBefore = await request.get(`${API_URL}/auth/me`, {
      headers: bearer(staffToken),
    });
    expect(meBefore.status()).toBe(200);

    // Admin đình chỉ nhân viên
    const suspendRes = await request.patch(`${API_URL}/staff/${staffId}/status`, {
      headers: bearer(adminToken),
      data: { status: "Đình chỉ", reason: "Tạm đình chỉ công tác để thanh tra" },
    });
    expect(suspendRes.status()).toBe(200);

    // Request kế tiếp bằng token cũ bị từ chối 401
    const meAfter = await request.get(`${API_URL}/auth/me`, {
      headers: bearer(staffToken),
    });
    expect(meAfter.status()).toBe(401);

    // Đăng nhập lại bị 403
    const loginBlocked = await request.post(`${API_URL}/auth/login`, {
      data: { username: code, password },
    });
    expect(loginBlocked.status()).toBe(403);

    // GET /api/staff?status=active không chứa nhân viên bị đình chỉ
    const activeStaffRes = await request.get(`${API_URL}/staff?status=active`, {
      headers: bearer(adminToken),
    });
    expect(activeStaffRes.status()).toBe(200);
    const activeList: Array<{ id: string; status: string }> = (await activeStaffRes.json()).data;
    expect(activeList.some((s) => s.id === staffId)).toBe(false);

    // Admin mở lại nhân viên
    const reactivateRes = await request.patch(`${API_URL}/staff/${staffId}/status`, {
      headers: bearer(adminToken),
      data: { status: "Đang hoạt động" },
    });
    expect(reactivateRes.status()).toBe(200);

    // Đăng nhập lại được với mật khẩu cũ
    const loginRestored = await request.post(`${API_URL}/auth/login`, {
      data: { username: code, password },
    });
    expect(loginRestored.status()).toBe(200);
  });

  test("AM gọi PATCH /api/staff/:id/status bị từ chối 403", async ({ request }) => {
    const suffix = Date.now();
    const createStaffRes = await request.post(`${API_URL}/staff`, {
      headers: bearer(adminToken),
      data: {
        code: `NV-STAT-AM-${suffix}`,
        name: `NV Status AM ${suffix}`,
        role: "AM",
        territory: "Phường Tân Phong",
        email: `stat_am_${suffix}@vnpt.vn`,
        password: "Password@123",
      },
    });
    expect(createStaffRes.status()).toBe(201);
    const staffId = (await createStaffRes.json()).data.id;

    const res = await request.patch(`${API_URL}/staff/${staffId}/status`, {
      headers: bearer(amToken),
      data: { status: "Đình chỉ", reason: "AM không có quyền" },
    });
    expect(res.status()).toBe(403);
  });

  test("DELETE /api/staff/:id trả về 404 (không hỗ trợ xóa cứng)", async ({ request }) => {
    const res = await request.delete(`${API_URL}/staff/fake-id-123`, {
      headers: bearer(adminToken),
    });
    expect(res.status()).toBe(404);
  });
});
