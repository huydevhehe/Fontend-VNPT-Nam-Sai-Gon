import { expect, test } from "@playwright/test";
import { ADMIN, AM, API_URL, apiLogin, bearer } from "./helpers";

const STAFF_PATHS = [
  "/customers",
  "/leads",
  "/contracts",
  "/commissions",
  "/territories",
  "/debts",
  "/renewals",
  "/services",
  "/tasks",
  "/staff",
  "/dashboard/stats",
  "/reports/summary",
  "/settings",
];

const ADMIN_ONLY_PATHS = new Set(["/settings"]);

test.describe("Khoá route nhân viên", () => {
  let adminToken: string;
  let amToken: string;

  test.beforeAll(async ({ request }) => {
    adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    amToken = await apiLogin(request, AM.username, AM.password);
  });

  for (const path of STAFF_PATHS) {
    test(`GET ${path} không token -> 401`, async ({ request }) => {
      const res = await request.get(`${API_URL}${path}`);
      expect(res.status()).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
    });

    test(`GET ${path} token Admin -> 200`, async ({ request }) => {
      const res = await request.get(`${API_URL}${path}`, {
        headers: bearer(adminToken),
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    const amExpected = ADMIN_ONLY_PATHS.has(path) ? 403 : 200;
    test(`GET ${path} token AM -> ${amExpected}`, async ({ request }) => {
      const res = await request.get(`${API_URL}${path}`, {
        headers: bearer(amToken),
      });
      expect(res.status()).toBe(amExpected);
    });
  }

  test("GET /health vẫn mở, không cần token", async ({ request }) => {
    const res = await request.get(`${API_URL}/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
  });

  test("POST /auth/login vẫn mở, không cần token", async ({ request }) => {
    const res = await request.post(`${API_URL}/auth/login`, {
      data: { username: ADMIN.username, password: ADMIN.password },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(typeof body.data.token).toBe("string");
  });
});
