import { expect, test } from "@playwright/test";
import { ADMIN, AM, API_URL, apiLogin, bearer } from "./helpers";

test.describe("API Cấu hình công thức KPI (Đợt 9 - Task 3)", () => {
  test.describe.configure({ mode: "serial" });

  let adminToken: string;
  let amToken: string;

  test.beforeAll(async ({ request }) => {
    adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    amToken = await apiLogin(request, AM.username, AM.password);
  });

  test("GET /kpi/formulas trả về cho mọi nhân viên (AM xem được)", async ({ request }) => {
    const res = await request.get(`${API_URL}/kpi/formulas`, {
      headers: bearer(amToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.thu_ngay).toBeTruthy();
    expect(body.data.ghtt_t).toBeTruthy();
    expect(body.data.ghtt_t1).toBeTruthy();
  });

  test("AM PUT /kpi/formulas/:key bị từ chối 403", async ({ request }) => {
    const res = await request.put(`${API_URL}/kpi/formulas/thu_ngay`, {
      headers: bearer(amToken),
      data: {
        segments: [{ from: null, fromInclusive: false, to: null, toInclusive: false, a: 0, b: 0 }],
      },
    });
    expect(res.status()).toBe(403);
  });

  test("Admin PUT bảng có khe hở → 400", async ({ request }) => {
    const res = await request.put(`${API_URL}/kpi/formulas/thu_ngay`, {
      headers: bearer(adminToken),
      data: {
        segments: [
          { from: null, fromInclusive: false, to: 0.98, toInclusive: false, a: 0, b: 1 },
          { from: 1.0, fromInclusive: true, to: null, toInclusive: false, a: 0, b: 5 },
        ],
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test("Admin PUT bảng hợp lệ → GET trả lại đúng, rồi reset về mặc định", async ({ request }) => {
    const customSegments = [
      { from: null, fromInclusive: false, to: 1.0, toInclusive: false, a: 10, b: -9 },
      { from: 1.0, fromInclusive: true, to: null, toInclusive: false, a: 0, b: 5 },
    ];

    const putRes = await request.put(`${API_URL}/kpi/formulas/ghtt_t1`, {
      headers: bearer(adminToken),
      data: { segments: customSegments },
    });
    expect(putRes.status(), await putRes.text()).toBe(200);

    const getRes = await request.get(`${API_URL}/kpi/formulas`, {
      headers: bearer(adminToken),
    });
    const getBody = await getRes.json();
    expect(getBody.data.ghtt_t1).toEqual(customSegments);

    const resetRes = await request.post(`${API_URL}/kpi/formulas/ghtt_t1/reset`, {
      headers: bearer(adminToken),
    });
    expect(resetRes.status(), await resetRes.text()).toBe(200);

    const afterReset = await request.get(`${API_URL}/kpi/formulas`, {
      headers: bearer(adminToken),
    });
    const afterResetBody = await afterReset.json();
    // Mặc định VNPT cho ghtt_t1 có khoảng giữa dùng a=22.22
    expect(afterResetBody.data.ghtt_t1.some((s: { a: number }) => s.a === 22.22)).toBe(true);
  });
});
