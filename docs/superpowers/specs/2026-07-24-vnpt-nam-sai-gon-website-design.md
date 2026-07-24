# Website VNPT Nam Sài Gòn — Thiết kế (GĐ1: Website hiển thị)

## 1. Mục tiêu & phạm vi

Xây website giới thiệu/marketing công khai cho "VNPT Nam Sài Gòn", dựa trên 18 ảnh
design đã có (`1-trang-chinh/`, `2-trang-lam-them/`, `01-so-do-tong-the.jpg`).

**Trong phạm vi:** toàn bộ trang hiển thị công khai — trang chủ, danh mục & chi tiết
sản phẩm, landing từng nhóm dịch vụ, giải pháp theo đối tượng, tin tức, khuyến mãi,
khách hàng, giới thiệu, liên hệ — kèm form thu lead (chỉ submit, chưa xử lý).

**Ngoài phạm vi (để sau — GĐ2/GĐ3 theo sơ đồ tổng thể):** CRM nội bộ (quản lý lead,
báo giá, hợp đồng, thanh toán, gia hạn, CSKH), dashboard, đăng nhập CTV/admin.

Đây là **project độc lập** với `d:\Dự án VNPT` (VNPT Data Explorer) — giao diện khác
hoàn toàn, chỉ dùng chung dữ liệu đã cào (snapshot một lần, không phụ thuộc đường dẫn
runtime tới project cũ).

## 2. Site map — 22 trang / 9 khuôn mẫu

| # | Khuôn mẫu | Số trang | Route dự kiến | Ưu tiên |
|---|---|---|---|---|
| 1 | Trang chủ | 1 | `/` | Chính |
| 2 | Giới thiệu | 1 | `/gioi-thieu` | Chính |
| 3 | Danh mục sản phẩm (grid 6 nhóm) | 1 | `/san-pham` | Chính |
| 4 | Landing 1 danh mục sản phẩm | 6 | `/san-pham/[danh-muc]` | 3 làm sau (Internet, Cloud&IDC, SmartCA đã có ảnh chính; Vinaphone, Hóa đơn-Thuế, Chuyển đổi số ở nhóm làm thêm) |
| 5 | Chi tiết sản phẩm | 1 (khuôn mẫu dùng chung) | `/san-pham/[danh-muc]/[slug]` | Chính |
| 6 | Giải pháp theo đối tượng | 6 (1 khuôn mẫu) | `/giai-phap/[doi-tuong]` | Làm thêm |
| 7 | Khuyến mãi (danh sách + chi tiết) | 2 | `/khuyen-mai`, `/khuyen-mai/[slug]` | Làm thêm |
| 8 | Tin tức (danh sách + chi tiết) | 2 | `/tin-tuc`, `/tin-tuc/[slug]` | Danh sách: Chính · Chi tiết: Làm thêm |
| 9 | Khách hàng | 1 | `/khach-hang` | Làm thêm |
| — | Liên hệ | 1 | `/lien-he` | Chính |

Nav chuẩn (thống nhất, dùng cho mọi trang — các ảnh có nav hơi lệch nhau nên chốt 1
bộ duy nhất):
`Trang chủ · Giới thiệu · Sản phẩm ▾ · Giải pháp ▾ · Khuyến mãi · Tin tức · Khách hàng · Liên hệ`
+ nút CTA "ĐĂNG KÝ TƯ VẤN" luôn hiện góc phải + nút nổi (gọi/Zalo/đăng ký) góc dưới phải.

## 3. Dữ liệu: thật vs fake

Copy snapshot 1 lần từ `d:\Dự án VNPT\data\*.json` (và `public/scraped-images`) vào
project mới, giữ nguyên schema `Product / Article / Source` (xem `lib/types.ts` bên
project cũ). Không đọc trực tiếp từ project cũ lúc build.

Bảng ánh xạ 6 danh mục UI mới ↔ nguồn dữ liệu cào được:

