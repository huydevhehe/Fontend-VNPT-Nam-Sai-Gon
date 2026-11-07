import { expect, test, type APIRequestContext } from "@playwright/test";
import { ADMIN, AM, API_URL, apiLogin, bearer, createApprovedCtv } from "./helpers";

const STAFF = "Nguyễn Thị Tình";

function randomIp(): string {
  const n = () => Math.floor(Math.random() * 254) + 1;
  return `198.${n()}.${n()}.${n()}`;
}

function uniq(): string {
  return `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
}

/** Số điện thoại 10 số, duy nhất theo từng lệnh gọi. */
function phoneOf(seed: number): string {
  const tail = String(Date.now() % 100000).padStart(5, "0");
  return `0909${tail}${seed}`;
}

type Ctv = Awaited<ReturnType<typeof createApprovedCtv>>;

test.describe("API /api/ctv — dữ liệu theo từng CTV", () => {
  let adminToken: string;
  let ctvA: Ctv;
  let ctvB: Ctv;
  const leadNamesA: string[] = [];
  const phonesA: string[] = [];
  let leadNameB = "";
  let commissionAmount = 0;
  let contractCode = "";
  const CONTRACT_VALUE = 12000000;

  async function submitLead(
    request: APIRequestContext,
    refCode: string,
    name: string,
    phone: string
  ) {
    const res = await request.post(`${API_URL}/public/leads`, {
      data: { name, phone, refCode },
      headers: { "X-Forwarded-For": randomIp() },
    });
    expect(res.status()).toBe(201);
  }

  test.beforeAll(async ({ request }) => {
    adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    ctvA = await createApprovedCtv(request, adminToken);
    ctvB = await createApprovedCtv(request, adminToken);

    // 2 lead cho A, 1 lead cho B qua API công khai.
    for (let i = 0; i < 2; i += 1) {
      const name = `Khách của A ${uniq()}`;
      const phone = phoneOf(i + 1);
      leadNamesA.push(name);
      phonesA.push(phone);
      await submitLead(request, ctvA.referralCode, name, phone);
    }
    leadNameB = `Khách của B ${uniq()}`;
    await submitLead(request, ctvB.referralCode, leadNameB, phoneOf(7));

    // Admin gán nhân viên, tạo HĐ từ lead đầu của A rồi Hoàn tất.
    const listRes = await request.get(`${API_URL}/leads`, { headers: bearer(adminToken) });
    const leads: Array<{ id: string; customerName: string }> = (await listRes.json()).data;
    for (const name of [...leadNamesA, leadNameB]) {
      const lead = leads.find((l) => l.customerName === name);
      expect(lead, `lead ${name} phải tồn tại`).toBeTruthy();
      const assign = await request.patch(`${API_URL}/leads/${lead!.id}/assignment`, {
        headers: bearer(adminToken),
        data: { staffName: STAFF },
      });
      expect(assign.status()).toBe(200);
    }
    const firstLead = leads.find((l) => l.customerName === leadNamesA[0])!;
    contractCode = `GD-CTV-${uniq()}`;
    const contractRes = await request.post(`${API_URL}/contracts`, {
      headers: bearer(adminToken),
      data: {
        transactionCode: contractCode,
        customerName: leadNamesA[0],
        subscriberCodes: ["0901234567"],
        totalValue: CONTRACT_VALUE,
        channel: "CTV giới thiệu",
        leadId: firstLead.id,
      },
    });
    expect(contractRes.status()).toBe(201);
    const contract = (await contractRes.json()).data;
    const done = await request.patch(`${API_URL}/contracts/${contract.id}/status`, {
      headers: bearer(adminToken),
      data: { deploymentStatus: "Hoàn tất" },
    });
    expect(done.status()).toBe(200);
    commissionAmount = Math.round(CONTRACT_VALUE * 0.1);
  });

  async function getJson(request: APIRequestContext, path: string, token: string) {
    const res = await request.get(`${API_URL}${path}`, { headers: bearer(token) });
    return { status: res.status(), body: await res.json() };
  }

  test("GET /ctv/me trả đúng hồ sơ của token", async ({ request }) => {
    const { status, body } = await getJson(request, "/ctv/me", ctvA.token);
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(ctvA.id);
    expect(body.data.username).toBe(ctvA.username);
    expect(body.data.referralCode).toBe(ctvA.referralCode);
    expect(JSON.stringify(body)).not.toContain("password");
  });

  test("CTV A: 2 lead, 1 hợp đồng, 1 hoa hồng, summary khớp", async ({ request }) => {
    const leads = await getJson(request, "/ctv/leads", ctvA.token);
    expect(leads.status).toBe(200);
    expect(leads.body.data).toHaveLength(2);
    const names = leads.body.data.map((l: { customerName: string }) => l.customerName).sort();
    expect(names).toEqual([...leadNamesA].sort());

    const withContract = leads.body.data.find(
      (l: { customerName: string }) => l.customerName === leadNamesA[0]
    );
    expect(withContract.contractStatus).toBe("Hoàn tất");
    const withoutContract = leads.body.data.find(
      (l: { customerName: string }) => l.customerName === leadNamesA[1]
    );
    expect(withoutContract.contractStatus).toBeNull();

    const contracts = await getJson(request, "/ctv/contracts", ctvA.token);
    expect(contracts.status).toBe(200);
    expect(contracts.body.data).toHaveLength(1);
    expect(contracts.body.data[0].transactionCode).toBe(contractCode);
    expect(contracts.body.data[0].totalValue).toBe(CONTRACT_VALUE);
    expect(contracts.body.data[0].deploymentStatus).toBe("Hoàn tất");

    const commissions = await getJson(request, "/ctv/commissions", ctvA.token);
    expect(commissions.status).toBe(200);
    expect(commissions.body.data).toHaveLength(1);
    expect(commissions.body.data[0].amount).toBe(commissionAmount);
    expect(commissions.body.data[0].status).toBe("Chờ chi");
    expect(commissions.body.data[0].transactionCode).toBe(contractCode);

    const summary = await getJson(request, "/ctv/summary", ctvA.token);
    expect(summary.status).toBe(200);
    expect(summary.body.data).toEqual({
      totalLeads: 2,
      successfulLeads: 0,
      failedLeads: 0,
      totalContracts: 1,
      completedContracts: 1,
      totalCommission: commissionAmount,
      pendingCommission: commissionAmount,
      paidCommission: 0,
    });
    expect(typeof summary.body.data.totalCommission).toBe("number");
  });

  test("CTV B chỉ thấy đúng 1 lead và không có HĐ/hoa hồng của A", async ({ request }) => {
    const leads = await getJson(request, "/ctv/leads", ctvB.token);
    expect(leads.body.data).toHaveLength(1);
    expect(leads.body.data[0].customerName).toBe(leadNameB);

    expect((await getJson(request, "/ctv/contracts", ctvB.token)).body.data).toHaveLength(0);
    expect((await getJson(request, "/ctv/commissions", ctvB.token)).body.data).toHaveLength(0);
    const summary = (await getJson(request, "/ctv/summary", ctvB.token)).body.data;
    expect(summary.totalLeads).toBe(1);
    expect(summary.totalCommission).toBe(0);
  });

  test("?ctvId=<CTV khác> bị bỏ qua ở mọi endpoint", async ({ request }) => {
    const q = `?ctvId=${encodeURIComponent(ctvA.id)}`;
    const me = await getJson(request, `/ctv/me${q}`, ctvB.token);
    expect(me.body.data.id).toBe(ctvB.id);

    const leads = await getJson(request, `/ctv/leads${q}`, ctvB.token);
    expect(leads.body.data).toHaveLength(1);
    expect(leads.body.data[0].customerName).toBe(leadNameB);

    expect((await getJson(request, `/ctv/contracts${q}`, ctvB.token)).body.data).toHaveLength(0);
    expect((await getJson(request, `/ctv/commissions${q}`, ctvB.token)).body.data).toHaveLength(0);
    expect((await getJson(request, `/ctv/summary${q}`, ctvB.token)).body.data.totalLeads).toBe(1);
  });

  test("không trả SĐT đầy đủ, staffName hay dữ liệu CTV khác", async ({ request }) => {
    const leads = await getJson(request, "/ctv/leads", ctvA.token);
    const raw = JSON.stringify(leads.body);
    for (const phone of phonesA) {
      expect(raw).not.toContain(phone);
      const masked = `${phone.slice(0, 4)}${"*".repeat(phone.length - 6)}${phone.slice(-2)}`;
      expect(raw).toContain(masked);
    }
    expect(raw).not.toContain(STAFF);
    expect(raw).not.toContain("staff");
    expect(raw).not.toContain(leadNameB);
    for (const lead of leads.body.data) {
      expect(lead.maskedPhone).toMatch(/^\d{4}\*+\d{2}$/);
    }
  });

  test("token CTV gọi API nhân viên → 403", async ({ request }) => {
    for (const path of ["/customers", "/leads", "/commissions", "/staff", "/ctv-accounts"]) {
      const res = await request.get(`${API_URL}${path}`, { headers: bearer(ctvA.token) });
      expect(res.status(), path).toBe(403);
    }
  });

  test("admin/AM gọi /api/ctv/* → 403, không token → 401", async ({ request }) => {
    const amToken = await apiLogin(request, AM.username, AM.password);
    for (const path of ["/ctv/me", "/ctv/summary", "/ctv/leads", "/ctv/contracts", "/ctv/commissions"]) {
      expect((await request.get(`${API_URL}${path}`, { headers: bearer(adminToken) })).status(), `admin ${path}`).toBe(403);
      expect((await request.get(`${API_URL}${path}`, { headers: bearer(amToken) })).status(), `AM ${path}`).toBe(403);
      expect((await request.get(`${API_URL}${path}`)).status(), `anon ${path}`).toBe(401);
    }
  });
});
