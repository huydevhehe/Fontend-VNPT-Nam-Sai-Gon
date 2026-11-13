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

/** Tên nhân viên gắn với tài khoản AM test (xem 00-tong-quan.md mục 3). */
const AM_STAFF_NAME = "Nguyễn Thị Tình";
/** Tháng cố định, xa thực tế để không lẫn với dữ liệu nghiệp vụ thật. */
const TEST_MONTH = "2031-07";

test.describe("API Chỉ tiêu & % thực hiện KPI (Đợt 9 - Task 4)", () => {
  test.describe.configure({ mode: "serial" });

  let adminToken: string;
  let amToken: string;

  test.beforeAll(async ({ request }) => {
    adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    amToken = await apiLogin(request, AM.username, AM.password);
  });

  test("AM PUT /kpi/targets/:month bị từ chối 403", async ({ request }) => {
    const res = await request.put(`${API_URL}/kpi/targets/${TEST_MONTH}`, {
      headers: bearer(amToken),
      data: { items: [{ staffName: AM_STAFF_NAME, kpiKey: "thu_ngay", targetRate: 1.0 }] },
    });
    expect(res.status()).toBe(403);
  });

  test("Admin PUT /kpi/targets/:month lưu chỉ tiêu thu_ngay 100% cho AM test", async ({ request }) => {
    const res = await request.put(`${API_URL}/kpi/targets/${TEST_MONTH}`, {
      headers: bearer(adminToken),
      data: { items: [{ staffName: AM_STAFF_NAME, kpiKey: "thu_ngay", targetRate: 1.0 }] },
    });
    expect(res.status(), await res.text()).toBe(200);
  });

  test("AM GET /kpi/targets/:month chỉ thấy chỉ tiêu của chính mình", async ({ request }) => {
    const res = await request.get(`${API_URL}/kpi/targets/${TEST_MONTH}`, {
      headers: bearer(amToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    for (const item of body.data) {
      expect(item.staffName.trim()).toBe(AM_STAFF_NAME);
    }
    expect(body.data.some((item: { kpiKey: string }) => item.kpiKey === "thu_ngay")).toBe(true);
  });

  test("AM GET /kpi/performance chỉ có 1 dòng của chính mình với chỉ tiêu vừa lưu", async ({ request }) => {
    const res = await request.get(`${API_URL}/kpi/performance?month=${TEST_MONTH}`, {
      headers: bearer(amToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.length).toBe(1);
    expect(body.data[0].staffName).toBe(AM_STAFF_NAME);
    expect(body.data[0].thuNgay.targetRate).toBe(1.0);
  });

  test("Admin GET /kpi/performance thấy đầy đủ, bao gồm dòng AM test", async ({ request }) => {
    const res = await request.get(`${API_URL}/kpi/performance?month=${TEST_MONTH}`, {
      headers: bearer(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const row = body.data.find((r: { staffName: string }) => r.staffName === AM_STAFF_NAME);
    expect(row).toBeTruthy();
    expect(row.thuNgay.targetRate).toBe(1.0);
  });
});
