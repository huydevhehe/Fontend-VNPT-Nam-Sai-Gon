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

  test("đăng nhập: quá 10 lần/15 phút với CÙNG username từ một IP -> 429, username/IP khác và đăng nhập đúng không bị ảnh hưởng", async ({
    request,
  }) => {
    const ip = randomIp();
    const login = (from: string, username: string) =>
      request.post(`${API_URL}/auth/login`, {
        data: { username, password: "sai" },
        headers: { "X-Forwarded-For": from },
      });

    // Key theo (IP, username): nhiều username KHÁC NHAU từ cùng một IP (mạng
    // văn phòng dùng NAT, hoặc nhiều nhân viên đăng nhập cùng lúc) không được
    // tính chung vào một hạn mức — mỗi username vẫn được 401 bình thường.
    for (let i = 0; i < LOGIN_LIMIT + 5; i += 1) {
      expect((await login(ip, `khong-ton-tai-${i}`)).status(), `username khác #${i + 1}`).toBe(401);
    }

    // Brute-force nhắm vào ĐÚNG MỘT username từ cùng IP đó: sau đúng
    // LOGIN_LIMIT lần vẫn 401, lần thứ LOGIN_LIMIT + 1 mới bị 429 — không bị
    // ảnh hưởng bởi các username khác đã gọi ở trên (key khác nhau).
    const targetUsername = "khong-ton-tai-target";
    for (let i = 0; i < LOGIN_LIMIT; i += 1) {
      expect((await login(ip, targetUsername)).status(), `username target lần ${i + 1}`).toBe(401);
    }
    const blocked = await login(ip, targetUsername);
    expect(blocked.status()).toBe(429);
    const body = await blocked.json();
    expect(body.success).toBe(false);
    expect(typeof body.message).toBe("string");

    // Cùng IP, username khác target (chưa chạm hạn mức riêng) vẫn 401 bình thường.
    expect((await login(ip, "khong-ton-tai-chua-bi-chan")).status()).toBe(401);

    // IP khác, cùng target username, không bị ảnh hưởng.
    expect((await login(randomIp(), targetUsername)).status()).toBe(401);

    // Đăng nhập admin hợp lệ từ IP khác vẫn hoạt động bình thường.
    await apiLogin(request, ADMIN.username, ADMIN.password);
  });
});
