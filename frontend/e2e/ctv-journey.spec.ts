import { expect, test, type Locator, type Page } from "@playwright/test";
import { ADMIN, API_URL, apiLogin, bearer, createApprovedCtv, uniquePhone } from "./api/helpers";
import { loginAs } from "./fixtures/auth";

const STAFF = "Nguyễn Thị Tình";
const CONTRACT_VALUE = 15000000;
const COMMISSION_TEXT = "1.500.000";

interface Ward {
  id: string;
  ward_name: string;
}

interface AdminLead {
  id: string;
  customerName: string;
}

/** Lấy control (input/select/textarea) nằm cùng div với label có text khớp chính xác. */
function fieldByLabel(scope: Page | Locator, labelText: string): Locator {
  return scope
    .locator(`div:has(> label:text-is("${labelText}")) :is(input, select, textarea)`)
    .first();
}

function randomIp(): string {
  const n = () => Math.floor(Math.random() * 254) + 1;
  return `201.${n()}.${n()}.${n()}`;
}

async function fillContactForm(page: Page, name: string, phone: string) {
  await page.getByLabel("Họ và tên").fill(name);
  await page.getByLabel("Số điện thoại").fill(phone);
  await page.getByLabel("Nội dung liên hệ").fill("Cần tư vấn gói Internet cho gia đình");
  await page.getByRole("checkbox").check();
}

async function loginAsCtvUser(
  page: Page,
  ctv: { username: string; password: string }
): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Tên đăng nhập").fill(ctv.username);
  await page.getByLabel("Mật khẩu").fill(ctv.password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL("**/cong-tac-vien/dashboard", { timeout: 15_000 });
}

async function findLeadByName(
  request: Parameters<typeof apiLogin>[0],
  adminToken: string,
  name: string
): Promise<AdminLead> {
  const res = await request.get(`${API_URL}/leads`, { headers: bearer(adminToken) });
  expect(res.status()).toBe(200);
  const leads: AdminLead[] = (await res.json()).data;
  const lead = leads.find((l) => l.customerName === name);
  if (!lead) {
    throw new Error(`Không tìm thấy lead "${name}" qua API admin`);
  }
  return lead;
}

