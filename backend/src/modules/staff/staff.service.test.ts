import { test } from "node:test";
import assert from "node:assert/strict";

const { initDatabase, query, run } = await import("../../database/db.js");
const { applySchemaExtensions } = await import("../../database/schema-extensions.js");
const { StaffService, deriveShortName } = await import("./staff.service.js");
const { HttpError } = await import("../auth/auth.service.js");
const bcrypt = (await import("bcryptjs")).default;

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

test("update rename cascades to all referencing tables", async () => {
  const service = new StaffService();
  const suffix = Date.now();
  const oldName = `NV Cu ${suffix}`;
  const newName = `NV Moi ${suffix}`;
  const code = `NV-REN-${suffix}`;

  const staff = await service.create({
    code,
    name: oldName,
    role: "AM",
    territory: "Phường Tân Phong",
    email: `ren_${suffix}@vnpt.vn`,
    password: "Password@123",
  });

  // Chèn 1 dòng vào mỗi bảng trong STAFF_NAME_REFERENCES
  await run(`INSERT INTO leads (id, customer_name, phone, group_name, channel, staff_name) VALUES (?, ?, ?, ?, ?, ?)`, [
    `LEAD-REN-${suffix}`, "KH Lead", "0901111111", "Lead KH mới", "Online", oldName,
  ]);
  await run(`INSERT INTO debts (id, staff_name, service_group, payment_code, subscriber_code, customer_name, month) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
    `DEBT-REN-${suffix}`, oldName, "Fiber", "PAY-1", "SUB-1", "KH Debt", "11/2026",
  ]);
  await run(`INSERT INTO renewals (id, transaction_code, subscriber_code, customer_name, staff_name, cohort) VALUES (?, ?, ?, ?, ?, ?)`, [
    `REN-REN-${suffix}`, `TX-${suffix}`, "SUB-2", "KH Renewal", oldName, "T11",
  ]);
  await run(`INSERT INTO customers (id, name, type, customer_group, am_staff, am_caring_staff) VALUES (?, ?, ?, ?, ?, ?)`, [
    `CUST-REN-${suffix}`, "KH Cust", "Doanh nghiệp", "Tập hiện hữu", oldName, oldName,
  ]);
  await run(`INSERT INTO services (id, customer_name, service_name, service_code, start_date, expiration_date, staff_name) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
    `SRV-REN-${suffix}`, "KH Cust", "Fiber", `SRV-${suffix}`, "2026-01-01", "2027-01-01", oldName,
  ]);
  await run(`INSERT INTO tasks (id, title, related_target, assignee, due_date) VALUES (?, ?, ?, ?, ?)`, [
    `TASK-REN-${suffix}`, "Task 1", "KH Cust", oldName, "2026-12-01",
  ]);
  await run(`INSERT INTO territories (id, ward_name, staff_name) VALUES (?, ?, ?)`, [
    `TERR-REN-${suffix}`, `Phường Ren ${suffix}`, oldName,
  ]);
  await run(`INSERT INTO ward_contacts (id, territory_id, unit, department, full_name, position, am_in_charge) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
    `WC-REN-${suffix}`, `TERR-REN-${suffix}`, "Lãnh đạo Phường", "UBND", "Nguyễn Văn A", "Chủ tịch", oldName,
  ]);

  // Gọi update đổi tên
  const updated = await service.update(staff.id, { name: newName });
  assert.equal(updated.name, newName);

  // Kiểm tra tất cả bảng đã được đổi sang newName
  const [lead] = await query<{ staff_name: string }>(`SELECT staff_name FROM leads WHERE id = ?`, [`LEAD-REN-${suffix}`]);
  assert.equal(lead.staff_name, newName);

  const [debt] = await query<{ staff_name: string }>(`SELECT staff_name FROM debts WHERE id = ?`, [`DEBT-REN-${suffix}`]);
  assert.equal(debt.staff_name, newName);

  const [renewal] = await query<{ staff_name: string }>(`SELECT staff_name FROM renewals WHERE id = ?`, [`REN-REN-${suffix}`]);
  assert.equal(renewal.staff_name, newName);

  const [cust] = await query<{ am_staff: string; am_caring_staff: string }>(`SELECT am_staff, am_caring_staff FROM customers WHERE id = ?`, [`CUST-REN-${suffix}`]);
  assert.equal(cust.am_staff, newName);
  assert.equal(cust.am_caring_staff, newName);

  const [srv] = await query<{ staff_name: string }>(`SELECT staff_name FROM services WHERE id = ?`, [`SRV-REN-${suffix}`]);
  assert.equal(srv.staff_name, newName);

  const [task] = await query<{ assignee: string }>(`SELECT assignee FROM tasks WHERE id = ?`, [`TASK-REN-${suffix}`]);
  assert.equal(task.assignee, newName);

  const [terr] = await query<{ staff_name: string }>(`SELECT staff_name FROM territories WHERE id = ?`, [`TERR-REN-${suffix}`]);
  assert.equal(terr.staff_name, newName);

  const [wc] = await query<{ am_in_charge: string }>(`SELECT am_in_charge FROM ward_contacts WHERE id = ?`, [`WC-REN-${suffix}`]);
  assert.equal(wc.am_in_charge, newName);

  // users.name phải đổi
  const [user] = await query<{ name: string }>(`SELECT name FROM users WHERE username = ?`, [code]);
  assert.equal(user.name, newName);

  // audit_logs có bản ghi Đổi tên nhân viên
  const logs = await query<{ action: string; details: string }>(
    `SELECT action, details FROM audit_logs WHERE action = 'Đổi tên nhân viên' AND details LIKE ?`,
    [`%${code}%`]
  );
  assert.ok(logs.length > 0);
});

test("update rename to existing staff name returns 409", async () => {
  const service = new StaffService();
  const suffix = Date.now();
  const nameA = `NV Trùng A ${suffix}`;
  const nameB = `NV Trùng B ${suffix}`;

  await service.create({
    code: `NV-DUP-A-${suffix}`,
    name: nameA,
    role: "AM",
    territory: "Phường Tân Phong",
    email: `dupa_${suffix}@vnpt.vn`,
    password: "Password@123",
  });

  const staffB = await service.create({
    code: `NV-DUP-B-${suffix}`,
    name: nameB,
    role: "AM",
    territory: "Phường Tân Phong",
    email: `dupb_${suffix}@vnpt.vn`,
    password: "Password@123",
  });

  await assert.rejects(
    async () => {
      await service.update(staffB.id, { name: nameA });
    },
    (err: any) => {
      assert.ok(err instanceof HttpError);
      assert.equal(err.status, 409);
      assert.equal(err.message, "Tên nhân viên đã tồn tại");
      return true;
    }
  );
});

test("resetPassword lets user login with new password and sets must_change_password", async () => {
  const service = new StaffService();
  const suffix = Date.now();
  const code = `NV-RST-${suffix}`;

  const staff = await service.create({
    code,
    name: `NV Reset Pass ${suffix}`,
    role: "AM",
    territory: "Phường Tân Phong",
    email: `rst_${suffix}@vnpt.vn`,
    password: "Password@Init1",
    mustChangePassword: false,
  });

  await service.resetPassword(staff.id, "NewPassword@Rst2", true);

  const [user] = await query<{ password_hash: string; must_change_password: boolean | number }>(
    `SELECT password_hash, must_change_password FROM users WHERE username = ?`,
    [code]
  );
  assert.ok(await bcrypt.compare("NewPassword@Rst2", user.password_hash));
  assert.equal(Boolean(user.must_change_password), true);
});

