import { expect, test } from "@playwright/test";
import { ADMIN, AM, API_URL, apiLogin, bearer } from "./helpers";

test.describe("API Quản lý số tiền hoa hồng (PATCH /commissions/:id/amount)", () => {
  test("Admin sửa số tiền và ghi chú hoa hồng thành công (200)", async ({ request }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);

    // Lấy danh sách hoa hồng có sẵn
    const listRes = await request.get(`${API_URL}/commissions`, {
      headers: bearer(adminToken),
    });
    expect(listRes.status()).toBe(200);
    const list = (await listRes.json()).data as any[];
    expect(list.length).toBeGreaterThan(0);

    const target = list[0];
    const newAmount = 350000;
    const newNote = "Áp dụng chính sách khuyến mại 35%";

    const patchRes = await request.patch(`${API_URL}/commissions/${target.id}/amount`, {
      headers: bearer(adminToken),
      data: { amount: newAmount, note: newNote },
    });
    expect(patchRes.status()).toBe(200);
    const body = await patchRes.json();
    expect(body.success).toBe(true);
    expect(body.data.amount).toBe(newAmount);
    expect(body.data.note).toBe(newNote);

    // Xác nhận khi get lại cũng mang số tiền và ghi chú mới
    const verifyRes = await request.get(`${API_URL}/commissions`, {
      headers: bearer(adminToken),
    });
    const updatedRow = ((await verifyRes.json()).data as any[]).find((c) => c.id === target.id);
    expect(updatedRow.amount).toBe(newAmount);
    expect(updatedRow.note).toBe(newNote);
  });

  test("AM (không phải Admin) gọi PATCH /amount bị từ chối 403", async ({ request }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    const amToken = await apiLogin(request, AM.username, AM.password);

    const listRes = await request.get(`${API_URL}/commissions`, {
      headers: bearer(adminToken),
    });
    const list = (await listRes.json()).data as any[];
    const target = list[0];

    const patchRes = await request.patch(`${API_URL}/commissions/${target.id}/amount`, {
      headers: bearer(amToken),
      data: { amount: 500000 },
    });
    expect(patchRes.status()).toBe(403);
  });

  test("Số tiền âm hoặc sai định dạng trả 400", async ({ request }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);

    const listRes = await request.get(`${API_URL}/commissions`, {
      headers: bearer(adminToken),
    });
    const list = (await listRes.json()).data as any[];
    const target = list[0];

    const negativeRes = await request.patch(`${API_URL}/commissions/${target.id}/amount`, {
      headers: bearer(adminToken),
      data: { amount: -1000 },
    });
    expect(negativeRes.status()).toBe(400);

    const nanRes = await request.patch(`${API_URL}/commissions/${target.id}/amount`, {
      headers: bearer(adminToken),
      data: { amount: "abc" },
    });
    expect(nanRes.status()).toBe(400);
  });

  test("ID không tồn tại trả 404", async ({ request }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);

    const notFoundRes = await request.patch(`${API_URL}/commissions/HH-KHONG-TON-TAI/amount`, {
      headers: bearer(adminToken),
      data: { amount: 200000 },
    });
    expect(notFoundRes.status()).toBe(404);
  });
});

test.describe("API Chi hoa hồng & ghi đè khách đã chi (PATCH /commissions/:id/payout)", () => {
  test("Admin ghi nhận đã chi hoa hồng và ghi đè khách đã chi thành công (200)", async ({ request }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);

    const listRes = await request.get(`${API_URL}/commissions`, {
      headers: bearer(adminToken),
    });
    const list = (await listRes.json()).data as { id: string }[];
    expect(list.length).toBeGreaterThan(0);
    const target = list[0];

    const patchRes = await request.patch(`${API_URL}/commissions/${target.id}/payout`, {
      headers: bearer(adminToken),
      data: { paidOutAmount: 500000, customerPaidOverride: 1000000 },
    });
    expect(patchRes.status()).toBe(200);
    const body = await patchRes.json();
    expect(body.success).toBe(true);
    expect(body.data.paidOutAmount).toBe(500000);
    expect(body.data.customerPaidOverride).toBe(1000000);
    expect(body.data.customerPaid).toBe(1000000);
    expect(body.data.remaining).toBe(body.data.amount - 500000);
  });

  test("AM (không phải Admin) gọi PATCH /payout bị từ chối 403", async ({ request }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    const amToken = await apiLogin(request, AM.username, AM.password);

    const listRes = await request.get(`${API_URL}/commissions`, {
      headers: bearer(adminToken),
    });
    const list = (await listRes.json()).data as { id: string }[];
    const target = list[0];

    const patchRes = await request.patch(`${API_URL}/commissions/${target.id}/payout`, {
      headers: bearer(amToken),
      data: { paidOutAmount: 100000 },
    });
    expect(patchRes.status()).toBe(403);
  });

  test("Số tiền đã chi âm trả 400", async ({ request }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);

    const listRes = await request.get(`${API_URL}/commissions`, {
      headers: bearer(adminToken),
    });
    const list = (await listRes.json()).data as { id: string }[];
    const target = list[0];

    const negativeRes = await request.patch(`${API_URL}/commissions/${target.id}/payout`, {
      headers: bearer(adminToken),
      data: { paidOutAmount: -1000 },
    });
    expect(negativeRes.status()).toBe(400);
  });

  test("ID không tồn tại trả 404", async ({ request }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);

    const notFoundRes = await request.patch(`${API_URL}/commissions/HH-KHONG-TON-TAI/payout`, {
      headers: bearer(adminToken),
      data: { paidOutAmount: 200000 },
    });
    expect(notFoundRes.status()).toBe(404);
  });
});

test.describe("API Thống kê theo người giới thiệu (GET /commissions/summary)", () => {
  test("Trả về danh sách thống kê hợp lệ, không bị route /:id/... nuốt mất", async ({ request }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);

    const res = await request.get(`${API_URL}/commissions/summary`, {
      headers: bearer(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);

    for (const group of body.data as { customerCount: number; orderCount: number }[]) {
      expect(group.customerCount).toBeGreaterThan(0);
      expect(group.orderCount).toBeGreaterThanOrEqual(group.customerCount);
    }
  });
});
