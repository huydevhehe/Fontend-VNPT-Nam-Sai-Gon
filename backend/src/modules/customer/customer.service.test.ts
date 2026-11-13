import { test } from "node:test";
import assert from "node:assert/strict";

const { initDatabase } = await import("../../database/db.js");
const { CustomerService, CustomerServiceError } = await import("./customer.service.js");

await initDatabase();

test("create stores contact and billing info separately", async () => {
  const service = new CustomerService();
  const suffix = Date.now();

  const result = await service.create({
    name: `Công ty Test Liên hệ ${suffix}`,
    type: "Doanh nghiệp",
    customerGroup: "Tự phát triển",
    phone: `090${String(suffix).slice(-7)}`,
    contactName: "Chị Diễm",
    contactEmail: "diem@example.com",
    billingName: "Anh Khải",
    billingPhone: "0983036755",
    billingEmail: "khai@example.com",
  });

  assert.equal(result.customer.contact_name, "Chị Diễm");
  assert.equal(result.customer.contact_email, "diem@example.com");
  assert.equal(result.customer.billing_name, "Anh Khải");
  assert.equal(result.customer.billing_phone, "0983036755");
  assert.equal(result.customer.billing_email, "khai@example.com");
});

test("create accepts PTM địa bàn group", async () => {
  const service = new CustomerService();
  const suffix = Date.now();

  const result = await service.create({
    name: `Công ty PTM Địa Bàn ${suffix}`,
    type: "Doanh nghiệp",
    customerGroup: "PTM địa bàn",
  });

  assert.equal(result.customer.customer_group, "PTM địa bàn");
});

test("create normalizes tax code", async () => {
  const service = new CustomerService();
  const suffix = Date.now();

  const result = await service.create({
    name: `Công ty Chuẩn Hóa MST ${suffix}`,
    type: "Doanh nghiệp",
    customerGroup: "Tự phát triển",
    identityCode: "317424086",
  });

  assert.equal(result.customer.identity_code, "0317424086");
});

test("update by unrelated AM returns 403", async () => {
  const service = new CustomerService();
  const suffix = Date.now();

  const result = await service.create({
    name: `Công ty Sửa Quyền ${suffix}`,
    type: "Doanh nghiệp",
    customerGroup: "Tự phát triển",
    amStaff: `AM Chủ ${suffix}`,
    amCaringStaff: `AM Chủ ${suffix}`,
  });

  await assert.rejects(
    async () => {
      await service.update(
        result.customer.id,
        { note: "Cố sửa khách không phải của mình" },
        { name: `AM Khác ${suffix}`, role: "AM" }
      );
    },
    (err: any) => {
      assert.ok(err instanceof CustomerServiceError);
      assert.equal(err.status, 403);
      return true;
    }
  );
});

test("update cannot change am_staff", async () => {
  const service = new CustomerService();
  const suffix = Date.now();

  const result = await service.create({
    name: `Công ty Không Đổi AM ${suffix}`,
    type: "Doanh nghiệp",
    customerGroup: "Tự phát triển",
  });

  await assert.rejects(
    async () => {
      await service.update(
        result.customer.id,
        { amStaff: "Ai đó khác" },
        { name: "Admin", role: "Admin" }
      );
    },
    (err: any) => {
      assert.ok(err instanceof CustomerServiceError);
      assert.equal(err.status, 400);
      return true;
    }
  );
});

test("update by owning AM succeeds and does not change am_staff/am_caring_staff", async () => {
  const service = new CustomerService();
  const suffix = Date.now();
  const amName = `AM Chủ Sở Hữu ${suffix}`;

  const result = await service.create({
    name: `Công ty Sửa Hợp Lệ ${suffix}`,
    type: "Doanh nghiệp",
    customerGroup: "Tự phát triển",
    amStaff: amName,
    amCaringStaff: amName,
  });

  const updated = await service.update(
    result.customer.id,
    { note: "Đã liên hệ khách, hẹn gặp lại" },
    { name: amName, role: "AM" }
  );

  assert.equal(updated.note, "Đã liên hệ khách, hẹn gặp lại");
  assert.equal(updated.am_staff, amName);
});

test("getById returns 404 for unknown id", async () => {
  const service = new CustomerService();
  await assert.rejects(
    async () => {
      await service.getById("KH-KHONG-TON-TAI");
    },
    (err: any) => {
      assert.ok(err instanceof CustomerServiceError);
      assert.equal(err.status, 404);
      return true;
    }
  );
});
