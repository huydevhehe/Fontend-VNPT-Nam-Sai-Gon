import { expect, test, type APIRequestContext } from "@playwright/test";
import { ADMIN, API_URL, apiLogin, bearer, createApprovedCtv, registerCtv } from "./helpers";

const STAFF_A = "Nguyễn Thị Tình";
const STAFF_B = "Phạm Thanh Hà";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function uniq(): string {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

test.describe("API Lead / Hợp đồng / Hoa hồng gắn CTV và Phường", () => {
  let token: string;
  let wardA: string;
  let wardB: string;
  let ctv: Awaited<ReturnType<typeof createApprovedCtv>>;

  test.beforeAll(async ({ request }) => {
    token = await apiLogin(request, ADMIN.username, ADMIN.password);
    const res = await request.get(`${API_URL}/territories`, { headers: bearer(token) });
    const wards: Array<{ id: string }> = (await res.json()).data;
    expect(wards.length).toBeGreaterThanOrEqual(2);
    wardA = wards[0].id;
    wardB = wards[1].id;
    ctv = await createApprovedCtv(request, token);
  });

  function leadPayload(overrides: Record<string, unknown> = {}) {
    return {
      customerName: `KH Lead API ${uniq()}`,
      phone: "0912345678",
      group: "Lead KH mới",
      channel: "Online",
      staffName: STAFF_A,
      expectedValue: 1000000,
      demandDescription: "Test API",
      ...overrides,
    };
  }

  async function postLead(request: APIRequestContext, data: Record<string, unknown>) {
    return request.post(`${API_URL}/leads`, { headers: bearer(token), data });
  }

  async function postContract(request: APIRequestContext, data: Record<string, unknown>) {
    return request.post(`${API_URL}/contracts`, {
      headers: bearer(token),
      data: {
        transactionCode: `GD-API-${uniq()}`,
        customerName: `KH HĐ API ${uniq()}`,
        subscriberCodes: ["0901234567"],
        totalValue: 10000000,
        channel: "Online",
        ...data,
      },
    });
  }

  async function commissionsOf(request: APIRequestContext, contractId: string) {
    const res = await request.get(`${API_URL}/commissions`, { headers: bearer(token) });
    expect(res.status()).toBe(200);
    return ((await res.json()).data as any[]).filter((c) => c.contractId === contractId);
  }

  async function setDeployment(request: APIRequestContext, id: string, status: string) {
    return request.patch(`${API_URL}/contracts/${id}/status`, {
      headers: bearer(token),
      data: { deploymentStatus: status },
    });
  }

  test.describe("Lead", () => {
    test("kênh CTV giới thiệu thiếu referredByCtvId bị 400", async ({ request }) => {
      const res = await postLead(request, leadPayload({ channel: "CTV giới thiệu" }));
      expect(res.status()).toBe(400);
      expect((await res.json()).success).toBe(false);
    });

    test("referredByCtvId là CTV Chờ duyệt bị 400", async ({ request }) => {
      const { res, payload } = await registerCtv(request);
      expect(res.status()).toBe(201);
      const list = await request.get(
        `${API_URL}/ctv-accounts?status=${encodeURIComponent("Chờ duyệt")}`,
        { headers: bearer(token) }
      );
      const pending = ((await list.json()).data as any[]).find((a) => a.username === payload.username);
      const created = await postLead(
        request,
        leadPayload({ channel: "CTV giới thiệu", referredByCtvId: pending.id })
      );
      expect(created.status()).toBe(400);
    });

    test("referredByCtvId không phải CTV (nhân viên / id lạ) bị 400", async ({ request }) => {
      const adminRes = await request.get(`${API_URL}/auth/me`, { headers: bearer(token) });
      const adminId: string | undefined = adminRes.ok() ? (await adminRes.json())?.data?.id : undefined;
      const bogus = await postLead(
        request,
        leadPayload({ channel: "CTV giới thiệu", referredByCtvId: "USER-KHONG-TON-TAI" })
      );
      expect(bogus.status()).toBe(400);
      if (adminId) {
        const asAdmin = await postLead(
          request,
          leadPayload({ channel: "CTV giới thiệu", referredByCtvId: adminId })
        );
        expect(asAdmin.status()).toBe(400);
      }
    });

    test("kênh khác mà có referredByCtvId bị 400", async ({ request }) => {
      const res = await postLead(request, leadPayload({ channel: "Online", referredByCtvId: ctv.id }));
      expect(res.status()).toBe(400);
    });

    test("channel / group ngoài whitelist bị 400", async ({ request }) => {
      expect((await postLead(request, leadPayload({ channel: "Facebook" }))).status()).toBe(400);
      expect((await postLead(request, leadPayload({ group: "Nhóm lạ" }))).status()).toBe(400);
    });

    test("territoryId không tồn tại bị 400", async ({ request }) => {
      const res = await postLead(request, leadPayload({ territoryId: "TERR-KHONG-TON-TAI" }));
      expect(res.status()).toBe(400);
    });

    test("tạo lead với CTV hợp lệ trả referredByCtvName và territoryId", async ({ request }) => {
      const res = await postLead(
        request,
        leadPayload({ channel: "CTV giới thiệu", referredByCtvId: ctv.id, territoryId: wardA })
      );
      expect(res.status()).toBe(201);
      const lead = (await res.json()).data;
      expect(lead.referredByCtvId).toBe(ctv.id);
      expect(lead.referredByCtvName).toBe("CTV E2E Test");
      expect(lead.territoryId).toBe(wardA);

      const list = await request.get(`${API_URL}/leads`, { headers: bearer(token) });
      const found = ((await list.json()).data as any[]).find((l) => l.id === lead.id);
      expect(found.referredByCtvName).toBe("CTV E2E Test");
    });

    test("lead không CTV có các trường liên kết là null", async ({ request }) => {
      const res = await postLead(request, leadPayload());
      expect(res.status()).toBe(201);
      const lead = (await res.json()).data;
      expect(lead.referredByCtvId).toBeNull();
      expect(lead.referredByCtvName).toBeNull();
      expect(lead.territoryId).toBeNull();
    });

    test("ctv-options trả CTV đang hoạt động, không trả CTV chờ duyệt", async ({ request }) => {
      const { res, payload } = await registerCtv(request, { name: "CTV Cho Duyet Opt" });
      expect(res.status()).toBe(201);
      const opts = await request.get(`${API_URL}/leads/ctv-options`, { headers: bearer(token) });
      expect(opts.status()).toBe(200);
      const data: Array<{ id: string; name: string; referralCode: string }> = (await opts.json()).data;
      const mine = data.find((o) => o.id === ctv.id);
      expect(mine).toBeTruthy();
      expect(mine!.referralCode).toBe(ctv.referralCode);
      expect(data.some((o) => o.name === "CTV Cho Duyet Opt")).toBe(false);
      expect(payload.username).toBeTruthy();
    });

    test("ctv-options: CTV bị 403, không token bị 401", async ({ request }) => {
      const asCtv = await request.get(`${API_URL}/leads/ctv-options`, { headers: bearer(ctv.token) });
      expect(asCtv.status()).toBe(403);
      const anon = await request.get(`${API_URL}/leads/ctv-options`);
      expect(anon.status()).toBe(401);
    });

    test("PATCH assignment đổi nhân viên và phường", async ({ request }) => {
      const lead = (await (await postLead(request, leadPayload({ territoryId: wardA }))).json()).data;

      const res = await request.patch(`${API_URL}/leads/${lead.id}/assignment`, {
        headers: bearer(token),
        data: { staffName: STAFF_B, territoryId: wardB },
      });
      expect(res.status()).toBe(200);
      const updated = (await res.json()).data;
      expect(updated.staffName).toBe(STAFF_B);
      expect(updated.territoryId).toBe(wardB);

      const onlyStaff = await request.patch(`${API_URL}/leads/${lead.id}/assignment`, {
        headers: bearer(token),
        data: { staffName: STAFF_A },
      });
      expect(onlyStaff.status()).toBe(200);
      const afterStaff = (await onlyStaff.json()).data;
      expect(afterStaff.staffName).toBe(STAFF_A);
      expect(afterStaff.territoryId).toBe(wardB);

      const cleared = await request.patch(`${API_URL}/leads/${lead.id}/assignment`, {
        headers: bearer(token),
        data: { territoryId: null },
      });
      expect(cleared.status()).toBe(200);
      expect((await cleared.json()).data.territoryId).toBeNull();
    });

    test("PATCH assignment: nhân viên không tồn tại 400, body rỗng 400, phường lạ 400, lead lạ 404", async ({
      request,
    }) => {
      const lead = (await (await postLead(request, leadPayload())).json()).data;
      const url = `${API_URL}/leads/${lead.id}/assignment`;

      const badStaff = await request.patch(url, {
        headers: bearer(token),
        data: { staffName: "Người Không Tồn Tại" },
      });
      expect(badStaff.status()).toBe(400);

      const empty = await request.patch(url, { headers: bearer(token), data: {} });
      expect(empty.status()).toBe(400);

      const badWard = await request.patch(url, {
        headers: bearer(token),
        data: { territoryId: "TERR-KHONG-TON-TAI" },
      });
      expect(badWard.status()).toBe(400);

      const missing = await request.patch(`${API_URL}/leads/LEAD-KHONG-TON-TAI/assignment`, {
        headers: bearer(token),
        data: { staffName: STAFF_A },
      });
      expect(missing.status()).toBe(404);
    });
  });

  test.describe("Hợp đồng", () => {
    test("leadId không tồn tại bị 400", async ({ request }) => {
      const res = await postContract(request, { leadId: "LEAD-KHONG-TON-TAI" });
      expect(res.status()).toBe(400);
    });

    test("territoryId không tồn tại bị 400", async ({ request }) => {
      const res = await postContract(request, { territoryId: "TERR-KHONG-TON-TAI" });
      expect(res.status()).toBe(400);
    });

    test("totalValue âm bị 400 khi tạo và khi cập nhật", async ({ request }) => {
      expect((await postContract(request, { totalValue: -1 })).status()).toBe(400);
      const created = (await (await postContract(request, {})).json()).data;
      const res = await request.patch(`${API_URL}/contracts/${created.id}/status`, {
        headers: bearer(token),
        data: { totalValue: -5 },
      });
      expect(res.status()).toBe(400);
    });

    test("HĐ tạo từ lead CTV thừa kế CTV và phường; territoryId truyền rõ thì ghi đè", async ({
      request,
    }) => {
      const lead = (
        await (
          await postLead(
            request,
            leadPayload({ channel: "CTV giới thiệu", referredByCtvId: ctv.id, territoryId: wardA })
          )
        ).json()
      ).data;

      const inherited = await postContract(request, { leadId: lead.id });
      expect(inherited.status()).toBe(201);
      const c1 = (await inherited.json()).data;
      expect(c1.leadId).toBe(lead.id);
      expect(c1.referredByCtvId).toBe(ctv.id);
      expect(c1.territoryId).toBe(wardA);

      const overridden = await postContract(request, { leadId: lead.id, territoryId: wardB });
      expect(overridden.status()).toBe(201);
      const c2 = (await overridden.json()).data;
      expect(c2.referredByCtvId).toBe(ctv.id);
      expect(c2.territoryId).toBe(wardB);

      const plain = (await (await postContract(request, {})).json()).data;
      expect(plain.leadId).toBeNull();
      expect(plain.referredByCtvId).toBeNull();
      expect(plain.territoryId).toBeNull();
    });
  });

  test.describe("Hoa hồng CTV", () => {
    async function contractFromCtvLead(request: APIRequestContext, totalValue: number) {
      const lead = (
        await (
          await postLead(request, leadPayload({ channel: "CTV giới thiệu", referredByCtvId: ctv.id }))
        ).json()
      ).data;
      const res = await postContract(request, { leadId: lead.id, totalValue });
      expect(res.status()).toBe(201);
      return (await res.json()).data;
    }

    test("chưa Hoàn tất thì chưa có hoa hồng", async ({ request }) => {
      const contract = await contractFromCtvLead(request, 10000000);
      expect(await commissionsOf(request, contract.id)).toHaveLength(0);
      expect((await setDeployment(request, contract.id, "Đang triển khai")).status()).toBe(200);
      expect(await commissionsOf(request, contract.id)).toHaveLength(0);
    });

    test("Hoàn tất sinh đúng 1 dòng hoa hồng 10% Chờ chi, gọi lại vẫn 1 dòng", async ({ request }) => {
      const contract = await contractFromCtvLead(request, 12345678);
      expect((await setDeployment(request, contract.id, "Hoàn tất")).status()).toBe(200);

      const rows = await commissionsOf(request, contract.id);
      expect(rows).toHaveLength(1);
      expect(rows[0].amount).toBe(Math.round(12345678 * 0.1));
      expect(rows[0].status).toBe("Chờ chi");
      expect(rows[0].type).toBe("Hoa hồng chi kênh");
      expect(rows[0].recipientName).toBe("CTV E2E Test");
      expect(rows[0].transactionCode).toBe(contract.transactionCode);
      expect(rows[0].ctvId).toBe(ctv.id);
      expect(rows[0].contractId).toBe(contract.id);
      expect(rows[0].date).toBe(today());

      expect((await setDeployment(request, contract.id, "Hoàn tất")).status()).toBe(200);
      expect(await commissionsOf(request, contract.id)).toHaveLength(1);
    });

    test("2 PATCH Hoàn tất song song chỉ sinh đúng 1 dòng hoa hồng", async ({ request }) => {
      const contract = await contractFromCtvLead(request, 5000000);
      const [r1, r2] = await Promise.all([
        setDeployment(request, contract.id, "Hoàn tất"),
        setDeployment(request, contract.id, "Hoàn tất"),
      ]);
      expect(r1.status()).toBe(200);
      expect(r2.status()).toBe(200);
      expect(await commissionsOf(request, contract.id)).toHaveLength(1);
    });

    test("HĐ không có CTV thì không sinh hoa hồng", async ({ request }) => {
      const contract = (await (await postContract(request, {})).json()).data;
      expect((await setDeployment(request, contract.id, "Hoàn tất")).status()).toBe(200);
      expect(await commissionsOf(request, contract.id)).toHaveLength(0);
    });

    test("đổi totalValue khi còn Chờ chi thì tính lại, khi đã Đã chi thì giữ nguyên", async ({
      request,
    }) => {
      const contract = await contractFromCtvLead(request, 10000000);
      await setDeployment(request, contract.id, "Hoàn tất");
      const [commission] = await commissionsOf(request, contract.id);
      expect(commission.amount).toBe(1000000);

      const patch1 = await request.patch(`${API_URL}/contracts/${contract.id}/status`, {
        headers: bearer(token),
        data: { totalValue: 20000000 },
      });
      expect(patch1.status()).toBe(200);
      const [recalculated] = await commissionsOf(request, contract.id);
      expect(recalculated.amount).toBe(2000000);
      expect(recalculated.status).toBe("Chờ chi");

      const paid = await request.patch(`${API_URL}/commissions/${commission.id}/status`, {
        headers: bearer(token),
        data: { status: "Đã chi" },
      });
      expect(paid.status()).toBe(200);

      const patch2 = await request.patch(`${API_URL}/contracts/${contract.id}/status`, {
        headers: bearer(token),
        data: { totalValue: 30000000 },
      });
      expect(patch2.status()).toBe(200);
      const rows = await commissionsOf(request, contract.id);
      expect(rows).toHaveLength(1);
      expect(rows[0].amount).toBe(2000000);
      expect(rows[0].status).toBe("Đã chi");
    });
  });
});
