# CTV + Khách hàng PTM/KHDN-chăm + Chi tiết Phường Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đưa vai trò CTV (cộng tác viên) vào chung hệ thống CRM với dữ liệu Lead/Hợp đồng/Hoa hồng dùng chung, phân loại khách hàng PTM vs KHDN-chăm, và làm trang chi tiết từng Phường/Khu phố — theo yêu cầu của anh Khoa.

**Architecture:** Giữ nguyên Express Router + Service class + `query()/run()` trong `backend/src/database/db.ts`; mọi thay đổi schema là **additive và idempotent** (production Postgres đã có dữ liệu) qua `ensureColumn` + `CREATE TABLE IF NOT EXISTS`. CTV là 1 role mới trong bảng `users` (cùng trang `/login`), dữ liệu CTV chỉ là **lát cắt lọc theo `referred_by_ctv_id`** trên chính các bảng `leads/contracts/commissions`. Route nhân viên được khoá tập trung ở `server.ts` (`requireAuth + requireStaff`), route CTV nằm ở `/api/ctv/*`.

**Tech Stack:** Express 4 + TypeScript, SQLite (dev/test) + Postgres 17 (prod; có sẵn bản local để test thật), Next.js 16 App Router, Playwright (`@playwright/test`) cho cả API test (`request` fixture) lẫn UI test. Không thêm dependency npm mới.

**Spec:** Không có file spec riêng — yêu cầu gốc là hội thoại với anh Khoa (07/11/2026), phần "Quyết định đã chốt" bên dưới là spec rút gọn đã được Huy duyệt. Bối cảnh code: `docs/TECHNICAL_HANDOFF_REPORT.md`, 2 plan trước trong cùng thư mục.

## Quyết định đã chốt (đóng vai trò spec)

- 4 role đăng nhập chung `/login`: `Admin`, `AM`, `AM Bán chăm` (nhân viên — **Admin tự tạo**, không tự đăng ký), `CTV` (**tự đăng ký**, trạng thái `Chờ duyệt` → Admin duyệt mới đăng nhập được).
- CTV có **dashboard riêng** (`/cong-tac-vien/dashboard`) nhưng **dùng chung dữ liệu** `leads/contracts/commissions` với CRM (không tách 2 hệ thống). CTV chỉ thấy: link giới thiệu, đơn (lead) mình giới thiệu, thành công hay không, hợp đồng, tiền hoa hồng.
- Lead có 2 chiều phân loại **đã có sẵn trong schema**: `channel` = nguồn (Online / **CTV giới thiệu** / Khách hàng hiện hữu / Đối tác / Chiến dịch) và `group_name` = loại nghiệp vụ (Khách hàng mới = "Lead KH mới", Gia hạn dịch vụ = "Lead gia hạn", Khách hiện hữu mua thêm = "Lead bán chéo"). Không thêm cột loại mới; chỉ đổi nhãn hiển thị.
- Khách hàng 2 loại đã có sẵn trong `customers.customer_group`: `Tự phát triển` = **KH PTM**, `Tập hiện hữu` = **KHDN chăm** (giữ nguyên giá trị lưu trong DB, chỉ đổi nhãn hiển thị). Thêm `handover_batch`/`handover_date` để biết khách thuộc đợt giao nào.
- Trang chi tiết Phường: **cố định** 1 cấu trúc cho mọi phường — "Lãnh đạo Phường" (Bí thư, Chủ tịch, Phó chủ tịch) + 3 phòng "Phòng Kinh tế hạ tầng", "Phòng Nội vụ", "Phòng Văn hóa" (Trưởng phòng, Phó phòng); Khu phố mỗi cái có Trưởng KP, Bí thư, MTTQ, số hộ dân, số dân; kèm Lead dự án và Hợp đồng của phường (qua cột `territory_id`).
- **Giả định (không chặn việc làm, cần xác nhận lại với anh Khoa):** hoa hồng CTV = 10% giá trị hợp đồng (hằng số `CTV_COMMISSION_RATE`), sinh khi hợp đồng chuyển `Hoàn tất` triển khai, trạng thái đầu `Chờ chi`; điều chuyển KH PTM chỉ đổi người **chăm** (giữ người phát triển `am_staff`), điều chuyển KH KHDN-chăm đổi cả hai; CTV thấy SĐT khách dạng che `0909****56`; mật khẩu mặc định nhân viên mới = `<mã NV>@Vnpt2026` (giống seed).

## Global Constraints

- Response backend luôn `{ success: true, data }` / `{ success: false, message }`, message tiếng Việt; lỗi validate = 400, không tìm thấy = 404, sai quyền = 403, chưa đăng nhập = 401, trùng = 409.
- **Tương thích Postgres bắt buộc** (production chạy Postgres, đã từng vỡ 3 lần vì lỗi này): (1) không dùng `INSERT OR REPLACE/IGNORE`; (2) `COUNT(*)`/`SUM()` trả **chuỗi** trên Postgres → luôn bọc `Number(...)` trước khi so sánh/cộng; (3) alias camelCase phải đặt trong dấu ngoặc kép (`AS "totalWards"`) hoặc dùng alias snake_case rồi map ở service; (4) `user` là từ khoá → quote `"user"`; (5) `ALTER TABLE ... ADD COLUMN` chỉ qua `ensureColumn`; (6) không `DEFAULT CURRENT_TIMESTAMP` trong `ADD COLUMN` (SQLite từ chối) — cột thời gian mới là `TEXT` nullable, tự ghi `new Date().toISOString()`.
- Schema chỉ **thêm**, không đổi/xoá cột hay giá trị đang có; mọi migration chạy lại nhiều lần không lỗi, không nhân đôi dữ liệu.
- Tên role đúng nguyên văn: `Admin`, `AM`, `AM Bán chăm`, `CTV`. Trạng thái user: `Đang hoạt động`, `Chờ duyệt`, `Từ chối`.
- Dữ liệu CTV **luôn lấy id từ JWT**, không bao giờ tin `ctvId` do client gửi.
- Mật khẩu: bcrypt (`bcryptjs`, cost 10 như `seedUsers`), không bao giờ trả `password_hash`; mật khẩu tự đăng ký tối thiểu 8 ký tự.
- UI: dùng token màu/chữ đã có (`bg-vnpt`, `hover:bg-vnpt-dark`, `btn-label`, `text-caption`…), nhãn tiếng Việt; không hardcode hex/`blue-*`.
- Không ghi tên AI/Claude/Anthropic vào code, comment, commit, PR (kể cả dòng `Co-Authored-By`). Commit message tiếng Anh ngắn gọn; chỉ `git add` đúng các file của task mình.
- Test phải **chạy thật** và báo đúng output; không suy diễn pass. API test dùng Playwright `request` fixture, UI test dùng page fixture; test tự tạo dữ liệu với tiền tố/hậu tố duy nhất (`Date.now()`) vì production-like DB dùng chung.
- Không thêm dependency npm mới.

## Review Focus

