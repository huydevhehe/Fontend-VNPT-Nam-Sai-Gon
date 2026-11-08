import { expect, test } from "@playwright/test";
import { loginAs } from "./fixtures/auth";

test.describe("Admin sửa số tiền hoa hồng trên UI", () => {
  test("Admin mở modal sửa số tiền, lưu và reload trang vẫn giữ nguyên", async ({ page }) => {
    await loginAs(page, "admin");
    await page.goto("/admin/commissions");

    // Chờ bảng dữ liệu tải xong
    await expect(page.locator("table")).toBeVisible({ timeout: 15_000 });

    // Tìm nút "Sửa số tiền" ở dòng đầu tiên
    const editBtn = page.getByRole("button", { name: "Sửa số tiền" }).first();
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // Modal hiển thị
    await expect(page.getByRole("heading", { name: "Sửa số tiền hoa hồng" })).toBeVisible();

    const uniqueAmount = 456000;
    const testNote = `Ghi chú test UI ${Date.now()}`;

    const amountInput = page.getByPlaceholder("Nhập số tiền...");
    await amountInput.fill(String(uniqueAmount));

    const noteInput = page.getByPlaceholder("VD: Áp dụng mức 20% theo thoả thuận gói CNTT...");
    await noteInput.fill(testNote);

    await page.getByRole("button", { name: "Lưu thay đổi" }).click();

    // Modal biến mất
    await expect(page.getByRole("heading", { name: "Sửa số tiền hoa hồng" })).toBeHidden({ timeout: 10_000 });

    // Kiểm tra số tiền mới hiển thị trong bảng
    await expect(page.getByText("456.000 ₫")).toBeVisible();
    await expect(page.getByText(testNote)).toBeVisible();

    // Reload lại trang để kiểm tra ghi DB thật
    await page.reload();
    await expect(page.locator("table")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("456.000 ₫")).toBeVisible();
    await expect(page.getByText(testNote)).toBeVisible();
  });

  test("AM vào /admin/commissions không thấy nút Sửa số tiền", async ({ page }) => {
    await loginAs(page, "am");
    await page.goto("/admin/commissions");

    await expect(page.locator("table")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: "Sửa số tiền" })).toHaveCount(0);
  });
});
