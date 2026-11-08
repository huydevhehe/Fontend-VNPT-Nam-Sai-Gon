import { expect, test, type APIRequestContext } from "@playwright/test";
import { ADMIN, API_URL, apiLogin, bearer } from "./helpers";

const STAFF_OLD = "Nguyễn Thị Tình";
const STAFF_NEW = "Phạm Thanh Hà";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

test.describe("API khách hàng PTM / KHDN chăm", () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await apiLogin(request, ADMIN.username, ADMIN.password);
  });

  async function createCustomer(
    request: APIRequestContext,
    customerGroup: string,
    suffix: string
  ) {
    return request.post(`${API_URL}/customers`, {
      headers: bearer(token),
      data: {
        name: `KH API ${suffix}`,
        type: "Doanh nghiệp",
        customerGroup,
        amStaff: STAFF_OLD,
      },
    });
  }

  async function findCustomer(request: APIRequestContext, id: string) {
    const res = await request.get(`${API_URL}/customers`, { headers: bearer(token) });
    const body = await res.json();
    return (body.data as any[]).find((c) => c.id === id);
  }

  // Ghi chú: điều chuyển AM bán hàng (/transfer) và AM chăm sóc
  // (/transfer-caring) giờ là 2 API độc lập (không còn tự động theo nhóm KH
  // qua 1 API gộp) — FE quyết định nút nào hiện theo nhóm KH, test ở đây gọi
  // đúng API cho từng vai trò.
  test("đổi AM chăm sóc không ảnh hưởng AM bán hàng (KH Tự phát triển)", async ({
    request,
  }) => {
    const created = await createCustomer(request, "Tự phát triển", `PTM-${Date.now()}`);
    expect(created.status()).toBe(201);
    const id = (await created.json()).data.id;

    const res = await request.patch(`${API_URL}/customers/${id}/transfer-caring`, {
      headers: bearer(token),
      data: { newCaringStaff: STAFF_NEW },
    });
    expect(res.status()).toBe(200);

    const row = await findCustomer(request, id);
    expect(row.am_staff).toBe(STAFF_OLD);
    expect(row.am_caring_staff).toBe(STAFF_NEW);
  });

  test("đổi AM chăm sóc KH Tập hiện hữu kèm đợt giao ghi đúng đợt + ngày giao", async ({
    request,
  }) => {
    const created = await createCustomer(request, "Tập hiện hữu", `KHDN-${Date.now()}`);
    expect(created.status()).toBe(201);
    const id = (await created.json()).data.id;
    const batch = `DOT-${Date.now()}`;

    const res = await request.patch(`${API_URL}/customers/${id}/transfer-caring`, {
      headers: bearer(token),
      data: { newCaringStaff: STAFF_NEW, handoverBatch: batch },
    });
    expect(res.status()).toBe(200);

    const row = await findCustomer(request, id);
    expect(row.am_caring_staff).toBe(STAFF_NEW);
    expect(row.handover_batch).toBe(batch);
    expect(row.handover_date).toBe(today());
  });

  test("đổi AM bán hàng (sales AM) không ảnh hưởng AM chăm sóc", async ({ request }) => {
    const created = await createCustomer(request, "Tập hiện hữu", `SALES-${Date.now()}`);
    expect(created.status()).toBe(201);
    const id = (await created.json()).data.id;

    const res = await request.patch(`${API_URL}/customers/${id}/transfer`, {
      headers: bearer(token),
      data: { newStaff: STAFF_NEW },
    });
    expect(res.status()).toBe(200);

    const row = await findCustomer(request, id);
    expect(row.am_staff).toBe(STAFF_NEW);
    expect(row.am_caring_staff).toBe(STAFF_OLD);
  });

  test("tạo KH kèm handoverBatch lưu đợt giao và ngày giao", async ({ request }) => {
    const batch = `DOT-NEW-${Date.now()}`;
    const res = await request.post(`${API_URL}/customers`, {
      headers: bearer(token),
      data: {
        name: `KH API batch ${Date.now()}`,
        type: "Doanh nghiệp",
        customerGroup: "Tập hiện hữu",
        handoverBatch: batch,
      },
    });
    expect(res.status()).toBe(201);
    const data = (await res.json()).data;
    expect(data.handover_batch).toBe(batch);
    expect(data.handover_date).toBe(today());
  });

  test("điều chuyển KH không tồn tại trả 404", async ({ request }) => {
    const res = await request.patch(`${API_URL}/customers/KH-KHONG-TON-TAI/transfer`, {
      headers: bearer(token),
      data: { newStaff: STAFF_NEW },
    });
    expect(res.status()).toBe(404);
    expect((await res.json()).success).toBe(false);
  });

  test("điều chuyển với newStaff rỗng hoặc không có trong bảng staff trả 400", async ({
    request,
  }) => {
    const created = await createCustomer(request, "Tự phát triển", `BAD-${Date.now()}`);
    const id = (await created.json()).data.id;

    const empty = await request.patch(`${API_URL}/customers/${id}/transfer`, {
      headers: bearer(token),
      data: { newStaff: "   " },
    });
    expect(empty.status()).toBe(400);

    const missing = await request.patch(`${API_URL}/customers/${id}/transfer`, {
      headers: bearer(token),
      data: {},
    });
    expect(missing.status()).toBe(400);

    const unknown = await request.patch(`${API_URL}/customers/${id}/transfer`, {
      headers: bearer(token),
      data: { newStaff: `Người không tồn tại ${Date.now()}` },
    });
    expect(unknown.status()).toBe(400);

    const row = await findCustomer(request, id);
    expect(row.am_caring_staff).toBe(STAFF_OLD);
  });

  test("tạo KH với customerGroup ngoài whitelist trả 400", async ({ request }) => {
    const res = await createCustomer(request, "Nhóm lạ", `GRP-${Date.now()}`);
    expect(res.status()).toBe(400);
  });

  test("lọc ?group= chỉ trả đúng nhóm; group sai trả 400", async ({ request }) => {
    const suffix = Date.now();
    await createCustomer(request, "Tự phát triển", `F-PTM-${suffix}`);
    await createCustomer(request, "Tập hiện hữu", `F-KHDN-${suffix}`);

    const res = await request.get(
      `${API_URL}/customers?group=${encodeURIComponent("Tập hiện hữu")}`,
      { headers: bearer(token) }
    );
    expect(res.status()).toBe(200);
    const rows = (await res.json()).data as any[];
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.customer_group === "Tập hiện hữu")).toBe(true);
    expect(rows.some((r) => r.name === `KH API F-KHDN-${suffix}`)).toBe(true);
    expect(rows.some((r) => r.name === `KH API F-PTM-${suffix}`)).toBe(false);

    const bad = await request.get(`${API_URL}/customers?group=xxx`, {
      headers: bearer(token),
    });
    expect(bad.status()).toBe(400);
  });

  test("audit log có dòng Điều chuyển chứa tên người cũ và mới", async ({ request }) => {
    const created = await createCustomer(request, "Tập hiện hữu", `AUD-${Date.now()}`);
    const id = (await created.json()).data.id;
    const batch = `DOT-AUD-${Date.now()}`;

    const res = await request.patch(`${API_URL}/customers/${id}/transfer-caring`, {
      headers: bearer(token),
      data: { newCaringStaff: STAFF_NEW, handoverBatch: batch },
    });
    expect(res.status()).toBe(200);

    const logsRes = await request.get(`${API_URL}/reports/audit-logs`, {
      headers: bearer(token),
    });
    expect(logsRes.status()).toBe(200);
    const logs = (await logsRes.json()).data as any[];
    const line = logs.find(
      (l) => String(l.action).includes("Điều chuyển") && String(l.details).includes(id)
    );
    expect(line, "phải có dòng audit Điều chuyển cho KH vừa chuyển").toBeTruthy();
    expect(line.details).toContain(STAFF_OLD);
    expect(line.details).toContain(STAFF_NEW);
    expect(line.details).toContain(batch);
  });
});
