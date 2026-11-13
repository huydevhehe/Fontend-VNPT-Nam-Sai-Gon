import { expect, test } from "@playwright/test";
import { ADMIN, AM, API_URL, apiLogin, bearer } from "./helpers";

/**
 * Tạo buffer "giả làm .xlsx" là CSV UTF-8 có BOM — backend đọc bằng
 * `XLSX.read(buffer, { type: "buffer" })` (SheetJS) và SheetJS tự nhận diện
 * nội dung không phải zip/binary rồi phân tích như CSV, BOM giúp giữ đúng
 * dấu tiếng Việt. Cách này tránh phải cài thêm package `xlsx` cho frontend
 * (plan không cho phép) chỉ để dựng file test.
 */
function buildWardContactsCsvBuffer(
  rows: Record<string, string>[],
  headers: string[]
): Buffer {
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

const HEADERS = ["Tên Phường", "Đơn vị", "Phòng ban", "Họ tên", "Chức", "SĐT", "AM phụ trách"];

test.describe("API import đầu mối phường (Excel)", () => {
  test("Admin import file 2 dòng hợp lệ, tự tạo phường -> 200, created = 2", async ({ request }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    const suffix = Date.now();
    const wardName = `E2E Phường Import ${suffix}`;

    const buffer = buildWardContactsCsvBuffer(
      [
        { "Tên Phường": wardName, "Đơn vị": "UBND", "Phòng ban": "Hành chính", Chức: "Chủ tịch" },
        { "Tên Phường": wardName, "Đơn vị": "Trạm Y tế", "Phòng ban": "Khám bệnh", Chức: "Trưởng trạm" },
      ],
      HEADERS
    );

    const res = await request.post(`${API_URL}/territories/contacts/import`, {
      headers: bearer(adminToken),
      multipart: {
        file: {
          name: "e2e-ward-contacts.xlsx",
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          buffer,
        },
        autoCreateWards: "true",
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.created).toBe(2);
    expect(body.data.duplicates).toBe(0);
    expect(body.data.createdWards).toContain(wardName);
    expect(body.data.errors).toEqual([]);
  });

  test("Import lại cùng file -> không nhân đôi (created = 0, duplicates = 2)", async ({ request }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    const suffix = Date.now();
    const wardName = `E2E Phường Import Lại ${suffix}`;

    const buffer = buildWardContactsCsvBuffer(
      [
        { "Tên Phường": wardName, "Đơn vị": "UBND", "Phòng ban": "Hành chính", Chức: "Chủ tịch" },
        { "Tên Phường": wardName, "Đơn vị": "Trạm Y tế", "Phòng ban": "Khám bệnh", Chức: "Trưởng trạm" },
      ],
      HEADERS
    );

    const upload = () =>
      request.post(`${API_URL}/territories/contacts/import`, {
        headers: bearer(adminToken),
        multipart: {
          file: {
            name: "e2e-ward-contacts-dup.xlsx",
            mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            buffer,
          },
          autoCreateWards: "true",
        },
      });

    const first = await upload();
    expect(first.status()).toBe(200);
    expect((await first.json()).data.created).toBe(2);

    const second = await upload();
    expect(second.status()).toBe(200);
    const secondBody = (await second.json()).data;
    expect(secondBody.created).toBe(0);
    expect(secondBody.duplicates).toBe(2);
  });

  test("Phường chưa có trong hệ thống và không tick tự tạo -> báo lỗi dòng đó", async ({ request }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    const suffix = Date.now();
    const wardName = `E2E Phường Chưa Có ${suffix}`;

    const buffer = buildWardContactsCsvBuffer(
      [{ "Tên Phường": wardName, "Đơn vị": "UBND", "Phòng ban": "Hành chính", Chức: "Chủ tịch" }],
      HEADERS
    );

    const res = await request.post(`${API_URL}/territories/contacts/import`, {
      headers: bearer(adminToken),
      multipart: {
        file: {
          name: "e2e-ward-contacts-unknown.xlsx",
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          buffer,
        },
        autoCreateWards: "false",
      },
    });

    expect(res.status()).toBe(200);
    const body = (await res.json()).data;
    expect(body.created).toBe(0);
    expect(body.createdWards).toEqual([]);
    expect(body.errors.length).toBe(1);
  });

  test("AM import -> 403", async ({ request }) => {
    const amToken = await apiLogin(request, AM.username, AM.password);
    const buffer = buildWardContactsCsvBuffer(
      [{ "Tên Phường": "X", "Đơn vị": "UBND", Chức: "Chủ tịch" }],
      HEADERS
    );

    const res = await request.post(`${API_URL}/territories/contacts/import`, {
      headers: bearer(amToken),
      multipart: {
        file: {
          name: "e2e-ward-contacts-am.xlsx",
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          buffer,
        },
        autoCreateWards: "true",
      },
    });

    expect(res.status()).toBe(403);
  });
});
