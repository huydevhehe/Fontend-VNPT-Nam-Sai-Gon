import { expect, test } from "@playwright/test";
import { loginAs } from "./fixtures/auth";
import { ADMIN, API_URL, apiLogin, bearer } from "./api/helpers";

const LABEL_PTM = "KH PTM (phát triển mới)";
const LABEL_KHDN = "KHDN chăm (địa bàn giao)";

test.describe("Khách hàng PTM / KHDN chăm trên /admin/customers", () => {
  test("hiện nhãn mới, lọc theo nhóm và ghi đợt giao khi điều chuyển KHDN chăm", async ({
    page,
    request,
  }) => {
    const suffix = Date.now();
    const ptmName = `KH UI PTM ${suffix}`;
    const khdnName = `KH UI KHDN ${suffix}`;
    const batch = `DOT-UI-${suffix}`;

    const token = await apiLogin(request, ADMIN.username, ADMIN.password);
    for (const [name, group] of [
      [ptmName, "Tự phát triển"],
      [khdnName, "Tập hiện hữu"],
    ]) {
      const res = await request.post(`${API_URL}/customers`, {
        headers: bearer(token),
        data: { name, type: "Doanh nghiệp", customerGroup: group, amStaff: "Nguyễn Thị Tình" },
      });
      expect(res.status()).toBe(201);
    }

    await loginAs(page, "admin");
    await page.goto("/admin/customers");

    const ptmRow = page.locator("tbody tr", { hasText: ptmName });
    const khdnRow = page.locator("tbody tr", { hasText: khdnName });
    await expect(ptmRow).toBeVisible();
    await expect(khdnRow).toBeVisible();

    // Badge dùng nhãn mới, không còn giá trị lưu trong DB
    await expect(ptmRow).toContainText(LABEL_PTM);
    await expect(khdnRow).toContainText(LABEL_KHDN);
    await expect(page.locator("tbody")).not.toContainText("Tự phát triển");
    await expect(page.locator("tbody")).not.toContainText("Tập hiện hữu");

    // Lọc theo nhóm
    const filter = page.getByLabel("Lọc theo nhóm khách hàng");
    await filter.selectOption({ label: LABEL_KHDN });
    await expect(khdnRow).toBeVisible();
    await expect(ptmRow).toHaveCount(0);
    await expect(page.locator("tbody")).not.toContainText(LABEL_PTM);

    await filter.selectOption({ label: LABEL_PTM });
    await expect(ptmRow).toBeVisible();
    await expect(khdnRow).toHaveCount(0);
    await expect(page.locator("tbody")).not.toContainText(LABEL_KHDN);

    await filter.selectOption({ label: LABEL_KHDN });

    // Điều chuyển KHDN chăm kèm mã đợt giao
    await expect(page.getByRole("columnheader", { name: "Đợt giao" })).toBeVisible();
    await khdnRow.getByRole("button", { name: "Điều chuyển" }).click();

    const modal = page.locator("div.fixed", { hasText: "Điều chuyển AM phụ trách" });
    await expect(modal).toBeVisible();
    await modal.getByLabel("AM phụ trách mới").fill("Phạm Thanh Hà");
    await modal.getByLabel("Mã đợt giao").fill(batch);
    await modal.getByRole("button", { name: "Điều chuyển", exact: true }).click();

    await expect(modal).toBeHidden();
    await expect(khdnRow).toContainText(batch);
    await expect(khdnRow).toContainText("Phạm Thanh Hà");

    // Tải lại: dữ liệu lấy từ backend vẫn hiện đợt giao
    await page.reload();
    await expect(page.locator("tbody tr", { hasText: khdnName })).toContainText(batch);
  });
});
