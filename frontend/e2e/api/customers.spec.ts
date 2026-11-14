import { expect, test, type APIRequestContext } from "@playwright/test";
import { ADMIN, AM, API_URL, apiLogin, bearer } from "./helpers";

const STAFF_OLD = "Nguyễn Thị Tình";
const STAFF_NEW = "Phạm Thanh Hà";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

test.describe("API khách hàng PTM / KHDN chăm", () => {
  let token: string;
  let amToken: string;

  test.beforeAll(async ({ request }) => {
    token = await apiLogin(request, ADMIN.username, ADMIN.password);
    amToken = await apiLogin(request, AM.username, AM.password);
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
        amCaringStaff: STAFF_OLD,
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
    expect(row.am_staff).toBe(STAFF_OLD);
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

  test("AM không có quyền điều chuyển khách hàng: /transfer và /transfer-caring trả 403", async ({
    request,
  }) => {
    const created = await createCustomer(request, "Tập hiện hữu", `PERM-${Date.now()}`);
    const id = (await created.json()).data.id;

    // AM gọi /transfer -> 403
    const transferRes = await request.patch(`${API_URL}/customers/${id}/transfer`, {
      headers: bearer(amToken),
      data: { newStaff: STAFF_NEW },
    });
    expect(transferRes.status()).toBe(403);

    // AM gọi /transfer-caring -> 403
    const transferCaringRes = await request.patch(`${API_URL}/customers/${id}/transfer-caring`, {
      headers: bearer(amToken),
      data: { newCaringStaff: STAFF_NEW },
    });
    expect(transferCaringRes.status()).toBe(403);
  });

  test("tạo KH nhóm PTM địa bàn, chuẩn hóa MST, có thông tin liên hệ/thanh toán riêng", async ({
    request,
  }) => {
    const res = await request.post(`${API_URL}/customers`, {
      headers: bearer(token),
      data: {
        name: `KH PTM Địa Bàn ${Date.now()}`,
        type: "Doanh nghiệp",
        customerGroup: "PTM địa bàn",
        identityCode: "317424086",
        contactName: "Chị Diễm",
        contactEmail: "diem.api@example.com",
        billingName: "Anh Khải",
        billingEmail: "khai.api@example.com",
      },
    });
    expect(res.status()).toBe(201);
    const data = (await res.json()).data;
    expect(data.customer_group).toBe("PTM địa bàn");
    expect(data.identity_code).toBe("0317424086");
    expect(data.contact_name).toBe("Chị Diễm");
    expect(data.billing_name).toBe("Anh Khải");
  });

  test("GET /customers/:id trả đủ thông tin, 404 khi không tồn tại", async ({ request }) => {
    const created = await createCustomer(request, "Tự phát triển", `DETAIL-${Date.now()}`);
    const id = (await created.json()).data.id;

    const res = await request.get(`${API_URL}/customers/${id}`, { headers: bearer(token) });
    expect(res.status()).toBe(200);
    expect((await res.json()).data.id).toBe(id);

    const notFound = await request.get(`${API_URL}/customers/KH-KHONG-TON-TAI`, {
      headers: bearer(token),
    });
    expect(notFound.status()).toBe(404);
  });

  test("PATCH /customers/:id: Admin sửa được, AM không liên quan bị 403, không đổi được am_staff", async ({
    request,
  }) => {
    // Khách gán cho STAFF_NEW ("Phạm Thanh Hà") — khác tài khoản AM đăng nhập
    // (AM.username ứng với "Nguyễn Thị Tình" = STAFF_OLD) nên chắc chắn
    // "không liên quan" theo đúng kịch bản test.
    const res = await request.post(`${API_URL}/customers`, {
      headers: bearer(token),
      data: {
        name: `KH API EDIT-${Date.now()}`,
        type: "Doanh nghiệp",
        customerGroup: "Tự phát triển",
        amStaff: STAFF_NEW,
        amCaringStaff: STAFF_NEW,
      },
    });
    expect(res.status()).toBe(201);
    const id = (await res.json()).data.id;

    const adminEdit = await request.patch(`${API_URL}/customers/${id}`, {
      headers: bearer(token),
      data: { note: "Admin sửa ghi chú" },
    });
    expect(adminEdit.status()).toBe(200);
    expect((await adminEdit.json()).data.note).toBe("Admin sửa ghi chú");

    const amEdit = await request.patch(`${API_URL}/customers/${id}`, {
      headers: bearer(amToken),
      data: { note: "AM không liên quan cố sửa" },
    });
    expect(amEdit.status()).toBe(403);

    const amStaffEdit = await request.patch(`${API_URL}/customers/${id}`, {
      headers: bearer(token),
      data: { amStaff: "Cố đổi AM" },
    });
    expect(amStaffEdit.status()).toBe(400);
  });
});

test.describe("API Team khách hàng", () => {
  let token: string;
  let amToken: string;

  test.beforeAll(async ({ request }) => {
    token = await apiLogin(request, ADMIN.username, ADMIN.password);
    amToken = await apiLogin(request, AM.username, AM.password);
  });

  test("AM không được tạo team (403)", async ({ request }) => {
    const res = await request.post(`${API_URL}/customer-teams`, {
      headers: bearer(amToken),
      data: { name: `Team AM ${Date.now()}` },
    });
    expect(res.status()).toBe(403);
  });

  test("Admin tạo team, gán 2 khách, GET /customers thấy team_name", async ({ request }) => {
    const suffix = Date.now();
    const teamRes = await request.post(`${API_URL}/customer-teams`, {
      headers: bearer(token),
      data: { name: `NOVA E2E ${suffix}` },
    });
    expect(teamRes.status()).toBe(201);
    const team = (await teamRes.json()).data;

    const c1 = await request.post(`${API_URL}/customers`, {
      headers: bearer(token),
      data: { name: `KH Team 1 ${suffix}`, type: "Doanh nghiệp", customerGroup: "Tự phát triển" },
    });
    const c2 = await request.post(`${API_URL}/customers`, {
      headers: bearer(token),
      data: { name: `KH Team 2 ${suffix}`, type: "Doanh nghiệp", customerGroup: "Tự phát triển" },
    });
    const id1 = (await c1.json()).data.id;
    const id2 = (await c2.json()).data.id;

    const assignRes = await request.patch(`${API_URL}/customers/team`, {
      headers: bearer(token),
      data: { customerIds: [id1, id2], teamId: team.id },
    });
    expect(assignRes.status()).toBe(200);
    expect((await assignRes.json()).data.updated).toBe(2);

    const listRes = await request.get(`${API_URL}/customers`, { headers: bearer(token) });
    const rows = (await listRes.json()).data as any[];
    const row1 = rows.find((r) => r.id === id1);
    const row2 = rows.find((r) => r.id === id2);
    expect(row1.team_name).toBe(team.name);
    expect(row2.team_name).toBe(team.name);
  });

  test("xóa team còn khách trả 409; xóa team trống thành công", async ({ request }) => {
    const suffix = Date.now();
    const teamRes = await request.post(`${API_URL}/customer-teams`, {
      headers: bearer(token),
      data: { name: `Dragon E2E ${suffix}` },
    });
    const team = (await teamRes.json()).data;

    const customerRes = await request.post(`${API_URL}/customers`, {
      headers: bearer(token),
      data: {
        name: `KH Dragon ${suffix}`,
        type: "Doanh nghiệp",
        customerGroup: "Tự phát triển",
        teamId: team.id,
      },
    });
    expect(customerRes.status()).toBe(201);

    const blockedDelete = await request.delete(`${API_URL}/customer-teams/${team.id}`, {
      headers: bearer(token),
    });
    expect(blockedDelete.status()).toBe(409);

    const emptyTeamRes = await request.post(`${API_URL}/customer-teams`, {
      headers: bearer(token),
      data: { name: `Team Trống E2E ${suffix}` },
    });
    const emptyTeam = (await emptyTeamRes.json()).data;
    const okDelete = await request.delete(`${API_URL}/customer-teams/${emptyTeam.id}`, {
      headers: bearer(token),
    });
    expect(okDelete.status()).toBe(200);
  });

  test("PATCH /customers/assign-staff gán AM chăm sóc cho nhiều khách cùng lúc", async ({
    request,
  }) => {
    const suffix = Date.now();
    const c1 = await request.post(`${API_URL}/customers`, {
      headers: bearer(token),
      data: { name: `KH Bulk 1 ${suffix}`, type: "Doanh nghiệp", customerGroup: "Tập hiện hữu" },
    });
    const c2 = await request.post(`${API_URL}/customers`, {
      headers: bearer(token),
      data: { name: `KH Bulk 2 ${suffix}`, type: "Doanh nghiệp", customerGroup: "Tập hiện hữu" },
    });
    const id1 = (await c1.json()).data.id;
    const id2 = (await c2.json()).data.id;

    const res = await request.patch(`${API_URL}/customers/assign-staff`, {
      headers: bearer(token),
      data: { customerIds: [id1, id2], amCaringStaff: STAFF_NEW },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.updated).toBe(2);

    const listRes = await request.get(`${API_URL}/customers`, { headers: bearer(token) });
    const rows = (await listRes.json()).data as { id: string; am_caring_staff?: string }[];
    const row1 = rows.find((r) => r.id === id1);
    const row2 = rows.find((r) => r.id === id2);
    expect(row1?.am_caring_staff).toBe(STAFF_NEW);
    expect(row2?.am_caring_staff).toBe(STAFF_NEW);
  });

  test("PATCH /customers/assign-staff: AM nhận lỗi 403, nhân viên không tồn tại nhận lỗi 400", async ({
    request,
  }) => {
    const suffix = Date.now();
    const c = await request.post(`${API_URL}/customers`, {
      headers: bearer(token),
      data: { name: `KH Bulk Lỗi ${suffix}`, type: "Doanh nghiệp", customerGroup: "Tập hiện hữu" },
    });
    const id = (await c.json()).data.id;

    const forbidden = await request.patch(`${API_URL}/customers/assign-staff`, {
      headers: bearer(amToken),
      data: { customerIds: [id], amCaringStaff: STAFF_NEW },
    });
    expect(forbidden.status()).toBe(403);

    const badStaff = await request.patch(`${API_URL}/customers/assign-staff`, {
      headers: bearer(token),
      data: { customerIds: [id], amCaringStaff: "Nhân Viên Không Tồn Tại ABC" },
    });
    expect(badStaff.status()).toBe(400);
  });
});
