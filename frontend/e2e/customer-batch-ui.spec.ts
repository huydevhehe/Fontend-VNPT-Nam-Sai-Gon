import { expect, test } from "@playwright/test";

test.describe("UI Nhập đợt KHDN-chăm", () => {
  test("AM không nhìn thấy nút Nhập đợt KHDN chăm", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="text"]', "VNPT-AM-01");
    await page.fill('input[type="password"]', "VNPT-AM-01@Vnpt2026");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/admin/**");

    await page.goto("/admin/customers");
    await page.waitForLoadState("networkidle");

    const batchBtn = page.getByRole("button", { name: /Nhập đợt KHDN chăm/i });
    await expect(batchBtn).toHaveCount(0);
  });

  test("Admin nhìn thấy nút Nhập đợt KHDN chăm và có thể mở/đóng modal", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="text"]', "admin");
    await page.fill('input[type="password"]', "admin@Vnpt2026");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/admin/**");

    await page.goto("/admin/customers");
    await page.waitForLoadState("networkidle");

    const batchBtn = page.getByRole("button", { name: /Nhập đợt KHDN chăm/i });
    await expect(batchBtn).toBeVisible();

    // Click mở modal
    await batchBtn.click();

    // Verify modal header và các field
    await expect(page.getByText("Nhập tập KHDN-chăm theo đợt")).toBeVisible();
    await expect(page.locator("#batch-territory-select")).toBeVisible();
    await expect(page.locator("#batch-caring-staff")).toBeVisible();
    await expect(page.locator("#batch-handover-batch")).toBeVisible();
    await expect(page.locator("#batch-mode-append")).toBeChecked();
    await expect(page.locator("#batch-mode-replace")).toBeVisible();
    await expect(page.locator("#batch-file-input")).toBeVisible();

    // Click đóng modal
    await page.getByRole("button", { name: "Đóng" }).click();
    await expect(page.getByText("Nhập tập KHDN-chăm theo đợt")).toHaveCount(0);
  });
});
