import bcrypt from "bcryptjs";
import { pgQuery, pgRun } from "./pg-adapter.js";

export const query = <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
  return pgQuery<T>(sql, params);
};

export const run = (sql: string, params: any[] = []): Promise<{ id: number; changes: number }> => {
  return pgRun(sql, params);
};

// Các cột thống kê mở rộng của bảng territories (dân số, số trường theo cấp,
// doanh thu) được thêm sau khi bảng đã tồn tại trên môi trường cũ — CREATE
// TABLE IF NOT EXISTS ở trên không tự thêm cột cho DB đã có sẵn, nên phải
// ALTER TABLE riêng (Postgres hỗ trợ ADD COLUMN IF NOT EXISTS).
const TERRITORY_EXTRA_COLUMNS: Array<{ name: string; sqlType: string }> = [
  { name: "population", sqlType: "INTEGER DEFAULT 0" },
  { name: "school_mamnon", sqlType: "INTEGER DEFAULT 0" },
  { name: "school_tieuhoc", sqlType: "INTEGER DEFAULT 0" },
  { name: "school_thcs", sqlType: "INTEGER DEFAULT 0" },
  { name: "school_thpt", sqlType: "INTEGER DEFAULT 0" },
  { name: "revenue", sqlType: "REAL DEFAULT 0" },
];

async function ensureTerritoryColumns() {
  for (const column of TERRITORY_EXTRA_COLUMNS) {
    await run(`ALTER TABLE territories ADD COLUMN IF NOT EXISTS ${column.name} ${column.sqlType}`);
  }
}

export async function initDatabase() {
  await createTables();

  await ensureTerritoryColumns();

  // Seed default data if debts table is empty
  const countRes = await query<{ count: number }>("SELECT COUNT(*) as count FROM debts");
  if (countRes[0]?.count === 0) {
    await seedInitialData();
  }

  // Seed users table independently (table may be newer than the rest of the schema)
  const userCountRes = await query<{ count: number }>("SELECT COUNT(*) as count FROM users");
  if (userCountRes[0]?.count === 0) {
    await seedUsers();
  }

  // Seed services table independently (table may be newer than the rest of the schema)
  const serviceCountRes = await query<{ count: number }>("SELECT COUNT(*) as count FROM services");
  if (serviceCountRes[0]?.count === 0) {
    await seedServices();
  }

  // Seed leads table independently (table may be newer than the rest of the schema)
  const leadCountRes = await query<{ count: number }>("SELECT COUNT(*) as count FROM leads");
  if (leadCountRes[0]?.count === 0) {
    await seedLeads();
  }

  // Seed contracts table independently (table may be newer than the rest of the schema)
  const contractCountRes = await query<{ count: number }>("SELECT COUNT(*) as count FROM contracts");
  if (contractCountRes[0]?.count === 0) {
    await seedContracts();
  }

  // Seed commissions table independently (table may be newer than the rest of the schema)
  const commissionCountRes = await query<{ count: number }>("SELECT COUNT(*) as count FROM commissions");
  if (commissionCountRes[0]?.count === 0) {
    await seedCommissions();
  }

  // Seed tasks table independently (table may be newer than the rest of the schema)
  const taskCountRes = await query<{ count: number }>("SELECT COUNT(*) as count FROM tasks");
  if (taskCountRes[0]?.count === 0) {
    await seedTasks();
  }

  // Seed customers table independently (table may be newer than the rest of the schema)
  const customerCountRes = await query<{ count: number }>("SELECT COUNT(*) as count FROM customers");
  if (customerCountRes[0]?.count === 0) {
    await seedCustomers();
  }
}

