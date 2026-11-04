// Ba nhóm dịch vụ Internet/Truyền hình theo brief. Tách riêng khỏi
// internet-packages.ts vì file đó đọc dữ liệu qua node:fs (chỉ chạy ở server),
// trong khi danh sách nhóm này còn dùng cho menu ở Client Component.

export type InternetGroupSlug =
  | "internet-ca-nhan-gia-dinh"
  | "internet-doanh-nghiep"
  | "truyen-hinh-mytv";

export type InternetGroup = {
  slug: InternetGroupSlug;
  name: string;
  shortDesc: string;
};

export const INTERNET_GROUPS: InternetGroup[] = [
  {
    slug: "internet-ca-nhan-gia-dinh",
    name: "Internet cá nhân/gia đình",
    shortDesc: "Cáp quang tốc độ cao cho hộ gia đình, cá nhân",
  },
  {
    slug: "internet-doanh-nghiep",
    name: "Internet doanh nghiệp",
    shortDesc: "Đường truyền chuyên dụng, cam kết băng thông cho doanh nghiệp",
  },
  {
    slug: "truyen-hinh-mytv",
    name: "Truyền hình MyTV",
    shortDesc: "Combo Internet + Truyền hình MyTV, hơn 180 kênh đặc sắc",
  },
];

export function getInternetGroup(slug: string): InternetGroup | undefined {
  return INTERNET_GROUPS.find((g) => g.slug === slug);
}