1. **Token CTV gọi API nhân viên** (`/api/customers`, `/api/leads`, `/api/staff`…) → 403; **không token** gọi các GET hiện đang công khai (`/api/customers`, `/api/leads`, `/api/contracts`, `/api/commissions`, `/api/territories`, `/api/debts`, `/api/renewals`, `/api/services`, `/api/tasks`) → 401 (hiện tại ai cũng đọc được SĐT khách — lỗ hổng có thật trên production). Test ở Task 2 và Task 8.
2. **CTV A đọc dữ liệu CTV B**: `/api/ctv/*` chỉ trả dữ liệu của chính token; gửi kèm `?ctvId=<id CTV khác>` vẫn bị bỏ qua (Task 8).
3. **CTV `Chờ duyệt`/`Từ chối` đăng nhập** → 403 với thông báo rõ ràng, nhưng nhập sai mật khẩu vẫn trả thông báo chung (không lộ trạng thái cho người không biết mật khẩu); đăng ký trùng username → 409, không 500 (Task 4).
4. **Form công khai bị spam/ref giả**: honeypot, sai SĐT, `refCode` không tồn tại/của CTV chưa duyệt → vẫn tạo lead `Online` chứ không gắn CTV; quá 5 lần/10 phút/IP → 429 (Task 7).
5. **Khởi động lại server nhiều lần / DB production đã có dữ liệu**: `applySchemaExtensions` + backfill chạy lại không lỗi, không ghi đè `territory_id` đã gán tay (Task 1, kiểm lại trên Postgres ở Task 9).

## Cấu trúc file & sở hữu (để chạy song song không đụng nhau)

- **Task 1** sở hữu: `backend/src/database/db.ts`, `schema-extensions.ts`, `backend/src/constants/org.ts`, `frontend/lib/crm/types/crm.types.ts`, `frontend/lib/crm/constants/org.constants.ts`.
- **Task 2** sở hữu: `backend/src/server.ts`, `backend/src/middleware/require-role.ts`, 3 file stub router, `frontend/e2e/api/helpers.ts`, và sửa lỗi `frontend/components/layout/Shell.tsx` (Task 7 chỉ được **thêm** `RefCapture` vào file này sau khi Task 2 đã merge).
- Từ Task 3 trở đi **không ai sửa** `db.ts`, `server.ts`, `crm.types.ts`, `org.*` (cần trường thiếu → báo lại controller, không tự sửa). Mỗi task chỉ sửa module/trang của mình (liệt kê trong từng task).
- Mỗi task song song chạy trong **worktree riêng** (`.worktrees/<tên-task>`, tạo từ commit cuối của wave trước), cổng và DB riêng để không đè nhau:

| Task | Backend | Frontend | `SQLITE_PATH` |
|---|---|---|---|
| 3 | 8103 | 3103 | `data/t3.sqlite` |
| 4 | 8104 | 3104 | `data/t4.sqlite` |
| 5 | 8105 | 3105 | `data/t5.sqlite` |
| 6 | 8106 | 3106 | `data/t6.sqlite` |
| 7 | 8107 | 3107 | `data/t7.sqlite` |
| 8 | 8108 | 3108 | `data/t8.sqlite` |
| 9 | 8199 | 3199 | (Postgres test) |

  Chạy: `cd backend && SQLITE_PATH=data/tN.sqlite PORT=810N CORS_ORIGIN=http://localhost:310N npm run dev`; `cd frontend && NEXT_PUBLIC_API_URL=http://localhost:810N/api npm run dev -- -p 310N`; test: `E2E_BASE_URL=http://localhost:310N E2E_API_URL=http://localhost:810N/api npx playwright test <file>`.
- **Thứ tự wave:** W1 = Task 1 ∥ Task 2 → W2 = Task 3 ∥ Task 4 ∥ Task 6 → W3 = Task 5 ∥ Task 7 (cần Task 4 để tạo CTV thật) → W4 = Task 8 (cần Task 5 + 7 để có dữ liệu giới thiệu) → W5 = Task 9 → Task 10 (thủ công).

---

### Task 1: Nền schema + hằng số dùng chung

**Files:**
- Create: `backend/src/database/schema-extensions.ts`, `backend/src/database/schema-extensions.test.ts`, `backend/src/constants/org.ts`, `frontend/lib/crm/constants/org.constants.ts`
- Modify: `backend/src/database/db.ts` (đường dẫn SQLite theo env + gọi hook trong `initDatabase`), `frontend/lib/crm/types/crm.types.ts`

**Interfaces:**
- Produces (`backend/src/constants/org.ts`):
  ```ts
  export const ROLES = { ADMIN: "Admin", AM: "AM", AM_BAN_CHAM: "AM Bán chăm", CTV: "CTV" } as const;
  export const USER_STATUS = { ACTIVE: "Đang hoạt động", PENDING: "Chờ duyệt", REJECTED: "Từ chối" } as const;
  export const LEAD_CHANNELS = ["Online", "CTV giới thiệu", "Khách hàng hiện hữu", "Đối tác", "Chiến dịch"] as const;
  export const LEAD_GROUPS = ["Khách hàng mới", "Khách hiện hữu mua thêm", "Gia hạn dịch vụ"] as const;
  export const CUSTOMER_GROUPS = ["Tự phát triển", "Tập hiện hữu"] as const;
  export const WARD_UNITS: readonly { unit: string; positions: readonly string[] }[]; // đúng 4 phần tử, thứ tự: "Lãnh đạo Phường" [Bí thư, Chủ tịch, Phó chủ tịch], "Phòng Kinh tế hạ tầng" / "Phòng Nội vụ" / "Phòng Văn hóa" [Trưởng phòng, Phó phòng]
  export const CTV_COMMISSION_RATE = 0.1;
  export const UNASSIGNED_STAFF = "Chưa phân công";
  ```
- Produces (`schema-extensions.ts`): `ensureColumn(table: string, column: string, ddlType: string): Promise<void>` (idempotent; kiểm tra bằng `PRAGMA table_info` ở SQLite, `ADD COLUMN IF NOT EXISTS` ở Postgres; `table`/`column` phải khớp `^[a-z_]+$` nếu không throw), `applySchemaExtensions(): Promise<void>` (chạy **trước** seed), `backfillRelations(): Promise<void>` (chạy **sau** seed).
- Cột/bảng mới (đúng tên, tất cả nullable trừ khi ghi khác):
  - `users`: `phone TEXT`, `referral_code TEXT`, `approved_at TEXT`, `approved_by TEXT`, `created_at TEXT`; `CREATE UNIQUE INDEX IF NOT EXISTS ux_users_referral_code ON users(referral_code)`
  - `customers`: `handover_batch TEXT`, `handover_date TEXT`
  - `leads`: `territory_id TEXT`, `referred_by_ctv_id TEXT`
  - `contracts`: `territory_id TEXT`, `referred_by_ctv_id TEXT`, `lead_id TEXT`
  - `commissions`: `contract_id TEXT`, `ctv_id TEXT`
  - bảng `ward_officials(id TEXT PRIMARY KEY, territory_id TEXT NOT NULL, unit TEXT NOT NULL, position TEXT NOT NULL, full_name TEXT NOT NULL, phone TEXT, created_at TEXT)`
  - bảng `quarters(id TEXT PRIMARY KEY, territory_id TEXT NOT NULL, name TEXT NOT NULL, head_name TEXT, secretary_name TEXT, mttq_name TEXT, household_count INTEGER DEFAULT 0, population INTEGER DEFAULT 0, created_at TEXT)`
