import { expect, test } from "@playwright/test";
import { loginAs } from "./fixtures/auth";
import { API_URL, apiLogin, bearer } from "./api/helpers";

test.describe("Menu Nhắc hết hạn (Email) (Đợt 10 - Task 5)", () => {
  test("admin bật nhắc, đặt số ngày [10, 3], lưu rồi reload vẫn còn", async ({ page }) => {
    await loginAs(page, "admin");
    await page.goto("/admin/reminders");
    await expect(page.getByRole("heading", { name: "Nhắc hết hạn (Email)" })).toBeVisible();

    const enabledCheckbox = page.getByLabel("Bật nhắc hết hạn tự động");
    if (!(await enabledCheckbox.isChecked())) {
      await enabledCheckbox.check();
    }

    const daysBeforeField = page.locator('input[placeholder="30, 7, 1"]');
    await daysBeforeField.fill("10, 3");

    await page.getByRole("button", { name: "Lưu cấu hình" }).click();
    await expect(page.getByText("Đã lưu cấu hình nhắc hết hạn.")).toBeVisible();

    await page.reload();
    await expect(page.locator('input[placeholder="30, 7, 1"]')).toHaveValue("10, 3");

    // Khôi phục lại để không ảnh hưởng các test khác chạy song song (tắt lại).
    const stillEnabled = page.getByLabel("Bật nhắc hết hạn tự động");
    if (await stillEnabled.isChecked()) {
      await stillEnabled.uncheck();
      await page.getByRole("button", { name: "Lưu cấu hình" }).click();
    }
  });

  test("import file nhắc hạn -> đợt xuất hiện trong danh sách tab Nhắc theo file Excel", async ({
    page,
    request,
  }) => {
    await loginAs(page, "admin");
    await page.goto("/admin/reminders");
    await page.getByRole("button", { name: "Nhắc theo file Excel" }).click();
    await page.getByRole("button", { name: "Import file nhắc hạn" }).click();

    const suffix = Date.now();
    const bom = "﻿";
    const csvContent = `${bom}Tên,Ngày hết hạn\nMục UI ${suffix},18/11/2026\n`;

    await page.setInputFiles('input[type="file"]', {
      name: `ui-reminder-${suffix}.xlsx`,
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      buffer: Buffer.from(csvContent, "utf8"),
    });

    await expect(page.getByText("Import file nhắc hạn (bước 2/3)")).toBeVisible();
    await page.getByLabel("Tên đợt nhắc hạn").fill(`Batch UI ${suffix}`);
    await page.getByLabel("Cột ngày hết hạn (*)").selectOption("Ngày hết hạn");

    await page.getByRole("button", { name: "Import", exact: true }).click();
    await expect(page.getByText(/Đã import 1 dòng/)).toBeVisible();
    await page.getByRole("button", { name: "Xong" }).click();

    await expect(page.getByText(`Batch UI ${suffix}`)).toBeVisible();

    // Dọn đợt vừa tạo (mặc định daysBefore [30,7,1], ngày hết hạn 18/11/2026)
    // để không còn "enabled" trong DB test dùng chung — tránh bị tính nhầm
    // vào test nhắc hạn dịch vụ ở backend (reminder-runner.test.ts) nếu sau
    // này nó cũng dùng mốc 7 ngày trước 2026-11-18.
    const adminToken = await apiLogin(request, "admin", "admin@Vnpt2026");
    const listRes = await request.get(`${API_URL}/reminders/files`, { headers: bearer(adminToken) });
    const batches: Array<{ id: string; name: string }> = (await listRes.json()).data;
    const created = batches.find((b) => b.name === `Batch UI ${suffix}`);
    if (created) {
      await request.delete(`${API_URL}/reminders/files/${created.id}`, { headers: bearer(adminToken) });
    }
  });

  test("AM thấy menu Nhắc hết hạn (Email) với badge Admin nhưng API trả 403", async ({ page, request }) => {
    await loginAs(page, "am");
    await expect(page.getByRole("link", { name: "Nhắc hết hạn (Email)" })).toBeVisible();

    const amToken = await apiLogin(request, "VNPT-AM-01", "VNPT-AM-01@Vnpt2026");
    const res = await request.get(`${API_URL}/reminders/settings`, { headers: bearer(amToken) });
    expect(res.status()).toBe(403);
  });
});
