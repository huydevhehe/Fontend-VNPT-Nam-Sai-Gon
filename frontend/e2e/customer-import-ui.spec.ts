import { expect, test } from "@playwright/test";

/**
 * Tạo buffer "giả làm .xlsx" là CSV UTF-8 có BOM — SheetJS tự nhận diện và
 * phân tích như CSV (xem frontend/e2e/api/customer-import.spec.ts).
 */
function buildCustomerCsvBuffer(rows: Record<string, string>[], headers: string[]): Buffer {
  const escapeCsv = (value: string) =>
    value.includes(",") || value.includes('"') || value.includes("\n")
      ? `"${value.replace(/"/g, '""')}"`
      : value;

  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsv(row[h] ?? "")).join(","));
  }
  const bom = Buffer.from([0xef, 0xbb, 0xbf]);
  return Buffer.concat([bom, Buffer.from(lines.join("\n") + "\n", "utf8")]);
}

const HEADERS = ["Tên khách hàng", "Mã số thuế"];

test.describe("UI Import khách hàng (xử lý trùng)", () => {
  test("AM không nhìn thấy nút Import khách hàng", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="text"]', "VNPT-AM-01");
    await page.fill('input[type="password"]', "VNPT-AM-01@Vnpt2026");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/admin/**");

    await page.goto("/admin/customers");
    await page.waitForLoadState("networkidle");

    const importBtn = page.getByRole("button", { name: "Import khách hàng" });
    await expect(importBtn).toHaveCount(0);
  });

  test("Admin upload file có 2 dòng trùng -> chọn tất cả -> Giữ bản cũ -> kết quả giữ nguyên 2", async ({
    page,
  }) => {
    const suffix = Date.now();
    const sharedTaxCode = `317${String(suffix).slice(-6)}`;

    await page.goto("/login");
    await page.fill('input[type="text"]', "admin");
    await page.fill('input[type="password"]', "admin@Vnpt2026");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/admin/**");

    // Tạo sẵn 1 khách để 2 dòng trong file đều trùng với khách này.
    const token = await page.evaluate(() => window.localStorage.getItem("vnpt_token"));
    const apiBase = process.env.E2E_API_URL || "http://localhost:8099/api";
    await page.request.post(`${apiBase}/customers`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: `Công ty UI Import ${suffix}`,
        type: "Doanh nghiệp",
        customerGroup: "Tập hiện hữu",
        identityCode: sharedTaxCode,
      },
    });

    await page.goto("/admin/customers");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: "Import khách hàng" }).click();
    await expect(page.getByText("Nhập khách hàng (xử lý trùng)")).toBeVisible();

    const buffer = buildCustomerCsvBuffer(
      [
        { "Tên khách hàng": `Công ty Trùng A ${suffix}`, "Mã số thuế": sharedTaxCode },
        { "Tên khách hàng": `Công ty Trùng B ${suffix}`, "Mã số thuế": sharedTaxCode },
      ],
      HEADERS
    );

    await page.setInputFiles('input[type="file"]', {
      name: "import.xlsx",
      mimeType: "text/csv",
      buffer,
    });

    await page.getByRole("button", { name: "Kiểm tra file" }).click();
    await expect(page.getByText(/Trùng cần quyết \(2\)/)).toBeVisible();

    await page.getByRole("button", { name: /Trùng cần quyết/ }).click();
    await page.getByLabel("Chọn tất cả").check();
    await page.getByRole("button", { name: "Giữ bản cũ" }).click();

    const submitBtn = page.getByRole("button", { name: "Nhập dữ liệu" });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    await expect(page.getByText(/giữ nguyên 2/)).toBeVisible();
  });
});
