import { expect, test, type Locator, type Page } from "@playwright/test";
import { loginAs } from "./fixtures/auth";
import { ADMIN, API_URL, apiLogin, bearer, createApprovedCtv } from "./api/helpers";

const STAFF_B = "Phạm Thanh Hà";

/** Lấy control (input/select/textarea) nằm cùng div với label có text khớp chính xác. */
function fieldByLabel(scope: Page | Locator, labelText: string): Locator {
  return scope
    .locator(`div:has(> label:text-is("${labelText}")) :is(input, select, textarea)`)
    .first();
}

interface Ward {
  id: string;
  ward_name: string;
}

test.describe("Lead / Hợp đồng / Hoa hồng gắn CTV và Phường trên trang Admin", () => {
  let token: string;
  let wards: Ward[];

  test.beforeAll(async ({ request }) => {
    token = await apiLogin(request, ADMIN.username, ADMIN.password);
    const res = await request.get(`${API_URL}/territories`, { headers: bearer(token) });
    wards = (await res.json()).data;
    expect(wards.length).toBeGreaterThanOrEqual(2);
  });

  test("tạo lead kênh CTV giới thiệu hiện tên CTV, rồi Phân công đổi nhân viên và phường", async ({
    page,
    request,
  }) => {
    const ctv = await createApprovedCtv(request, token);
    const suffix = Date.now();
    const customerName = `KH UI CTV ${suffix}`;
    const phone = `09${String(suffix).slice(-8)}`;

    await loginAs(page, "admin");
    await page.goto("/admin/leads");

    await page.getByRole("button", { name: "Tạo Lead mới" }).click();
    await expect(page.getByRole("heading", { name: "Tạo Lead mới" })).toBeVisible();

    const createModal = page.locator("div.fixed:has(h3:text-is('Tạo Lead mới'))");
    // Popup tạo lead không còn ô Phường và Giá trị dự kiến
    await expect(createModal.locator("label:text-is('Phường')")).toHaveCount(0);
    await expect(createModal.locator("label:text-is('Giá trị dự kiến (₫)')")).toHaveCount(0);

    // Ô chọn CTV chỉ hiện khi kênh = "CTV giới thiệu"
    await expect(fieldByLabel(createModal, "Cộng tác viên giới thiệu")).toHaveCount(0);

    await fieldByLabel(createModal, "Tên khách hàng / Đầu mối").fill(customerName);
    await fieldByLabel(createModal, "Số điện thoại").fill(phone);
    await fieldByLabel(createModal, "AM Phụ trách").selectOption("Nguyễn Thị Tình");
    await fieldByLabel(createModal, "Kênh phát triển").selectOption("CTV giới thiệu");

    const ctvSelect = fieldByLabel(createModal, "Cộng tác viên giới thiệu");
    await expect(ctvSelect).toBeVisible();
    await ctvSelect.selectOption(ctv.id);

    await createModal.getByRole("button", { name: "Tạo Lead", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Tạo Lead mới" })).not.toBeVisible({
      timeout: 10_000,
    });

    await page.getByPlaceholder("Tìm theo tên Lead, SĐT, kênh phát triển...").fill(phone);
    const row = page.locator("table tbody tr", { hasText: phone });
    await expect(row).toHaveCount(1);
    await expect(row).toContainText("CTV E2E Test");
    await expect(row).toContainText("Lead KH mới");

    // Phân công: đổi nhân viên và phường
    await row.getByRole("button", { name: "Phân công" }).click();
    await expect(page.getByRole("heading", { name: "Phân công Lead" })).toBeVisible();
    await fieldByLabel(page, "Nhân viên phụ trách").selectOption(STAFF_B);
    await fieldByLabel(page, "Phường").selectOption(wards[1].id);
    await page.getByRole("button", { name: "Lưu phân công" }).click();
    await expect(page.getByRole("heading", { name: "Phân công Lead" })).not.toBeVisible({
      timeout: 10_000,
    });

    await expect(row).toContainText(STAFF_B);
    await expect(row).toContainText(wards[1].ward_name);

    // Giữ nguyên sau reload (đã ghi DB thật)
    await page.reload();
    await page.getByPlaceholder("Tìm theo tên Lead, SĐT, kênh phát triển...").fill(phone);
    const reloaded = page.locator("table tbody tr", { hasText: phone });
    await expect(reloaded).toContainText(STAFF_B);
    await expect(reloaded).toContainText(wards[1].ward_name);
    await expect(reloaded).toContainText("CTV E2E Test");
  });

  test("tạo lead để AM Ngẫu nhiên thì bảng hiển thị một AM hợp lệ (không phải __RANDOM__)", async ({
    page,
  }) => {
    const suffix = Date.now();
    const customerName = `KH Random AM ${suffix}`;
    const phone = `09${String(suffix).slice(-8)}`;

    await loginAs(page, "admin");
    await page.goto("/admin/leads");

    await page.getByRole("button", { name: "Tạo Lead mới" }).click();
    const createModal = page.locator("div.fixed:has(h3:text-is('Tạo Lead mới'))");
    await expect(createModal).toBeVisible();

    // AM Phụ trách mặc định là __RANDOM__
    await expect(fieldByLabel(createModal, "AM Phụ trách")).toHaveValue("__RANDOM__");

    await fieldByLabel(createModal, "Tên khách hàng / Đầu mối").fill(customerName);
    await fieldByLabel(createModal, "Số điện thoại").fill(phone);
    await createModal.getByRole("button", { name: "Tạo Lead", exact: true }).click();
    await expect(createModal).not.toBeVisible({ timeout: 10_000 });

    await page.getByPlaceholder("Tìm theo tên Lead, SĐT, kênh phát triển...").fill(phone);
    const row = page.locator("table tbody tr", { hasText: phone });
    await expect(row).toHaveCount(1);
    const rowText = await row.innerText();
    expect(rowText).not.toContain("__RANDOM__");
    expect(rowText).toMatch(/(Nguyễn Thị Tình|Phạm Thanh Hà|Trần Văn An|Lê Hoàng Nam|Hoàng Thị Mai)/);
  });

  test("nhãn loại lead hiển thị Lead KH mới / Lead gia hạn / Lead bán chéo", async ({
    page,
    request,
  }) => {
    const suffix = Date.now();
    const groups: Array<[string, string]> = [
      ["Lead KH mới", "Lead KH mới"],
      ["Lead gia hạn", "Lead gia hạn"],
      ["Lead bán chéo DV", "Lead bán chéo DV"],
    ];
    const phones: string[] = [];
    for (const [i, [group]] of groups.entries()) {
      const phone = `08${String(suffix + i).slice(-8)}`;
      phones.push(phone);
      const res = await request.post(`${API_URL}/leads`, {
        headers: bearer(token),
        data: {
          customerName: `KH Nhãn ${suffix}-${i}`,
          phone,
          group,
          channel: "Online",
          staffName: "Nguyễn Thị Tình",
          expectedValue: 1000000,
        },
      });
      expect(res.status()).toBe(201);
    }

    await loginAs(page, "admin");
    await page.goto("/admin/leads");
    for (const [i, [, label]] of groups.entries()) {
      await page.getByPlaceholder("Tìm theo tên Lead, SĐT, kênh phát triển...").fill(phones[i]);
      const row = page.locator("table tbody tr", { hasText: phones[i] });
      await expect(row).toHaveCount(1);
      await expect(row).toContainText(label);
    }
  });

  test("tạo hợp đồng Từ Lead, Hoàn tất triển khai thì Hoa hồng có dòng của CTV", async ({
    page,
    request,
  }) => {
    const ctv = await createApprovedCtv(request, token);
    const suffix = Date.now();
    const customerName = `KH UI HĐ ${suffix}`;
    const transactionCode = `GD-UI-${suffix}`;

    const leadRes = await request.post(`${API_URL}/leads`, {
      headers: bearer(token),
      data: {
        customerName,
        phone: `07${String(suffix).slice(-8)}`,
        group: "Lead KH mới",
        channel: "CTV giới thiệu",
        referredByCtvId: ctv.id,
        territoryId: wards[0].id,
        staffName: "Nguyễn Thị Tình",
        expectedValue: 20000000,
      },
    });
    expect(leadRes.status()).toBe(201);
    const lead = (await leadRes.json()).data;
    const won = await request.patch(`${API_URL}/leads/${lead.id}/status`, {
      headers: bearer(token),
      data: { status: "Chốt thành công" },
    });
    expect(won.status()).toBe(200);

    await loginAs(page, "admin");
    await page.goto("/admin/contracts");

    await page.getByRole("button", { name: "Thêm hợp đồng" }).click();
    await expect(page.getByRole("heading", { name: "Thêm hợp đồng" })).toBeVisible();

    await fieldByLabel(page, "Từ Lead").selectOption(lead.id);
    // Chọn lead tự điền tên khách hàng và giá trị
    await expect(fieldByLabel(page, "Tên khách hàng")).toHaveValue(customerName);
    await expect(fieldByLabel(page, "Giá trị hợp đồng (₫)")).toHaveValue("20000000");
    await fieldByLabel(page, "Mã giao dịch").fill(transactionCode);
    await fieldByLabel(page, "Mã thuê bao (phân tách bởi dấu phẩy)").fill("0901112223");
    await expect(fieldByLabel(page, "Phường")).toHaveValue(wards[0].id);

    await page.getByRole("button", { name: "Tạo hợp đồng" }).click();
    await expect(page.getByRole("heading", { name: "Thêm hợp đồng" })).not.toBeVisible({
      timeout: 10_000,
    });

    await page
      .getByPlaceholder("Tìm theo mã giao dịch, khách hàng, mã thuê bao...")
      .fill(transactionCode);
    const row = page.locator("table tbody tr", { hasText: transactionCode });
    await expect(row).toHaveCount(1);
    await expect(row).toContainText("CTV E2E Test");
    await expect(row).toContainText(wards[0].ward_name);

    const deploymentSelect = row.locator("select").first();
    await deploymentSelect.selectOption("Hoàn tất");
    await expect(deploymentSelect).toHaveValue("Hoàn tất", { timeout: 10_000 });

    await page.goto("/admin/commissions");
    await page
      .getByPlaceholder("Tìm theo đối tượng thụ hưởng, mã giao dịch...")
      .fill(transactionCode);
    const commissionRow = page.locator("table tbody tr", { hasText: transactionCode });
    await expect(commissionRow).toHaveCount(1);
    await expect(commissionRow).toContainText("CTV E2E Test");
    await expect(commissionRow).toContainText("2.000.000");
    await expect(commissionRow.locator("select")).toHaveValue("Chờ chi");
    await expect(commissionRow.getByRole("link", { name: transactionCode })).toHaveAttribute(
      "href",
      /\/admin\/contracts/
    );
  });

  test("chọn bộ lọc Trạng thái = Chốt thành công thì mọi dòng hiển thị đều có trạng thái đó", async ({
    page,
    request,
  }) => {
    const suffix = Date.now();
    const wonLeadRes = await request.post(`${API_URL}/leads`, {
      headers: bearer(token),
      data: {
        customerName: `KH Won Filter ${suffix}`,
        phone: `09${String(suffix).slice(-8)}`,
        group: "Lead KH mới",
        channel: "Online",
        staffName: "Nguyễn Thị Tình",
      },
    });
    expect(wonLeadRes.status()).toBe(201);
    const wonLead = (await wonLeadRes.json()).data;
    await request.patch(`${API_URL}/leads/${wonLead.id}/status`, {
      headers: bearer(token),
      data: { status: "Chốt thành công" },
    });

    await loginAs(page, "admin");
    await page.goto("/admin/leads");

    const statusFilter = page.locator("select[aria-label='Trạng thái']");
    await expect(statusFilter).toBeVisible();
    await statusFilter.selectOption("Chốt thành công");

    // Nút xóa lọc xuất hiện
    await expect(page.getByRole("button", { name: "Xóa lọc" })).toBeVisible();

    // Mọi dòng hiển thị đều có trạng thái 'Chốt thành công'
    const rows = page.locator("table tbody tr");
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText("Chốt thành công");
    }

    // Nhấn Xóa lọc -> filter về rỗng
    await page.getByRole("button", { name: "Xóa lọc" }).click();
    await expect(statusFilter).toHaveValue("");
  });
});
