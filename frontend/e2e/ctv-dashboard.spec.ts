import { expect, test, type Page } from "@playwright/test";
import { ADMIN, API_URL, apiLogin, bearer, createApprovedCtv } from "./api/helpers";

const STAFF = "Nguyễn Thị Tình";
const CONTRACT_VALUE = 12000000;
const COMMISSION_TEXT = "1.200.000";

function randomIp(): string {
  const n = () => Math.floor(Math.random() * 254) + 1;
  return `192.${n()}.${n()}.${n()}`;
}

function uniq(): string {
  return `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
}

type Ctv = Awaited<ReturnType<typeof createApprovedCtv>>;

async function loginAsCtv(page: Page, ctv: Ctv): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Tên đăng nhập").fill(ctv.username);
  await page.getByLabel("Mật khẩu").fill(ctv.password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL("**/cong-tac-vien/dashboard", { timeout: 15_000 });
}

test.describe("Dashboard CTV chạy dữ liệu thật", () => {
  let ctv: Ctv;
  let other: Ctv;
  const leadNames: string[] = [];
  const phones: string[] = [];
  let otherLeadName = "";
  let contractCode = "";

  test.beforeAll(async ({ request }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    ctv = await createApprovedCtv(request, adminToken);
    other = await createApprovedCtv(request, adminToken);

    const tail = String(Date.now() % 100000).padStart(5, "0");
    const submit = async (refCode: string, name: string, phone: string) => {
      const res = await request.post(`${API_URL}/public/leads`, {
        data: { name, phone, refCode },
        headers: { "X-Forwarded-For": randomIp() },
      });
      expect(res.status()).toBe(201);
    };
    for (let i = 1; i <= 2; i += 1) {
      const name = `Khách UI CTV ${uniq()}`;
      const phone = `0909${tail}${i}`;
      leadNames.push(name);
      phones.push(phone);
      await submit(ctv.referralCode, name, phone);
    }
    otherLeadName = `Khách UI khác ${uniq()}`;
    await submit(other.referralCode, otherLeadName, `0988${tail}9`);

    const listRes = await request.get(`${API_URL}/leads`, { headers: bearer(adminToken) });
    const leads: Array<{ id: string; customerName: string }> = (await listRes.json()).data;
    for (const name of leadNames) {
      const lead = leads.find((l) => l.customerName === name)!;
      const assign = await request.patch(`${API_URL}/leads/${lead.id}/assignment`, {
        headers: bearer(adminToken),
        data: { staffName: STAFF },
      });
      expect(assign.status()).toBe(200);
    }

    contractCode = `GD-UI-${uniq()}`;
    const first = leads.find((l) => l.customerName === leadNames[0])!;
    const created = await request.post(`${API_URL}/contracts`, {
      headers: bearer(adminToken),
      data: {
        transactionCode: contractCode,
        customerName: leadNames[0],
        subscriberCodes: ["0901234567"],
        totalValue: CONTRACT_VALUE,
        channel: "CTV giới thiệu",
        leadId: first.id,
      },
    });
    expect(created.status()).toBe(201);
    const contract = (await created.json()).data;
    const done = await request.patch(`${API_URL}/contracts/${contract.id}/status`, {
      headers: bearer(adminToken),
      data: { deploymentStatus: "Hoàn tất" },
    });
    expect(done.status()).toBe(200);
  });

  test("Tổng quan hiện đúng số liệu thật của CTV", async ({ page }) => {
    await loginAsCtv(page, ctv);
    await expect(page.getByTestId("stat-total-leads")).toContainText("2", { timeout: 10_000 });
    await expect(page.getByTestId("stat-successful-leads")).toContainText("0");
    await expect(page.getByTestId("stat-total-contracts")).toContainText("1");
    await expect(page.getByTestId("stat-total-commission")).toContainText(COMMISSION_TEXT);
    await expect(page.getByTestId("stat-pending-commission")).toContainText(COMMISSION_TEXT);
    // Tên CTV thật hiện ở thanh trên, không còn dữ liệu mẫu.
    await expect(page.getByText("Nguyễn Văn Minh")).toHaveCount(0);
    await expect(page.getByText("CTV E2E Test").first()).toBeVisible();
  });

  test("Đơn hàng chỉ có lead của mình, SĐT bị che", async ({ page }) => {
    await loginAsCtv(page, ctv);
    await page.goto("/cong-tac-vien/dashboard/don-hang");
    for (const name of leadNames) {
      await expect(page.locator("tbody tr", { hasText: name })).toBeVisible({ timeout: 10_000 });
    }
    await expect(page.getByText(otherLeadName)).toHaveCount(0);
    const body = await page.locator("tbody").innerText();
    for (const phone of phones) {
      expect(body).not.toContain(phone);
      expect(body).toContain(`${phone.slice(0, 4)}****${phone.slice(-2)}`);
    }
    await expect(page.locator("tbody tr", { hasText: leadNames[0] })).toContainText("Hoàn tất");
  });

  test("Hợp đồng hiện HĐ của mình", async ({ page }) => {
    await loginAsCtv(page, ctv);
    await page.goto("/cong-tac-vien/dashboard/hop-dong");
    const row = page.locator("tbody tr", { hasText: contractCode });
    await expect(row).toBeVisible({ timeout: 10_000 });
    await expect(row).toContainText("12.000.000");
    await expect(row).toContainText("Hoàn tất");
  });

  test("Hoa hồng hiện số tiền và trạng thái", async ({ page }) => {
    await loginAsCtv(page, ctv);
    await page.goto("/cong-tac-vien/dashboard/hoa-hong");
    const row = page.locator("tbody tr", { hasText: contractCode });
    await expect(row).toBeVisible({ timeout: 10_000 });
    await expect(row).toContainText(COMMISSION_TEXT);
    await expect(row).toContainText("Chờ chi");
  });

  test("Link giới thiệu hiện đúng mã của CTV và nút sao chép", async ({ page }) => {
    await loginAsCtv(page, ctv);
    await page.goto("/cong-tac-vien/dashboard/link-gioi-thieu");
    const origin = new URL(page.url()).origin;
    const generalLink = `${origin}/ref/${ctv.referralCode}`;
    await expect(page.locator(`input[value="${generalLink}"]`)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: "Sao chép" }).first()).toBeVisible();
    await expect(
      page.locator(`input[value^="${generalLink}?to=/san-pham/"]`).first()
    ).toBeVisible();
    await expect(page.getByText("Lượt click")).toHaveCount(0);
    await expect(page.getByTestId("ref-total-leads")).toContainText("2");
  });

  test("Sidebar chỉ còn các mục cần thiết", async ({ page }) => {
    await loginAsCtv(page, ctv);
    const aside = page.locator("aside");
    for (const label of [
      "Dashboard",
      "Đơn hàng",
      "Hợp đồng",
      "Hoa hồng",
      "Link giới thiệu",
      "Tài liệu & Banner",
      "Sản phẩm",
      "Hỗ trợ",
    ]) {
      await expect(aside.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    for (const label of ["Khách hàng", "Doanh số", "Thanh toán", "Thông báo", "Cài đặt"]) {
      await expect(aside.getByRole("link", { name: label, exact: true })).toHaveCount(0);
    }
  });

  test("CTV mở /admin/dashboard bị chuyển về dashboard CTV", async ({ page }) => {
    await loginAsCtv(page, ctv);
    await page.goto("/admin/dashboard");
    await page.waitForURL("**/cong-tac-vien/dashboard", { timeout: 15_000 });
  });

  test("Chưa đăng nhập mở dashboard CTV bị chuyển về /login", async ({ page }) => {
    await page.goto("/cong-tac-vien/dashboard");
    await page.waitForURL("**/login", { timeout: 15_000 });
    await page.goto("/cong-tac-vien/dashboard/hoa-hong");
    await page.waitForURL("**/login", { timeout: 15_000 });
  });

  test("Nhân viên mở dashboard CTV bị chuyển về /admin/dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Tên đăng nhập").fill(ADMIN.username);
    await page.getByLabel("Mật khẩu").fill(ADMIN.password);
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15_000 });
    await page.goto("/cong-tac-vien/dashboard");
    await page.waitForURL("**/admin/dashboard", { timeout: 15_000 });
  });
});