- Produces (FE `crm.types.ts`, chỉ **thêm**): `UserRole`; `WardOfficialRecord {id, territoryId, unit, position, fullName, phone}`; `QuarterRecord {id, territoryId, name, headName, secretaryName, mttqName, householdCount, population}`; `TerritoryDetail {territory: {id, wardName, quarterCount, householdCount, opportunityCount, deployedCount, staffName}, officials, quarters, leads: {id, customerName, status, expectedValue, channel, staffName}[], contracts: {id, transactionCode, customerName, totalValue, deploymentStatus, paymentStatus}[], totals: {quarterCount, householdCount, population, leadCount, contractCount, contractValue}}`; `CtvAccountRecord {id, username, name, phone, email, referralCode, status, createdAt, approvedAt}`; `CtvProfile {id, username, name, email, phone, referralCode}`; `CtvSummary {totalLeads, successfulLeads, failedLeads, totalContracts, completedContracts, totalCommission, pendingCommission, paidCommission}`; `CtvLeadRecord {id, customerName, maskedPhone, group, status, expectedValue, createdAt, contractStatus}`; `CtvContractRecord {id, transactionCode, customerName, totalValue, deploymentStatus, paymentStatus, createdAt}`; `CtvCommissionRecord {id, transactionCode, amount, status, date}`. Mở rộng trường tuỳ chọn: `LeadRecord` + `territoryId?`, `referredByCtvId?`, `referredByCtvName?`, `channel` thêm `"CTV giới thiệu"`; `ContractRecord` + `leadId?`, `territoryId?`, `referredByCtvId?`; `CommissionRecord` + `ctvId?`, `contractId?`; `CustomerRecord` + `handoverBatch`, `handoverDate` (chuỗi, rỗng nếu chưa có).
- Produces (FE `org.constants.ts`): `CUSTOMER_GROUP_LABEL: Record<CustomerGroup,string>` (`Tự phát triển` → "KH PTM (phát triển mới)", `Tập hiện hữu` → "KHDN chăm (địa bàn giao)"), `LEAD_GROUP_LABEL` (→ "Lead KH mới" / "Lead bán chéo" / "Lead gia hạn" theo quyết định đã chốt), `LEAD_CHANNELS`, `WARD_UNITS` (bản sao đúng nội dung backend).

- [ ] **Step 1: Viết test (fail trước)** `schema-extensions.test.ts` bằng `node:test` (chạy `cd backend && npx tsx --test src/database/schema-extensions.test.ts`): đặt `process.env.SQLITE_PATH` sang file tạm **trước** `await import("./db.js")`; gọi `initDatabase()` hai lần liên tiếp; assert (a) mọi cột/bảng ở trên tồn tại (hàm helper `columnExists(table, col)` rẽ nhánh SQLite `PRAGMA table_info` / Postgres `information_schema.columns` để cùng file chạy được với `DB_DRIVER=postgres DATABASE_URL=...`), (b) lần 2 không throw và `SELECT COUNT(*) FROM leads` không đổi, (c) sau backfill `leads.territory_id` của `LEAD-01` = id phường của AM "Nguyễn Thị Tình" (`TB-01`), (d) `contracts.territory_id` của `CTR-01` = `TB-01` (suy ra từ lead cùng `customer_name`), (e) gán tay `UPDATE leads SET territory_id='TB-02' WHERE id='LEAD-01'` rồi `initDatabase()` lại → vẫn `TB-02`.
- [ ] **Step 2: Chạy test, xác nhận fail** (thiếu module).
- [ ] **Step 3: Implement `backend/src/constants/org.ts`** đúng giá trị ở Interfaces.
- [ ] **Step 4: Implement `schema-extensions.ts`**: `ensureColumn`, `applySchemaExtensions` (thêm cột, tạo 2 bảng + unique index bằng DDL tương thích cả hai driver — `TEXT`/`INTEGER`, không `AUTOINCREMENT`), `backfillRelations` bằng `UPDATE ... WHERE territory_id IS NULL` với subquery tương quan: leads → `staff.territory = territories.ward_name` theo `leads.staff_name = staff.name`; contracts → `territory_id` của lead cùng `customer_name` có `territory_id` không null (`LIMIT 1`).
- [ ] **Step 4b: Sửa `db.ts`:** `new sqlite3.Database(process.env.SQLITE_PATH ? path.resolve(process.env.SQLITE_PATH) : dbPath)`; trong `initDatabase()` gọi `await applySchemaExtensions()` ngay sau `createTables*()` và `await backfillRelations()` sau khối seed cuối cùng.
- [ ] **Step 5: Thêm types FE + `org.constants.ts`** (chỉ thêm, không sửa trường cũ); `cd frontend && npx tsc --noEmit` và `npm run build` pass.
- [ ] **Step 6: Chạy test (SQLite) → pass**; chạy lại với `DB_DRIVER=postgres DATABASE_URL=postgres://<user>:<pass>@localhost:5432/vnpt_crm_test` (DB trống do controller tạo) → pass hai lần liên tiếp. Chạy `cd backend && npm run build` pass.
- [ ] **Step 7: Commit** `git commit -m "Add idempotent schema extensions and shared org constants"`

---

### Task 2: Khoá route nhân viên, role middleware, khung router, bộ API test

**Files:**
- Create: `backend/src/middleware/require-role.ts`, `backend/src/middleware/require-role.test.ts`, `backend/src/modules/ctv/ctv.controller.ts`, `backend/src/modules/ctv/ctv-accounts.controller.ts`, `backend/src/modules/public/public.controller.ts`, `frontend/e2e/api/helpers.ts`, `frontend/e2e/api/guards.spec.ts`, `frontend/e2e/public-layout.spec.ts`
- Modify: `backend/src/server.ts`, `frontend/components/layout/Shell.tsx`

**Interfaces:**
- Consumes: `ROLES` từ Task 1; `requireAuth` hiện có (đặt `req.user = {id, role, name}`).
- Produces: `requireStaff`, `requireAdmin`, `requireCtv` (Express middleware, chạy **sau** `requireAuth`; sai quyền → `403 {success:false,message:"Không có quyền truy cập"}`); `requireStaff` = role khác `CTV`; stub `export const ctvRouter = Router()`, `ctvAccountsRouter`, `publicRouter` (rỗng, các task sau điền).
- Produces (`e2e/api/helpers.ts`): `API_URL = process.env.E2E_API_URL || "http://localhost:8099/api"`; `apiLogin(request: APIRequestContext, username: string, password: string): Promise<string>` (trả token, throw nếu không 200); `bearer(token: string): { Authorization: string }`; `ADMIN`, `AM` = `{username, password}` (`admin`/`admin@Vnpt2026`, `VNPT-AM-01`/`VNPT-AM-01@Vnpt2026`).

