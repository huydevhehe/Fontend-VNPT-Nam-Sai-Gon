import { execFileSync } from "node:child_process";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { ADMIN, AM, API_URL, apiLogin, bearer } from "./helpers";

/** Tên nhân viên gắn với tài khoản AM test (xem 00-tong-quan.md mục 3). */
const AM_STAFF_NAME = "Nguyễn Thị Tình";


test.describe("API phân quyền Nợ & Gia hạn (Đợt 9 - Task 1)", () => {
  test.describe.configure({ mode: "serial" });

  let adminToken: string;
  let amToken: string;
  let otherStaffName: string;
  let ownDebtId: string;
  let otherDebtId: string;
  let ownRenewalTransactionCode: string;
  let otherRenewalTransactionCode: string;

  test.beforeAll(async ({ request }) => {
    adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    amToken = await apiLogin(request, AM.username, AM.password);

    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    otherStaffName = `AM Khác Scope Test ${suffix}`;

    // Tạo một nhân viên khác để kiểm tra cách ly dữ liệu
    const createStaffRes = await request.post(`${API_URL}/staff`, {
      headers: bearer(adminToken),
      data: {
        code: `NV-SCOPE-${suffix}`,
        name: otherStaffName,
        role: "AM",
        password: "Password@12345",
      },
    });
    expect(createStaffRes.status(), await createStaffRes.text()).toBe(201);

    // Nợ của chính AM test
    const ownDebtRes = await request.post(`${API_URL}/debts`, {
      headers: bearer(adminToken),
      data: {
        staffName: AM_STAFF_NAME,
        serviceGroup: "BRCĐ",
        paymentCode: `PC-OWN-${suffix}`,
        subscriberCode: `SUB-OWN-${suffix}`,
        customerName: `KH Own ${suffix}`,
        immediateDebt: 1_000_000,
        cumulativeDebt: 0,
        month: "2026-10",
      },
    });
    expect(ownDebtRes.status(), await ownDebtRes.text()).toBe(201);
    ownDebtId = (await ownDebtRes.json()).data.id;

    // Nợ của nhân viên khác
    const otherDebtRes = await request.post(`${API_URL}/debts`, {
      headers: bearer(adminToken),
      data: {
        staffName: otherStaffName,
        serviceGroup: "BRCĐ",
        paymentCode: `PC-OTHER-${suffix}`,
        subscriberCode: `SUB-OTHER-${suffix}`,
        customerName: `KH Other ${suffix}`,
        immediateDebt: 2_000_000,
        cumulativeDebt: 0,
        month: "2026-10",
      },
    });
    expect(otherDebtRes.status(), await otherDebtRes.text()).toBe(201);
    otherDebtId = (await otherDebtRes.json()).data.id;

    ownRenewalTransactionCode = `GD-OWN-${suffix}`;
    otherRenewalTransactionCode = `GD-OTHER-${suffix}`;
  });

  test("admin POST /debts tạo nợ lẻ thành công (201)", async ({ request }) => {
    const suffix = `${Date.now()}-single`;
    const res = await request.post(`${API_URL}/debts`, {
      headers: bearer(adminToken),
      data: {
        staffName: AM_STAFF_NAME,
        serviceGroup: "CNTT",
        paymentCode: `PC-${suffix}`,
        subscriberCode: `SUB-${suffix}`,
        customerName: `KH Single ${suffix}`,
        immediateDebt: 500_000,
        cumulativeDebt: 0,
        month: "2026-10",
      },
    });
    expect(res.status(), await res.text()).toBe(201);
    const body = await res.json();
    expect(body.data.status).toBe("Nợ cước");
  });

  test("AM POST /debts (thêm nợ lẻ) bị từ chối 403", async ({ request }) => {
    const res = await request.post(`${API_URL}/debts`, {
      headers: bearer(amToken),
      data: {
        staffName: AM_STAFF_NAME,
        serviceGroup: "BRCĐ",
        paymentCode: "PC-X",
        subscriberCode: "SUB-X",
        customerName: "KH X",
        immediateDebt: 1,
        cumulativeDebt: 0,
        month: "2026-10",
      },
    });
    expect(res.status()).toBe(403);
  });

  test("AM GET /debts?staff=<người khác> vẫn chỉ nhận dữ liệu của mình", async ({ request }) => {
    const res = await request.get(`${API_URL}/debts?staff=${encodeURIComponent(otherStaffName)}`, {
      headers: bearer(amToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    for (const row of body.data) {
      expect(row.staff_name.trim()).toBe(AM_STAFF_NAME);
    }
    // Dữ liệu của nhân viên khác KHÔNG xuất hiện
    expect(body.data.some((row: { id: string }) => row.id === otherDebtId)).toBe(false);
    expect(body.data.some((row: { id: string }) => row.id === ownDebtId)).toBe(true);
  });

  test("admin GET /debts?staff=<ai đó> xem được đầy đủ theo tham số", async ({ request }) => {
    const res = await request.get(`${API_URL}/debts?staff=${encodeURIComponent(otherStaffName)}`, {
      headers: bearer(adminToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.some((row: { id: string }) => row.id === otherDebtId)).toBe(true);
  });

  test("AM gạch nợ dòng của người khác → 403", async ({ request }) => {
    const res = await request.patch(`${API_URL}/debts/${otherDebtId}/gach-no`, {
      headers: bearer(amToken),
      data: { amount: 100, documentRef: "UNC-TEST" },
    });
    expect(res.status()).toBe(403);
  });

  test("AM gạch nợ dòng của chính mình → 200", async ({ request }) => {
    const res = await request.patch(`${API_URL}/debts/${ownDebtId}/gach-no`, {
      headers: bearer(amToken),
      data: { amount: 1_000_000, documentRef: "UNC-TEST" },
    });
    expect(res.status()).toBe(200);
  });

  test("AM POST /debts/import bị từ chối 403", async ({ request }) => {
    const res = await request.post(`${API_URL}/debts/import`, {
      headers: bearer(amToken),
      multipart: {
        file: {
          name: "test.xlsx",
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          buffer: Buffer.from("dummy"),
        },
        month: "2026-10",
      },
    });
    expect(res.status()).toBe(403);
  });

  test("AM POST /renewals/import bị từ chối 403", async ({ request }) => {
    const res = await request.post(`${API_URL}/renewals/import`, {
      headers: bearer(amToken),
      multipart: {
        file: {
          name: "test.xlsx",
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          buffer: Buffer.from("dummy"),
        },
        cohort: "THÁNG T",
      },
    });
    expect(res.status()).toBe(403);
  });

  test("Renewals: AM GET ?staff=<người khác> chỉ thấy dữ liệu của mình, PATCH status dòng người khác → 403", async ({
    request,
  }) => {
    // Tạo giao dịch gia hạn cho chính AM và cho nhân viên khác qua import giả
    // lập bằng cách build 1 file Excel tối giản với 1 dòng mỗi file. `xlsx`
    // không phải dependency của frontend; để không cài thêm package mới,
    // build buffer bằng cách gọi `node` chạy script CommonJS require thẳng
    // `xlsx` đã có sẵn trong `backend/node_modules` (tách tiến trình riêng
    // nên không vướng type-check của chương trình TS frontend).
    function buildSheet(rows: Record<string, unknown>[]): Buffer {
      const script = `
        const XLSX = require(${JSON.stringify(
          path.resolve(process.cwd(), "../backend/node_modules/xlsx")
        )});
        const rows = ${JSON.stringify(rows)};
        const sheet = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, sheet, "GIA HẠN");
        process.stdout.write(XLSX.write(wb, { type: "buffer" }));
      `;
      return execFileSync(process.execPath, ["-e", script], {
        encoding: "buffer",
        maxBuffer: 10 * 1024 * 1024,
      });
    }

    const ownBuffer = buildSheet([
      {
        "TÊN NHÂN VIÊN CHĂM": AM_STAFF_NAME,
        "MA_THANH TOÁN": `PC-RN-OWN`,
        "MA_THUÊ BAO": `SUB-RN-OWN`,
        "TEN_THUÊ BAO": `KH Renewal Own`,
        "MÃ GIAO DỊCH": ownRenewalTransactionCode,
        "THÁNG T": 100000,
      },
    ]);
    const otherBuffer = buildSheet([
      {
        "TÊN NHÂN VIÊN CHĂM": otherStaffName,
        "MA_THANH TOÁN": `PC-RN-OTHER`,
        "MA_THUÊ BAO": `SUB-RN-OTHER`,
        "TEN_THUÊ BAO": `KH Renewal Other`,
        "MÃ GIAO DỊCH": otherRenewalTransactionCode,
        "THÁNG T": 200000,
      },
    ]);

    const importOwn = await request.post(`${API_URL}/renewals/import`, {
      headers: bearer(adminToken),
      multipart: {
        file: { name: "own.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer: ownBuffer },
        cohort: "THÁNG T",
      },
    });
    expect(importOwn.status(), await importOwn.text()).toBe(200);

    const importOther = await request.post(`${API_URL}/renewals/import`, {
      headers: bearer(adminToken),
      multipart: {
        file: { name: "other.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer: otherBuffer },
        cohort: "THÁNG T",
      },
    });
    expect(importOther.status(), await importOther.text()).toBe(200);

    // AM GET ?staff=<other> vẫn chỉ thấy dòng của mình
    const getRes = await request.get(`${API_URL}/renewals?staff=${encodeURIComponent(otherStaffName)}`, {
      headers: bearer(amToken),
    });
    expect(getRes.status()).toBe(200);
    const getBody = await getRes.json();
    for (const row of getBody.data) {
      expect(row.staff_name.trim()).toBe(AM_STAFF_NAME);
    }
    const ownRow = getBody.data.find(
      (row: { transaction_code: string }) => row.transaction_code === ownRenewalTransactionCode
    );
    expect(ownRow).toBeTruthy();
    const otherRow = getBody.data.find(
      (row: { transaction_code: string }) => row.transaction_code === otherRenewalTransactionCode
    );
    expect(otherRow).toBeFalsy();

    // Tìm id của dòng "other" qua admin để PATCH status
    const adminGetRes = await request.get(
      `${API_URL}/renewals?staff=${encodeURIComponent(otherStaffName)}`,
      { headers: bearer(adminToken) }
    );
    const adminBody = await adminGetRes.json();
    const otherRenewalRow = adminBody.data.find(
      (row: { transaction_code: string }) => row.transaction_code === otherRenewalTransactionCode
    );
    expect(otherRenewalRow).toBeTruthy();

    const patchRes = await request.patch(`${API_URL}/renewals/${otherRenewalRow.id}/status`, {
      headers: bearer(amToken),
      data: { status: "Hoàn thành" },
    });
    expect(patchRes.status()).toBe(403);
  });
});