test.describe("Hành trình CTV đầu-cuối", () => {
  test("ref -> lead -> phân công -> HĐ -> hoa hồng -> CTV xem -> chi tiết Phường", async ({
    page,
    request,
  }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    const ctv = await createApprovedCtv(request, adminToken);

    const wardsRes = await request.get(`${API_URL}/territories`, { headers: bearer(adminToken) });
    expect(wardsRes.status()).toBe(200);
    const wards: Ward[] = (await wardsRes.json()).data;
    expect(wards.length).toBeGreaterThanOrEqual(1);
    const ward = wards[0];

    const suffix = Date.now();
    const customerName = `KH Hành trình ${suffix}`;
    const phone = uniquePhone();
    const transactionCode = `GD-HT-${suffix}`;

    let leadRow: Locator;

    await test.step("Khách vào /ref/<mã>?to=/lien-he và gửi form liên hệ", async () => {
      const ip = randomIp();
      await page.route("**/public/leads", (route) =>
        route.continue({ headers: { ...route.request().headers(), "x-forwarded-for": ip } })
      );
      await page.goto(`/ref/${ctv.referralCode}?to=/lien-he`);
      await page.waitForURL((url) => url.pathname === "/lien-he");
      await fillContactForm(page, customerName, phone);
      await page.getByRole("button", { name: "GỬI THÔNG TIN" }).click();
      await expect(page.getByText("Cảm ơn bạn đã liên hệ!")).toBeVisible({ timeout: 10_000 });
    });

    await test.step("Admin thấy lead \"CTV giới thiệu\" chưa phân công", async () => {
      await loginAs(page, "admin");
      await page.goto("/admin/leads");
      await page.getByPlaceholder("Tìm theo tên Lead, SĐT, kênh phát triển...").fill(phone);
      leadRow = page.locator("table tbody tr", { hasText: phone });
      await expect(leadRow).toHaveCount(1);
      await expect(leadRow).toContainText("CTV giới thiệu");
      await expect(leadRow).toContainText("CTV E2E Test");
      await expect(leadRow).toContainText("Chưa phân công");
    });

    await test.step("Phân công nhân viên và Phường cho lead", async () => {
      await leadRow.getByRole("button", { name: "Phân công" }).click();
      await expect(page.getByRole("heading", { name: "Phân công Lead" })).toBeVisible();
      await fieldByLabel(page, "Nhân viên phụ trách").selectOption(STAFF);
      await fieldByLabel(page, "Phường").selectOption(ward.id);
      await page.getByRole("button", { name: "Lưu phân công" }).click();
      await expect(page.getByRole("heading", { name: "Phân công Lead" })).not.toBeVisible({
        timeout: 10_000,
      });
      await expect(leadRow).toContainText(STAFF);
      await expect(leadRow).toContainText(ward.ward_name);
    });

    await test.step("Đổi trạng thái lead sang Chốt thành công", async () => {
      await leadRow.locator("select").first().selectOption("Chốt thành công");
      await expect(leadRow.locator("select").first()).toHaveValue("Chốt thành công", {
        timeout: 10_000,
      });
    });

    let contractRow: Locator;

    await test.step("Tạo hợp đồng từ lead", async () => {
      await page.goto("/admin/contracts");
      await page.getByRole("button", { name: "Thêm hợp đồng" }).click();
      await expect(page.getByRole("heading", { name: "Thêm hợp đồng" })).toBeVisible();

      const lead = await findLeadByName(request, adminToken, customerName);
      await fieldByLabel(page, "Từ Lead").selectOption(lead.id);
      await expect(fieldByLabel(page, "Tên khách hàng")).toHaveValue(customerName);
      await fieldByLabel(page, "Mã giao dịch").fill(transactionCode);
      await fieldByLabel(page, "Giá trị hợp đồng (₫)").fill(String(CONTRACT_VALUE));
      await fieldByLabel(page, "Mã thuê bao (phân tách bởi dấu phẩy)").fill("0901234567");

      await page.getByRole("button", { name: "Tạo hợp đồng" }).click();
      await expect(page.getByRole("heading", { name: "Thêm hợp đồng" })).not.toBeVisible({
        timeout: 10_000,
      });

      await page
        .getByPlaceholder("Tìm theo mã giao dịch, khách hàng, mã thuê bao...")
        .fill(transactionCode);
      contractRow = page.locator("table tbody tr", { hasText: transactionCode });
      await expect(contractRow).toHaveCount(1);
      await expect(contractRow).toContainText("CTV E2E Test");
      await expect(contractRow).toContainText(ward.ward_name);
    });

    await test.step("Đổi hợp đồng sang Hoàn tất triển khai", async () => {
      const deploymentSelect = contractRow.locator("select").first();
      await deploymentSelect.selectOption("Hoàn tất");
      await expect(deploymentSelect).toHaveValue("Hoàn tất", { timeout: 10_000 });
    });

    let commissionRow: Locator;

    await test.step("Trang Hoa hồng có dòng Chờ chi của CTV", async () => {
      await page.goto("/admin/commissions");
      await page
        .getByPlaceholder("Tìm theo đối tượng thụ hưởng, mã giao dịch...")
        .fill(transactionCode);
      commissionRow = page.locator("table tbody tr", { hasText: transactionCode });
      await expect(commissionRow).toHaveCount(1);
      await expect(commissionRow).toContainText("CTV E2E Test");
      await expect(commissionRow).toContainText(COMMISSION_TEXT);
      await expect(commissionRow.locator("select")).toHaveValue("Chờ chi");
    });

    await test.step("Admin đổi hoa hồng sang Đã chi", async () => {
      await commissionRow.locator("select").selectOption("Đã chi");
      await expect(commissionRow.locator("select")).toHaveValue("Đã chi", { timeout: 10_000 });
    });

    await test.step("CTV đăng nhập thấy lead, hợp đồng, hoa hồng Đã chi, tổng khớp", async () => {
      await loginAsCtvUser(page, ctv);

      await expect(page.getByTestId("stat-total-leads")).toContainText("1", { timeout: 10_000 });
      await expect(page.getByTestId("stat-successful-leads")).toContainText("1");
      await expect(page.getByTestId("stat-total-contracts")).toContainText("1");
      await expect(page.getByTestId("stat-total-commission")).toContainText(COMMISSION_TEXT);
      await expect(page.getByTestId("stat-pending-commission")).toContainText("0");
      await expect(page.getByTestId("stat-paid-commission")).toContainText(COMMISSION_TEXT);

      await page.goto("/cong-tac-vien/dashboard/don-hang");
      const ctvLeadRow = page.locator("tbody tr", { hasText: customerName });
      await expect(ctvLeadRow).toBeVisible({ timeout: 10_000 });
      await expect(ctvLeadRow).toContainText("Chốt thành công");
      const body = await page.locator("tbody").innerText();
      expect(body).not.toContain(phone);
      expect(body).toContain(`${phone.slice(0, 4)}****${phone.slice(-2)}`);

      await page.goto("/cong-tac-vien/dashboard/hop-dong");
      const ctvContractRow = page.locator("tbody tr", { hasText: transactionCode });
      await expect(ctvContractRow).toBeVisible({ timeout: 10_000 });
      await expect(ctvContractRow).toContainText("15.000.000");
      await expect(ctvContractRow).toContainText("Hoàn tất");

      await page.goto("/cong-tac-vien/dashboard/hoa-hong");
      const ctvCommissionRow = page.locator("tbody tr", { hasText: transactionCode });
      await expect(ctvCommissionRow).toBeVisible({ timeout: 10_000 });
      await expect(ctvCommissionRow).toContainText(COMMISSION_TEXT);
      await expect(ctvCommissionRow).toContainText("Đã chi");
    });

    await test.step("Chi tiết Phường của lead hiện lead và hợp đồng vừa tạo", async () => {
      await loginAs(page, "admin");
      await page.goto(`/admin/territories/${ward.id}`);
      await expect(page.getByRole("heading", { name: "Lead dự án đang theo" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Hợp đồng đã triển khai" })).toBeVisible();
      await expect(page.getByText(customerName).first()).toBeVisible();
      await expect(page.getByText(transactionCode)).toBeVisible();
    });

    // Xác nhận id của lead thật nằm trong admin list để chắc dữ liệu đã lưu DB.
    const leadFromApi = await findLeadByName(request, adminToken, customerName);
    expect(leadFromApi.id).toBeTruthy();
  });
});