- [ ] **Step 1: Viết test** `require-role.test.ts` (`node:test`, gọi middleware với `req/res` giả): `requireStaff` cho qua `Admin`/`AM`/`AM Bán chăm`, chặn `CTV` bằng 403; `requireAdmin` chỉ cho `Admin`; `requireCtv` chỉ cho `CTV`. Viết `guards.spec.ts`: với mỗi path trong danh sách `[/customers, /leads, /contracts, /commissions, /territories, /debts, /renewals, /services, /tasks, /staff, /dashboard/stats, /reports/summary, /settings]` — không token → 401; token admin → 200; token AM → 200 (riêng `/settings` AM → 403 vì Admin-only sẵn có). Thêm test `/health` và `POST /auth/login` vẫn mở không token.
- [ ] **Step 2: Chạy, xác nhận fail** (GET hiện đang công khai nên trả 200 không token).
- [ ] **Step 3: Implement** `require-role.ts` và 3 stub router.
- [ ] **Step 4: Sửa `server.ts`:** `app.set("trust proxy", 1)`; gắn guard tập trung `app.use("/api/<x>", requireAuth, requireStaff, <x>Router)` cho debts, renewals, customers, territories, dashboard, services, leads, contracts, commissions, staff, tasks, reports, settings; `/api/auth` và `/api/public` mở; `app.use("/api/ctv", requireAuth, requireCtv, ctvRouter)`; `app.use("/api/ctv-accounts", requireAuth, requireAdmin, ctvAccountsRouter)`. Không sửa file controller nào.
- [ ] **Step 5: Chạy lại toàn bộ** `npx playwright test e2e/api/guards.spec.ts` + suite cũ `e2e/admin-pages.spec.ts e2e/admin-write-actions.spec.ts` (đảm bảo không vỡ) → pass; `cd backend && npm run build` pass.
- [ ] **Step 6: Sửa lỗi hồi quy đã phát hành ở `Shell.tsx`:** `APP_PREFIXES` hiện là `["/admin", "/cong-tac-vien"]` nên trang giới thiệu công khai `/cong-tac-vien` (và sau này `/cong-tac-vien/dang-ky`) bị mất header/footer marketing. Đổi thành `["/admin", "/cong-tac-vien/dashboard"]`. Viết `public-layout.spec.ts` (fail trước, pass sau): `/cong-tac-vien` và `/lien-he` có link "Sim số" ở header; sau khi đăng nhập admin, `/admin/dashboard` **không** có link "Sim số".
- [ ] **Step 7: Commit** `git commit -m "Guard staff routes centrally and add role middleware with API test helpers"` rồi `git commit -m "Keep public header on CTV landing page"` (hai commit riêng).

---

### Task 3: Khách hàng PTM vs KHDN-chăm (BE + FE)

**Files:**
- Modify: `backend/src/modules/customer/customer.service.ts`, `customer.controller.ts`, `frontend/app/admin/customers/page.tsx`, `frontend/lib/api/customers.api.ts`
- Create: `frontend/e2e/api/customers.spec.ts`, `frontend/e2e/customers-group.spec.ts`

**Interfaces:**
- Consumes: `CUSTOMER_GROUPS`, `CUSTOMER_GROUP_LABEL`, cột `handover_*` (Task 1), helpers (Task 2).
- Produces: `GET /api/customers?search=&group=` (`group` ∈ `CUSTOMER_GROUPS`, sai → 400); `POST /api/customers` nhận thêm `handoverBatch?: string`; `PATCH /api/customers/:id/transfer` nhận `{ newStaff: string, handoverBatch?: string }`. Hàng trả về thêm `handover_batch`, `handover_date` (`YYYY-MM-DD`). `createCustomer`/`transferCustomer` ở FE nhận tham số `handoverBatch?`.

- [ ] **Step 1: Viết test API** `customers.spec.ts` (tên test = mô tả): tạo KH `Tự phát triển` rồi transfer sang AM khác → `am_staff` giữ nguyên, `am_caring_staff` đổi; tạo KH `Tập hiện hữu` + transfer kèm `handoverBatch:"DOT-<ts>"` → cả hai cột đổi, `handover_batch` và `handover_date` = hôm nay; transfer id không tồn tại → 404; `newStaff` rỗng hoặc không có trong bảng `staff` → 400; `customerGroup` ngoài whitelist khi tạo → 400; `?group=Tập hiện hữu` chỉ trả đúng nhóm; `?group=xxx` → 400; audit log có dòng "Điều chuyển" chứa tên người cũ và mới (đọc `/api/reports/audit-logs`).
- [ ] **Step 2: Chạy → fail.**
- [ ] **Step 3: Implement service/controller:** whitelist `group` ở `create` và `getAll`; `transfer(id, newStaff, operator, handoverBatch?)` theo quy tắc giả định đã chốt, kiểm tra tồn tại KH + staff, ghi `audit_logs` dạng `Điều chuyển KH <id> (<nhãn nhóm>): <người chăm cũ> → <người chăm mới>[, đợt <batch>]`; đổi mã trạng thái controller từ 500 sang 400/404 đúng loại lỗi.
- [ ] **Step 4: Chạy lại test API → pass;** chạy lại phần transfer trong `admin-write-actions.spec.ts` (nếu assert cũ giả định đổi cả `am_staff` cho KH PTM thì sửa assert cho khớp quy tắc mới, ghi rõ trong commit).
- [ ] **Step 5: Viết test UI** `customers-group.spec.ts`: trang `/admin/customers` hiện nhãn "KH PTM (phát triển mới)" / "KHDN chăm (địa bàn giao)" (không còn chữ "Tự phát triển"/"Tập hiện hữu" trong badge), dropdown lọc nhóm làm bảng chỉ còn đúng nhóm, modal điều chuyển có ô "Mã đợt giao" tuỳ chọn và cột "Đợt giao" hiện giá trị sau khi điều chuyển KH KHDN-chăm.
- [ ] **Step 5b: Implement FE** (nhãn qua `CUSTOMER_GROUP_LABEL`, bộ lọc nhóm client-side, cột/ô đợt giao, map `handoverBatch/handoverDate` trong `mapCustomerRow`). Chạy test UI → pass; `npm run build` pass.
- [ ] **Step 6: Commit** `git commit -m "Distinguish PTM and KHDN-care customers with handover batch tracking"`

---

### Task 4: Tài khoản CTV + đăng nhập chung + Admin tạo nhân viên có tài khoản (BE + FE)

**Files:**
- Modify: `backend/src/modules/auth/auth.service.ts`, `auth.controller.ts`, `backend/src/modules/staff/staff.service.ts`, `staff.controller.ts`, `backend/src/modules/ctv/ctv-accounts.controller.ts` (điền stub); Create `backend/src/modules/ctv/ctv-accounts.service.ts`
- Modify: `frontend/app/login/page.tsx`, `frontend/lib/auth/auth-context.tsx`, `frontend/lib/api/auth.api.ts`, `frontend/lib/api/staff.api.ts`, `frontend/app/admin/employees/page.tsx`, `frontend/app/admin/layout.tsx`, `frontend/components/admin/layout/AdminSidebar.tsx`, `frontend/app/cong-tac-vien/page.tsx`; Create `frontend/app/cong-tac-vien/dang-ky/page.tsx`, `frontend/app/admin/ctv-accounts/page.tsx`, `frontend/lib/api/ctv-accounts.api.ts`
- Modify (helpers): `frontend/e2e/api/helpers.ts` (thêm hàm bên dưới); Create `frontend/e2e/api/ctv-accounts.spec.ts`, `frontend/e2e/ctv-auth.spec.ts`

