import { expect, test } from "@playwright/test";
import { API_URL, randomIp, registerCtv } from "./helpers";

const REGISTER_LIMIT = 10;
const REF_LIMIT = 60;

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
});
