import { expect, test, type ConsoleMessage } from "@playwright/test";
import { loginAs, type Role } from "./fixtures/auth";

const ADMIN_PAGES = [
  "dashboard",
  "debt-management",
  "renewals",
  "customers",
  "services",
  "leads",
  "contracts",
  "commissions",
  "territories",
  "employees",
  "tasks",
  "data-transfer",
  "settings",
] as const;

const ROLES: Role[] = ["admin", "am"];

// URL gốc của backend thật (không đi qua Next.js) — dùng cho các request API trực
// tiếp không qua UI. Mặc định khớp cổng backend dùng khi chạy test theo brief.
const API_BASE_URL = process.env.E2E_API_URL || "http://localhost:8099/api";

const SEVERE_CONSOLE_PATTERNS = [/TypeError/i, /Cannot read/i];

for (const role of ROLES) {
  for (const path of ADMIN_PAGES) {
    test(`[${role}] trang /admin/${path} hiển thị dữ liệu, không lỗi`, async ({
      page,
    }) => {
      const severeConsoleErrors: string[] = [];
      page.on("console", (msg: ConsoleMessage) => {
        if (msg.type() !== "error") return;
        const text = msg.text();
        if (SEVERE_CONSOLE_PATTERNS.some((pattern) => pattern.test(text))) {
          severeConsoleErrors.push(text);
        }
      });

      await loginAs(page, role);
      await page.goto(`/admin/${path}`);

      // Trang phải render xong: hoặc có bảng dữ liệu, hoặc ít nhất tiêu đề trang
      // hiển thị (AdminTopbar luôn render <h1> cho mọi trang admin).
      const table = page.locator("table").first();
      const heading = page.locator("h1").first();
      const hasTable = await table
        .waitFor({ state: "visible", timeout: 10_000 })
        .then(() => true)
        .catch(() => false);

      if (hasTable) {
        await expect(table).toBeVisible();
      } else {
        await expect(heading).toBeVisible();
      }

      // Không được lộ giá trị "undefined" ra nội dung bảng/trang.
      await expect(page.locator("body")).not.toContainText("undefined");

      expect(
        severeConsoleErrors,
        `Có lỗi console nghiêm trọng trên /admin/${path} (role ${role}): ${severeConsoleErrors.join(" | ")}`
      ).toEqual([]);
    });
  }
}

test("[am] không được phép tạo Nhân viên qua API (phân quyền 403)", async ({
  page,
  request,
}) => {
  await loginAs(page, "am");

  const token = await page.evaluate(() =>
    window.localStorage.getItem("vnpt_token")
  );
  expect(token).toBeTruthy();

  const response = await request.post(`${API_BASE_URL}/staff`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: {
      code: "NV-E2E-TEST",
      name: "Nhân viên test E2E",
      role: "AM",
      territory: "Khu vực 1",
      email: "e2e-test@example.com",
    },
  });

  expect(response.status()).toBe(403);
});

test("sidebar không có menu Import / Export; Quản lý nợ và Gia hạn trả trước vẫn có nút import", async ({
  page,
}) => {
  await loginAs(page, "admin");
  await page.goto("/admin/dashboard");

  // Sidebar không có link text 'Import / Export'
  const sidebar = page.locator("aside");
  await expect(sidebar.getByText("Import / Export")).toHaveCount(0);

  // Trang Quản lý nợ có nút import
  await page.goto("/admin/debt-management");
  await expect(page.getByRole("button", { name: "Import file nợ" })).toBeVisible();

  // Trang Gia hạn trả trước có nút import
  await page.goto("/admin/renewals");
  await expect(page.getByRole("button", { name: "Import file gia hạn" })).toBeVisible();
});