**Interfaces:**
- Consumes: `ROLES`, `USER_STATUS`, cột `users.*` mới (Task 1), `requireAdmin` đã gắn cho `/api/ctv-accounts` (Task 2).
- Produces (API):
  - `POST /api/auth/register-ctv` body `{ username, password, name, phone, email? }` → `201 {success:true,data:{message}}`; validate: username `^[A-Za-z0-9_.-]{4,30}$`, password ≥ 8 ký tự, name 2–80, phone `^0\d{9}$`; username/phone trùng → 409; tạo `users` với `id = "USR-CTV-"+Date.now()`, `role="CTV"`, `status="Chờ duyệt"`, `referral_code = "CTV" + 6 ký tự từ "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"` (dùng `crypto.randomInt`, thử lại tối đa 5 lần khi trùng), `created_at` ISO; không trả token.
  - `POST /api/auth/login`: kiểm tra mật khẩu **trước**, rồi mới kiểm tra `status`: `Chờ duyệt` → 403 "Tài khoản đang chờ Admin duyệt"; `Từ chối` → 403 "Đăng ký cộng tác viên chưa được duyệt"; sai thông tin → 401 như cũ.
  - `GET /api/ctv-accounts?status=` → `CtvAccountDto[]` (`{id, username, name, phone, email, referralCode, status, createdAt, approvedAt}`, chỉ `role='CTV'`, mới nhất trước); `PATCH /api/ctv-accounts/:id/approve` → `status="Đang hoạt động"`, ghi `approved_at`, `approved_by` (tên admin); `PATCH /:id/reject` → `"Từ chối"`; id không phải CTV → 404.
  - `POST /api/staff` nhận thêm `password?` và **tạo luôn dòng `users`** (`id="USR-"+code`, `username=code`, mật khẩu = `password` nếu hợp lệ ≥ 8, nếu không có thì `<code>@Vnpt2026`, `role`, `name`, `email`, `status` active); response thêm `initialPassword` **chỉ khi dùng mật khẩu mặc định**; trùng username trong `users` → 409 trước khi insert `staff`. `PATCH /api/staff/:id` đồng bộ `name/role/email` và `status` (`Đang hoạt động` ↔ khác) sang `users`.
- Produces (`helpers.ts`): `createApprovedCtv(request, adminToken): Promise<{ id: string; username: string; password: string; token: string; referralCode: string }>` (đăng ký username duy nhất `ctv_${Date.now()}_${random}`, admin duyệt, đăng nhập lấy token); `registerCtv(request, overrides?)`.
- Produces (FE): `AuthProvider.login` trả `Promise<AuthUser>`; trang login: CTV → `/cong-tac-vien/dashboard`, role khác → `/admin/dashboard`; lỗi 403 hiện đúng message server; link "Đăng ký làm CTV" dưới form → `/cong-tac-vien/dang-ky`; `/admin/layout.tsx` đẩy role `CTV` sang `/cong-tac-vien/dashboard`; mục sidebar "Duyệt CTV" (badge Admin) → `/admin/ctv-accounts`.

- [ ] **Step 1: Viết test API** `ctv-accounts.spec.ts` (đủ các case): đăng ký hợp lệ → 201 và đăng nhập ngay → 403 "chờ duyệt"; sai mật khẩu của tài khoản chờ duyệt vẫn 401 (không lộ trạng thái); username trùng → 409; phone sai/password < 8/username có ký tự lạ → 400; admin duyệt → đăng nhập OK, token có `role:"CTV"`, `/auth/me` trả đúng; admin từ chối → login 403 "chưa được duyệt"; AM và token CTV gọi `PATCH /ctv-accounts/:id/approve` → 403; tạo staff mới bằng admin → đăng nhập được bằng `<code>@Vnpt2026`, response có `initialPassword`; tạo staff với `password` tự đặt → không có `initialPassword`; AM tạo staff → 403 (đã có); chuyển staff sang `Ngừng hoạt động` → login 403.
- [ ] **Step 2: Chạy → fail.**
- [ ] **Step 3: Implement BE** (auth service dùng lớp lỗi nhỏ mang `status` HTTP để controller trả đúng mã; `CtvAccountsService` với `list/approve/reject`; sửa `StaffService.create/update`).
- [ ] **Step 4: Chạy test API → pass;** chạy lại suite cũ (login e2e fixture phải vẫn qua).
- [ ] **Step 5: Viết test UI** `ctv-auth.spec.ts`: (a) `/cong-tac-vien/dang-ky` điền form hợp lệ → thấy thông báo "đã gửi, chờ Admin duyệt"; (b) đăng nhập tài khoản đó ở `/login` → thấy message chờ duyệt; (c) admin vào `/admin/ctv-accounts` thấy dòng `Chờ duyệt`, bấm "Duyệt" → trạng thái đổi; (d) CTV đăng nhập → URL `/cong-tac-vien/dashboard`; (e) admin tạo nhân viên ở `/admin/employees` → modal/thông báo hiện mật khẩu mặc định một lần.
- [ ] **Step 6: Implement FE** các trang/sửa đổi ở Files; trang đăng ký gọi `registerCtv` qua `apiFetch`, validate client giống BE, hiện lỗi 409/400 từ server. Chạy test UI → pass; `npm run build` pass.
- [ ] **Step 7: Commit** hai lần: `Add CTV registration, approval and unified login` rồi `Create login accounts when admin adds staff`.

---

### Task 5: Lead / Hợp đồng / Hoa hồng gắn CTV và Phường (BE + FE)

**Files:**
- Modify: `backend/src/modules/lead/lead.service.ts`, `lead.controller.ts`, `backend/src/modules/contract/contract.service.ts`, `contract.controller.ts`, `backend/src/modules/commission/commission.service.ts`; Create `backend/src/modules/commission/commission.rules.ts`
- Modify: `frontend/app/admin/leads/page.tsx`, `frontend/app/admin/contracts/page.tsx`, `frontend/app/admin/commissions/page.tsx`, `frontend/lib/api/leads.api.ts`, `contracts.api.ts`, `commissions.api.ts`
- Create: `frontend/e2e/api/lead-contract-commission.spec.ts`, `frontend/e2e/lead-contract-ui.spec.ts`

**Interfaces:**
- Consumes: `LEAD_CHANNELS`, `LEAD_GROUPS`, `CTV_COMMISSION_RATE`, `UNASSIGNED_STAFF`, `createApprovedCtv` (Task 4), cột mới (Task 1).
- Produces:
  - `LeadRecordDto` + `territoryId: string|null`, `referredByCtvId: string|null`, `referredByCtvName: string|null` (LEFT JOIN `users`, alias snake_case rồi map); `POST /api/leads` nhận `territoryId?`, `referredByCtvId?`; luật: `channel` ∈ `LEAD_CHANNELS`, `group` ∈ `LEAD_GROUPS`, `channel==="CTV giới thiệu"` ⇔ có `referredByCtvId` là CTV `Đang hoạt động`, `territoryId` (nếu có) phải tồn tại.
  - `GET /api/leads/ctv-options` (đặt **trước** các route `/:id`) → `{id, name, referralCode}[]` các CTV đang hoạt động (cho nhân viên không phải Admin).
  - `PATCH /api/leads/:id/assignment` body `{ staffName?: string, territoryId?: string|null }` (≥ 1 trường; `staffName` phải có trong `staff`; không tìm thấy lead → 404).
  - `ContractRecordDto` + `leadId`, `territoryId`, `referredByCtvId`; `POST /api/contracts` nhận `leadId?`, `territoryId?`: có `leadId` → lead phải tồn tại, hợp đồng **thừa kế** `referred_by_ctv_id` và `territory_id` từ lead (`territoryId` truyền rõ thì ghi đè), lưu `lead_id`.
  - `commission.rules.ts`: `calcCtvCommission(totalValue: number): number` = `Math.round(totalValue * CTV_COMMISSION_RATE)`; `CommissionService.createForContract(contract)` idempotent theo `(contract_id, ctv_id)`: tạo dòng `type="Hoa hồng chi kênh"`, `recipient_name` = tên CTV, `transaction_code` = mã giao dịch HĐ, `status="Chờ chi"`, `date` = hôm nay `YYYY-MM-DD`, `contract_id`, `ctv_id`. Được gọi khi `updateStatus` đổi `deployment_status` sang `Hoàn tất` và HĐ có `referred_by_ctv_id`; khi `totalValue` đổi mà hoa hồng CTV của HĐ còn `Chờ chi` → tính lại `amount`.
  - `CommissionRecordDto` + `ctvId`, `contractId`.
