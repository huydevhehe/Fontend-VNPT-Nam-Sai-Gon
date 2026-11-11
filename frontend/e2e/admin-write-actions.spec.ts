import {
  expect,
  test,
  type ConsoleMessage,
  type Dialog,
  type Locator,
  type Page,
} from "@playwright/test";
import * as path from "path";
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

/**
 * Các form modal trong app (contracts/employees/leads) dùng cấu trúc
 * `<div><label>Nhãn</label><input/></div>` KHÔNG gắn `htmlFor`/`id`, nên
 * `getByLabel` của Playwright không khớp được. Dùng helper này để lấy control
 * (input/select/textarea) nằm cùng div với label có text khớp chính xác.
 */
function fieldByLabel(scope: Page | Locator, labelText: string): Locator {
  return scope
    .locator(
      `div:has(> label:text-is("${labelText}")) :is(input, select, textarea)`
    )
    .first();
}

test.describe("Hành động ghi dữ liệu trên trang Admin (Task 3-10)", () => {
  test("[admin] tạo hợp đồng mới: giá trị âm bị chặn, giá trị hợp lệ tạo thành công", async ({
    page,
  }) => {
    const severeConsoleErrors = trackSevereConsoleErrors(page);

    await loginAs(page, "admin");
    await page.goto("/admin/contracts");

    const uniqueSuffix = Date.now();
    const transactionCode = `GD-E2E-${uniqueSuffix}`;
    const customerName = `KH E2E Hợp đồng ${uniqueSuffix}`;

    await page.getByRole("button", { name: "Thêm hợp đồng" }).click();
    await expect(
      page.getByRole("heading", { name: "Thêm hợp đồng" })
    ).toBeVisible();

    await fieldByLabel(page, "Mã giao dịch").fill(transactionCode);
    await fieldByLabel(page, "Tên khách hàng").fill(customerName);
    await fieldByLabel(page, "Mã thuê bao (phân tách bởi dấu phẩy)").fill(
      "0909000111"
    );

    const totalValueInput = fieldByLabel(page, "Giá trị hợp đồng (₫)");
    await totalValueInput.fill("-1000000");

    await page.getByRole("button", { name: "Tạo hợp đồng" }).click();

    // Giá trị âm phải bị chặn (browser constraint validation với min=0 hoặc
    // lỗi backend trả về) — modal "Thêm hợp đồng" không được đóng, và chưa có
    // dòng mới nào xuất hiện trong bảng với mã giao dịch này.
    await page.waitForTimeout(300);
    await expect(
      page.getByRole("heading", { name: "Thêm hợp đồng" })
    ).toBeVisible();

    const isValueInputValid = await totalValueInput.evaluate(
      (el: HTMLInputElement) => el.validity.valid
    );
    expect(isValueInputValid).toBe(false);

    // Sửa lại giá trị hợp lệ (dương) và submit lại — lần này phải tạo thành công.
    await totalValueInput.fill("1500000");
    await page.getByRole("button", { name: "Tạo hợp đồng" }).click();

    await expect(
      page.getByRole("heading", { name: "Thêm hợp đồng" })
    ).not.toBeVisible({ timeout: 10_000 });

    const searchBox = page.getByPlaceholder(
      "Tìm theo mã giao dịch, khách hàng, mã thuê bao..."
    );
    await searchBox.fill(transactionCode);

    const row = page.locator("table tbody tr", { hasText: transactionCode });
    await expect(row).toHaveCount(1);
    await expect(row).toContainText(customerName);
    await expect(row).toContainText("1.500.000");

    expect(severeConsoleErrors, severeConsoleErrors.join(" | ")).toEqual([]);
  });

  test("[am] tạo nhân viên bị từ chối với lỗi 403 rõ ràng, không crash trang", async ({
    page,
  }) => {
    const severeConsoleErrors = trackSevereConsoleErrors(page);

    await loginAs(page, "am");
    await page.goto("/admin/employees");

    const uniqueSuffix = Date.now();

    await page.getByRole("button", { name: "Thêm nhân viên" }).click();
    await expect(
      page.getByRole("heading", { name: "Thêm nhân viên" })
    ).toBeVisible();

    await fieldByLabel(page, "Mã nhân viên").fill(`NV-E2E-${uniqueSuffix}`);
    await fieldByLabel(page, "Họ tên").fill(`NV E2E Test ${uniqueSuffix}`);
    await fieldByLabel(page, "Địa bàn phụ trách").fill("Khu vực 1");
    await fieldByLabel(page, "Email").fill(
      `nv-e2e-${uniqueSuffix}@example.com`
    );

    await page.getByRole("button", { name: "Tạo nhân viên" }).click();

    // Phải hiện lỗi 403 rõ ràng từ backend ("Chỉ Admin được phép tạo Nhân
    // viên"), modal vẫn còn (chưa đóng do tạo thất bại), trang không bị crash
    // (heading vẫn hiển thị bình thường).
    await expect(
      page.getByText("Chỉ Admin được phép tạo Nhân viên")
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole("heading", { name: "Thêm nhân viên" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Quản lý nhân viên & Phân công" })
    ).toBeVisible();

    expect(severeConsoleErrors, severeConsoleErrors.join(" | ")).toEqual([]);
  });

  test("[admin] đổi trạng thái Lead qua StatusSelect ghi DB thật (giữ nguyên sau reload)", async ({
    page,
  }) => {
    const severeConsoleErrors = trackSevereConsoleErrors(page);

    await loginAs(page, "admin");
    await page.goto("/admin/leads");

    const uniqueSuffix = Date.now();
    const customerName = `KH E2E Lead ${uniqueSuffix}`;
    const phone = `09${String(uniqueSuffix).slice(-8)}`;

    await page.getByRole("button", { name: "Tạo Lead mới" }).click();
    await expect(
      page.getByRole("heading", { name: "Tạo Lead mới" })
    ).toBeVisible();

    await fieldByLabel(page, "Tên khách hàng / Đầu mối").fill(customerName);
    await fieldByLabel(page, "Số điện thoại").fill(phone);
    // "AM Phụ trách" là <select> (dropdown AM + "🎲 Ngẫu nhiên"), không phải input.
    // "Giá trị dự kiến (₫)" đã bị bỏ khỏi form tạo (Đợt 1, Task 3) nên không còn điền ở đây.
    await fieldByLabel(page, "AM Phụ trách").selectOption("Nguyễn Thị Tình");

    await page.getByRole("button", { name: "Tạo Lead", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Tạo Lead mới" })
    ).not.toBeVisible({ timeout: 10_000 });

    const searchBox = page.getByPlaceholder(
      "Tìm theo tên Lead, SĐT, kênh phát triển..."
    );
    await searchBox.fill(phone);

    const row = page.locator("table tbody tr", { hasText: phone });
    await expect(row).toHaveCount(1);

    const statusSelect = row.locator("select");
    await expect(statusSelect).toHaveValue("Mới tiếp nhận");

    await statusSelect.selectOption("Đã liên hệ");
    await expect(statusSelect).toHaveValue("Đã liên hệ", { timeout: 10_000 });

    // Reload lại trang để xác nhận đã ghi DB thật, không chỉ state FE.
    await page.reload();
    await searchBox.fill(phone);
    const rowAfterReload = page.locator("table tbody tr", { hasText: phone });
    await expect(rowAfterReload).toHaveCount(1);
    await expect(rowAfterReload.locator("select")).toHaveValue("Đã liên hệ");

    expect(severeConsoleErrors, severeConsoleErrors.join(" | ")).toEqual([]);
  });

  test("[admin] sửa số hộ dân âm ở Địa bàn bị từ chối, giá trị cũ giữ nguyên", async ({
    page,
  }) => {
    const severeConsoleErrors = trackSevereConsoleErrors(page);

    await loginAs(page, "admin");
    await page.goto("/admin/territories");
    const territoryListToggle = page.getByRole("button", { name: /Xem danh sách phường/ });
    const firstRow = page.locator("table tbody tr").first();
    if (!(await firstRow.isVisible().catch(() => false))) {
      await territoryListToggle.click();
      await expect(firstRow).toBeVisible();
    }

    const editButton = firstRow.locator("button").first();
    const originalValueText = (await editButton.innerText()).trim();

    await editButton.click();

    const editInput = firstRow.locator('input[type="number"]');
    await expect(editInput).toBeVisible();
    await editInput.fill("-25");
    await editInput.press("Enter");

    // Phải hiện lỗi rõ ràng và giá trị cũ không đổi sau khi ô edit đóng lại.
    await expect(firstRow).toContainText("không được âm", { timeout: 10_000 });

    const displayButtonAfter = firstRow.locator("button").first();
    await expect(displayButtonAfter).toHaveText(originalValueText);

    // Reload để xác nhận backend thực sự không lưu giá trị âm.
    await page.reload();
    const firstRowAfterReload = page.locator("table tbody tr").first();
    if (!(await firstRowAfterReload.isVisible().catch(() => false))) {
      await territoryListToggle.click();
      await expect(firstRowAfterReload).toBeVisible();
    }
    await expect(
      firstRowAfterReload.locator("button").first()
    ).toHaveText(originalValueText);

    expect(severeConsoleErrors, severeConsoleErrors.join(" | ")).toEqual([]);
  });

  test("[admin] import Excel gia hạn thiếu cột mã thuê bao hiển thị lỗi rõ ràng, không crash trang trắng", async ({
    page,
  }) => {
    const severeConsoleErrors = trackSevereConsoleErrors(page);

    await loginAs(page, "admin");
    await page.goto("/admin/renewals");

    await expect(
      page.getByRole("heading", { name: "Gia hạn trả trước dịch vụ" })
    ).toBeVisible();

    let dialogMessage = "";
    page.once("dialog", async (dialog: Dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    const fixturePath = path.join(
      __dirname,
      "fixtures",
      "renewal-missing-column.xlsx"
    );
    await page
      .locator('input[type="file"]')
      .setInputFiles(fixturePath);

    // Đợi dialog alert() xuất hiện và được xử lý (xem handleFileSelected
    // trong app/admin/renewals/page.tsx).
    await expect
      .poll(() => dialogMessage, { timeout: 15_000 })
      .not.toBe("");

    expect(dialogMessage).toContain("Bỏ qua 2 dòng lỗi");
    expect(dialogMessage).toContain("Thiếu thông tin thuê bao hoặc khách hàng");

    // Trang không bị crash / trắng trang sau khi import lỗi — heading và
    // bảng dữ liệu vẫn hiển thị bình thường.
    await expect(
      page.getByRole("heading", { name: "Gia hạn trả trước dịch vụ" })
    ).toBeVisible();
    const table = page.locator("table").first();
    await expect(table).toBeVisible();
    await expect(page.locator("body")).not.toContainText("undefined");

    expect(severeConsoleErrors, severeConsoleErrors.join(" | ")).toEqual([]);
  });
});
