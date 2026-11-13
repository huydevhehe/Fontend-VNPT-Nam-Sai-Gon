import { expect, test, type APIRequestContext } from "@playwright/test";
import { ADMIN, AM, API_URL, apiLogin, bearer } from "./helpers";

async function createCustomer(request: APIRequestContext, token: string, suffix: string | number) {
  const res = await request.post(`${API_URL}/customers`, {
    headers: bearer(token),
    data: { name: `KH Giấy Tờ API ${suffix}`, type: "Doanh nghiệp", customerGroup: "Tự phát triển" },
  });
  expect(res.status()).toBe(201);
  return (await res.json()).data.id as string;
}

test.describe("API giấy tờ đính kèm khách hàng", () => {
  let token: string;
  let amToken: string;

  test.beforeAll(async ({ request }) => {
    token = await apiLogin(request, ADMIN.username, ADMIN.password);
    amToken = await apiLogin(request, AM.username, AM.password);
  });

  test("upload PDF hợp lệ -> 201, tải về -> 200 giống nội dung gốc, xóa -> 200", async ({ request }) => {
    const suffix = Date.now();
    const customerId = await createCustomer(request, token, suffix);
    const pdfContent = Buffer.from(`%PDF-1.4\n%test ${suffix}\n%%EOF`);

    const uploadRes = await request.post(`${API_URL}/customers/${customerId}/documents`, {
      headers: bearer(token),
      multipart: {
        docType: "GPKD",
        file: { name: "gpkd.pdf", mimeType: "application/pdf", buffer: pdfContent },
      },
    });
    expect(uploadRes.status()).toBe(201);
    const doc = (await uploadRes.json()).data;
    expect(doc.docType).toBe("GPKD");
    expect(doc.originalName).toBe("gpkd.pdf");

    const listRes = await request.get(`${API_URL}/customers/${customerId}/documents`, {
      headers: bearer(token),
    });
    expect(listRes.status()).toBe(200);
    const list = (await listRes.json()).data as Array<{ id: string }>;
    expect(list.some((d) => d.id === doc.id)).toBe(true);

    const downloadRes = await request.get(`${API_URL}/customers/documents/${doc.id}/download`, {
      headers: bearer(token),
    });
    expect(downloadRes.status()).toBe(200);
    const body = await downloadRes.body();
    expect(body.toString()).toBe(pdfContent.toString());

    const deleteRes = await request.delete(`${API_URL}/customers/documents/${doc.id}`, {
      headers: bearer(token),
    });
    expect(deleteRes.status()).toBe(200);

    const listAfter = await request.get(`${API_URL}/customers/${customerId}/documents`, {
      headers: bearer(token),
    });
    const listAfterBody = (await listAfter.json()).data as Array<{ id: string }>;
    expect(listAfterBody.some((d) => d.id === doc.id)).toBe(false);
  });

  test("upload file giả đổi đuôi (MZ -> .pdf) trả 400", async ({ request }) => {
    const suffix = Date.now();
    const customerId = await createCustomer(request, token, suffix);
    const fakePdf = Buffer.from("MZ\x90\x00\x03 giả danh pdf");

    const res = await request.post(`${API_URL}/customers/${customerId}/documents`, {
      headers: bearer(token),
      multipart: {
        docType: "GPKD",
        file: { name: "fake.pdf", mimeType: "application/pdf", buffer: fakePdf },
      },
    });
    expect(res.status()).toBe(400);
  });

  test("upload file vượt 10MB trả 400", async ({ request }) => {
    const suffix = Date.now();
    const customerId = await createCustomer(request, token, suffix);
    const big = Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(11 * 1024 * 1024, 0x41)]);

    const res = await request.post(`${API_URL}/customers/${customerId}/documents`, {
      headers: bearer(token),
      multipart: {
        docType: "GPKD",
        file: { name: "big.pdf", mimeType: "application/pdf", buffer: big },
      },
    });
    expect(res.status()).toBe(400);
  });

  test("tải về không có token trả 401", async ({ request }) => {
    const suffix = Date.now();
    const customerId = await createCustomer(request, token, suffix);
    const pdfContent = Buffer.from(`%PDF-1.4\n%nocred ${suffix}\n%%EOF`);
    const uploadRes = await request.post(`${API_URL}/customers/${customerId}/documents`, {
      headers: bearer(token),
      multipart: {
        docType: "CCCD",
        file: { name: "cccd.pdf", mimeType: "application/pdf", buffer: pdfContent },
      },
    });
    const doc = (await uploadRes.json()).data;

    const res = await request.get(`${API_URL}/customers/documents/${doc.id}/download`);
    expect(res.status()).toBe(401);
  });

  test("AM không được xóa giấy tờ (403)", async ({ request }) => {
    const suffix = Date.now();
    const customerId = await createCustomer(request, token, suffix);
    const pdfContent = Buffer.from(`%PDF-1.4\n%am-del ${suffix}\n%%EOF`);
    const uploadRes = await request.post(`${API_URL}/customers/${customerId}/documents`, {
      headers: bearer(token),
      multipart: {
        docType: "KHAC",
        file: { name: "khac.pdf", mimeType: "application/pdf", buffer: pdfContent },
      },
    });
    const doc = (await uploadRes.json()).data;

    const res = await request.delete(`${API_URL}/customers/documents/${doc.id}`, {
      headers: bearer(amToken),
    });
    expect(res.status()).toBe(403);
  });
});