- FE: kênh nguồn lấy từ `LEAD_CHANNELS`, nhãn loại lead qua `LEAD_GROUP_LABEL`; modal tạo lead có ô chọn CTV (gọi `/leads/ctv-options`, chỉ hiện khi kênh = "CTV giới thiệu") và chọn Phường; hành động "Phân công" (chọn nhân viên + phường) ở bảng lead; modal tạo hợp đồng có chọn "Từ Lead" (lead `Chốt thành công` chưa gắn HĐ) và Phường; bảng HĐ hiện cột CTV/Phường; bảng hoa hồng hiện liên kết tới mã HĐ.

- [ ] **Step 1: Viết test API:** kênh `CTV giới thiệu` thiếu `referredByCtvId` → 400; `referredByCtvId` là CTV `Chờ duyệt` hoặc không phải CTV → 400; kênh khác mà có `referredByCtvId` → 400; `channel`/`group` ngoài whitelist → 400; lead tạo với CTV hợp lệ có `referredByCtvName`; `PATCH assignment` đổi nhân viên/phường, nhân viên không tồn tại → 400, lead không tồn tại → 404, body rỗng → 400; HĐ tạo từ lead CTV thừa kế `referredByCtvId`/`territoryId`; `leadId` không tồn tại → 400; chuyển HĐ sang `Hoàn tất` → đúng **1** dòng hoa hồng `amount = round(value*0.1)` `Chờ chi` cho đúng CTV, gọi lại cùng trạng thái → vẫn 1 dòng; HĐ không có CTV → không sinh hoa hồng; đổi `totalValue` khi còn `Chờ chi` → `amount` tính lại, khi đã `Đã chi` → giữ nguyên; `totalValue` âm → 400.
- [ ] **Step 2: Chạy → fail.**
- [ ] **Step 3: Implement BE** theo Interfaces (mọi SQL tương thích Postgres theo Global Constraints, đặc biệt alias của JOIN).
- [ ] **Step 4: Chạy test API → pass;** chạy lại phần leads/contracts của `admin-write-actions.spec.ts` và sửa assert nếu bị ảnh hưởng bởi whitelist mới (ghi rõ trong commit).
- [ ] **Step 5: Viết test UI** `lead-contract-ui.spec.ts`: tạo lead kênh "CTV giới thiệu" chọn CTV vừa tạo → thấy tên CTV ở dòng lead; "Phân công" đổi nhân viên và phường; tạo HĐ "Từ Lead" rồi đổi triển khai sang `Hoàn tất` → trang Hoa hồng có dòng của CTV đó; nhãn loại lead hiện "Lead KH mới/Lead gia hạn/Lead bán chéo".
- [ ] **Step 6: Implement FE** → test UI pass; `npm run build` pass.
- [ ] **Step 7: Commit** `git commit -m "Link leads, contracts and commissions to CTV and ward"`

---

### Task 6: Trang chi tiết Phường / Khu phố (BE + FE)

**Files:**
- Modify: `backend/src/modules/territory/territory.service.ts`, `territory.controller.ts`, `frontend/app/admin/territories/page.tsx`, `frontend/lib/api/territories.api.ts`
- Create: `frontend/app/admin/territories/[id]/page.tsx`, `frontend/components/admin/territory/OfficialsSection.tsx`, `QuartersSection.tsx`, `WardLeadsContractsSection.tsx`, `frontend/e2e/api/territory-detail.spec.ts`, `frontend/e2e/territory-detail.spec.ts`

**Interfaces:**
- Consumes: `WARD_UNITS` (Task 1), bảng `ward_officials`/`quarters`, `leads.territory_id`, `contracts.territory_id`, `requireAdmin` (Task 2; áp **từng route** ghi bằng `requireAdmin` ngay trong controller vì route cha chỉ `requireStaff`).
- Produces (JSON camelCase, đúng `TerritoryDetail` của Task 1; mọi tổng tính bằng JS từ mảng đã `Number()`, không dùng `SUM` SQL):
  - `GET /api/territories/:id/detail` (staff): 404 nếu phường không tồn tại.
  - `POST /api/territories/:id/officials` `{unit, position, fullName, phone?}` → 201; `PATCH /api/territories/officials/:officialId` `{fullName?, phone?}`; `DELETE /api/territories/officials/:officialId`. Validate `(unit, position)` ∈ `WARD_UNITS`, `fullName` 1–100 ký tự. Chỉ Admin.
  - `POST /api/territories/:id/quarters` `{name, headName?, secretaryName?, mttqName?, householdCount?, population?}` → 201; `PATCH /api/territories/quarters/:quarterId` (cùng trường, tuỳ chọn); `DELETE /api/territories/quarters/:quarterId`. Số nguyên ≥ 0, không NaN. Chỉ Admin.
  - Lưu ý thứ tự khai báo route: các path `/officials/...` và `/quarters/...` khai báo **trước** `/:id/...` để không bị bắt nhầm.
- FE: tên phường ở bảng `/admin/territories` thành link tới `/admin/territories/<id>` (không phá chức năng sửa số hộ dân inline đang có); trang chi tiết có 4 khối: "Lãnh đạo & Phòng ban" (render theo `WARD_UNITS`; vị trí chưa có dữ liệu hiện "Chưa cập nhật" + nút "Thêm"), "Khu phố" (bảng + tổng hộ/dân + nhãn "Khai báo: N · Đã nhập chi tiết: M"), "Lead dự án đang theo", "Hợp đồng đã triển khai" (tổng giá trị). Admin thấy nút thêm/sửa/xoá, AM chỉ xem. Dùng `params` kiểu Promise theo Next 16 (đọc tài liệu trong `node_modules/next/dist/docs` nếu cần).

