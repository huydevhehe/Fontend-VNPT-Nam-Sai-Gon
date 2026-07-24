# Nguồn dữ liệu đã cào (dự án VNPT FE)

Toàn bộ dữ liệu sản phẩm/bài viết đang dùng trong dự án được cào (scrape) từ **6 website chính thức của VNPT**, lưu thành file JSON tĩnh, không gọi trực tiếp sang site gốc khi chạy web.

Ngày cào dữ liệu gần nhất: **2026-07-11**.

## 1. Danh sách 6 nguồn gốc

| Mã nguồn | Tên | Link gốc | Nội dung |
|---|---|---|---|
| `metronet` | VNPT MetroNet | https://vnpt.vn | Dịch vụ truyền số liệu / kênh thuê riêng đô thị băng rộng MetroNet |
| `digishop` | VNPT DigiShop | https://digishop.vnpt.vn | Cửa hàng số VNPT — bài tư vấn, khuyến mãi & bảng giá gói cước (MyTV, Internet...) |
| `cloud` | VNPT Cloud | https://cloud.vnpt.vn | Nền tảng điện toán đám mây VNPT — Compute, Database, Storage, AI, Security... |
| `vnptit` | VNPT IT | https://vnptit.vn | Công ty CNTT VNPT — giải pháp Chính phủ số, Doanh nghiệp, Giáo dục, Y tế, Bảo mật |
| `vnpt-technology` | VNPT Technology | https://www.vnpt-technology.vn | Nhà sản xuất thiết bị & công nghệ VNPT — ONT, Mesh WiFi, Camera, SmartBox, 5G... |
| `onesme` | oneSME | https://onesme.vn | Nền tảng chuyển đổi số toàn diện cho doanh nghiệp SME (VNPT) |

## 2. Số lượng đã cào được theo từng nguồn

| Nguồn | Sản phẩm | Bài viết |
|---|---|---|
| MetroNet | 1 | 0 |
| DigiShop | 0 | 3 |
| Cloud | 30 | 0 |
| VNPT IT | 23 | 0 |
| VNPT Technology | 11 | 12 |
| oneSME | 8 | 0 |
| **Tổng** | **73** | **15** |

## 3. File dữ liệu (nằm trong dự án Next.js — `d:\Dự án VNPT\data\`)

```
data/
├── index.json             # metadata chung (ngày cào, danh sách nguồn)
├── metronet.json          # dữ liệu từ vnpt.vn (MetroNet)
├── digishop.json          # dữ liệu từ digishop.vnpt.vn
├── cloud.json             # dữ liệu từ cloud.vnpt.vn
├── vnptit.json             # dữ liệu từ vnptit.vn
├── vnpt-technology.json   # dữ liệu từ vnpt-technology.vn
└── onesme.json             # dữ liệu từ onesme.vn
```

Mỗi file JSON có cấu trúc:
```ts
{
  source: { id, name, url, description },
  products: [ { id, slug, sourceId, category, title, shortDesc, features, pricing, images, bodyText, sourceUrl } ],
  articles: [ { id, slug, sourceId, title, date, category, bodyText, images, sourceUrl } ]
}
```
Mỗi sản phẩm/bài viết đều giữ `sourceUrl` — link chính xác tới trang gốc đã cào, để tra cứu/đối chiếu khi cần.

## 4. Ảnh đã tải về (không chỉ là link)

Toàn bộ ảnh sản phẩm/bài viết **đã được tải về máy thật**, không phải chỉ lưu link trỏ ngược ra site gốc:

```
public/scraped-images/
├── cloud/
├── digishop/
├── metronet/
├── onesme/
├── vnpt-technology/
└── vnptit/
```

- **Tổng: 222 ảnh, ~40 MB.**
- Trong file JSON, mỗi ảnh được tham chiếu bằng đường dẫn local, ví dụ:
  `"/scraped-images/cloud/5a3fb28e759bc110.png"`
- Nghĩa là web **tự phục vụ ảnh, không phụ thuộc site VNPT gốc còn online hay không** — quan trọng để bàn giao/deploy độc lập.

## 5. Script cào dữ liệu (nếu cần cào lại)

Nằm ở: `d:\Dự án VNPT\scripts\scrape\`
- `index.ts` — điều phối chạy cào tất cả nguồn
- `sources/` — logic cào riêng cho từng site (cheerio cho site tĩnh, Playwright cho oneSME vì là SPA)
- `types.ts` — định nghĩa kiểu dữ liệu chung

Chạy lại toàn bộ: `npm run scrape` (trong thư mục `d:\Dự án VNPT`).

## 6. Nơi dữ liệu được đọc & hiển thị

- Lớp đọc dữ liệu: `d:\Dự án VNPT\lib\data.ts` (đọc toàn bộ file trong `data/*.json` lúc build/server-side).
- Các trang dùng dữ liệu này: Trang chủ, Danh mục sản phẩm (`/san-pham`), Chi tiết sản phẩm (`/san-pham/[slug]`), Tin tức (`/tin-tuc`, `/tin-tuc/[slug]`).
