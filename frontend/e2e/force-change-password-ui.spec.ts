import { expect, test } from "@playwright/test";
import { ADMIN, API_URL, apiLogin, bearer } from "./api/helpers";

test.describe("Bắt đổi mật khẩu nhân viên mới trên UI", () => {
  test("Nhân viên mới đăng nhập bằng mật khẩu mặc định bị chuyển tới /doi-mat-khau, đổi xong mới vào được dashboard", async ({
    page,
    request,
  }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);

    // 1. Admin tạo nhân viên mới có password do admin đặt và mustChangePassword = true
    const code = `NV-UI-${Date.now()}`;
    const defaultPassword = `${code}@Vnpt2026`;
    const newPassword = "MyNewPassword@2026";

    const createRes = await request.post(`${API_URL}/staff`, {
      headers: bearer(adminToken),
      data: {
        code,
        name: `Nhân viên UI ${code}`,
        role: "AM",
        territory: "Phường 1",
        password: defaultPassword,
        mustChangePassword: true,
      },
    });
    expect(createRes.status()).toBe(201);

    // 2. Nhân viên đăng nhập tại /login bằng mật khẩu mặc định
    await page.goto("/login");
    await page.getByLabel("Tên đăng nhập").fill(code);
    await page.getByLabel("Mật khẩu").fill(defaultPassword);
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    // 3. Phải bị chuyển hướng sang /doi-mat-khau
    await page.waitForURL("**/doi-mat-khau", { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Đổi mật khẩu tài khoản" })).toBeVisible();

    // 4. Cố tình truy cập trang khác (/admin/dashboard) -> vẫn bị đẩy về /doi-mat-khau
    await page.goto("/admin/dashboard");
    await page.waitForURL("**/doi-mat-khau", { timeout: 15_000 });

    // 5. Điền form đổi mật khẩu
    await page.getByLabel("Mật khẩu hiện tại").fill(defaultPassword);
    await page.getByLabel("Mật khẩu mới (ít nhất 8 ký tự)").fill(newPassword);
    await page.getByLabel("Xác nhận mật khẩu mới").fill(newPassword);
    await page.getByRole("button", { name: "Cập nhật mật khẩu" }).click();

    // 6. Hiển thị thông báo thành công và chuyển về dashboard
    await expect(page.getByText("Đổi mật khẩu thành công!")).toBeVisible();
    await page.waitForURL("**/admin/dashboard", { timeout: 15_000 });

    // 7. Đăng xuất
    await page.getByRole("button", { name: "Đăng xuất" }).click();
    await page.waitForURL("**/login", { timeout: 15_000 });

    // 8. Đăng nhập lại bằng mật khẩu MỚI -> thành công vào thẳng dashboard
    await page.getByLabel("Tên đăng nhập").fill(code);
    await page.getByLabel("Mật khẩu").fill(newPassword);
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15_000 });
    await expect(page.locator("h1").first()).toBeVisible();
  });
});
