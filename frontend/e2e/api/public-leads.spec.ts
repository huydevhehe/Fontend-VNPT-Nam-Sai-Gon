import { expect, test, type APIRequestContext } from "@playwright/test";
import {
  ADMIN,
  API_URL,
  apiLogin,
  bearer,
  createApprovedCtv,
  registerCtv,
  uniquePhone,
} from "./helpers";

// Rate limit tính theo req.ip (server tin X-Forwarded-For với trust proxy = 1).
// Mỗi test dùng một IP ngẫu nhiên riêng để không chạm giới hạn của nhau.
function randomIp(): string {
  const n = () => Math.floor(Math.random() * 254) + 1;
  return `203.${n()}.${n()}.${n()}`;
}

function suffix(): string {
  return `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
}

interface LeadRow {
  id: string;
  customerName: string;
  phone: string;
  group: string;
  channel: string;
  staffName: string;
  status: string;
  expectedValue: number;
  demandDescription: string;
  referredByCtvId?: string | null;
}

async function postLead(
  request: APIRequestContext,
  ip: string,
  body: Record<string, unknown>
) {
  return request.post(`${API_URL}/public/leads`, {
    data: body,
    headers: { "X-Forwarded-For": ip },
  });
}

async function listLeads(request: APIRequestContext, adminToken: string): Promise<LeadRow[]> {
  const res = await request.get(`${API_URL}/leads`, { headers: bearer(adminToken) });
  expect(res.status()).toBe(200);
  return (await res.json()).data as LeadRow[];
}

test.describe("POST /api/public/leads", () => {
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
  });

  test("không có refCode → lead kênh Online, chưa phân công", async ({ request }) => {
    const name = `Khách web ${suffix()}`;
    const phone = uniquePhone();
    const res = await postLead(request, randomIp(), {
      name,
      phone,
      demand: "Cần tư vấn gói cước cáp quang",
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toEqual({ success: true, data: { message: "Đã ghi nhận" } });

    const lead = (await listLeads(request, adminToken)).find((l) => l.customerName === name);
    expect(lead, "lead phải được tạo").toBeTruthy();
    expect(lead!.channel).toBe("Online");
    expect(lead!.staffName).toBe("Chưa phân công");
    expect(lead!.group).toBe("Lead KH mới");
    expect(lead!.phone).toBe(phone);
    expect(lead!.expectedValue).toBe(0);
    expect(lead!.demandDescription).toBe("Cần tư vấn gói cước cáp quang");
    expect(lead!.referredByCtvId ?? null).toBeNull();
  });

  test("refCode của CTV đã duyệt → kênh CTV giới thiệu và gắn đúng CTV", async ({ request }) => {
    const ctv = await createApprovedCtv(request, adminToken);
    const name = `Khách CTV ${suffix()}`;
    const res = await postLead(request, randomIp(), {
      name,
      phone: uniquePhone(),
      refCode: ctv.referralCode,
    });
    expect(res.status()).toBe(201);

    const lead = (await listLeads(request, adminToken)).find((l) => l.customerName === name);
    expect(lead, "lead phải được tạo").toBeTruthy();
    expect(lead!.channel).toBe("CTV giới thiệu");
    expect(lead!.staffName).toBe("Chưa phân công");
    // Trường này do DTO của /api/leads (Task 5) trả về.
    expect(lead!.referredByCtvId).toBe(ctv.id);
  });

  test("refCode bậy → vẫn tạo lead Online, không gắn CTV", async ({ request }) => {
    const name = `Khách ref giả ${suffix()}`;
    const res = await postLead(request, randomIp(), {
      name,
      phone: uniquePhone(),
      refCode: "KHONGTONTAI",
    });
    expect(res.status()).toBe(201);

    const lead = (await listLeads(request, adminToken)).find((l) => l.customerName === name);
    expect(lead).toBeTruthy();
    expect(lead!.channel).toBe("Online");
    expect(lead!.referredByCtvId ?? null).toBeNull();
  });

  test("refCode của CTV Chờ duyệt → vẫn tạo lead Online", async ({ request }) => {
    const { res: regRes, payload } = await registerCtv(request);
    expect(regRes.status()).toBe(201);
    const listRes = await request.get(
      `${API_URL}/ctv-accounts?status=${encodeURIComponent("Chờ duyệt")}`,
      { headers: bearer(adminToken) }
    );
    const pending: Array<{ username: string; referralCode: string }> = (await listRes.json()).data;
    const account = pending.find((a) => a.username === payload.username);
    expect(account, "CTV vừa đăng ký phải nằm trong danh sách chờ duyệt").toBeTruthy();

    const name = `Khách ref chờ ${suffix()}`;
    const res = await postLead(request, randomIp(), {
      name,
      phone: uniquePhone(),
      refCode: account!.referralCode,
    });
    expect(res.status()).toBe(201);

    const lead = (await listLeads(request, adminToken)).find((l) => l.customerName === name);
    expect(lead).toBeTruthy();
    expect(lead!.channel).toBe("Online");
    expect(lead!.referredByCtvId ?? null).toBeNull();
  });

  test("honeypot có giá trị → 201 giả và không lưu lead", async ({ request }) => {
    const name = `Bot ${suffix()}`;
    const phone = uniquePhone();
    const res = await postLead(request, randomIp(), {
      name,
      phone,
      website: "http://spam.example.com",
    });
    expect(res.status()).toBe(201);
    expect(await res.json()).toEqual({ success: true, data: { message: "Đã ghi nhận" } });

    // So theo tên + SĐT duy nhất của request này (tổng số lead đổi theo các test chạy song song).
    const after = await listLeads(request, adminToken);
    expect(after.filter((l) => l.customerName === name || l.phone === phone)).toHaveLength(0);
  });

  test("dữ liệu sai → 400", async ({ request }) => {
    const ip = randomIp();
    const cases: Array<[string, Record<string, unknown>]> = [
      ["SĐT sai", { name: "Nguyễn Văn A", phone: "12345" }],
      ["SĐT có chữ", { name: "Nguyễn Văn A", phone: "09abc12345" }],
      ["tên 1 ký tự", { name: "A", phone: uniquePhone() }],
      ["thiếu tên", { phone: uniquePhone() }],
      ["demand > 500", { name: "Nguyễn Văn A", phone: uniquePhone(), demand: "x".repeat(501) }],
    ];
    for (const [label, body] of cases) {
      const res = await postLead(request, ip, body);
      expect(res.status(), label).toBe(400);
      const json = await res.json();
      expect(json.success, label).toBe(false);
      expect(typeof json.message, label).toBe("string");
    }
  });

  test("demand đúng 500 ký tự và tên 2 ký tự → 201", async ({ request }) => {
    const res = await postLead(request, randomIp(), {
      name: "An",
      phone: uniquePhone(),
      demand: "x".repeat(500),
    });
    expect(res.status()).toBe(201);
  });

  test("quá 5 lần/10 phút từ một IP → 429 ở lần thứ 6", async ({ request }) => {
    const ip = randomIp();
    for (let i = 1; i <= 5; i += 1) {
      const res = await postLead(request, ip, { name: `Rate ${suffix()}`, phone: uniquePhone() });
      expect(res.status(), `request ${i}`).toBe(201);
    }
    const sixth = await postLead(request, ip, { name: `Rate ${suffix()}`, phone: uniquePhone() });
    expect(sixth.status()).toBe(429);
    expect((await sixth.json()).success).toBe(false);

    // IP khác không bị ảnh hưởng.
    const other = await postLead(request, randomIp(), { name: `Rate ${suffix()}`, phone: uniquePhone() });
    expect(other.status()).toBe(201);
  });
});

test.describe("GET /api/public/ref/:code", () => {
  test("mã đúng → valid:true, mã sai/CTV chưa duyệt → valid:false, không lộ tên CTV", async ({
    request,
  }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    const ctv = await createApprovedCtv(request, adminToken);

    const ok = await request.get(`${API_URL}/public/ref/${ctv.referralCode}`);
    expect(ok.status()).toBe(200);
    expect(await ok.json()).toEqual({ success: true, data: { valid: true } });

    const bad = await request.get(`${API_URL}/public/ref/KHONGTONTAI`);
    expect(bad.status()).toBe(200);
    expect(await bad.json()).toEqual({ success: true, data: { valid: false } });

    const { res: regRes, payload } = await registerCtv(request);
    expect(regRes.status()).toBe(201);
    const listRes = await request.get(
      `${API_URL}/ctv-accounts?status=${encodeURIComponent("Chờ duyệt")}`,
      { headers: bearer(adminToken) }
    );
    const pending: Array<{ username: string; referralCode: string }> = (await listRes.json()).data;
    const account = pending.find((a) => a.username === payload.username)!;
    const pend = await request.get(`${API_URL}/public/ref/${account.referralCode}`);
    expect((await pend.json()).data.valid).toBe(false);
  });
});
