# Bàn giao: CTV + Khách hàng PTM/KHDN-chăm + Chi tiết Phường

**Trạng thái:** Đã push lên nhánh `dev` (commit mới nhất `8b99db5`, chứa cả commit code `cd9c63e` và chính file báo cáo này). Backend và frontend đều **build sạch**. Test node:test (backend) chạy thật trên Postgres: **22/22 pass**. Test Playwright (UI + API) **chưa kịp chạy lại lần cuối trên nhánh `dev` đã push** vì hết token giữa chừng — phiên AI tiếp theo phải chạy lại toàn bộ trước khi báo cho Huy là xong.

**Việc phiên AI tiếp theo cần làm, theo đúng thứ tự:**
1. Đọc hết file này.
2. Làm đủ 8 bước ở Mục 4 bên dưới (test + build + lint + kiểm dấu vết AI) — **test phải chạy thật, dán log thật**, không được suy diễn hay báo "chắc là pass".
3. Chỉ khi TẤT CẢ xanh thật: merge `dev` vào `main` + push `main` (bước 7, Mục 4).
4. **Sau khi merge xong, tạo 1 file Word (.docx) trình bày đẹp** để báo cáo cho anh Khoa (dùng skill docx có sẵn trong Claude Code). Nội dung bắt buộc có:
   - **Anh Khoa yêu cầu gì** — tóm tắt đúng ý từ Mục 1 bên dưới (4 điểm Khoa yêu cầu), viết lại cho dễ đọc, không chép nguyên văn file này.
   - **Mình đã làm những gì** — liệt kê tính năng đã hoàn thành (Mục 2), nói rõ bằng ngôn ngữ nghiệp vụ (không thuật ngữ kỹ thuật khó hiểu), có thể kèm vài ảnh chụp màn hình tính năng thật nếu tiện (trang CTV, trang chi tiết Phường, trang khách hàng PTM/KHDN) — chụp bằng Playwright hoặc trình duyệt sau khi server test đang chạy.
   - **Hướng giải quyết so với dự án thực tế hiện tại** — giải thích vì sao chọn cách này (dùng chung dữ liệu CRM thay vì tách hệ thống riêng cho CTV, cấu trúc Phường cố định theo đúng yêu cầu, v.v.), và nói rõ phần đã gộp thêm với việc của phiên AI khác (thống kê Phường, tách API điều chuyển khách hàng) để Khoa biết đây không phải trùng lặp mà là bổ sung.
   - Kết quả test (số liệu pass/fail thật, không cần chi tiết kỹ thuật, chỉ cần dòng tổng kết "đã kiểm tra toàn bộ, X/X pass").
   - Các việc còn để ngỏ cần Khoa xác nhận (tỷ lệ hoa hồng CTV 10%, mật khẩu mặc định nhân viên mới, quy tắc điều chuyển khách hàng — xem lại nội dung quyết định đã chốt trong plan gốc nếu cần).
   - File docx lưu lại đường dẫn rõ ràng, báo cho Huy đường dẫn file đó.

---

## 1. Anh Khoa yêu cầu gì

Từ hội thoại gốc với anh Khoa (07/11/2026, xem lại ảnh chụp chat nếu cần):

1. **Đưa CTV (cộng tác viên) vào chung hệ thống CRM** — vì CTV dùng chung dữ liệu Khách hàng / Lead / Dịch vụ với nhân viên, không nên tách hệ thống riêng.
2. **3 (sau chốt thành 4) vai trò đăng nhập chung**: `Admin`, `AM`, `AM Bán chăm`, `CTV` — nhân viên do Admin tạo, CTV tự đăng ký và chờ Admin duyệt.
3. **Phân biệt khách hàng PTM (tự phát triển) vs KHDN-chăm (địa bàn giao sẵn)** — hai nhóm này có luồng nghiệp vụ điều chuyển người phụ trách khác nhau.
4. **Trang chi tiết từng Phường/Khu phố** — cấu trúc cố định: Lãnh đạo Phường (Bí thư, Chủ tịch, Phó chủ tịch) + 3 phòng ban (Kinh tế hạ tầng, Nội vụ, Văn hóa), kèm danh sách Lead và Hợp đồng của phường đó.

