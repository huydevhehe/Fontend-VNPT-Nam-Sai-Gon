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
