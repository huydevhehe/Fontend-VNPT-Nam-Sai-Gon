import { test } from "node:test";
import assert from "node:assert/strict";

const { initDatabase, query } = await import("../../database/db.js");
const { applySchemaExtensions } = await import("../../database/schema-extensions.js");
const { StaffService, deriveShortName } = await import("./staff.service.js");
const { HttpError } = await import("../auth/auth.service.js");

await initDatabase();
await applySchemaExtensions();

test("create requires password", async () => {
  const service = new StaffService();
  const suffix = Date.now();
  await assert.rejects(
    async () => {
      await service.create({
        code: `NV-PASS-${suffix}`,
        name: `Nhân viên Không Pass ${suffix}`,
        role: "AM",
        territory: "Phường Tân Phong",
        email: `nopass_${suffix}@vnpt.vn`,
        password: "",
      });
    },
    (err: any) => {
      assert.ok(err instanceof HttpError);
      assert.equal(err.status, 400);
      assert.equal(err.message, "Mật khẩu phải từ 8 đến 72 ký tự");
      return true;
    }
  );
});

test("create stores sheet fields and login account", async () => {
  const service = new StaffService();
  const suffix = Date.now();
  const code = `NV-T1-${suffix}`;
  const hrmCode = `HRM-${suffix}`;

  const created = await service.create({
    code,
    name: "Nguyễn Thị Huyền Trang",
    role: "AM Bán chăm",
    territory: "Phường Tân Hưng",
    email: `trang_${suffix}@vnpt.vn`,
    hrmCode,
    staffType: "Cộng tác viên",
    phone: "0901234567",
    birthDate: "1995-10-25",
    personalEmail: `trang.personal_${suffix}@gmail.com`,
    shortName: "",
    note: "Nhân viên thử việc",
    password: "Password@123",
    mustChangePassword: true,
  });

  assert.equal(created.code, code);
  assert.equal(created.hrmCode, hrmCode);
  assert.equal(created.staffType, "Cộng tác viên");
  assert.equal(created.phone, "0901234567");
  assert.equal(created.birthDate, "1995-10-25");
  assert.equal(created.personalEmail, `trang.personal_${suffix}@gmail.com`);
  assert.equal(created.shortName, "TRANG");
  assert.equal(created.note, "Nhân viên thử việc");
  assert.equal(created.username, code);

  // Kiểm tra bảng users
  const userRows = await query<{ username: string; must_change_password: boolean | number }>(
    "SELECT username, must_change_password FROM users WHERE username = ?",
    [code]
  );
  assert.equal(userRows.length, 1);
  assert.equal(userRows[0].username, code);
  assert.equal(Boolean(userRows[0].must_change_password), true);
});

test("create with mustChangePassword false", async () => {
  const service = new StaffService();
  const suffix = Date.now();
  const code = `NV-MCF-${suffix}`;

  await service.create({
    code,
    name: "Phạm Văn Test",
    role: "AM",
    territory: "Phường Tân Phú",
    email: `mcf_${suffix}@vnpt.vn`,
    password: "Password@123",
    mustChangePassword: false,
  });

  const userRows = await query<{ must_change_password: boolean | number }>(
    "SELECT must_change_password FROM users WHERE username = ?",
    [code]
  );
  assert.equal(userRows.length, 1);
  assert.equal(Boolean(userRows[0].must_change_password), false);
});

test("create rejects duplicate hrmCode", async () => {
  const service = new StaffService();
  const suffix = Date.now();
  const dupHrm = `HRM-DUP-${suffix}`;

  await service.create({
    code: `NV-DUP1-${suffix}`,
    name: `Nhân viên HRM 1 ${suffix}`,
    role: "AM",
    territory: "Phường Tân Phong",
    email: `hrm1_${suffix}@vnpt.vn`,
    hrmCode: dupHrm,
    password: "Password@123",
  });

  await assert.rejects(
    async () => {
      await service.create({
        code: `NV-DUP2-${suffix}`,
        name: `Nhân viên HRM 2 ${suffix}`,
        role: "AM",
        territory: "Phường Tân Phong",
        email: `hrm2_${suffix}@vnpt.vn`,
        hrmCode: dupHrm,
        password: "Password@123",
      });
    },
    (err: any) => {
      assert.ok(err instanceof HttpError);
      assert.equal(err.status, 409);
      assert.equal(err.message, "Mã HRM đã được dùng cho nhân viên khác");
      return true;
    }
  );
});

test("create rejects invalid staffType", async () => {
  const service = new StaffService();
  const suffix = Date.now();

  await assert.rejects(
    async () => {
      await service.create({
        code: `NV-TYPE-${suffix}`,
        name: `Nhân viên Sai Loại ${suffix}`,
        role: "AM",
        territory: "Phường Tân Phong",
        email: `type_${suffix}@vnpt.vn`,
        staffType: "Toàn thời gian" as any,
        password: "Password@123",
      });
    },
    (err: any) => {
      assert.ok(err instanceof HttpError);
      assert.equal(err.status, 400);
      return true;
    }
  );
});

test("deriveShortName removes diacritics and takes last word", () => {
  assert.equal(deriveShortName("Vũ Tiến Khoa"), "KHOA");
  assert.equal(deriveShortName("Nguyễn Thị Huyền Trang"), "TRANG");
  assert.equal(deriveShortName("  Phạm Thanh Hà "), "HA");
});
