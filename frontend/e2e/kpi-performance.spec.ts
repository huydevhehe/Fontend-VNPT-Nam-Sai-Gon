import { expect, test } from "@playwright/test";
import { loginAs } from "./fixtures/auth";
import { ADMIN, API_URL, apiLogin, bearer } from "./api/helpers";

/** Tên nhân viên gắn với tài khoản AM test (xem 00-tong-quan.md mục 3). */
const AM_STAFF_NAME = "Nguyễn Thị Tình";

test.describe("Tab % thực hiện theo nhân viên (Đợt 9 - Task 4)", () => {
  test("admin nhập chỉ tiêu thu ngay 100% cho AM test → tab % thực hiện trang Nợ hiện đúng chỉ tiêu; AM chỉ thấy 1 dòng", async ({
    page,
    request,
  }) => {
    const month = new Date().toISOString().slice(0, 7);
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);

    const putRes = await request.put(`${API_URL}/kpi/targets/${month}`, {
      headers: bearer(adminToken),
      data: { items: [{ staffName: AM_STAFF_NAME, kpiKey: "thu_ngay", targetRate: 1.0 }] },
    });
    expect(putRes.status(), await putRes.text()).toBe(200);

    await loginAs(page, "admin");
    await page.goto("/admin/debt-management");
    await page.getByRole("button", { name: "% thực hiện theo nhân viên" }).click();

    const amRow = page.locator("tbody tr", { hasText: AM_STAFF_NAME });
    await expect(amRow).toBeVisible();
    await expect(amRow).toContainText("100.0%");

    await loginAs(page, "am");
    await page.goto("/admin/debt-management");
    await page.getByRole("button", { name: "% thực hiện theo nhân viên" }).click();

    const amRows = page.locator("tbody tr");
    await expect(amRows).toHaveCount(1);
    await expect(amRows.first()).toContainText(AM_STAFF_NAME);
  });
});
