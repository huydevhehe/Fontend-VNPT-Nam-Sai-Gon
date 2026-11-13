import { expect, test } from "@playwright/test";
import { ADMIN, AM, API_URL, apiLogin, bearer } from "./helpers";

/**
 * Tạo buffer "giả làm .xlsx" là CSV UTF-8 có BOM — SheetJS tự nhận diện và
 * phân tích như CSV (xem ward-contact-import.spec.ts). Tránh phải cài thêm
 * package `xlsx` cho frontend chỉ để dựng file test (plan không cho phép
 * cài package mới).
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

const HEADERS = ["Tên khách hàng", "Mã số thuế", "Số điện thoại", "Loại KH"];

test.describe("API Import khách hàng + xử lý trùng (POST /api/customers/import/preview, /commit)", () => {
  let adminToken: string;
  let amToken: string;

  test.beforeAll(async ({ request }) => {
    adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    amToken = await apiLogin(request, AM.username, AM.password);
  });

  test("AM gọi preview nhận lỗi 403", async ({ request }) => {
    const buffer = buildCustomerCsvBuffer(
      [{ "Tên khách hàng": "Công ty 403", "Mã số thuế": "0101111111" }],
      HEADERS
    );

    const res = await request.post(`${API_URL}/customers/import/preview`, {
      headers: bearer(amToken),
      multipart: { file: { name: "import.xlsx", mimeType: "text/csv", buffer } },
    });

    expect(res.status()).toBe(403);
  });

  test("preview phân loại đúng mới / trùng MST / trùng PTM, commit áp quyết định", async ({
    request,
  }) => {
    const suffix = Date.now();
    const existingTaxCode = `317${String(suffix).slice(-6)}`;
    const ptmTaxCode = `327${String(suffix).slice(-6)}`;

    // Dựng sẵn 1 khách đã có (để dòng trùng MST) và 1 khách PTM (để cảnh báo PTM).
    const existingRes = await request.post(`${API_URL}/customers`, {
      headers: bearer(adminToken),
      data: {
        name: `Công ty Đã Có ${suffix}`,
        type: "Doanh nghiệp",
        customerGroup: "Tập hiện hữu",
        identityCode: existingTaxCode,
      },
    });
    expect(existingRes.status()).toBe(201);
    const existingCustomer = (await existingRes.json()).data;

    const ptmRes = await request.post(`${API_URL}/customers`, {
      headers: bearer(adminToken),
      data: {
        name: `Công ty PTM ${suffix}`,
        type: "Doanh nghiệp",
        customerGroup: "Tự phát triển",
        identityCode: ptmTaxCode,
      },
    });
    expect(ptmRes.status()).toBe(201);
    const ptmCustomer = (await ptmRes.json()).data;

    const newTaxCode = `337${String(suffix).slice(-6)}`;
    const buffer = buildCustomerCsvBuffer(
      [
        { "Tên khách hàng": `Công ty Mới ${suffix}`, "Mã số thuế": newTaxCode, "Loại KH": "Tập hiện hữu" },
        { "Tên khách hàng": `Công ty Trùng MST ${suffix}`, "Mã số thuế": existingTaxCode },
        { "Tên khách hàng": `Công ty Trùng PTM ${suffix}`, "Mã số thuế": ptmTaxCode },
      ],
      HEADERS
    );

    const previewRes = await request.post(`${API_URL}/customers/import/preview`, {
      headers: bearer(adminToken),
      multipart: { file: { name: "import.xlsx", mimeType: "text/csv", buffer } },
    });
    expect(previewRes.status()).toBe(200);
    const previewBody = await previewRes.json();
    expect(previewBody.success).toBe(true);

    const { rows, summary } = previewBody.data;
    expect(summary.new).toBe(1);
    expect(summary.duplicate).toBe(2);
    expect(summary.ptmConflict).toBe(1);

    const newRow = rows.find((r: any) => r.row.name === `Công ty Mới ${suffix}`);
    const dupRow = rows.find((r: any) => r.row.name === `Công ty Trùng MST ${suffix}`);
    const ptmRow = rows.find((r: any) => r.row.name === `Công ty Trùng PTM ${suffix}`);

    expect(newRow.status).toBe("new");
    expect(dupRow.status).toBe("duplicate");
    expect(dupRow.matches[0].customerId).toBe(existingCustomer.id);
    expect(dupRow.matches[0].matchedFields).toContain("MST/CCCD");
    expect(ptmRow.ptmConflict).toBe(true);

    const commitRes = await request.post(`${API_URL}/customers/import/commit`, {
      headers: bearer(adminToken),
      data: {
        territoryId: null,
        handoverBatch: `DOT-IMPORT-E2E-${suffix}`,
        decisions: [
          { row: newRow.row, action: "create" },
          { row: dupRow.row, action: "keep_old", targetCustomerId: existingCustomer.id },
          {
            row: ptmRow.row,
            action: "use_new",
            targetCustomerId: ptmCustomer.id,
            customerGroup: "PTM địa bàn",
          },
        ],
      },
    });
    expect(commitRes.status()).toBe(200);
    const commitBody = await commitRes.json();
    expect(commitBody.success).toBe(true);
    expect(commitBody.data.created).toBe(1);
    expect(commitBody.data.kept).toBe(1);
    expect(commitBody.data.updated).toBe(1);
    expect(commitBody.data.errors.length).toBe(0);

    // Khách mới đã được tạo
    const listRes = await request.get(
      `${API_URL}/customers?search=${encodeURIComponent(newTaxCode)}`,
      { headers: bearer(adminToken) }
    );
    const listBody = await listRes.json();
    const createdRow = listBody.data.find((c: any) => c.name === `Công ty Mới ${suffix}`);
    expect(createdRow).toBeTruthy();
    expect(createdRow.identity_code).toBe(`0${newTaxCode}`);
    expect(createdRow.customer_group).toBe("Tập hiện hữu");

    // Khách PTM đã chuyển thành PTM địa bàn
    const ptmCheckRes = await request.get(`${API_URL}/customers/${ptmCustomer.id}`, {
      headers: bearer(adminToken),
    });
    const ptmCheckBody = await ptmCheckRes.json();
    expect(ptmCheckBody.data.customer_group).toBe("PTM địa bàn");
  });

  test("AM gọi commit nhận lỗi 403", async ({ request }) => {
    const res = await request.post(`${API_URL}/customers/import/commit`, {
      headers: bearer(amToken),
      data: { territoryId: null, decisions: [] },
    });
    expect(res.status()).toBe(403);
  });
});
