import { test, expect } from "@playwright/test";
import { ADMIN, API_URL, apiLogin, bearer } from "./helpers";

test.describe("Orders API (Đơn hàng)", () => {
  test.describe.configure({ mode: "serial" });

  let adminToken: string;
  let amKhoaToken: string;
  let amTuanToken: string;
  let amKhoaName: string;

  test.beforeAll(async ({ request }) => {
    // 1. Login as admin
    adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);

    // 2. Ensure staff AM Khoa and AM Tuấn exist
    const suffix = Date.now();
    amKhoaName = `Vũ Tiến Khoa ${suffix}`;
    const tuanName = `Trần Văn Tuấn ${suffix}`;

    await request.post(`${API_URL}/staff`, {
      headers: bearer(adminToken),
      data: {
        code: `KHOA_${suffix}`,
        name: amKhoaName,
        role: "AM",
        password: "Password@12345",
      },
    });

    await request.post(`${API_URL}/staff`, {
      headers: bearer(adminToken),
      data: {
        code: `TUAN_${suffix}`,
        name: tuanName,
        role: "AM",
        password: "Password@12345",
      },
    });

    // Login AM Khoa & Tuấn
    amKhoaToken = await apiLogin(request, `KHOA_${suffix}`, "Password@12345");
    amTuanToken = await apiLogin(request, `TUAN_${suffix}`, "Password@12345");
  });

  test("create order with full fields and get in list", async ({ request }) => {
    const suffix = Date.now();
    const createRes = await request.post(`${API_URL}/contracts`, {
      headers: bearer(adminToken),
      data: {
        transactionCode: `GD_TEST_${suffix}`,
        customerName: `Khách Hàng Test ${suffix}`,
        subscriberCodes: [`TB_${suffix}`],
        totalValue: 5940000,
        channel: "Trực tiếp",
        serviceGroup: "BRCĐ",
        serviceName: "FiberVNN",
        packageName: "Home Net 2",
        paymentMethod: "Trả trước",
        contractNumber: `20261113/0319653211/VNPT.NSG/VNPT026696`,
        signedDate: "2026-11-13",
      },
    });

    expect(createRes.status()).toBe(201);
    const createdJson = await createRes.json();
    expect(createdJson.data.serviceGroup).toBe("BRCĐ");
    expect(createdJson.data.paymentMethod).toBe("Trả trước");
    expect(createdJson.data.contractNumber).toBe(`20261113/0319653211/VNPT.NSG/VNPT026696`);

    // Verify GET /contracts contains it
    const listRes = await request.get(`${API_URL}/contracts`, {
      headers: bearer(adminToken),
    });
    expect(listRes.status()).toBe(200);
    const listJson = await listRes.json();
    const found = listJson.data.find((c: any) => c.transactionCode === `GD_TEST_${suffix}`);
    expect(found).toBeDefined();
    expect(found.serviceGroup).toBe("BRCĐ");
    expect(found.packageName).toBe("Home Net 2");
  });

  test("AM cannot update order belonging to another AM (403)", async ({ request }) => {
    const suffix = Date.now();
    // Admin creates order assigned to AM Khoa
    const createRes = await request.post(`${API_URL}/contracts`, {
      headers: bearer(adminToken),
      data: {
        transactionCode: `GD_KHOA_${suffix}`,
        customerName: `Khách Hàng Của Khoa ${suffix}`,
        subscriberCodes: [`TB_KHOA_${suffix}`],
        totalValue: 2000000,
        channel: "Trực tiếp",
        amStaff: amKhoaName,
        serviceGroup: "CNTT",
        paymentMethod: "Trả trước",
      },
    });
    expect(createRes.status()).toBe(201);
    const created = (await createRes.json()).data;

    // AM Tuấn tries to edit Khoa's order -> 403
    const updateRes = await request.patch(`${API_URL}/contracts/${created.id}`, {
      headers: bearer(amTuanToken),
      data: {
        packageName: "Gói Lạ",
      },
    });
    expect(updateRes.status()).toBe(403);
    const errJson = await updateRes.json();
    expect(errJson.message).toBe("Không có quyền chỉnh sửa đơn hàng này");
  });

  test("Admin or assigned AM can update order (200)", async ({ request }) => {
    const suffix = Date.now();
    const createRes = await request.post(`${API_URL}/contracts`, {
      headers: bearer(adminToken),
      data: {
        transactionCode: `GD_EDIT_${suffix}`,
        customerName: `Khách Hàng Edit ${suffix}`,
        subscriberCodes: [`TB_EDIT_${suffix}`],
        totalValue: 3000000,
        channel: "Trực tiếp",
        amStaff: amKhoaName,
        serviceGroup: "Di động",
        paymentMethod: "Trả hàng tháng",
      },
    });
    expect(createRes.status()).toBe(201);
    const created = (await createRes.json()).data;

    // Assigned AM Khoa updates package
    const updateRes = await request.patch(`${API_URL}/contracts/${created.id}`, {
      headers: bearer(amKhoaToken),
      data: {
        packageName: "Gói Doanh Nghiệp VIP",
        paymentMethod: "Trả trước",
      },
    });
    expect(updateRes.status()).toBe(200);
    const updated = (await updateRes.json()).data;
    expect(updated.packageName).toBe("Gói Doanh Nghiệp VIP");
    expect(updated.paymentMethod).toBe("Trả trước");
  });

  test("export payment request docx produces valid docx file and logs export", async ({ request }) => {
    const suffix = Date.now();
    const createRes = await request.post(`${API_URL}/contracts`, {
      headers: bearer(adminToken),
      data: {
        transactionCode: `GD_EXPORT_${suffix}`,
        customerName: `Khách Hàng Xuất Đề Nghị ${suffix}`,
        subscriberCodes: [`TB_EXP_${suffix}`],
        totalValue: 5940000,
        channel: "Trực tiếp",
        serviceGroup: "CNTT",
        packageName: "eduOffice",
        paymentMethod: "Trả trước",
      },
    });
    expect(createRes.status()).toBe(201);
    const order = (await createRes.json()).data;

    // Missing docNumber -> 400
    const errRes = await request.get(`${API_URL}/contracts/${order.id}/payment-request`, {
      headers: bearer(adminToken),
    });
    expect(errRes.status()).toBe(400);

    // Preview
    const previewRes = await request.get(`${API_URL}/contracts/${order.id}/payment-request/preview`, {
      headers: bearer(adminToken),
    });
    expect(previewRes.status()).toBe(200);
    const previewJson = await previewRes.json();
    expect(previewJson.data.missingFields).toBeDefined();

    // Export with docNumber=706
    const exportRes = await request.get(`${API_URL}/contracts/${order.id}/payment-request?docNumber=706`, {
      headers: bearer(adminToken),
    });
    expect(exportRes.status()).toBe(200);
    expect(exportRes.headers()["content-type"]).toContain("officedocument.wordprocessingml.document");
    expect(exportRes.headers()["content-disposition"]).toContain(`De-nghi-thanh-toan_${order.transactionCode}.docx`);

    const bodyBuffer = await exportRes.body();
    // Docx file starts with PK (0x50 0x4B)
    expect(bodyBuffer[0]).toBe(0x50);
    expect(bodyBuffer[1]).toBe(0x4B);

    // Verify logs
    const logsRes = await request.get(`${API_URL}/contracts/payment-requests`, {
      headers: bearer(adminToken),
    });
    expect(logsRes.status()).toBe(200);
    const logsJson = await logsRes.json();
    const foundLog = logsJson.data.find((l: any) => l.contractId === order.id && l.docNumber === "706");
    expect(foundLog).toBeDefined();
  });
});
