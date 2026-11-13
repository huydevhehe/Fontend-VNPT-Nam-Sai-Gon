import { expect, test } from "@playwright/test";
import { loginAs } from "./fixtures/auth";

test.describe("Admin sửa số tiền hoa hồng trên UI", () => {
  // Các test cùng thao tác trên "dòng đầu tiên" của bảng (dữ liệu DB thật,
  // dùng chung giữa các worker) — chạy serial để tránh đua ghi đè nhau.
  test.describe.configure({ mode: "serial" });

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

    const uniqueAmount = 400000 + Math.floor((Date.now() % 90000) / 1000) * 1000;
    const testNote = `Ghi chú test UI ${Date.now()}`;
    const formattedAmount = `${uniqueAmount.toLocaleString("vi-VN")} ₫`;

    const amountInput = page.getByPlaceholder("Nhập số tiền...");
    await amountInput.fill(String(uniqueAmount));

    const noteInput = page.getByPlaceholder("VD: Áp dụng mức 20% theo thoả thuận gói CNTT...");
    await noteInput.fill(testNote);

    await page.getByRole("button", { name: "Lưu thay đổi" }).click();

    // Modal biến mất
    await expect(page.getByRole("heading", { name: "Sửa số tiền hoa hồng" })).toBeHidden({ timeout: 10_000 });

    // Kiểm tra số tiền mới hiển thị trong bảng
    await expect(page.getByText(formattedAmount).first()).toBeVisible();
    await expect(page.getByText(testNote)).toBeVisible();

    // Reload lại trang để kiểm tra ghi DB thật
    await page.reload();
    await expect(page.locator("table")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(formattedAmount).first()).toBeVisible();
    await expect(page.getByText(testNote)).toBeVisible();
  });

  test("AM vào /admin/commissions không thấy nút Sửa số tiền", async ({ page }) => {
    await loginAs(page, "am");
    await page.goto("/admin/commissions");

    await expect(page.locator("table")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: "Sửa số tiền" })).toHaveCount(0);
  });

  test("Admin ghi nhận đã chi hoa hồng, cột Còn lại tự trừ và giữ sau reload", async ({ page }) => {
    await loginAs(page, "admin");
    await page.goto("/admin/commissions");

    await expect(page.locator("table")).toBeVisible({ timeout: 15_000 });

    // Cột theo Global Constraints đợt 4: 0 Mã giao dịch, 5 Hoa hồng phải chi,
    // 6 Đã chi hoa hồng, 7 Còn lại.
    const firstRow = page.locator("table tbody tr").first();
    // Chỉ lấy text của <span> số tiền, không lấy cả <p> ghi chú bên dưới
    // (ghi chú có thể chứa số, ví dụ timestamp của test "Sửa số tiền").
    const amountText = await firstRow.locator("td").nth(5).locator("span").first().innerText();
    const amount = Number(amountText.replace(/[^\d-]/g, ""));

    const payoutBtn = page.getByRole("button", { name: "Chi hoa hồng" }).first();
    await expect(payoutBtn).toBeVisible();
    await payoutBtn.click();

    await expect(page.getByRole("heading", { name: "Chi hoa hồng" })).toBeVisible();

    const paidAmount = 100000 + Math.floor((Date.now() % 90000) / 1000) * 1000;
    await page.getByPlaceholder("Nhập số tiền đã chi...").fill(String(paidAmount));

    await page.getByRole("button", { name: "Lưu thay đổi" }).click();

    // Modal biến mất
    await expect(page.getByRole("heading", { name: "Chi hoa hồng" })).toBeHidden({ timeout: 10_000 });

    const expectedRemaining = amount - paidAmount;
    const formattedPaid = `${paidAmount.toLocaleString("vi-VN")} ₫`;
    const formattedRemaining = `${expectedRemaining.toLocaleString("vi-VN")} ₫`;

    await expect(firstRow.locator("td").nth(6)).toContainText(formattedPaid);
    await expect(firstRow.locator("td").nth(7)).toContainText(formattedRemaining);

    // Reload lại trang để kiểm tra ghi DB thật
    await page.reload();
    await expect(page.locator("table")).toBeVisible({ timeout: 15_000 });
    const firstRowAfterReload = page.locator("table tbody tr").first();
    await expect(firstRowAfterReload.locator("td").nth(6)).toContainText(formattedPaid);
    await expect(firstRowAfterReload.locator("td").nth(7)).toContainText(formattedRemaining);
  });
});