// DDL schema (Postgres). Cột "user" (từ khóa dành riêng trong Postgres) phải
// đặt trong dấu ngoặc kép.
async function createTables() {
  // 1. Debts table
  await run(`
    CREATE TABLE IF NOT EXISTS debts (
      id TEXT PRIMARY KEY,
      staff_name TEXT NOT NULL,
      service_group TEXT NOT NULL,
      payment_code TEXT NOT NULL,
      subscriber_code TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      installation_address TEXT,
      immediate_debt REAL DEFAULT 0,
      cumulative_debt REAL DEFAULT 0,
      collected_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'Nợ cước',
      document_ref TEXT,
      month TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Renewals table
  await run(`
    CREATE TABLE IF NOT EXISTS renewals (
      id TEXT PRIMARY KEY,
      transaction_code TEXT NOT NULL UNIQUE,
      subscriber_code TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      payment_code TEXT,
      installation_address TEXT,
      staff_name TEXT NOT NULL,
      term_amount REAL DEFAULT 0,
      duration_months INTEGER DEFAULT 12,
      cohort TEXT NOT NULL,
      status TEXT DEFAULT 'Chưa xử lý',
      failure_reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3. Customers table
  await run(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      identity_code TEXT,
      type TEXT NOT NULL,
      customer_group TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      services TEXT,
      nearest_expiration TEXT,
      am_staff TEXT,
      am_caring_staff TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 4. Territories table (7 Phường)
  await run(`
    CREATE TABLE IF NOT EXISTS territories (
      id TEXT PRIMARY KEY,
      ward_name TEXT NOT NULL UNIQUE,
      quarter_count INTEGER DEFAULT 0,
      household_count INTEGER DEFAULT 0,
      opportunity_count INTEGER DEFAULT 0,
      deployed_count INTEGER DEFAULT 0,
      staff_name TEXT,
      leadership_contact TEXT
    )
  `);

  // 4b. Ward contacts table (đầu mối nhân sự theo Đơn vị/Phòng ban trong từng phường)
  await run(`
    CREATE TABLE IF NOT EXISTS ward_contacts (
      id TEXT PRIMARY KEY,
      territory_id TEXT NOT NULL,
      unit TEXT NOT NULL,
      department TEXT NOT NULL,
      full_name TEXT NOT NULL,
      position TEXT NOT NULL,
      phone TEXT,
      am_in_charge TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 5. Staff table
  await run(`
    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      territory TEXT,
      assigned_customers INTEGER DEFAULT 0,
      monthly_leads INTEGER DEFAULT 0,
      monthly_contracts INTEGER DEFAULT 0,
      revenue_executed REAL DEFAULT 0,
      collection_rate REAL DEFAULT 0,
      renewal_rate REAL DEFAULT 0,
      status TEXT DEFAULT 'Đang hoạt động',
      email TEXT
    )
  `);

  // 6b. Services table (Dịch vụ & Cảnh báo hết hạn)
  await run(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      service_name TEXT NOT NULL,
      service_code TEXT NOT NULL,
      start_date TEXT NOT NULL,
      expiration_date TEXT NOT NULL,
      staff_name TEXT NOT NULL
    )
  `);

  // 6c. Leads table (Quản lý Lead & Cơ hội)
  await run(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      group_name TEXT NOT NULL,
      channel TEXT NOT NULL,
      staff_name TEXT NOT NULL,
      status TEXT DEFAULT 'Mới tiếp nhận',
      expected_value REAL DEFAULT 0,
      demand_description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 6d. Contracts table (Hợp đồng & Mã giao dịch)
  await run(`
    CREATE TABLE IF NOT EXISTS contracts (
      id TEXT PRIMARY KEY,
      transaction_code TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      subscriber_codes TEXT NOT NULL,
      total_value REAL DEFAULT 0,
      channel TEXT NOT NULL,
      deployment_status TEXT DEFAULT 'Chưa triển khai',
      payment_status TEXT DEFAULT 'Chưa thanh toán',
      document_status TEXT DEFAULT 'Soạn thảo',
      has_revenue INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 6e. Commissions table (Hoa hồng nội bộ & chi kênh)
  await run(`
    CREATE TABLE IF NOT EXISTS commissions (
      id TEXT PRIMARY KEY,
      recipient_name TEXT NOT NULL,
      type TEXT NOT NULL,
      transaction_code TEXT NOT NULL,
      amount REAL DEFAULT 0,
      status TEXT DEFAULT 'Chờ nhận',
      date TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 6f. Tasks table (Công việc & Nhắc việc chăm sóc)
  await run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      related_target TEXT NOT NULL,
      assignee TEXT NOT NULL,
      due_date TEXT NOT NULL,
      priority TEXT DEFAULT 'Vừa',
      status TEXT DEFAULT 'Mới',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 6. Audit Logs ("user" là từ khóa dành riêng trong Postgres, phải quote)
  await run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "user" TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT
    )
  `);

  // 7. Users (Auth)
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      password_hash TEXT,
      name TEXT,
      role TEXT,
      email TEXT,
      status TEXT DEFAULT 'Đang hoạt động'
    )
  `);
}

async function seedCustomers() {
  console.log("[Database] Seeding dữ liệu Khách hàng...");

  const customers: [string, string, string, string, string, string, string, string, string, string, string][] = [
    ["CUS-01", "Công ty TNHH Thương mại Minh Phát", "0312345678", "Doanh nghiệp", "Tự phát triển", "0909123456", "123 Trần Xuân Soạn, P. Tân Hưng", "Internet Fiber", "2026-11-10", "Nguyễn Thị Tình", "Nguyễn Thị Tình"],
    ["CUS-02", "Hộ kinh doanh An Bình", "0323456789", "Hộ kinh doanh", "Tập hiện hữu", "0918234567", "45 Huỳnh Tấn Phát, P. Tân Thuận", "Chữ ký số SmartCA", "2026-11-20", "Nguyễn Đức Tiến", "Nguyễn Đức Tiến"],
    ["CUS-03", "Công ty Cổ phần Xây dựng Đại Thành", "0334567890", "Doanh nghiệp", "Tập hiện hữu", "0987345678", "78 Nguyễn Thị Thập, P. Tân Mỹ", "Hóa đơn điện tử VNPT Invoice", "2026-10-30", "Nguyễn Thị Huyền Trang", "Nguyễn Thị Huyền Trang"],
    ["CUS-04", "Nguyễn Văn An", "079201012345", "Cá nhân", "Tự phát triển", "0932456789", "12 Đào Trí, P. Phú Thuận", "Internet Fiber, MyTV", "2026-09-05", "Phạm Thanh Hà", "Phạm Thanh Hà"],
    ["CUS-05", "Hộ kinh doanh Phát Đạt", "0345678901", "Hộ kinh doanh", "Tập hiện hữu", "0977567890", "Khu phố 3, P. Xóm Chiếu", "Camera an ninh VNPT iAlert", "2026-12-01", "Nguyễn Lê Vi", "Nguyễn Lê Vi"],
  ];
  for (const c of customers) {
    await run(
      `INSERT OR REPLACE INTO customers (
        id, name, identity_code, type, customer_group, phone, address, services, nearest_expiration, am_staff, am_caring_staff
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      c
    );
  }

  console.log("[Database] Đã seed dữ liệu Khách hàng!");
}

async function seedTasks() {
  console.log("[Database] Seeding dữ liệu Công việc...");

  const tasks: [string, string, string, string, string, string, string, string][] = [
    ["TASK-01", "Đôn đốc gạch nợ cước tháng 10", "Hộ kinh doanh An Bình", "Nguyễn Đức Tiến", "2026-11-08", "Cao", "Mới", "Khách hẹn thanh toán trước ngày 10"],
    ["TASK-02", "Nhắc gia hạn trả trước gói Internet", "Công ty Cổ phần Xây dựng Đại Thành", "Phạm Thanh Hà", "2026-11-06", "Cao", "Đang làm", "Khách đang tạm ngưng dịch vụ"],
    ["TASK-03", "Chăm sóc khách hàng mới sau lắp đặt", "Nguyễn Văn An", "Nguyễn Lê Vi", "2026-11-12", "Vừa", "Mới", ""],
    ["TASK-04", "Theo dõi phản hồi tư vấn gói cước", "Hộ kinh doanh Phát Đạt", "Nguyễn Thị Tình", "2026-11-02", "Thấp", "Hoàn tất", "Khách đã xác nhận gia hạn"],
  ];
  for (const t of tasks) {
    await run(
      `INSERT OR REPLACE INTO tasks (
        id, title, related_target, assignee, due_date, priority, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      t
    );
  }

  console.log("[Database] Đã seed dữ liệu Công việc!");
}

async function seedCommissions() {
  console.log("[Database] Seeding dữ liệu Hoa hồng...");

  const commissions: [string, string, string, string, number, string, string][] = [
    ["COM-01", "Nguyễn Thị Tình", "Hoa hồng nội bộ", "GD-26001", 1440000, "Đã nhận", "2026-10-05"],
    ["COM-02", "Đại lý Phú Mỹ", "Hoa hồng chi kênh", "GD-26002", 720000, "Chờ chi", "2026-10-08"],
    ["COM-03", "Nguyễn Đức Tiến", "Hoa hồng nội bộ", "GD-26003", 1110000, "Chờ nhận", "2026-10-12"],
    ["COM-04", "Đối tác Thành Lợi", "Hoa hồng chi kênh", "GD-26004", 1920000, "Đã chi", "2026-10-15"],
  ];
  for (const c of commissions) {
    await run(
      `INSERT OR REPLACE INTO commissions (
        id, recipient_name, type, transaction_code, amount, status, date
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      c
    );
  }

  console.log("[Database] Đã seed dữ liệu Hoa hồng!");
}

async function seedContracts() {
  console.log("[Database] Seeding dữ liệu Hợp đồng & Mã giao dịch...");

  const contracts: [string, string, string, string, number, string, string, string, string, number][] = [
    ["CTR-01", "GD-26001", "Công ty TNHH Thương mại Minh Phát", JSON.stringify(["TB-100238"]), 28800000, "Online", "Hoàn tất", "Đã thanh toán", "Hoàn thiện bàn giao", 1],
    ["CTR-02", "GD-26002", "Hộ kinh doanh An Bình", JSON.stringify(["TB-100451", "TB-100452"]), 14400000, "Khách hàng hiện hữu", "Đang triển khai", "Chưa thanh toán", "Khách trình ký", 0],
    ["CTR-03", "GD-26003", "Công ty Cổ phần Xây dựng Đại Thành", JSON.stringify(["TB-100782"]), 22200000, "Đối tác", "Chưa triển khai", "Chưa thanh toán", "Soạn thảo", 0],
    ["CTR-04", "GD-26004", "Nguyễn Văn An", JSON.stringify(["TB-101003"]), 38400000, "Chiến dịch", "Hoàn tất", "Đã thanh toán", "Hoàn thiện bàn giao", 1],
  ];
  for (const c of contracts) {
    await run(
      `INSERT OR REPLACE INTO contracts (
        id, transaction_code, customer_name, subscriber_codes, total_value,
        channel, deployment_status, payment_status, document_status, has_revenue
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      c
    );
  }

  console.log("[Database] Đã seed dữ liệu Hợp đồng!");
}

async function seedLeads() {
  console.log("[Database] Seeding dữ liệu Lead & Cơ hội...");

  const leads = [
    ["LEAD-01", "Công ty TNHH Thương mại Minh Phát", "0909123456", "Khách hàng mới", "Online", "Nguyễn Thị Tình", "Mới tiếp nhận", 15000000, "Cần lắp Internet Fiber cho văn phòng mới"],
    ["LEAD-02", "Hộ kinh doanh An Bình", "0918234567", "Khách hiện hữu mua thêm", "Khách hàng hiện hữu", "Nguyễn Đức Tiến", "Đã liên hệ", 5000000, "Muốn nâng cấp gói Internet hiện tại"],
    ["LEAD-03", "Công ty Cổ phần Xây dựng Đại Thành", "0987345678", "Gia hạn dịch vụ", "Đối tác", "Nguyễn Thị Huyền Trang", "Đang tư vấn", 8500000, "Gia hạn hóa đơn điện tử VNPT Invoice"],
    ["LEAD-04", "Nguyễn Văn An", "0932456789", "Khách hàng mới", "Chiến dịch", "Phạm Thanh Hà", "Chốt thành công", 3200000, "Đăng ký Internet Fiber & MyTV"],
    ["LEAD-05", "Hộ kinh doanh Phát Đạt", "0977567890", "Khách hiện hữu mua thêm", "Online", "Nguyễn Lê Vi", "Thất bại", 12000000, "Quan tâm lắp camera an ninh iAlert"],
  ];
  for (const l of leads) {
    await run(
      "INSERT OR REPLACE INTO leads (id, customer_name, phone, group_name, channel, staff_name, status, expected_value, demand_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      l
    );
  }

  console.log("[Database] Đã seed dữ liệu Lead & Cơ hội!");
}

async function seedServices() {
  console.log("[Database] Seeding dữ liệu dịch vụ & cảnh báo hết hạn...");

  const services = [
    ["SRV-01", "Công ty TNHH Thương mại Minh Phát", "Internet Fiber", "FTTH-100238", "2025-11-01", "2026-11-10", "Nguyễn Thị Tình"],
    ["SRV-02", "Hộ kinh doanh An Bình", "Chữ ký số SmartCA", "CA-100451", "2025-11-05", "2026-11-20", "Nguyễn Đức Tiến"],
    ["SRV-03", "Công ty Cổ phần Xây dựng Đại Thành", "Hóa đơn điện tử VNPT Invoice", "INV-100782", "2025-10-15", "2026-10-30", "Nguyễn Thị Huyền Trang"],
    ["SRV-04", "Nguyễn Văn An", "Internet Fiber & MyTV", "FTTH-101003", "2025-09-01", "2026-09-05", "Phạm Thanh Hà"],
    ["SRV-05", "Hộ kinh doanh Phát Đạt", "Camera an ninh VNPT iAlert", "CAM-101220", "2025-11-02", "2026-12-01", "Nguyễn Lê Vi"],
  ];
  for (const s of services) {
    await run(
      "INSERT OR REPLACE INTO services (id, customer_name, service_name, service_code, start_date, expiration_date, staff_name) VALUES (?, ?, ?, ?, ?, ?, ?)",
      s
    );
  }

  console.log("[Database] Đã seed dữ liệu dịch vụ!");
}

async function seedUsers() {
  console.log("[Database] Seeding tài khoản đăng nhập...");

  const staffRows = await query<{ id: string; code: string; name: string; role: string; email: string }>(
    "SELECT id, code, name, role, email FROM staff"
  );

  for (const staff of staffRows) {
    const passwordHash = await bcrypt.hash(`${staff.code}@Vnpt2026`, 10);
    await run(
      "INSERT OR REPLACE INTO users (id, username, password_hash, name, role, email) VALUES (?, ?, ?, ?, ?, ?)",
      [`USR-${staff.code}`, staff.code, passwordHash, staff.name, staff.role, staff.email]
    );
  }

  // Tài khoản quản trị riêng, không gắn với nhân viên nào
  const adminPasswordHash = await bcrypt.hash("admin@Vnpt2026", 10);
  await run(
    "INSERT OR REPLACE INTO users (id, username, password_hash, name, role, email) VALUES (?, ?, ?, ?, ?, ?)",
    ["USR-ADMIN", "admin", adminPasswordHash, "Quản trị viên", "Admin", null]
  );

  console.log("[Database] Đã seed tài khoản đăng nhập!");
}

async function seedInitialData() {
  console.log("[Database] Seeding initial data for VNPT Nam Sài Gòn...");

  // Seed 7 Wards
  const wards = [
    ["TB-01", "Tân Hưng", 18, 12450, 36, 21, "Nguyễn Thị Tình", "Đ/c Trần Minh - Chủ tịch UBND Phường"],
    ["TB-02", "Tân Mỹ", 15, 10820, 29, 17, "Nguyễn Thị Huyền Trang", "Đ/c Lê Văn - Phó Chủ tịch UBND Phường"],
    ["TB-03", "Tân Thuận", 21, 15700, 42, 31, "Nguyễn Đức Tiến", "Đ/c Hoàng Phúc - Chủ tịch UBND Phường"],
    ["TB-04", "Phú Thuận", 16, 11960, 31, 20, "Phạm Thanh Hà", "Đ/c Nguyễn Nam - Cán bộ Văn phòng"],
    ["TB-05", "Xóm Chiếu", 14, 9860, 24, 14, "Nguyễn Lê Vi", "Đ/c Đặng Thảo - Bí thư Đảng ủy"],
    ["TB-06", "Vĩnh Hội", 15, 11120, 27, 18, "Nguyễn Ngọc Hải Bằng", "Đ/c Bùi Hữu - Cán bộ CNTT"],
    ["TB-07", "Khánh Hội", 13, 10340, 22, 13, "Hồ Thị Ngọc Trâm", "Đ/c Vũ Hải - Phó Chủ tịch UBND Phường"],
  ];
  for (const w of wards) {
    await run(
      "INSERT OR REPLACE INTO territories (id, ward_name, quarter_count, household_count, opportunity_count, deployed_count, staff_name, leadership_contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      w
    );
  }

  // Seed Staff
  const staffMembers = [
    ["NV-01", "VNPT-AM-01", "Nguyễn Thị Tình", "AM Bán chăm", "Tân Hưng", 184, 48, 19, 186500000, 98, 72, "Đang hoạt động", "tinhnt@vnpt.vn"],
    ["NV-02", "VNPT-AM-02", "Nguyễn Thị Huyền Trang", "AM", "Tân Mỹ", 156, 42, 17, 164200000, 94, 69, "Đang hoạt động", "trangnth@vnpt.vn"],
    ["NV-03", "VNPT-AM-03", "Nguyễn Đức Tiến", "AM Bán chăm", "Tân Thuận", 201, 56, 23, 208600000, 96, 74, "Đang hoạt động", "tiennd@vnpt.vn"],
    ["NV-04", "VNPT-AM-04", "Phạm Thanh Hà", "AM", "Phú Thuận", 142, 39, 16, 148300000, 97, 61, "Đang hoạt động", "hapt@vnpt.vn"],
    ["NV-05", "VNPT-AM-05", "Nguyễn Lê Vi", "AM Bán chăm", "Xóm Chiếu", 121, 35, 14, 132800000, 92, 65, "Đang hoạt động", "vinl@vnpt.vn"],
    ["NV-06", "VNPT-AM-06", "Nguyễn Ngọc Hải Bằng", "AM", "Vĩnh Hội", 138, 31, 13, 124500000, 93, 68, "Đang hoạt động", "bangnnh@vnpt.vn"],
    ["NV-07", "VNPT-AM-07", "Hồ Thị Ngọc Trâm", "AM Bán chăm", "Khánh Hội", 115, 29, 11, 108200000, 91, 60, "Đang hoạt động", "tramhtn@vnpt.vn"],
  ];
  for (const s of staffMembers) {
    await run(
      "INSERT OR REPLACE INTO staff (id, code, name, role, territory, assigned_customers, monthly_leads, monthly_contracts, revenue_executed, collection_rate, renewal_rate, status, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      s
    );
  }

  // Seed Debts (8 columns matching Sheet 1)
  const debts = [
    ["DEBT-01", "Nguyễn Thị Tình", "Internet Fiber", "TT-77001", "TB-100238", "Công ty TNHH Thương mại Minh Phát", "123 Trần Xuân Soạn, P. Tân Hưng", 3200000, 0, 3200000, "Đã gạch nợ", "UNC-99231", "2026-10"],
    ["DEBT-02", "Nguyễn Đức Tiến", "Chữ ký số SmartCA", "TT-77002", "TB-100451", "Hộ kinh doanh An Bình", "45 Huỳnh Tấn Phát, P. Tân Thuận", 2000000, 4500000, 2000000, "Nợ cước", null, "2026-10"],
    ["DEBT-03", "Nguyễn Thị Huyền Trang", "Hóa đơn điện tử VNPT Invoice", "TT-77003", "TB-100782", "Công ty Cổ phần Xây dựng Đại Thành", "78 Nguyễn Thị Thập, P. Tân Mỹ", 1850000, 0, 1850000, "Đã gạch nợ", "UNC-99245", "2026-10"],
    ["DEBT-04", "Phạm Thanh Hà", "Internet Fiber & MyTV", "TT-77004", "TB-101003", "Nguyễn Văn An", "12 Đào Trí, P. Phú Thuận", 1200000, 3000000, 0, "Nợ cước", null, "2026-10"],
  ];
  for (const d of debts) {
    await run(
      "INSERT OR REPLACE INTO debts (id, staff_name, service_group, payment_code, subscriber_code, customer_name, installation_address, immediate_debt, cumulative_debt, collected_amount, status, document_ref, month) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      d
    );
  }

  // Seed Renewals (8 columns matching Sheet 2)
  const renewals = [
    ["RN-01", "GH-26001", "TB-100238", "Công ty TNHH Thương mại Minh Phát", "TT-77001", "123 Trần Xuân Soạn, P. Tân Hưng", "Nguyễn Thị Tình", 2400000, 12, "THÁNG T", "Hoàn thành", null],
    ["RN-02", "GH-26002", "TB-100451", "Hộ kinh doanh An Bình", "TT-77002", "45 Huỳnh Tấn Phát, P. Tân Thuận", "Nguyễn Đức Tiến", 1200000, 6, "THÁNG T", "Khách hẹn thanh toán", null],
    ["RN-03", "GH-26003", "TB-100782", "Công ty Cổ phần Xây dựng Đại Thành", "TT-77003", "78 Nguyễn Thị Thập, P. Tân Mỹ", "Phạm Thanh Hà", 2400000, 12, "THÁNG T", "Thất bại", "Tạm ngưng"],
    ["RN-04", "GH-26004", "TB-101003", "Nguyễn Văn An", "TT-77004", "12 Đào Trí, P. Phú Thuận", "Nguyễn Lê Vi", 1800000, 6, "THÁNG T-1", "Hoàn thành", null],
  ];
  for (const r of renewals) {
    await run(
      "INSERT OR REPLACE INTO renewals (id, transaction_code, subscriber_code, customer_name, payment_code, installation_address, staff_name, term_amount, duration_months, cohort, status, failure_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      r
    );
  }

  // Seed initial audit log
  // Cột "user" đặt trong dấu ngoặc kép vì là từ khóa dành riêng trong Postgres.
  await run(
    'INSERT INTO audit_logs (id, "user", action, details) VALUES (?, ?, ?, ?)',
    ["LOG-INIT", "System", "Khởi tạo CSDL", "Hệ thống VNPT CRM Nam Sài Gòn V2 được khởi tạo thành công"]
  );

  console.log("[Database] Initial data seeded successfully!");
}