Huy đã duyệt toàn bộ các mục trên và yêu cầu triển khai bằng nhiều subagent chạy song song cho nhanh (quy trình `subagent-driven-development`).

## 2. Mình đã làm gì (toàn bộ, tính tới lúc dừng)

Thực hiện qua kế hoạch chi tiết tại `docs/superpowers/plans/2026-11-07-ctv-customer-territory.md` (**lưu ý: thư mục `docs/` bị gitignore, không có trên remote** — nếu cần đọc lại plan gốc, lấy từ máy Huy hoặc từ lịch sử hội thoại). Plan này chia 9 Task + 1 Task gia cố (H), mỗi task chạy bởi 1 subagent riêng, có review độc lập trước khi gộp. Tất cả đã hoàn thành và gộp vào nhánh `feat/ctv-customer-territory` trước khi tiếp tục bước dưới đây.

**Tính năng đã có (tất cả đã qua code review độc lập + test thật trên cả SQLite lẫn Postgres tại thời điểm merge nội bộ):**

- **Schema nền**: thêm cột/bảng mới hoàn toàn additive — `users` (phone, referral_code, approved_at/by), `customers` (handover_batch/date), `leads`/`contracts` (territory_id, referred_by_ctv_id), `commissions` (contract_id, ctv_id), bảng `ward_officials`, `quarters`.
- **Khoá API nhân viên**: trước đây `/api/customers`, `/api/leads`... **mở công khai không cần đăng nhập** (lỗ hổng lộ SĐT khách thật, đã phát hiện và vá). Giờ toàn bộ route nhân viên yêu cầu `requireAuth + requireStaff`.
- **CTV**: đăng ký công khai (`/cong-tac-vien/dang-ky`) → trạng thái "Chờ duyệt" → Admin duyệt (`/admin/ctv-accounts`) → đăng nhập chung `/login`, vào dashboard riêng `/cong-tac-vien/dashboard` chạy dữ liệu thật (lead/hợp đồng/hoa hồng của chính mình, SĐT khách bị che dạng `0909****56`).
- **Khách hàng PTM/KHDN-chăm**: nhãn hiển thị mới, lọc theo nhóm, theo dõi "đợt giao" (handoverBatch).
- **Form liên hệ công khai** (`/lien-he`) tạo Lead thật, có theo dõi mã giới thiệu CTV (`/ref/<mã>`), có honeypot + giới hạn tốc độ chống spam.
- **Trang chi tiết Phường** (`/admin/territories/<id>`): đúng cấu trúc anh Khoa yêu cầu — Lãnh đạo Phường + 3 phòng ban, Khu phố, Lead, Hợp đồng.
- **Gia cố bảo mật** (Task H, sau khi review toàn nhánh phát hiện): kiểm tra lại trạng thái tài khoản ở mỗi request (không chỉ lúc đăng nhập), giới hạn tốc độ đăng ký/đăng nhập, chặn trùng hoa hồng khi 2 request đồng thời, vá cột `user` (từ khoá dành riêng của Postgres) chưa được quote đúng ở vài chỗ.

**Toàn bộ test thật** (không phải suy diễn): 177-182 test Playwright (API + UI) pass trên SQLite, 116-118 test API pass trên Postgres local, 1 test hành trình đầu-cuối (đăng ký CTV → Lead → Hợp đồng → Hoa hồng → CTV xem lại) pass.

## 3. Phát sinh giữa chừng: trùng việc với phiên AI khác

