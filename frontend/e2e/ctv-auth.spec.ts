import { expect, test, type Page } from "@playwright/test";
import { loginAs } from "./fixtures/auth";
import { randomIp, uniquePhone } from "./api/helpers";

function fieldByLabel(page: Page, labelText: string) {
  return page
    .locator(`div:has(> label:text-is("${labelText}")) :is(input, select, textarea)`)
    .first();
}

test.describe("CTV đăng ký, Admin duyệt, đăng nhập chung (UI)", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/auth/register-ctv", (route) =>
      route.continue({ headers: { ...route.request().headers(), "x-forwarded-for": randomIp() } })
    );
  });

  test("đăng ký → chờ duyệt → Admin duyệt → CTV vào dashboard riêng", async ({ page, browser }) => {
    const suffix = Date.now();
    const username = `ctv_ui_${suffix}`;
    const password = "Ctv@Ui12345";

    // (a) Đăng ký
    await page.goto("/cong-tac-vien/dang-ky");
    await page.getByLabel("Tên đăng nhập").fill(username);
    await page.getByLabel("Họ và tên").fill(`CTV UI ${suffix}`);
    await page.getByLabel("Số điện thoại").fill(uniquePhone());
    await page.getByLabel("Mật khẩu", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Gửi đăng ký" }).click();
    await expect(page.getByText(/đã được gửi.*chờ Admin duyệt/)).toBeVisible({ timeout: 10_000 });

    // (b) Đăng nhập khi chưa duyệt → thấy message chờ duyệt
    await page.goto("/login");
    await page.getByLabel("Tên đăng nhập").fill(username);
    await page.getByLabel("Mật khẩu").fill(password);
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page.getByText("Tài khoản đang chờ Admin duyệt")).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/login$/);

    // Sai mật khẩu vẫn chỉ hiện thông báo chung
    await page.getByLabel("Mật khẩu").fill("Sai-mat-khau-1");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page.getByText("Sai tài khoản hoặc mật khẩu")).toBeVisible({ timeout: 10_000 });

    // (c) Admin duyệt
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await loginAs(adminPage, "admin");
    await adminPage.goto("/admin/ctv-accounts");
    await adminPage.getByPlaceholder(/Tìm theo/).fill(username);
    const row = adminPage.locator("tbody tr", { hasText: username });
    await expect(row).toBeVisible({ timeout: 10_000 });
    await expect(row.getByText("Chờ duyệt")).toBeVisible();
    await row.getByRole("button", { name: "Duyệt", exact: true }).click();
    await expect(row.getByText("Đang hoạt động")).toBeVisible({ timeout: 10_000 });
    await adminContext.close();

    // (d) CTV đăng nhập → dashboard CTV trong browser context mới
    const ctvContext = await browser.newContext();
    const ctvPage = await ctvContext.newPage();
    await ctvPage.goto("/login");
    await ctvPage.getByLabel("Tên đăng nhập").fill(username);
    await ctvPage.getByLabel("Mật khẩu").fill(password);
    await ctvPage.getByRole("button", { name: "Đăng nhập" }).click();
    await ctvPage.waitForURL("**/cong-tac-vien/dashboard", { timeout: 15_000, waitUntil: "domcontentloaded" });

    // CTV vào /admin bị đẩy về dashboard CTV
    await ctvPage.goto("/admin/dashboard");
    await ctvPage.waitForURL("**/cong-tac-vien/dashboard", { timeout: 15_000, waitUntil: "domcontentloaded" });
    await ctvContext.close();
  });

  test("Admin từ chối CTV → đăng nhập thấy thông báo chưa được duyệt", async ({ page, browser }) => {
    const suffix = Date.now();
    const username = `ctv_rej_${suffix}`;
    const password = "Ctv@Rej12345";

    await page.goto("/cong-tac-vien/dang-ky");
    await page.getByLabel("Tên đăng nhập").fill(username);
    await page.getByLabel("Họ và tên").fill(`CTV Rej ${suffix}`);
    await page.getByLabel("Số điện thoại").fill(uniquePhone());
    await page.getByLabel("Mật khẩu", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Gửi đăng ký" }).click();
    await expect(page.getByText(/đã được gửi.*chờ Admin duyệt/)).toBeVisible({ timeout: 10_000 });

    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await loginAs(adminPage, "admin");
    await adminPage.goto("/admin/ctv-accounts");
    await adminPage.getByPlaceholder(/Tìm theo/).fill(username);
    const row = adminPage.locator("tbody tr", { hasText: username });
    await expect(row).toBeVisible({ timeout: 10_000 });
    await row.getByRole("button", { name: "Từ chối", exact: true }).click();
    await expect(row.getByText("Từ chối", { exact: true }).first()).toBeVisible({ timeout: 10_000 });
    await adminContext.close();

    const ctvContext = await browser.newContext();
    const ctvPage = await ctvContext.newPage();
    await ctvPage.goto("/login");
    await ctvPage.getByLabel("Tên đăng nhập").fill(username);
    await ctvPage.getByLabel("Mật khẩu").fill(password);
    await ctvPage.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(ctvPage.getByText("Đăng ký cộng tác viên chưa được duyệt")).toBeVisible({
      timeout: 10_000,
    });
    await ctvContext.close();
  });

  test("form đăng ký hiện lỗi 409 từ server khi trùng tên đăng nhập, và chặn dữ liệu sai ở client", async ({
    page,
  }) => {
    // Tên đăng nhập 'admin' đã tồn tại (seed)
    await page.goto("/cong-tac-vien/dang-ky");
    await page.getByLabel("Tên đăng nhập").fill("admin");
    await page.getByLabel("Họ và tên").fill("Người Trùng Tên");
    await page.getByLabel("Số điện thoại").fill(uniquePhone());
    await page.getByLabel("Mật khẩu", { exact: true }).fill("Ctv@Dup12345");
    await page.getByRole("button", { name: "Gửi đăng ký" }).click();
    await expect(page.getByText("Tên đăng nhập đã tồn tại")).toBeVisible({ timeout: 10_000 });

    // Validate client: số điện thoại sai
    await page.getByLabel("Số điện thoại").fill("12345");
    await page.getByRole("button", { name: "Gửi đăng ký" }).click();
    await expect(page.getByText(/Số điện thoại phải gồm 10 chữ số/)).toBeVisible();
  });

  test("Admin tạo nhân viên → nhân viên đăng nhập bằng mật khẩu ban đầu và phải đổi mật khẩu", async ({
    page,
  }) => {
    const suffix = Date.now();
    const code = `NV-UI-${suffix}`;
    const password = `InitPass@${suffix}`;

    await loginAs(page, "admin");
    await page.goto("/admin/employees");
    await page.getByRole("button", { name: "Thêm nhân viên" }).click();
    await fieldByLabel(page, "Mã nhân viên").fill(code);
    await fieldByLabel(page, "Họ tên").fill(`NV UI ${suffix}`);
    const territoryField = fieldByLabel(page, "Phường phụ trách");
    if ((await territoryField.count()) > 0) {
      const tagName = await territoryField.evaluate((el) => el.tagName.toLowerCase());
      if (tagName === "select") {
        await territoryField.selectOption({ index: 1 });
      } else {
        await territoryField.fill("Phường Tân Phong");
      }
    }
    await fieldByLabel(page, "Email VNPT").fill(`nv-ui-${suffix}@example.com`);
    await page.getByPlaceholder("Mật khẩu ban đầu").fill(password);
    await page.getByPlaceholder("Nhập lại chính xác").fill(password);
    await page.getByRole("button", { name: "Tạo nhân viên" }).click();

    await expect(page.getByRole("table").getByText(code, { exact: true })).toBeVisible({
      timeout: 10_000,
    });

    // Nhân viên mới đăng nhập bằng mật khẩu ban đầu → bị bắt đổi mật khẩu lần đầu
    const fresh = await page.context().browser()!.newContext();
    const freshPage = await fresh.newPage();
    await freshPage.goto("/login");
    await freshPage.getByLabel("Tên đăng nhập").fill(code);
    await freshPage.getByLabel("Mật khẩu").fill(password);
    await freshPage.getByRole("button", { name: "Đăng nhập" }).click();
    await freshPage.waitForURL("**/doi-mat-khau", { timeout: 15_000, waitUntil: "domcontentloaded" });

    // Đổi mật khẩu sang mật khẩu mới
    const newPass = `${code}@NewPass123`;
    await freshPage.getByLabel("Mật khẩu hiện tại").fill(password);
    await freshPage.locator("#newPassword").fill(newPass);
    await freshPage.locator("#confirmPassword").fill(newPass);
    await freshPage.getByRole("button", { name: "Cập nhật mật khẩu" }).click();

    await freshPage.waitForURL("**/admin/dashboard", { timeout: 15_000, waitUntil: "domcontentloaded" });
    await fresh.close();
  });
});
