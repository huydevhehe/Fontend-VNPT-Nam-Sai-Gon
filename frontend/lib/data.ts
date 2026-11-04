// Lớp đọc & truy vấn dữ liệu đã cào (data/*.json). Chạy ở server component.

import fs from "node:fs";
import path from "node:path";
import type { Article, Product, ScrapeResult, Source } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const PUBLIC_DIR = path.join(process.cwd(), "public");
// Ảnh cào được dưới ngưỡng này thường là icon/logo/banner lặp lại của site nguồn,
// không phải ảnh nội dung thật (đo thực tế: icon rác nặng vài trăm byte tới ~7KB,
// ảnh thật nhẹ nhất cũng ~10KB trở lên).
const MIN_REAL_IMAGE_BYTES = 8000;

function isRealImage(src: string): boolean {
  if (!src.startsWith("/scraped-images/")) return true;
  try {
    return fs.statSync(path.join(PUBLIC_DIR, src)).size >= MIN_REAL_IMAGE_BYTES;
  } catch {
    return false;
  }
}

function stripDiacritics(s: string): string {
  let out = "";
  for (const ch of s.normalize("NFD")) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 0x0300 && code <= 0x036f) continue; // combining diacritical marks
    out += ch;
  }
  return out.replaceAll("đ", "d").replaceAll("Đ", "D");
}

export function normalizeForCompare(s: string): string {
  return stripDiacritics(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function toTitleCase(s: string): string {
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

// Một số nguồn cào bị mất dấu tiếng Việt ở title (lấy từ slug thay vì title thật),
// trong khi bodyText vẫn còn heading "## ..." giữ đủ dấu. Nếu heading đó khớp nội dung
// với title (chỉ khác dấu/hoa-thường) thì dùng lại heading để khôi phục tiêu đề đúng.
function recoverArticleTitle(article: Article): Article {
  const target = normalizeForCompare(article.title);
  const headings = article.bodyText
    .split("\n")
    .filter((l) => l.startsWith("## "))
    .map((l) => l.slice(3).trim());
  const match = headings.find((h) => normalizeForCompare(h) === target);
  return match ? { ...article, title: toTitleCase(match) } : article;
}

type Dataset = {
  sources: Source[];
  products: Product[];
  articles: Article[];
  generatedAt: string;
};

let cache: Dataset | null = null;

function loadDataset(): Dataset {
  if (cache) return cache;
  const sources: Source[] = [];
  const products: Product[] = [];
  const articles: Article[] = [];
  let generatedAt = "";

  let files: string[] = [];
  try {
    files = fs.readdirSync(DATA_DIR);
  } catch {
    files = [];
  }

  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    const full = path.join(DATA_DIR, f);
    try {
      const raw = fs.readFileSync(full, "utf8");
      if (f === "index.json") {
        const idx = JSON.parse(raw) as { generatedAt?: string };
        generatedAt = idx.generatedAt ?? "";
        continue;
      }
      const r = JSON.parse(raw) as ScrapeResult;
      sources.push(r.source);
      products.push(...r.products.map((p) => ({ ...p, images: p.images.filter(isRealImage) })));
      articles.push(
        ...r.articles.map((a) => recoverArticleTitle({ ...a, images: a.images.filter(isRealImage) })),
      );
    } catch {
      // bỏ file lỗi
    }
  }

  cache = { sources, products, articles, generatedAt };
  return cache;
}

export function getSources(): Source[] {
  return loadDataset().sources.slice().sort((a, b) => a.name.localeCompare(b.name));
}

export function getAllProducts(): Product[] {
  return loadDataset().products;
}

export function getAllArticles(): Article[] {
  return loadDataset().articles;
}

export function getProductBySlug(slug: string): Product | undefined {
  return loadDataset().products.find((p) => p.slug === slug);
}

export function getArticleBySlug(slug: string): Article | undefined {
  return loadDataset().articles.find((a) => a.slug === slug);
}

export function getProductsBySource(sourceId: string): Product[] {
  return loadDataset().products.filter((p) => p.sourceId === sourceId);
}

export function getArticlesBySource(sourceId: string): Article[] {
  return loadDataset().articles.filter((a) => a.sourceId === sourceId);
}

export function getCategories(): Array<{ name: string; count: number }> {
  const map = new Map<string, number>();
  for (const p of loadDataset().products) {
    map.set(p.category, (map.get(p.category) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getStats() {
  const d = loadDataset();
  return {
    sourceCount: d.sources.length,
    productCount: d.products.length,
    articleCount: d.articles.length,
    generatedAt: d.generatedAt,
  };
}

export function getFeaturedProducts(limit = 8): Product[] {
  const d = loadDataset();
  const byScore = d.products.slice().sort((a, b) => scoreProduct(b) - scoreProduct(a));
  const perSource = new Map<string, number>();
  const out: Product[] = [];
  for (const p of byScore) {
    const n = perSource.get(p.sourceId) ?? 0;
    if (n >= 3) continue;
    perSource.set(p.sourceId, n + 1);
    out.push(p);
    if (out.length >= limit) break;
  }
  return out;
}

function scoreProduct(p: Product): number {
  return (
    (p.images.length > 0 ? 3 : 0) +
    p.pricing.length * 2 +
    Math.min(p.features.length, 5) +
    (p.shortDesc.length > 40 ? 1 : 0)
  );
}