Trong lúc mình làm, **một phiên AI khác (cũng của Huy) đã làm song song và độc lập** 2 việc trùng phạm vi trên nhánh `dev`:
- Trang chi tiết Phường **phiên bản khác** (có thêm: bảng thống kê dân số/trường học/doanh thu theo phường, và "Đầu mối liên hệ" tự do — khác với "Lãnh đạo Phường + 3 phòng ban" cố định mà anh Khoa yêu cầu).
- **Tách điều chuyển khách hàng thành 2 API riêng**: đổi AM bán hàng và đổi AM chăm sóc (CSKH) độc lập nhau — thay vì 1 API gộp theo nhóm KH như mình làm ban đầu.
- Phiên đó còn **bỏ hẳn SQLite, chỉ chạy Postgres** (quyết định kiến trúc đúng hướng, mình đã theo).

Huy xác nhận đây là việc của chính Huy nhờ phiên khác, và yêu cầu mình **tự quyết định hướng gộp chuẩn nhất**. Mình đã gộp thủ công (không dùng `git merge` tự động vì xung đột ở nhiều file), quyết định như sau:

- **Trang chi tiết Phường**: GIỮ CẢ HAI — khối "Lãnh đạo Phường + 3 phòng ban" (đúng yêu cầu Khoa, của mình) **cộng thêm** khối thống kê (dân số/trường học/doanh thu) và khối "Đầu mối liên hệ" tự do (của phiên kia) — hai khái niệm khác nhau, không phải trùng lặp. Có vá thêm 1 lỗ hổng: API `GET .../contacts` của họ đang mở công khai không cần đăng nhập, đã thêm `requireAuth`.
- **Điều chuyển khách hàng**: chuyển sang mô hình 2 API tách biệt của phiên kia (rõ ràng hơn), **giữ lại** phần validate nhóm khách hàng + theo dõi đợt giao (handoverBatch) + mã lỗi 400/404 đúng chuẩn của mình, và **vá 1 lỗi** họ để sót: cột `user` trong câu INSERT audit log chưa được quote — sẽ lỗi thật trên Postgres nếu không sửa.
- **Database**: theo hướng Postgres-only của họ (đúng, vì production chỉ chạy Postgres). Đã đơn giản hoá lại file `schema-extensions.ts` của mình cho khớp (bỏ hết nhánh code dành cho SQLite).

File đã gộp xong, build sạch cả backend lẫn frontend (`npm run build` cả 2 bên pass), 22/22 test node:test backend pass thật trên Postgres.

## 4. Việc phiên AI tiếp theo PHẢI làm trước khi báo "xong" cho Huy

1. **Chạy lại toàn bộ Playwright trên nhánh `dev` vừa push (commit `cd9c63e`)** — bước này mình **chưa kịp chạy xong** trước khi hết token. Lệnh:
   ```bash
   # Tạo DB Postgres test riêng (local đã có Postgres 17, user postgres không mật khẩu)
   psql -U postgres -h localhost -w -c "DROP DATABASE IF EXISTS vnpt_crm_test"
   psql -U postgres -h localhost -w -c "CREATE DATABASE vnpt_crm_test"

   cd backend && DATABASE_URL="postgres://postgres@localhost:5432/vnpt_crm_test" PORT=8195 CORS_ORIGIN=http://localhost:3195 npm run dev
   # (terminal khác) cd frontend && NEXT_PUBLIC_API_URL=http://localhost:8195/api npm run dev -- -p 3195
   # (terminal khác, sau khi cả 2 server đã sẵn sàng)
   cd frontend && E2E_BASE_URL=http://localhost:3195 E2E_API_URL=http://localhost:8195/api npx playwright test --workers=2
   ```
   Nếu có test fail — **đọc kỹ lỗi thật**, đa số khả năng là do UI mới của phiên kia (bảng thống kê, đầu mối liên hệ) chưa có test riêng, hoặc do 2 bên đụng route/selector. Sửa tận gốc, không bỏ qua.

