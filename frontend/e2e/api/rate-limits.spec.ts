import { expect, test } from "@playwright/test";
import { ADMIN, API_URL, apiLogin, randomIp, registerCtv } from "./helpers";

const REGISTER_LIMIT = 10;
const REF_LIMIT = 60;
const LOGIN_LIMIT = 10;

test.describe("Giới hạn tần suất theo IP", () => {
  test("đăng ký CTV: quá 10 lần/giờ từ một IP -> 429, IP khác không bị ảnh hưởng", async ({ request }) => {
    const ip = randomIp();
    for (let i = 0; i < REGISTER_LIMIT; i += 1) {
      // Payload sai (tên quá ngắn) vẫn tính vào hạn mức của IP.
      const { res } = await registerCtv(request, { name: "A" }, ip);
      expect(res.status(), `lần ${i + 1}`).toBe(400);
    }
    const blocked = await registerCtv(request, { name: "A" }, ip);
    expect(blocked.res.status()).toBe(429);
    const body = await blocked.res.json();
    expect(body.success).toBe(false);
    expect(typeof body.message).toBe("string");

    const other = await registerCtv(request, {}, randomIp());
    expect(other.res.status()).toBe(201);
  });

  test("tra mã giới thiệu: quá 60 lần/10 phút từ một IP -> 429, IP khác không bị ảnh hưởng", async ({ request }) => {
    const ip = randomIp();
    const lookup = (from: string) =>
      request.get(`${API_URL}/public/ref/KHONGTONTAI`, { headers: { "X-Forwarded-For": from } });

    for (let i = 0; i < REF_LIMIT; i += 1) {
      expect((await lookup(ip)).status(), `lần ${i + 1}`).toBe(200);
    }
    const blocked = await lookup(ip);
    expect(blocked.status()).toBe(429);
    expect((await blocked.json()).success).toBe(false);

    expect((await lookup(randomIp())).status()).toBe(200);
  });

  test("đăng nhập: quá 10 lần/15 phút từ một IP -> 429, IP khác và đăng nhập đúng không bị ảnh hưởng", async ({
    request,
  }) => {
    const ip = randomIp();
    const login = (from: string) =>
      request.post(`${API_URL}/auth/login`, {
        data: { username: "khong-ton-tai", password: "sai" },
        headers: { "X-Forwarded-For": from },
      });

    for (let i = 0; i < LOGIN_LIMIT; i += 1) {
      expect((await login(ip)).status(), `lần ${i + 1}`).toBe(401);
    }
    const blocked = await login(ip);
    expect(blocked.status()).toBe(429);
    const body = await blocked.json();
    expect(body.success).toBe(false);
    expect(typeof body.message).toBe("string");

    // IP khác không bị ảnh hưởng.
    expect((await login(randomIp())).status()).toBe(401);

    // Đăng nhập admin hợp lệ từ IP khác vẫn hoạt động bình thường.
    await apiLogin(request, ADMIN.username, ADMIN.password);
  });
});