| Danh mục UI | Nguồn thật | Ghi chú |
|---|---|---|
| Cloud & IDC | `cloud.json` (30 sản phẩm) | Data đầy đủ, dùng thẳng |
| Chuyển đổi số | `vnptit.json` (23) + `onesme.json` (8) | Data đầy đủ, gộp 2 nguồn |
| Băng rộng cố định | `metronet.json` (1) + `vnpt-technology.json` (11 thiết bị) | Mỏng — bổ sung thêm sản phẩm fake (gói Internet/MyTV/Camera AI theo đúng nội dung trong ảnh) |
| Hóa đơn - Thuế | `digishop.json` (3 bài viết, không có sản phẩm) | Chỉ có bài viết → dùng làm tin tức liên quan; toàn bộ sản phẩm/bảng giá trong trang landing là **fake**, theo đúng nội dung ảnh `16-landing-hoa-don-thue.jpg` |
| Di động Vinaphone | Không có | **Fake toàn bộ**, theo đúng nội dung ảnh `15-landing-di-dong-vinaphone.jpg` |
| Chữ ký số (SmartCA) | Không có | **Fake toàn bộ**, theo đúng nội dung ảnh `06-landing-chu-ky-so-smartca.jpg` |

Trang "Giải pháp theo đối tượng" (6 trang): không có nhóm sẵn theo đối tượng trong
data cào — sẽ viết 1 file cấu hình gán sản phẩm thật (đã có) + nội dung fake còn thiếu
cho từng đối tượng, theo đúng nội dung đã vẽ trong `17-giai-phap-theo-doi-tuong.jpg`.

Cách làm cụ thể: 1 file `content/category-map.ts` (hoặc tương đương) định nghĩa cho
mỗi route (danh mục / đối tượng) → danh sách sản phẩm thật (lọc theo `sourceId`/
`category` cũ) + danh sách entry fake viết tay (đúng type `Product`/`Article`, đánh dấu
`isFake: true` để sau này dễ thay bằng data thật khi có). Trang chi tiết sản phẩm dùng
chung 1 component cho cả sản phẩm thật lẫn fake vì cùng type.

## 4. Tech stack

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 — giống stack project
cũ để dễ tái dùng cách đọc data, dễ deploy, và là bản mới nhất hiện có.

Khởi tạo ngay tại `d:\du an  VNPT FE` (cùng cấp với 2 folder ảnh design + tài liệu).

## 5. Cấu trúc thư mục dự kiến

```
app/
  page.tsx                          # Trang chủ
  gioi-thieu/page.tsx
  lien-he/page.tsx
  san-pham/page.tsx                 # Danh mục
  san-pham/[danhMuc]/page.tsx       # Landing danh mục
  san-pham/[danhMuc]/[slug]/page.tsx
  giai-phap/[doiTuong]/page.tsx
  khuyen-mai/page.tsx
  khuyen-mai/[slug]/page.tsx
  tin-tuc/page.tsx
  tin-tuc/[slug]/page.tsx
  khach-hang/page.tsx
  layout.tsx, globals.css
components/
  layout/          # Header, Footer, Breadcrumb, FloatingContact
  sections/         # Hero, StatBar, LeadForm, FaqAccordion, ProcessSteps, TestimonialLogos...
  product/          # ProductCard, ProductGrid, PricingTable, ProductTabs
  article/          # ArticleCard, ArticleGrid
content/
  category-map.ts   # Ánh xạ danh mục UI ↔ data thật/fake
  audience-map.ts    # Ánh xạ giải pháp theo đối tượng
  fake/              # Các entry Product/Article viết tay cho phần chưa có data thật
lib/
  data.ts            # Đọc data/*.json (copy từ project cũ), giữ types.ts
data/                # Snapshot copy 1 lần từ project cũ
public/scraped-images/
```

## 6. Style/theme

Theo đúng tông trong ảnh: nền trắng, khối hero/footer xanh dương đậm (gradient navy →
blue), accent cam cho nút CTA chính (`ĐĂNG KÝ NGAY`, `GỬI THÔNG TIN`), card bo góc nhẹ
+ shadow mềm, icon outline 2 màu (xanh dương/cam) theo từng nhóm dịch vụ. Định nghĩa
màu qua Tailwind theme tokens (`--color-primary`, `--color-accent`...) để đồng bộ toàn
site, không hard-code hex rải rác.

## 7. Bước tiếp theo

Sau khi duyệt spec này, viết implementation plan (writing-plans) theo thứ tự ưu tiên:
1. Scaffold project + design tokens + layout (Header/Footer/FloatingContact)
2. Copy & mapping data (bước 3 ở trên) + component product/article dùng chung
3. 6 trang "Chính" (Trang chủ, Giới thiệu, Danh mục sản phẩm, Chi tiết sản phẩm mẫu,
   Tin tức danh sách, Liên hệ)
4. 11 trang "Làm thêm" (6 landing danh mục, Khuyến mãi ×2, Tin tức chi tiết, Khách
   hàng, Giải pháp theo đối tượng ×6 dùng chung khuôn mẫu)
