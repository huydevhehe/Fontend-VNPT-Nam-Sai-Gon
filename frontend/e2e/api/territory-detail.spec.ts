import { expect, test, type APIRequestContext } from "@playwright/test";
import type { TerritoryDetail } from "@/lib/crm/types/crm.types";
import { ADMIN, AM, API_URL, apiLogin, bearer } from "./helpers";

test.describe.configure({ mode: "serial" });

test.describe("API chi tiết Phường", () => {
  let adminToken: string;
  let amToken: string;
  const suffix = Date.now();

  test.beforeAll(async ({ request }) => {
    adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    amToken = await apiLogin(request, AM.username, AM.password);
  });

  async function getDetail(request: APIRequestContext, token: string, id: string) {
    const res = await request.get(`${API_URL}/territories/${id}/detail`, {
      headers: bearer(token),
    });
    return res;
  }

  test("GET detail TB-01: thông tin phường, lead và hợp đồng backfill, tổng khớp mảng", async ({ request }) => {
    const res = await getDetail(request, amToken, "TB-01");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    const d = body.data;

    expect(d.territory.id).toBe("TB-01");
    expect(d.territory.wardName).toBe("Tân Hưng");
    // Dữ liệu E2E của test khác có thể tồn tại; phần seed thì chưa có cán bộ/khu phố.
    expect(d.officials.filter((o: TerritoryDetail["officials"][number]) => !o.fullName.startsWith("E2E"))).toEqual([]);
    expect(d.quarters.filter((q: TerritoryDetail["quarters"][number]) => !q.name.startsWith("E2E"))).toEqual([]);

    expect(d.leads.map((l: TerritoryDetail["leads"][number]) => l.id)).toContain("LEAD-01");
    expect(d.contracts.map((c: TerritoryDetail["contracts"][number]) => c.id)).toContain("CTR-01");

    const lead = d.leads.find((l: TerritoryDetail["leads"][number]) => l.id === "LEAD-01");
    expect(typeof lead.customerName).toBe("string");
    expect(typeof lead.expectedValue).toBe("number");
    const contract = d.contracts.find((c: TerritoryDetail["contracts"][number]) => c.id === "CTR-01");
    expect(typeof contract.transactionCode).toBe("string");
    expect(typeof contract.totalValue).toBe("number");

    expect(d.totals.leadCount).toBe(d.leads.length);
    expect(d.totals.contractCount).toBe(d.contracts.length);
    expect(d.totals.contractValue).toBe(
      d.contracts.reduce((sum: number, c: TerritoryDetail["contracts"][number]) => sum + c.totalValue, 0)
    );
  });

  test("GET detail id không tồn tại -> 404", async ({ request }) => {
    const res = await getDetail(request, adminToken, "TB-NOPE");
    expect(res.status()).toBe(404);
    expect((await res.json()).success).toBe(false);
  });

  test("GET detail không token -> 401", async ({ request }) => {
    const res = await request.get(`${API_URL}/territories/TB-01/detail`);
    expect(res.status()).toBe(401);
  });

  test("Admin tạo cán bộ hợp lệ -> 201, hiện trong detail, sửa và xoá được", async ({ request }) => {
    const fullName = `E2E Chủ tịch ${suffix}`;
    const create = await request.post(`${API_URL}/territories/TB-03/officials`, {
      headers: bearer(adminToken),
      data: { unit: "Lãnh đạo Phường", position: "Chủ tịch", fullName, phone: "0909000111" },
    });
    expect(create.status()).toBe(201);
    const created = (await create.json()).data;
    expect(created.fullName).toBe(fullName);
    expect(created.territoryId).toBe("TB-03");
    expect(created.unit).toBe("Lãnh đạo Phường");
    expect(created.position).toBe("Chủ tịch");
    expect(created.phone).toBe("0909000111");
    expect(typeof created.id).toBe("string");

    const detail = (await (await getDetail(request, amToken, "TB-03")).json()).data;
    expect(detail.officials.map((o: TerritoryDetail["officials"][number]) => o.id)).toContain(created.id);

    const patch = await request.patch(`${API_URL}/territories/officials/${created.id}`, {
      headers: bearer(adminToken),
      data: { fullName: `${fullName} sửa`, phone: "0909000222" },
    });
    expect(patch.status()).toBe(200);
    const patched = (await patch.json()).data;
    expect(patched.fullName).toBe(`${fullName} sửa`);
    expect(patched.phone).toBe("0909000222");

    const del = await request.delete(`${API_URL}/territories/officials/${created.id}`, {
      headers: bearer(adminToken),
    });
    expect(del.status()).toBe(200);

    const after = (await (await getDetail(request, adminToken, "TB-03")).json()).data;
    expect(after.officials.map((o: TerritoryDetail["officials"][number]) => o.id)).not.toContain(created.id);
  });

  test("Cán bộ: (unit, position) sai hoặc tên rỗng/quá dài -> 400; phường không tồn tại -> 404", async ({ request }) => {
    const post = (data: object, id = "TB-03") =>
      request.post(`${API_URL}/territories/${id}/officials`, { headers: bearer(adminToken), data });

    expect((await post({ unit: "Lãnh đạo Phường", position: "Trưởng phòng", fullName: "E2E A" })).status()).toBe(400);
    expect((await post({ unit: "Phòng Lạ", position: "Trưởng phòng", fullName: "E2E A" })).status()).toBe(400);
    expect((await post({ unit: "Phòng Nội vụ", position: "Phó phòng", fullName: "" })).status()).toBe(400);
    expect((await post({ unit: "Phòng Nội vụ", position: "Phó phòng", fullName: "x".repeat(101) })).status()).toBe(400);
    expect((await post({ unit: "Phòng Nội vụ", position: "Phó phòng", fullName: "E2E A" }, "TB-NOPE")).status()).toBe(404);
  });

  test("AM POST/PATCH/DELETE cán bộ và khu phố -> 403, AM GET detail -> 200", async ({ request }) => {
    const h = { headers: bearer(amToken) };
    expect(
      (await request.post(`${API_URL}/territories/TB-03/officials`, {
        ...h,
        data: { unit: "Lãnh đạo Phường", position: "Bí thư", fullName: "E2E AM" },
      })).status()
    ).toBe(403);
    expect((await request.patch(`${API_URL}/territories/officials/x`, { ...h, data: { fullName: "E2E" } })).status()).toBe(403);
    expect((await request.delete(`${API_URL}/territories/officials/x`, h)).status()).toBe(403);
    expect((await request.post(`${API_URL}/territories/TB-03/quarters`, { ...h, data: { name: "E2E AM" } })).status()).toBe(403);
    expect((await request.patch(`${API_URL}/territories/quarters/x`, { ...h, data: { name: "E2E" } })).status()).toBe(403);
    expect((await request.delete(`${API_URL}/territories/quarters/x`, h)).status()).toBe(403);
    expect((await getDetail(request, amToken, "TB-03")).status()).toBe(200);
  });

  test("Sửa/xoá id cán bộ hoặc khu phố không tồn tại -> 404", async ({ request }) => {
    const h = { headers: bearer(adminToken) };
    expect((await request.patch(`${API_URL}/territories/officials/NOPE`, { ...h, data: { fullName: "E2E" } })).status()).toBe(404);
    expect((await request.delete(`${API_URL}/territories/officials/NOPE`, h)).status()).toBe(404);
    expect((await request.patch(`${API_URL}/territories/quarters/NOPE`, { ...h, data: { name: "E2E" } })).status()).toBe(404);
    expect((await request.delete(`${API_URL}/territories/quarters/NOPE`, h)).status()).toBe(404);
  });

  test("Khu phố: số âm / NaN / không phải số nguyên / tên rỗng -> 400", async ({ request }) => {
    const post = (data: object) =>
      request.post(`${API_URL}/territories/TB-04/quarters`, { headers: bearer(adminToken), data });

    expect((await post({ name: "E2E KP", householdCount: -1 })).status()).toBe(400);
    expect((await post({ name: "E2E KP", population: -5 })).status()).toBe(400);
    expect((await post({ name: "E2E KP", householdCount: "NaN" })).status()).toBe(400);
    expect((await post({ name: "E2E KP", householdCount: "abc" })).status()).toBe(400);
    expect((await post({ name: "E2E KP", householdCount: 1.5 })).status()).toBe(400);
    expect((await post({ name: "  " })).status()).toBe(400);
    expect(
      (await request.post(`${API_URL}/territories/TB-NOPE/quarters`, {
        headers: bearer(adminToken),
        data: { name: "E2E KP" },
      })).status()
    ).toBe(404);

    const detail = (await (await getDetail(request, adminToken, "TB-04")).json()).data;
    expect(detail.quarters.filter((q: TerritoryDetail["quarters"][number]) => q.name === "E2E KP")).toEqual([]);
  });

  test("Khu phố: tạo, sửa, xoá; totals bằng tổng các khu phố đã nhập", async ({ request }) => {
    const h = { headers: bearer(adminToken) };
    const mk = async (name: string, householdCount: number, population: number) => {
      const res = await request.post(`${API_URL}/territories/TB-05/quarters`, {
        ...h,
        data: { name, headName: "Trưởng KP", secretaryName: "Bí thư KP", mttqName: "MTTQ KP", householdCount, population },
      });
      expect(res.status()).toBe(201);
      return (await res.json()).data;
    };
    const q1 = await mk(`E2E KP1 ${suffix}`, 100, 350);
    const q2 = await mk(`E2E KP2 ${suffix}`, 50, 120);
    expect(q1.headName).toBe("Trưởng KP");
    expect(q1.householdCount).toBe(100);
    expect(q1.territoryId).toBe("TB-05");

    const patch = await request.patch(`${API_URL}/territories/quarters/${q2.id}`, {
      ...h,
      data: { householdCount: 70, mttqName: "MTTQ mới" },
    });
    expect(patch.status()).toBe(200);
    const patched = (await patch.json()).data;
    expect(patched.householdCount).toBe(70);
    expect(patched.mttqName).toBe("MTTQ mới");
    expect(patched.name).toBe(`E2E KP2 ${suffix}`);

    const bad = await request.patch(`${API_URL}/territories/quarters/${q2.id}`, { ...h, data: { population: -1 } });
    expect(bad.status()).toBe(400);

    const d = (await (await getDetail(request, adminToken, "TB-05")).json()).data;
    const ids = d.quarters.map((q: TerritoryDetail["quarters"][number]) => q.id);
    expect(ids).toContain(q1.id);
    expect(ids).toContain(q2.id);
    expect(d.totals.quarterCount).toBe(d.quarters.length);
    expect(d.totals.householdCount).toBe(d.quarters.reduce((s: number, q: TerritoryDetail["quarters"][number]) => s + q.householdCount, 0));
    expect(d.totals.population).toBe(d.quarters.reduce((s: number, q: TerritoryDetail["quarters"][number]) => s + q.population, 0));

    for (const q of [q1, q2]) {
      expect((await request.delete(`${API_URL}/territories/quarters/${q.id}`, h)).status()).toBe(200);
    }
    const after = (await (await getDetail(request, adminToken, "TB-05")).json()).data;
    expect(after.quarters.map((q: TerritoryDetail["quarters"][number]) => q.id)).not.toContain(q1.id);
  });

  test("Admin tạo phường mới -> 201; trùng tên (khác hoa/thường, có tiền tố Phường) -> 409; AM tạo -> 403", async ({ request }) => {
    const wardName = `E2E Phường Mới ${suffix}`;

    const created = await request.post(`${API_URL}/territories`, {
      headers: bearer(adminToken),
      data: { wardName },
    });
    expect(created.status()).toBe(201);
    const createdBody = (await created.json()).data;
    expect(createdBody.wardName).toBe(wardName);
    expect(typeof createdBody.id).toBe("string");

    const duplicate = await request.post(`${API_URL}/territories`, {
      headers: bearer(adminToken),
      data: { wardName: `phường ${wardName.toLowerCase()}` },
    });
    expect(duplicate.status()).toBe(409);

    const amAttempt = await request.post(`${API_URL}/territories`, {
      headers: bearer(amToken),
      data: { wardName: `E2E AM Không Được Tạo ${suffix}` },
    });
    expect(amAttempt.status()).toBe(403);
  });

  test("Mở chi tiết mọi phường trong danh sách đều trả 200 (test hồi quy Đợt 6 Task 4)", async ({ request }) => {
    const listRes = await request.get(`${API_URL}/territories`, { headers: bearer(adminToken) });
    expect(listRes.status()).toBe(200);
    const territories = (await listRes.json()).data as Array<{ id: string }>;
    expect(territories.length).toBeGreaterThan(0);

    const failures: { id: string; status: number }[] = [];
    for (const t of territories) {
      const detail = await getDetail(request, adminToken, t.id);
      if (detail.status() !== 200) {
        failures.push({ id: t.id, status: detail.status() });
      }
    }

    expect(failures, JSON.stringify(failures)).toEqual([]);
  });

  test("Route /:id/households cũ vẫn hoạt động (không bị route mới bắt nhầm)", async ({ request }) => {
    const res = await request.patch(`${API_URL}/territories/TB-06/households`, {
      headers: bearer(adminToken),
      data: { householdCount: 11120 },
    });
    expect(res.status()).toBe(200);
  });
});
