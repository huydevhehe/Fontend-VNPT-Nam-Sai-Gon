import { expect, test } from "@playwright/test";
import { ADMIN, AM, API_URL, apiLogin, bearer } from "./helpers";

/**
 * Tạo buffer "giả làm .xlsx" là CSV UTF-8 có BOM (xem ward-contact-import.spec.ts
 * để biết lý do: SheetJS tự fallback đọc CSV, tránh phải cài thêm package
 * xlsx cho frontend chỉ để dựng file test).
 */
function buildCsvBuffer(rows: Record<string, string>[], headers: string[]): Buffer {
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

test.describe("API Nhắc hết hạn (Đợt 10 - Task 4)", () => {
  test.describe.configure({ mode: "serial" });

  let adminToken: string;
  let amToken: string;

  test.beforeAll(async ({ request }) => {
    adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    amToken = await apiLogin(request, AM.username, AM.password);
  });

  const HEADERS = ["Tên", "Ngày hết hạn", "Email"];
  const SUFFIX = Date.now();

  test("Admin import file 3 dòng (1 serial, 1 dd/mm/yyyy, 1 rác) -> imported = 2, 1 lỗi", async ({ request }) => {
    const buffer = buildCsvBuffer(
      [
        { "Tên": `Mục Serial ${SUFFIX}`, "Ngày hết hạn": "45962", "Email": "serial@example.com" },
        { "Tên": `Mục DMY ${SUFFIX}`, "Ngày hết hạn": "18/11/2026", "Email": "dmy@example.com" },
        { "Tên": `Mục Rác ${SUFFIX}`, "Ngày hết hạn": "không phải ngày", "Email": "rac@example.com" },
      ],
      HEADERS
    );

    const res = await request.post(`${API_URL}/reminders/files/import`, {
      headers: bearer(adminToken),
      multipart: {
        file: {
          name: "e2e-reminders.xlsx",
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          buffer,
        },
        name: `Batch E2E ${SUFFIX}`,
        daysBefore: JSON.stringify([10, 3]),
        columns: JSON.stringify({ expiryDate: "Ngày hết hạn", title: "Tên", recipientEmail: "Email" }),
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.imported).toBe(2);
    expect(body.data.errors.length).toBe(1);
  });

  test("Admin inspect file trả về headers và 5 dòng mẫu", async ({ request }) => {
    const buffer = buildCsvBuffer(
      [{ "Tên": `Mục Inspect ${SUFFIX}`, "Ngày hết hạn": "18/11/2026", "Email": "x@example.com" }],
      HEADERS
    );
    const res = await request.post(`${API_URL}/reminders/files/inspect`, {
      headers: bearer(adminToken),
      multipart: {
        file: {
          name: "e2e-inspect.xlsx",
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          buffer,
        },
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.headers).toEqual(expect.arrayContaining(HEADERS));
    expect(body.data.sampleRows.length).toBeGreaterThan(0);
  });

  test("AM gọi bất kỳ route /reminders → 403", async ({ request }) => {
    const getSettings = await request.get(`${API_URL}/reminders/settings`, { headers: bearer(amToken) });
    expect(getSettings.status()).toBe(403);

    const listFiles = await request.get(`${API_URL}/reminders/files`, { headers: bearer(amToken) });
    expect(listFiles.status()).toBe(403);

    const runNow = await request.post(`${API_URL}/reminders/run-now`, { headers: bearer(amToken) });
    expect(runNow.status()).toBe(403);

    const logs = await request.get(`${API_URL}/reminders/logs`, { headers: bearer(amToken) });
    expect(logs.status()).toBe(403);
  });

  test("GET /reminders/files liệt kê đợt vừa import", async ({ request }) => {
    const res = await request.get(`${API_URL}/reminders/files`, { headers: bearer(adminToken) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const batch = body.data.find((b: { name: string }) => b.name === `Batch E2E ${SUFFIX}`);
    expect(batch).toBeTruthy();
    expect(batch.itemCount).toBe(2);

    // Dọn đợt vừa tạo để không còn "enabled" trong DB test dùng chung (xem
    // comment trong reminders-ui.spec.ts) — làm sau cùng vì các test khác
    // trong describe này cũng cần đợt này còn tồn tại.
    await request.delete(`${API_URL}/reminders/files/${batch.id}`, { headers: bearer(adminToken) });
  });
});
