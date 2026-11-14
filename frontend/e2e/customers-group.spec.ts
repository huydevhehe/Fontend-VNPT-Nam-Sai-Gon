import { expect, test } from "@playwright/test";
import { loginAs } from "./fixtures/auth";
import { ADMIN, API_URL, apiLogin, bearer } from "./api/helpers";

const LABEL_PTM = "KH PTM";
const LABEL_KHDN = "KH địa bàn";
const LABEL_PTM_DIA_BAN = "PTM địa bàn";

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

    // Lọc theo loại khách
    const filter = page.getByLabel("Loại khách");
    await filter.selectOption({ label: LABEL_KHDN });
    await expect(khdnRow).toBeVisible();
    await expect(ptmRow).toHaveCount(0);

    await filter.selectOption({ label: LABEL_PTM });
    await expect(ptmRow).toBeVisible();
    await expect(khdnRow).toHaveCount(0);

    await filter.selectOption("");

    // Điều chuyển AM chăm sóc (CSKH) của KHDN chăm kèm mã đợt giao — việc
    // "bàn giao" đợt giờ gắn với nút Điều chuyển CSKH, tách khỏi Điều chuyển AM.
    await expect(page.getByRole("columnheader", { name: "Đợt giao" })).toBeVisible();
    await khdnRow.getByRole("button", { name: "Điều chuyển CSKH" }).click();

    const modal = page.locator("div.fixed", { hasText: "Điều chuyển AM chăm sóc (CSKH)" });
    await expect(modal).toBeVisible();
    await modal.getByLabel("AM chăm sóc mới").fill("Phạm Thanh Hà");
    await modal.getByLabel("Mã đợt giao").fill(batch);
    await modal.getByRole("button", { name: "Điều chuyển", exact: true }).click();

    await expect(modal).toBeHidden();
    await expect(khdnRow).toContainText(batch);
    await expect(khdnRow).toContainText("Phạm Thanh Hà");

    // Tải lại: dữ liệu lấy từ backend vẫn hiện đợt giao
    await page.reload();
    await expect(page.locator("tbody tr", { hasText: khdnName })).toContainText(batch);
  });

  test("AM vào /admin/customers không thấy các nút Điều chuyển", async ({ page }) => {
    await loginAs(page, "am");
    await page.goto("/admin/customers");
    await expect(page.locator("table")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: "Điều chuyển AM" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Điều chuyển CSKH" })).toHaveCount(0);
  });

  test("tạo khách loại PTM địa bàn với Team, Kênh bán, liên hệ/thanh toán — dòng mới hiện badge địa bàn, cột Kênh bán, cột Team", async ({
    page,
    request,
  }) => {
    const suffix = Date.now();
    const customerName = `KH UI PTM Địa Bàn ${suffix}`;
    const teamName = `NOVA UI ${suffix}`;

    const token = await apiLogin(request, ADMIN.username, ADMIN.password);
    const teamRes = await request.post(`${API_URL}/customer-teams`, {
      headers: bearer(token),
      data: { name: teamName },
    });
    expect(teamRes.status()).toBe(201);

    const territoriesRes = await request.get(`${API_URL}/territories`, { headers: bearer(token) });
    const territories = (await territoriesRes.json()).data as Array<{ id: string; ward_name: string }>;
    const territory = territories[0];

    await loginAs(page, "admin");
    await page.goto("/admin/customers");

    await page.getByRole("button", { name: "Thêm khách hàng" }).click();
    const formModal = page.locator("div.fixed", { hasText: "Thêm khách hàng" });
    await expect(formModal).toBeVisible();

    await formModal.locator("#cf-name").fill(customerName);
    await formModal.locator("#cf-group").selectOption({ label: LABEL_PTM_DIA_BAN });
    await formModal.locator("#cf-team").selectOption({ label: teamName });
    await formModal.locator("#cf-sales-channel").selectOption({ label: "Online" });
    await formModal.locator("#cf-territory").selectOption({ label: territory.ward_name });

    await formModal.getByRole("button", { name: "Thêm khách hàng" }).click();
    await expect(formModal).toBeHidden();

    const row = page.locator("tbody tr", { hasText: customerName });
    await expect(row).toBeVisible();
    await expect(row).toContainText(LABEL_PTM_DIA_BAN);
    await expect(row).toContainText(teamName);
    await expect(row).toContainText("Online");
    await expect(row).toContainText(territory.ward_name);
  });

  test("Admin lọc bằng ô tìm kiếm, chọn tất cả, gán AM chăm sóc cho nhiều khách", async ({
    page,
    request,
  }) => {
    const suffix = Date.now();
    const keyword = `UIBulk${suffix}`;
    const name1 = `KH ${keyword} Một`;
    const name2 = `KH ${keyword} Hai`;
    const newStaff = "Phạm Thanh Hà";

    const token = await apiLogin(request, ADMIN.username, ADMIN.password);
    for (const name of [name1, name2]) {
      const res = await request.post(`${API_URL}/customers`, {
        headers: bearer(token),
        data: { name, type: "Doanh nghiệp", customerGroup: "Tập hiện hữu" },
      });
      expect(res.status()).toBe(201);
    }

    await loginAs(page, "admin");
    await page.goto("/admin/customers");
    await page.waitForLoadState("networkidle");

    await page.getByPlaceholder("Tìm theo tên, MST, CCCD, địa chỉ...").fill(keyword);
    await expect(page.locator("tbody tr", { hasText: name1 })).toBeVisible();
    await expect(page.locator("tbody tr", { hasText: name2 })).toBeVisible();

    await page.getByLabel("Chọn tất cả").check();
    await expect(page.getByText("Đã chọn 2 khách")).toBeVisible();

    await page.getByRole("button", { name: "Gán AM chăm sóc" }).click();
    await page.getByPlaceholder("Chọn hoặc nhập tên nhân viên").fill(newStaff);
    await page.getByRole("button", { name: "Gán", exact: true }).click();

    await expect(page.getByText("Đã chọn 2 khách")).toHaveCount(0);

    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.getByPlaceholder("Tìm theo tên, MST, CCCD, địa chỉ...").fill(keyword);

    const row1 = page.locator("tbody tr", { hasText: name1 });
    const row2 = page.locator("tbody tr", { hasText: name2 });
    await expect(row1).toContainText(newStaff);
    await expect(row2).toContainText(newStaff);
  });
});
