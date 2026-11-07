import { expect, type APIRequestContext } from "@playwright/test";

export const API_URL = process.env.E2E_API_URL || "http://localhost:8099/api";

export const ADMIN = { username: "admin", password: "admin@Vnpt2026" };
export const AM = { username: "VNPT-AM-01", password: "VNPT-AM-01@Vnpt2026" };

/** Đăng nhập qua API thật và trả về JWT; ném lỗi nếu không phải 200. */
export async function apiLogin(
  request: APIRequestContext,
  username: string,
  password: string
): Promise<string> {
  const res = await request.post(`${API_URL}/auth/login`, {
    data: { username, password },
  });
  expect(res.status(), `Đăng nhập ${username} phải trả 200`).toBe(200);
  const body = await res.json();
  const token = body?.data?.token;
  if (typeof token !== "string" || !token) {
    throw new Error(`Đăng nhập ${username} không trả về token`);
  }
  return token;
}

export function bearer(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
