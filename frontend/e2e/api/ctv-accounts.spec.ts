import { expect, test, type APIRequestContext } from "@playwright/test";
import {
  ADMIN,
  AM,
  API_URL,
  apiLogin,
  bearer,
  createApprovedCtv,
  registerCtv,
} from "./helpers";

async function findAccount(
  request: APIRequestContext,
  adminToken: string,
  username: string,
  status?: string
) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  const res = await request.get(`${API_URL}/ctv-accounts${qs}`, { headers: bearer(adminToken) });
  expect(res.status()).toBe(200);
  const list: Array<Record<string, any>> = (await res.json()).data;
  return list.find((a) => a.username === username);
}

async function rawLogin(request: APIRequestContext, username: string, password: string) {
  return request.post(`${API_URL}/auth/login`, { data: { username, password } });
}

test.describe("Đăng ký, duyệt và đăng nhập CTV (API)", () => {
  test("đăng ký hợp lệ trả 201, không trả token; đăng nhập ngay bị 403 chờ duyệt", async ({ request }) => {
    const { res, payload } = await registerCtv(request);
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(typeof body.data.message).toBe("string");
    expect(body.data.token).toBeUndefined();

    const login = await rawLogin(request, payload.username, payload.password);
    expect(login.status()).toBe(403);
    expect((await login.json()).message).toBe("Tài khoản đang chờ Admin duyệt");
  });

  test("sai mật khẩu của tài khoản chờ duyệt vẫn trả 401 (không lộ trạng thái)", async ({ request }) => {
    const { res, payload } = await registerCtv(request);
    expect(res.status()).toBe(201);

    const login = await rawLogin(request, payload.username, "Sai-mat-khau-1");
    expect(login.status()).toBe(401);
    expect((await login.json()).message).toBe("Tên đăng nhập hoặc mật khẩu không đúng");
  });

  test("username trùng trả 409; số điện thoại trùng trả 409", async ({ request }) => {
    const { res, payload } = await registerCtv(request);
    expect(res.status()).toBe(201);

    const dupUser = await registerCtv(request, { username: payload.username });
    expect(dupUser.res.status()).toBe(409);

    const dupPhone = await registerCtv(request, { phone: payload.phone });
    expect(dupPhone.res.status()).toBe(409);
  });

  test("dữ liệu sai định dạng trả 400", async ({ request }) => {
    expect((await registerCtv(request, { phone: "12345" })).res.status()).toBe(400);
    expect((await registerCtv(request, { phone: "1234567890" })).res.status()).toBe(400);
    expect((await registerCtv(request, { password: "short" })).res.status()).toBe(400);
    expect((await registerCtv(request, { username: "ab" })).res.status()).toBe(400);
    expect((await registerCtv(request, { username: "bad name!" })).res.status()).toBe(400);
    expect((await registerCtv(request, { name: "A" })).res.status()).toBe(400);
  });

  test("Admin duyệt: đăng nhập OK, token role CTV, /auth/me đúng, danh sách không lộ mật khẩu", async ({ request }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    const { res, payload } = await registerCtv(request);
    expect(res.status()).toBe(201);

    const pending = await findAccount(request, adminToken, payload.username, "Chờ duyệt");
    expect(pending).toBeTruthy();
    expect(pending!.status).toBe("Chờ duyệt");
    expect(pending!.referralCode).toMatch(/^CTV[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
    expect(pending!.password_hash).toBeUndefined();
    expect(pending!.passwordHash).toBeUndefined();

    const approve = await request.patch(`${API_URL}/ctv-accounts/${pending!.id}/approve`, {
      headers: bearer(adminToken),
    });
    expect(approve.status()).toBe(200);
    const approved = (await approve.json()).data;
    expect(approved.status).toBe("Đang hoạt động");
    expect(approved.approvedAt).toBeTruthy();

    const login = await rawLogin(request, payload.username, payload.password);
    expect(login.status()).toBe(200);
    const { token, user } = (await login.json()).data;
    expect(user.role).toBe("CTV");

    const claims = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    expect(claims.role).toBe("CTV");

    const me = await request.get(`${API_URL}/auth/me`, { headers: bearer(token) });
    expect(me.status()).toBe(200);
    const meBody = (await me.json()).data;
    expect(meBody.role).toBe("CTV");
    expect(meBody.id).toBe(pending!.id);
  });

  test("Admin từ chối: đăng nhập 403 'chưa được duyệt'", async ({ request }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    const { res, payload } = await registerCtv(request);
    expect(res.status()).toBe(201);
    const account = await findAccount(request, adminToken, payload.username);

    const reject = await request.patch(`${API_URL}/ctv-accounts/${account!.id}/reject`, {
      headers: bearer(adminToken),
    });
    expect(reject.status()).toBe(200);
    expect((await reject.json()).data.status).toBe("Từ chối");

    const login = await rawLogin(request, payload.username, payload.password);
    expect(login.status()).toBe(403);
    expect((await login.json()).message).toBe("Đăng ký cộng tác viên chưa được duyệt");

    const wrong = await rawLogin(request, payload.username, "Sai-mat-khau-1");
    expect(wrong.status()).toBe(401);
  });

  test("id không phải CTV trả 404; AM và token CTV gọi approve bị 403", async ({ request }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    const amToken = await apiLogin(request, AM.username, AM.password);
    const ctv = await createApprovedCtv(request, adminToken);

    const notCtv = await request.patch(`${API_URL}/ctv-accounts/USR-ADMIN/approve`, {
      headers: bearer(adminToken),
    });
    expect(notCtv.status()).toBe(404);

    const missing = await request.patch(`${API_URL}/ctv-accounts/USR-CTV-0/reject`, {
      headers: bearer(adminToken),
    });
    expect(missing.status()).toBe(404);

    const byAm = await request.patch(`${API_URL}/ctv-accounts/${ctv.id}/approve`, {
      headers: bearer(amToken),
    });
    expect(byAm.status()).toBe(403);

    const byCtv = await request.patch(`${API_URL}/ctv-accounts/${ctv.id}/approve`, {
      headers: bearer(ctv.token),
    });
    expect(byCtv.status()).toBe(403);

    const listByCtv = await request.get(`${API_URL}/ctv-accounts`, { headers: bearer(ctv.token) });
    expect(listByCtv.status()).toBe(403);
  });

  test("danh sách chỉ gồm CTV, lọc theo trạng thái", async ({ request }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    const ctv = await createApprovedCtv(request, adminToken);

    const res = await request.get(`${API_URL}/ctv-accounts`, { headers: bearer(adminToken) });
    expect(res.status()).toBe(200);
    const list: Array<Record<string, any>> = (await res.json()).data;
    expect(list.some((a) => a.id === ctv.id)).toBe(true);
    expect(list.some((a) => a.username === "admin")).toBe(false);

    const pendingOnly = await request.get(
      `${API_URL}/ctv-accounts?status=${encodeURIComponent("Chờ duyệt")}`,
      { headers: bearer(adminToken) }
    );
    const pendingList: Array<Record<string, any>> = (await pendingOnly.json()).data;
    expect(pendingList.every((a) => a.status === "Chờ duyệt")).toBe(true);
    expect(pendingList.some((a) => a.id === ctv.id)).toBe(false);
  });
});

test.describe("Admin tạo nhân viên có tài khoản đăng nhập (API)", () => {
  test("tạo staff mới với password hợp lệ: đăng nhập thành công", async ({ request }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    const code = `NV-T4-${Date.now()}`;
    const password = "Matkhau@HopLe1";

    const res = await request.post(`${API_URL}/staff`, {
      headers: bearer(adminToken),
      data: {
        code,
        name: "NV T4 Mặc định",
        role: "AM",
        territory: "Khu vực T4",
        email: `${code.toLowerCase()}@example.com`,
        password,
      },
    });
    expect(res.status()).toBe(201);
    const body = (await res.json()).data;
    expect(body.code).toBe(code);

    const login = await rawLogin(request, code, password);
    expect(login.status()).toBe(200);
    const user = (await login.json()).data.user;
    expect(user.role).toBe("AM");
    expect(user.name).toBe("NV T4 Mặc định");
  });

  test("tạo staff thiếu password hoặc quá ngắn: trả về 400", async ({ request }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    const code = `NV-T4S-${Date.now()}`;
    const resNoPass = await request.post(`${API_URL}/staff`, {
      headers: bearer(adminToken),
      data: {
        code,
        name: "NV Thiếu Pass",
        role: "AM",
        territory: "Khu vực T4",
        email: `${code.toLowerCase()}@example.com`,
      },
    });
    expect(resNoPass.status()).toBe(400);

    const resShort = await request.post(`${API_URL}/staff`, {
      headers: bearer(adminToken),
      data: {
        code: `${code}-2`,
        name: "NV Pass Ngắn",
        role: "AM",
        territory: "Khu vực T4",
        email: `${code.toLowerCase()}2@example.com`,
        password: "abc",
      },
    });
    expect(resShort.status()).toBe(400);
  });

  test("trùng username trong users trả 409 và không tạo staff", async ({ request }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    const { res, payload } = await registerCtv(request);
    expect(res.status()).toBe(201);

    const dup = await request.post(`${API_URL}/staff`, {
      headers: bearer(adminToken),
      data: {
        code: payload.username,
        name: "NV Trùng",
        role: "AM",
        territory: "Khu vực T4",
        email: "dup@example.com",
        password: "Matkhau@Dup123",
      },
    });
    expect(dup.status()).toBe(409);

    const list = await request.get(`${API_URL}/staff`, { headers: bearer(adminToken) });
    const staff: Array<{ code: string }> = (await list.json()).data;
    expect(staff.some((s) => s.code === payload.username)).toBe(false);
  });

  test("AM tạo staff bị 403", async ({ request }) => {
    const amToken = await apiLogin(request, AM.username, AM.password);
    const res = await request.post(`${API_URL}/staff`, {
      headers: bearer(amToken),
      data: {
        code: `NV-T4A-${Date.now()}`,
        name: "NV AM tạo",
        role: "AM",
        territory: "Khu vực T4",
        email: "am@example.com",
        password: "Matkhau@Am123",
      },
    });
    expect(res.status()).toBe(403);
  });

  test("chuyển staff sang Ngừng hoạt động thì đăng nhập bị 403, bật lại thì vào được; vai trò và tên đồng bộ", async ({ request }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    const code = `NV-T4D-${Date.now()}`;
    const password = "Matkhau@DongBo1";
    const initialName = `NV T4 Ngừng ${code}`;
    const updatedName = `NV T4 Đổi tên ${code}`;

    const created = await request.post(`${API_URL}/staff`, {
      headers: bearer(adminToken),
      data: {
        code,
        name: initialName,
        role: "AM",
        territory: "Khu vực T4",
        email: `${code.toLowerCase()}@example.com`,
        password,
      },
    });
    expect(created.status()).toBe(201);
    const staff = (await created.json()).data;

    const off = await request.patch(`${API_URL}/staff/${staff.id}/status`, {
      headers: bearer(adminToken),
      data: { status: "Ngừng hoạt động", reason: "Ngừng hoạt động để test" },
    });
    expect(off.status()).toBe(200);

    const blocked = await rawLogin(request, code, password);
    expect(blocked.status()).toBe(403);
    // sai mật khẩu vẫn 401, không lộ trạng thái
    expect((await rawLogin(request, code, "Sai-mat-khau-1")).status()).toBe(401);

    const on = await request.patch(`${API_URL}/staff/${staff.id}/status`, {
      headers: bearer(adminToken),
      data: { status: "Đang hoạt động" },
    });
    expect(on.status()).toBe(200);

    const rename = await request.patch(`${API_URL}/staff/${staff.id}`, {
      headers: bearer(adminToken),
      data: { role: "AM Bán chăm", name: updatedName },
    });
    expect(rename.status()).toBe(200);

    const ok = await rawLogin(request, code, password);
    expect(ok.status()).toBe(200);
    const user = (await ok.json()).data.user;
    expect(user.role).toBe("AM Bán chăm");
    expect(user.name).toBe(updatedName);
  });

  test("admin tạo trực tiếp CTV → 201, CTV đăng nhập được ngay (không cần duyệt) và bắt buộc đổi mật khẩu", async ({
    request,
  }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    const suffix = Date.now();
    const username = `ctv_direct_${suffix}`;
    const password = "DirectPassword@123";
    const phone = `09${String(suffix).slice(-8)}`;

    const createRes = await request.post(`${API_URL}/ctv-accounts`, {
      headers: bearer(adminToken),
      data: {
        username,
        password,
        name: `CTV Tạo Trực Tiếp ${suffix}`,
        phone,
        email: `direct_${suffix}@vnpt.vn`,
        mustChangePassword: true,
      },
    });
    expect(createRes.status()).toBe(201);
    const created = (await createRes.json()).data;
    expect(created.username).toBe(username);
    expect(created.status).toBe("Đang hoạt động");
    expect(created.referralCode).toBeTruthy();

    // CTV đăng nhập được ngay mà không cần qua duyệt
    const loginRes = await rawLogin(request, username, password);
    expect(loginRes.status()).toBe(200);
    const loginData = (await loginRes.json()).data;
    expect(loginData.user.role).toBe("CTV");
    expect(loginData.user.mustChangePassword).toBe(true);

    // AM gọi POST /api/ctv-accounts bị từ chối 403
    const amToken = await apiLogin(request, AM.username, AM.password);
    const amRes = await request.post(`${API_URL}/ctv-accounts`, {
      headers: bearer(amToken),
      data: {
        username: `ctv_am_forbid_${suffix}`,
        password: "Password@123",
        name: "CTV AM Forbid",
        phone: `08${String(suffix).slice(-8)}`,
      },
    });
    expect(amRes.status()).toBe(403);
  });
});
