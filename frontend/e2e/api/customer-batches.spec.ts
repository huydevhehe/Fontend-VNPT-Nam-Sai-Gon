import { expect, test } from "@playwright/test";
import { ADMIN, AM, API_URL, apiLogin, bearer } from "./helpers";

test.describe("API Nhập đợt KHDN-chăm (POST /api/customers/batches)", () => {
  let adminToken: string;
  let amToken: string;

  test.beforeAll(async ({ request }) => {
    adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    amToken = await apiLogin(request, AM.username, AM.password);
  });

  test("AM không có quyền gọi API nhập đợt, nhận lỗi 403", async ({ request }) => {
    const res = await request.post(`${API_URL}/customers/batches`, {
      headers: bearer(amToken),
      data: {
        territoryId: "TB-01",
        amCaringStaff: "Nguyễn Thị Tình",
        handoverBatch: "DOT-TEST-403",
        mode: "append",
        customers: [{ name: "Công ty Test 403", identityCode: "MST-403" }],
      },
    });

    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test("Admin gọi API nhập đợt thành công với mode 'append'", async ({ request }) => {
    const suffix = Date.now();
    const batchCode = `DOT-E2E-${suffix}`;
    const mst = `MST-BATCH-${suffix}`;

    const res = await request.post(`${API_URL}/customers/batches`, {
      headers: bearer(adminToken),
      data: {
        territoryId: "TB-02",
        amCaringStaff: "Nguyễn Thị Huyền Trang",
        handoverBatch: batchCode,
        mode: "append",
        customers: [
          {
            name: `Công ty E2E Append ${suffix}`,
            identityCode: mst,
            phone: `09${String(suffix).slice(-8)}`,
            address: "123 Đường Test, Phường Tân Mỹ",
            services: "Internet Cáp quang",
          },
        ],
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.createdCount).toBe(1);

    // Xác nhận khách hàng đã xuất hiện trên hệ thống
    const listRes = await request.get(`${API_URL}/customers?search=${mst}`, {
      headers: bearer(adminToken),
    });
    const listBody = await listRes.json();
    const rows = listBody.data as Array<{ identity_code?: string; am_caring_staff?: string; handover_batch?: string }>;
    const found = rows.find((c) => c.identity_code === mst);
    expect(found).toBeTruthy();
    expect(found?.am_caring_staff).toBe("Nguyễn Thị Huyền Trang");
    expect(found?.handover_batch).toBe(batchCode);
  });

  test("Admin gọi API nhập đợt với mode 'replace' gỡ chăm sóc của khách không có trong đợt", async ({
    request,
  }) => {
    const suffix = Date.now();
    const mst1 = `MST-REP1-${suffix}`;
    const mst2 = `MST-REP2-${suffix}`;

    // Đợt 1: Thêm khách 1
    const res1 = await request.post(`${API_URL}/customers/batches`, {
      headers: bearer(adminToken),
      data: {
        territoryId: "TB-03",
        amCaringStaff: "Nguyễn Đức Tiến",
        handoverBatch: `DOT-1-${suffix}`,
        mode: "append",
        customers: [{ name: `Khách 1 ${suffix}`, identityCode: mst1 }],
      },
    });
    expect(res1.status()).toBe(200);

    // Đợt 2: Thay thế toàn bộ bằng khách 2
    const res2 = await request.post(`${API_URL}/customers/batches`, {
      headers: bearer(adminToken),
      data: {
        territoryId: "TB-03",
        amCaringStaff: "Nguyễn Đức Tiến",
        handoverBatch: `DOT-2-${suffix}`,
        mode: "replace",
        customers: [{ name: `Khách 2 ${suffix}`, identityCode: mst2 }],
      },
    });
    expect(res2.status()).toBe(200);
    const body2 = await res2.json();
    expect(body2.success).toBe(true);
    expect(body2.data.clearedCount).toBeGreaterThanOrEqual(1);

    // Kiểm tra khách 1 đã bị gỡ am_caring_staff về null
    const listRes = await request.get(`${API_URL}/customers?search=${mst1}`, {
      headers: bearer(adminToken),
    });
    const listBody = await listRes.json();
    const rows1 = listBody.data as Array<{ identity_code?: string; am_caring_staff?: string }>;
    const found1 = rows1.find((c) => c.identity_code === mst1);
    expect(found1).toBeTruthy();
    expect(found1?.am_caring_staff).toBeFalsy();
  });

  test("Thiếu các trường bắt buộc trả về 400", async ({ request }) => {
    const res = await request.post(`${API_URL}/customers/batches`, {
      headers: bearer(adminToken),
      data: {
        territoryId: "",
        amCaringStaff: "",
      },
    });
    expect(res.status()).toBe(400);
  });
});
