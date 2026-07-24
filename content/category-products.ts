// Gộp sản phẩm thật (đọc từ data đã cào, lọc theo sourceId) với sản phẩm fake khai báo
// trong category-map.ts. Tách khỏi category-map.ts vì cần "@/lib/data" (dùng node:fs) —
// chỉ import file này trong Server Component, không import trong Client Component.

import { getProductsBySource } from "@/lib/data";
import type { Product } from "@/lib/types";
import { getCategoryBySlug } from "./category-map";

export function getCategoryProducts(slug: string): Product[] {
  const cat = getCategoryBySlug(slug);
  if (!cat) return [];
  const real = cat.sourceIds.flatMap((id) => getProductsBySource(id));
  return [...real, ...cat.fakeProducts];
}

export function getProductInCatalog(danhMuc: string, slug: string): Product | undefined {
  return getCategoryProducts(danhMuc).find((p) => p.slug === slug);
}