2. **Chạy test node:test backend riêng** (vì 2 file test có `initDatabase()` không chạy song song được — lỗi race DDL Postgres nếu chạy chung tiến trình):
   ```bash
   cd backend && DATABASE_URL="postgres://postgres@localhost:5432/vnpt_crm_test" npx tsx --test --test-concurrency=1 src/database/schema-extensions.test.ts src/modules/commission/commission.service.test.ts src/middleware/rate-limit.test.ts src/middleware/require-role.test.ts src/modules/ctv/ctv.service.test.ts
   ```

3. **`npm run build`** cả `backend/` và `frontend/` — lúc mình dừng cả 2 đều sạch, nhưng kiểm lại cho chắc sau khi sửa gì thêm.

4. **`npm run lint`** ở frontend — mình **chưa chạy lại** trên bản gộp cuối. Có thể có cảnh báo pre-existing (đã biết từ trước, không phải lỗi mới) nhưng cần xác nhận không có lỗi mới do gộp gây ra.

5. **Kiểm tra không có dấu vết AI** trong code/commit (quy tắc bắt buộc của Huy — xem CLAUDE.md gốc):
   ```bash
   git grep -n -i -E "claude|anthropic|co-authored" -- . ':!docs' ':!HANDOFF-CTV-PHUONG.md'
   ```
   Phải rỗng. Commit message cũng tuyệt đối không có dòng `Co-Authored-By`.

6. **Việc nhỏ chưa làm xong (không chặn, nhưng nên làm nếu còn thời gian)**:
   - Giới hạn đăng nhập hiện tính theo cặp (IP, tên đăng nhập) — chống brute-force 1 tài khoản, nhưng chưa chặn được kiểu dò nhiều tài khoản khác nhau từ 1 IP (vì mật khẩu mặc định nhân viên mới dễ đoán: `<mã NV>@Vnpt2026`). Có thể thêm 1 giới hạn lỏng hơn theo IP (ví dụ 30-50 lần sai/15 phút) dùng chung `createRateLimiter` đã có sẵn ở `backend/src/middleware/rate-limit.ts`.
   - Chưa test lại UI của 2 khối mới gộp vào trang chi tiết Phường (thống kê + đầu mối liên hệ) theo đúng chuẩn test của dự án (Playwright, test thật, không giả định).

7. **SAU KHI** tất cả xanh thật (không suy diễn, có log thật) — merge `dev` vào `main` và push `main`, theo đúng yêu cầu Huy đã dặn ("push mege main nhé").
   ```bash
   git checkout main && git pull
   git merge dev
   # chạy lại build + test 1 lần nữa trên main sau merge
   git push origin main
   ```

8. **Không merge vào `main` nếu còn test fail hoặc build lỗi.** Báo lại cho Huy cụ thể lỗi gì nếu không tự sửa được.

## 5. Quy tắc bắt buộc khi làm tiếp (từ CLAUDE.md của Huy — không có ngoại lệ)

- Luôn nghĩ/trả lời/hỏi bằng tiếng Việt.
- Commit message tiếng Anh, ngắn gọn.
- **TUYỆT ĐỐI không** để lại bất kỳ dấu vết AI/Claude/Anthropic nào trong code, comment, commit, PR — kể cả dòng `Co-Authored-By`.
- Luôn hỏi Huy trước khi làm hành động thay đổi/thực thi quan trọng (đặc biệt: merge vào `main`, push, xoá dữ liệu) — trừ hành động chỉ đọc.

## 6. Thông tin kỹ thuật tham khảo nhanh

- Server production: `crm.vnpthcmc.com.vn:3004` (nginx, pm2 app `vnpt-backend-api` cổng 3005 nội bộ), Postgres production đã có dữ liệu thật — **Task 10 (deploy) chưa chạy, không tự ý deploy production**, chỉ merge code lên `main`/`dev` thôi.
- Postgres local (máy Windows) dùng để test: `psql -U postgres -h localhost -w`, không cần mật khẩu.
- Tài khoản test có sẵn (seed data): `admin` / `admin@Vnpt2026`, `VNPT-AM-01` / `VNPT-AM-01@Vnpt2026`.
