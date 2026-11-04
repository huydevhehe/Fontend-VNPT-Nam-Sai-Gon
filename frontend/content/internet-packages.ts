// Gói cước Internet / Truyền hình chia theo 3 nhóm của brief:
// Internet cá nhân/gia đình - Internet doanh nghiệp - Truyền hình MyTV.
//
// Gói cá nhân/gia đình và MyTV lấy từ dữ liệu digishop đã cào (data/digishop.json);
// gói doanh nghiệp hiện chưa có nguồn cào nên dùng dữ liệu khai báo tay trong
// category-map.ts. Chỉ dùng trong Server Component (đọc file qua @/lib/data).

import { getAllProducts } from "@/lib/data";
import type { Product } from "@/lib/types";
import { getCategoryBySlug } from "./category-map";
import type { InternetGroupSlug } from "./internet-groups";

export { INTERNET_GROUPS, getInternetGroup } from "./internet-groups";
export type { InternetGroup, InternetGroupSlug } from "./internet-groups";

/** Tên nhóm dùng trong trường `category` của dữ liệu đã cào. */
const CRAWLED_CATEGORY: Partial<Record<InternetGroupSlug, string>> = {
  "internet-ca-nhan-gia-dinh": "Internet cá nhân/gia đình",
  "truyen-hinh-mytv": "Truyền hình MyTV",
};

/** Slug sản phẩm khai báo tay dùng cho nhóm chưa có nguồn cào. */
const FALLBACK_PRODUCT_SLUG: Partial<Record<InternetGroupSlug, string[]>> = {
  "internet-doanh-nghiep": ["internet-doanh-nghiep"],
};

export function getInternetPackages(slug: InternetGroupSlug): Product[] {
  const categoryName = CRAWLED_CATEGORY[slug];
  if (categoryName) {
    return getAllProducts().filter((p) => p.category === categoryName);
  }

  const wanted = FALLBACK_PRODUCT_SLUG[slug] ?? [];
  const fakes = getCategoryBySlug("bang-rong-co-dinh")?.fakeProducts ?? [];
  return fakes.filter((p) => wanted.includes(p.slug));
}

/**
 * Giá thấp nhất của nhóm, dùng hiển thị "chỉ từ ...".
 * Bảng giá mỗi nguồn có số cột khác nhau nên dò theo ô có đơn vị tiền ("đ")
 * thay vì cố định vị trí cột.
 */
export function getLowestPrice(products: Product[]): string | undefined {
  const parsed = products
    .flatMap((p) => p.pricing)
    .flatMap((table) => table.rows)
    .flat()
    .filter((cell) => cell.includes("đ") && /\d/.test(cell))
    .map((label) => ({ label, value: Number(label.replace(/\D/g, "")) }))
    .filter((x) => Number.isFinite(x.value) && x.value > 0)
    .sort((a, b) => a.value - b.value);
  return parsed[0]?.label;
}