- [ ] **Step 1: Viết test API:** `GET detail` của `TB-01` trả `territory.wardName="Tân Hưng"`, `officials=[]`, `quarters=[]`, `leads` chứa `LEAD-01` (nhờ backfill), `contracts` chứa `CTR-01`, `totals.leadCount/contractCount/contractValue` khớp mảng; id không tồn tại → 404; Admin tạo official hợp lệ → 201 và hiện trong detail; `(unit, position)` sai → 400; AM POST/PATCH/DELETE → 403 nhưng AM GET detail → 200; tạo quarter `householdCount:-1` → 400, `NaN` → 400; sửa/xoá id không tồn tại → 404; `totals.quarterCount/householdCount/population` bằng tổng các quarter đã nhập.
- [ ] **Step 2: Chạy → fail.**
- [ ] **Step 3: Implement BE.**
- [ ] **Step 4: Chạy test API → pass.**
- [ ] **Step 5: Viết test UI** `territory-detail.spec.ts`: từ `/admin/territories` bấm tên "Tân Hưng" → URL `/admin/territories/TB-01`, thấy đủ 4 khối và "Chưa cập nhật"; Admin thêm "Chủ tịch" tên unique → hiện trong khối; thêm 1 Khu phố → hàng mới + tổng hộ dân cập nhật; xoá cả hai → quay lại trạng thái cũ; đăng nhập AM → không thấy nút thêm/sửa/xoá.
- [ ] **Step 6: Implement FE** → test UI pass; `npm run build` pass.
- [ ] **Step 7: Commit** `git commit -m "Add ward detail page with officials, quarters, leads and contracts"`

---

### Task 7: Form liên hệ công khai tạo Lead + theo dõi mã giới thiệu (BE + FE)

**Files:**
- Modify: `backend/src/modules/public/public.controller.ts`, `frontend/app/lien-he/page.tsx`, `frontend/components/layout/Shell.tsx`; Create `backend/src/modules/public/public.service.ts`, `frontend/lib/referral.ts`, `frontend/components/layout/RefCapture.tsx`, `frontend/app/ref/[code]/page.tsx`, `frontend/lib/api/public.api.ts`, `frontend/e2e/api/public-leads.spec.ts`, `frontend/e2e/referral.spec.ts`

**Interfaces:**
- Consumes: `LEAD_CHANNELS`, `UNASSIGNED_STAFF`, `createApprovedCtv` (Task 4), `trust proxy` (Task 2).
- Produces:
  - `POST /api/public/leads` body `{ name, phone, demand?, refCode?, website? }` → `201 {success:true,data:{message:"Đã ghi nhận"}}`. `website` là honeypot: có giá trị → trả 201 giả, **không** lưu. Validate: name 2–100, phone `^0\d{9,10}$`, demand ≤ 500; sai → 400. `refCode` khớp CTV `Đang hoạt động` (so khớp `users.referral_code`, role `CTV`) → lead `channel="CTV giới thiệu"`, `referred_by_ctv_id`; còn lại → `channel="Online"`. Lead luôn: `group_name="Khách hàng mới"`, `staff_name=UNASSIGNED_STAFF`, `expected_value=0`, `demand_description=demand`. Rate limit in-memory theo `req.ip`: tối đa 5 lần/10 phút (hằng số ở đầu file), quá → 429.
  - `GET /api/public/ref/:code` → `{success:true,data:{valid:boolean}}` (không lộ tên CTV).
  - FE `lib/referral.ts`: `storeRef(code: string): void`, `getStoredRef(): string | null` (localStorage khoá `vnpt_ref`, hết hạn 30 ngày, mọi truy cập bọc try/catch); `RefCapture` đọc `?ref=` trên mọi trang công khai và gọi `storeRef`; route `/ref/<code>` lưu mã rồi chuyển hướng tới `to` nếu `to` bắt đầu bằng đúng một `/` (không `//`, không có scheme), ngược lại về `/`.

- [ ] **Step 1: Viết test API** `public-leads.spec.ts`: không `refCode` → lead `Online`, `staffName="Chưa phân công"` (đọc bằng token admin `GET /api/leads`); `refCode` của CTV đã duyệt → `channel="CTV giới thiệu"` và `referredByCtvId` đúng; `refCode` bậy hoặc của CTV `Chờ duyệt` → vẫn tạo lead `Online`; honeypot có giá trị → 201 nhưng không có lead mới (so số lượng); SĐT sai / tên 1 ký tự / demand > 500 → 400; 6 request liên tiếp dùng header `X-Forwarded-For: 203.0.113.<ngẫu nhiên>` riêng của test → request thứ 6 là 429 (các test khác không gửi header này nên không bị ảnh hưởng); `GET /public/ref/<mã đúng>` → `valid:true`, mã sai → `valid:false`.
- [ ] **Step 2: Chạy → fail.**
- [ ] **Step 3: Implement BE.**
- [ ] **Step 4: Chạy test API → pass.**
- [ ] **Step 5: Viết test UI** `referral.spec.ts`: mở `/ref/<mã CTV>?to=/lien-he` → vào `/lien-he`, localStorage có `vnpt_ref`; điền và gửi form → thấy "Cảm ơn bạn đã liên hệ!" và admin thấy lead kênh "CTV giới thiệu"; `/ref/x?to=//evil.com` và `?to=https://evil.com` → về `/` (không rời domain); gửi form khi chưa có `ref` → lead `Online`; gửi SĐT sai → hiện lỗi, không hiện "Cảm ơn".
- [ ] **Step 6: Implement FE:** nối `ContactForm` hiện chỉ `setSubmitted(true)` sang `POST /public/leads` (kèm `getStoredRef()`, trạng thái đang gửi, hiện lỗi server); thêm `RefCapture` vào nhánh công khai của `Shell`. Test UI pass; `npm run build` pass.
- [ ] **Step 7: Commit** `git commit -m "Capture public contact leads with CTV referral tracking"`

---

### Task 8: Dashboard CTV chạy dữ liệu thật (BE + FE)

**Files:**
- Modify: `backend/src/modules/ctv/ctv.controller.ts`; Create `backend/src/modules/ctv/ctv.service.ts`
- Modify: `frontend/app/cong-tac-vien/dashboard/layout.tsx`, `page.tsx`, `don-hang/page.tsx`, `hop-dong/page.tsx`, `hoa-hong/page.tsx`, `link-gioi-thieu/page.tsx`, `frontend/components/ctv/CtvSidebar.tsx`, `CtvTopbar.tsx`
- Create: `frontend/lib/api/ctv.api.ts`, `frontend/e2e/api/ctv-scope.spec.ts`, `frontend/e2e/ctv-dashboard.spec.ts`
- Delete (sau khi `grep` xác nhận không còn nơi dùng): `frontend/app/cong-tac-vien/dashboard/khach-hang`, `doanh-so`, `thanh-toan`, `thong-bao`, `cai-dat` và các component chỉ phục vụ chúng

**Interfaces:**
- Consumes: kiểu `Ctv*` (Task 1), `createApprovedCtv` (Task 4), lead/HĐ/hoa hồng gắn CTV (Task 5), lead công khai (Task 7). Route đã bọc `requireAuth + requireCtv` (Task 2).
- Produces (`/api/ctv`, mọi truy vấn lọc theo `req.user.id`): `GET /me` → `CtvProfile`; `GET /summary` → `CtvSummary` (số tính bằng `Number()`); `GET /leads` → `CtvLeadRecord[]` (`maskedPhone`: giữ 4 số đầu + 2 số cuối, giữa thay `*`, ví dụ `0909123456` → `0909****56`; `contractStatus` = `deployment_status` của HĐ gắn với lead hoặc `null`); `GET /contracts` → `CtvContractRecord[]`; `GET /commissions` → `CtvCommissionRecord[]`. Query param lạ (kể cả `ctvId`) bị bỏ qua. Không bao giờ trả SĐT đầy đủ, `staff_name`, hay dữ liệu CTV khác.
- FE: `layout.tsx` (client) — chưa đăng nhập → `/login`; role khác `CTV` → `/admin/dashboard`; sidebar chỉ còn: Dashboard, Đơn hàng, Hợp đồng, Hoa hồng, Link giới thiệu, Tài liệu & Banner, Sản phẩm, Hỗ trợ (3 mục cuối là nội dung tĩnh, giữ nguyên). Link giới thiệu thật: `${window.location.origin}/ref/${referralCode}` và theo dịch vụ `…?to=/san-pham/<slug>`; thống kê trang này = số lead đã giới thiệu và tỷ lệ `Chốt thành công` (bỏ số "lượt click" vì không theo dõi). Mọi nơi đang đọc `CTV_PROFILE` mock chuyển sang `getCtvMe()`.

