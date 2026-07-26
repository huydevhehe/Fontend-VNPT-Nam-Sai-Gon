// Tìm kiếm sản phẩm + tin tức, không phân biệt dấu tiếng Việt / hoa-thường.

import { getAllArticles, normalizeForCompare } from "./data";
import { categories } from "@/content/category-map";
import { getCategoryProducts } from "@/content/category-products";
import type { Article, Product } from "./types";

export type ProductSearchResult = { product: Product; categorySlug: string };

export type SearchResults = {
  products: ProductSearchResult[];
  articles: Article[];
};

export function searchSite(query: string): SearchResults {
  const q = normalizeForCompare(query);
  if (!q) return { products: [], articles: [] };

  const products: ProductSearchResult[] = [];
  for (const cat of categories) {
    for (const product of getCategoryProducts(cat.slug)) {
      const haystack = normalizeForCompare(`${product.title} ${product.shortDesc}`);
      if (haystack.includes(q)) {
        products.push({ product, categorySlug: cat.slug });
      }
    }
  }

  const articles = getAllArticles().filter((a) => normalizeForCompare(a.title).includes(q));

  return { products, articles };
}
