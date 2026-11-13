import test from "node:test";
import assert from "node:assert/strict";
import { initDatabase, query } from "../../database/db.js";
import { applySchemaExtensions } from "../../database/schema-extensions.js";
import { CtvAccountsService } from "./ctv-accounts.service.js";
import { AuthService, HttpError } from "../auth/auth.service.js";
import { USER_STATUS } from "../../constants/org.js";

await initDatabase();
await applySchemaExtensions();

test("createByAdmin creates active CTV with referral code", async () => {
  const service = new CtvAccountsService();
  const suffix = Date.now();
  const username = `ctv_admin_${suffix}`;
  const phone = `09${String(suffix).slice(-8)}`;

  const ctv = await service.createByAdmin(
    {
      username,
      password: "Password@123",
      name: `CTV Tạo Bởi Admin ${suffix}`,
      phone,
      email: `ctv_${suffix}@gmail.com`,
      mustChangePassword: true,
    },
    "Admin Test"
  );

  assert.equal(ctv.username, username);
  assert.equal(ctv.status, USER_STATUS.ACTIVE);
  assert.ok(ctv.referralCode, "Phải có referralCode");
  assert.ok(ctv.approvedAt, "Phải có approvedAt");

  // Kiểm tra trong DB users
  const rows = await query<{ status: string; must_change_password: number; approved_by: string }>(
    "SELECT status, must_change_password, approved_by FROM users WHERE id = ?",
    [ctv.id]
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].status, USER_STATUS.ACTIVE);
  assert.equal(Boolean(rows[0].must_change_password), true);
  assert.equal(rows[0].approved_by, "Admin Test");
});

test("createByAdmin rejects duplicate username (409)", async () => {
  const service = new CtvAccountsService();
  const suffix = Date.now();
  const username = `ctv_dup_${suffix}`;
  const phone1 = `09${String(suffix).slice(-8)}`;
  const phone2 = `08${String(suffix).slice(-8)}`;

  await service.createByAdmin(
    {
      username,
      password: "Password@123",
      name: `CTV Dup 1 ${suffix}`,
      phone: phone1,
    },
    "Admin"
  );

  await assert.rejects(
    async () => {
      await service.createByAdmin(
        {
          username,
          password: "Password@456",
          name: `CTV Dup 2 ${suffix}`,
          phone: phone2,
        },
        "Admin"
      );
    },
    (err: unknown) => {
      assert.ok(err instanceof HttpError);
      assert.equal(err.status, 409);
      assert.match(err.message, /Tên đăng nhập đã tồn tại/);
      return true;
    }
  );
});

test("createByAdmin rejects duplicate phone (409)", async () => {
  const service = new CtvAccountsService();
  const suffix = Date.now();
  const phone = `09${String(suffix + 1).slice(-8)}`;

  await service.createByAdmin(
    {
      username: `ctv_ph1_${suffix}`,
      password: "Password@123",
      name: `CTV Phone 1 ${suffix}`,
      phone,
    },
    "Admin"
  );

  await assert.rejects(
    async () => {
      await service.createByAdmin(
        {
          username: `ctv_ph2_${suffix}`,
          password: "Password@456",
          name: `CTV Phone 2 ${suffix}`,
          phone,
        },
        "Admin"
      );
    },
    (err: unknown) => {
      assert.ok(err instanceof HttpError);
      assert.equal(err.status, 409);
      assert.match(err.message, /Số điện thoại đã được đăng ký/);
      return true;
    }
  );
});

test("registerCtv still creates pending account (regression check)", async () => {
  const authService = new AuthService();
  const suffix = Date.now();
  const username = `ctv_reg_${suffix}`;
  const phone = `09${String(suffix + 2).slice(-8)}`;

  const res = await authService.registerCtv({
    username,
    password: "Password@123",
    name: `CTV Tự Đăng Ký ${suffix}`,
    phone,
    email: `ctv_reg_${suffix}@example.com`,
  });

  assert.match(res.message, /chờ Admin duyệt/);

  const rows = await query<{ status: string; must_change_password: number }>(
    "SELECT status, must_change_password FROM users WHERE username = ?",
    [username]
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].status, USER_STATUS.PENDING);
  assert.equal(Boolean(rows[0].must_change_password), false);
});