- [ ] **Step 1: Viết test API** `ctv-scope.spec.ts`: tạo CTV A và B; dùng API công khai (Task 7) với `refCode` của A tạo 2 lead, của B tạo 1 lead; admin gán nhân viên, tạo HĐ từ lead của A rồi `Hoàn tất` (sinh hoa hồng — Task 5); khi đó token A: `/ctv/leads` đúng 2 dòng, `/ctv/contracts` 1, `/ctv/commissions` 1, `/ctv/summary` khớp (`totalLeads=2`, `totalCommission` = amount, `pendingCommission` = amount); token B chỉ thấy đúng 1 lead; `?ctvId=<id của A>` bằng token B vẫn trả dữ liệu của B; `maskedPhone` không chứa SĐT đầy đủ; token CTV gọi `/api/customers`, `/api/leads`, `/api/commissions`, `/api/staff`, `/api/ctv-accounts` → 403; admin/AM gọi `/api/ctv/me` → 403; không token → 401.
- [ ] **Step 2: Chạy → fail.**
- [ ] **Step 3: Implement BE** (`CtvService` với các hàm `getProfile/getSummary/getLeads/getContracts/getCommissions(ctvId)`).
- [ ] **Step 4: Chạy test API → pass.**
- [ ] **Step 5: Viết test UI** `ctv-dashboard.spec.ts`: CTV đăng nhập → `/cong-tac-vien/dashboard` hiện đúng số liệu tổng quan; trang Đơn hàng chỉ có lead của mình (SĐT bị che); trang Hoa hồng hiện số tiền và trạng thái; trang Link giới thiệu hiện đúng mã của CTV và nút copy; sidebar không còn mục Khách hàng/Doanh số/Thanh toán/Thông báo/Cài đặt; CTV mở `/admin/dashboard` → bị chuyển về `/cong-tac-vien/dashboard`; chưa đăng nhập mở `/cong-tac-vien/dashboard` → `/login`.
- [ ] **Step 6: Implement FE;** dọn các trang/component mock không còn dùng; `npm run build` và `npm run lint` pass; test UI pass.
- [ ] **Step 7: Commit** `git commit -m "Serve CTV dashboard from real scoped API and drop mock pages"`

---

### Task 9: Tích hợp, hành trình đầu-cuối và chạy thật trên Postgres

**Files:**
- Create: `frontend/e2e/ctv-journey.spec.ts`
- Modify: bất kỳ file nào Task 1–8 để **sửa lỗi tương thích Postgres/tích hợp** tìm được ở đây (ghi rõ trong commit)

**Interfaces:**
- Consumes: toàn bộ các task trước đã merge vào nhánh tích hợp.

- [ ] **Step 1: Viết** `ctv-journey.spec.ts` (1 test dài, các bước `test.step`): khách vào `/ref/<mã>?to=/lien-he` → gửi form → admin thấy lead "CTV giới thiệu" chưa phân công → "Phân công" nhân viên + phường → đổi lead `Chốt thành công` → tạo HĐ từ lead → đổi `Hoàn tất` → trang Hoa hồng có dòng `Chờ chi` → admin đổi `Đã chi` → CTV đăng nhập thấy lead, HĐ, hoa hồng `Đã chi`, tổng khớp → chi tiết Phường của lead đó hiện lead và HĐ.
- [ ] **Step 2: Chạy toàn bộ suite trên SQLite** (cổng 8199/3199): `npx playwright test` (cũ + mới) → báo đúng số pass/fail thật; sửa lỗi gốc rồi chạy lại đến khi xanh.
- [ ] **Step 3: Chạy phần API trên Postgres local** (`DB_DRIVER=postgres DATABASE_URL=postgres://<user>:<pass>@localhost:5432/vnpt_crm_test`, DB trống do người dùng cấp thông tin): khởi động backend **hai lần liền** (kiểm migration idempotent), rồi `npx playwright test e2e/api`; mọi lỗi kiểu chuỗi `COUNT/SUM`, alias, cú pháp SQL phải sửa tận gốc ở service.
- [ ] **Step 4: Kiểm tra** `cd backend && npm run build`, `cd frontend && npm run build && npm run lint` đều pass; `git grep -n -i "claude\|anthropic\|co-authored"` trên các file/commit của nhánh → rỗng.
- [ ] **Step 5: Commit** `git commit -m "Add CTV end-to-end journey test and fix integration issues"`

---

### Task 10: Triển khai production (thủ công — người dùng chạy trên PuTTY, không giao subagent)

- [ ] **Step 1:** Sao lưu DB production trước khi chạy: `sudo -u postgres pg_dump vnpt_crm_db > ~/backup-before-ctv-$(date +%F).sql` (kiểm tra file không rỗng).
- [ ] **Step 2:** Merge nhánh tích hợp vào `main` → push (Vercel tự build FE).
- [ ] **Step 3:** Xác nhận backend không truy cập trực tiếp từ Internet qua cổng nội bộ (ví dụ `curl http://<ip-public>:3005/api/health` phải KHÔNG trả lời) và nginx không ghi đè `X-Forwarded-For` của client bằng giá trị client tự gửi (kiểm tra site conf dùng `$proxy_add_x_forwarded_for` hoặc `$remote_addr`, không dùng biến đọc thẳng từ client).
- [ ] **Step 4:** Trên server: `cd /home/demo/apps/Fontend-VNPT-Nam-Sai-Gon/backend && ./deploy.sh`; xác nhận log khởi động không có lỗi migration và `curl https://crm.vnpthcmc.com.vn:3004/api/health` trả `Postgres`.
- [ ] **Step 5:** Kiểm tra chỉ-đọc trên bản live: không token gọi `/api/customers` → 401; admin vào được `/admin/territories/<id>`, `/admin/ctv-accounts`; Dashboard vẫn đúng số liệu.
- [ ] **Step 6:** Người dùng tự đăng ký 1 CTV thật bằng tài khoản của mình, Admin duyệt, kiểm tra luồng link giới thiệu một lần; xác nhận với anh Khoa các giả định (tỷ lệ hoa hồng, thời điểm sinh hoa hồng, quy tắc điều chuyển KH, đổi mật khẩu mặc định).
- [ ] **Rollback nếu lỗi:** `git revert` các commit đã merge + `./deploy.sh`; cột/bảng thêm mới vô hại với bản code cũ nên không cần khôi phục DB, chỉ dùng file backup khi dữ liệu bị hỏng.
