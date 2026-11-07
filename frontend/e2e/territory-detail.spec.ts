import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";
import { loginAs } from "./fixtures/auth";

const SEVERE_CONSOLE_PATTERNS = [/TypeError/i, /Cannot read/i];

function trackSevereConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (SEVERE_CONSOLE_PATTERNS.some((pattern) => pattern.test(text))) {
      errors.push(text);
    }
  });
  return errors;
}

async function openTanHung(page: Page) {
  await page.goto("/admin/territories");
  await page.getByRole("link", { name: "Tân Hưng" }).click();
  await expect(page).toHaveURL(/\/admin\/territories\/TB-01$/);
}

function parseNumber(text: string | null): number {
  return Number((text ?? "").replace(/[^\d]/g, "")) || 0;
}

test.describe("Chi tiết Phường", () => {
  test("[admin] mở chi tiết từ danh sách, thấy đủ 4 khối; thêm/xoá cán bộ và khu phố", async ({ page }) => {
    const severeConsoleErrors = trackSevereConsoleErrors(page);
    const suffix = Date.now();
    const officialName = `E2E Chủ tịch ${suffix}`;
    const quarterName = `E2E KP ${suffix}`;

    await loginAs(page, "admin");
    await openTanHung(page);

    await expect(page.getByRole("heading", { name: "Lãnh đạo & Phòng ban" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Khu phố", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Lead dự án đang theo" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Hợp đồng đã triển khai" })).toBeVisible();
    await expect(page.getByText("Chưa cập nhật").first()).toBeVisible();
    await expect(page.getByText("LEAD-01")).toBeVisible();
    await expect(page.getByText("Khai báo:")).toContainText("Đã nhập chi tiết:");

    // Thêm Chủ tịch
    await page.getByRole("button", { name: "Thêm Chủ tịch Lãnh đạo Phường" }).click();
    await page.getByLabel("Họ tên").fill(officialName);
    await page.getByLabel("Số điện thoại").fill("0909123456");
    await page.getByRole("button", { name: "Lưu" }).click();
    await expect(page.getByText(officialName)).toBeVisible();

    // Thêm khu phố
    const rowsBefore = await page.getByTestId("quarter-row").count();
    const householdsBefore = parseNumber(await page.getByTestId("quarter-total-households").textContent());
    const populationBefore = parseNumber(await page.getByTestId("quarter-total-population").textContent());

    await page.getByRole("button", { name: "Thêm khu phố" }).click();
    await page.getByLabel("Tên khu phố").fill(quarterName);
    await page.getByLabel("Trưởng khu phố").fill("Ông Trưởng");
    await page.getByLabel("Số hộ dân").fill("120");
    await page.getByLabel("Số dân").fill("430");
    await page.getByRole("button", { name: "Lưu" }).click();

    const quarterRow = page.getByTestId("quarter-row").filter({ hasText: quarterName });
    await expect(quarterRow).toHaveCount(1);
    await expect(page.getByTestId("quarter-row")).toHaveCount(rowsBefore + 1);
    await expect(page.getByTestId("quarter-total-households")).toHaveText(
      (householdsBefore + 120).toLocaleString("vi-VN")
    );
    await expect(page.getByTestId("quarter-total-population")).toHaveText(
      (populationBefore + 430).toLocaleString("vi-VN")
    );

    // Xoá khu phố
    await quarterRow.getByRole("button", { name: `Xoá ${quarterName}` }).click();
    await quarterRow.getByRole("button", { name: "Xác nhận xoá" }).click();
    await expect(page.getByText(quarterName)).toHaveCount(0);
    await expect(page.getByTestId("quarter-row")).toHaveCount(rowsBefore);
    await expect(page.getByTestId("quarter-total-households")).toHaveText(
      householdsBefore.toLocaleString("vi-VN")
    );

    // Xoá cán bộ
    await page.getByRole("button", { name: `Xoá ${officialName}` }).click();
    await page.getByRole("button", { name: "Xác nhận xoá" }).click();
    await expect(page.getByText(officialName)).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Thêm Chủ tịch Lãnh đạo Phường" })).toBeVisible();

    expect(severeConsoleErrors, severeConsoleErrors.join(" | ")).toEqual([]);
  });

  test("[admin] sửa số hộ dân inline trên danh sách vẫn hoạt động", async ({ page }) => {
    await loginAs(page, "admin");
    await page.goto("/admin/territories");
    const row = page.locator("table tbody tr", { hasText: "Tân Mỹ" });
    const button = row.getByTitle("Nhấn để sửa số hộ dân");
    await expect(button).toBeVisible();
    await button.click();
    const input = row.locator("input[type=number]");
    await expect(input).toBeVisible();
    const current = await input.inputValue();
    await input.fill(current);
    await input.press("Enter");
    await expect(row.getByTitle("Nhấn để sửa số hộ dân")).toBeVisible();
  });

  test("[am] chỉ xem: không có nút thêm/sửa/xoá", async ({ page }) => {
    const severeConsoleErrors = trackSevereConsoleErrors(page);
    await loginAs(page, "am");
    await openTanHung(page);

    await expect(page.getByRole("heading", { name: "Lãnh đạo & Phòng ban" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Khu phố", exact: true })).toBeVisible();
    await expect(page.getByText("Chưa cập nhật").first()).toBeVisible();

    await expect(page.getByRole("button", { name: /^Thêm/ })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^Sửa/ })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^Xoá/ })).toHaveCount(0);

    expect(severeConsoleErrors, severeConsoleErrors.join(" | ")).toEqual([]);
  });
});
