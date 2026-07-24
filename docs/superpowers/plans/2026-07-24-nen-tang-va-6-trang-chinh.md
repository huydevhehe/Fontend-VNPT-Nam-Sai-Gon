# VNPT Nam Sài Gòn — Nền tảng & 6 Trang Chính — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold Next.js project VNPT Nam Sài Gòn, dựng data layer (copy snapshot dữ
liệu thật đã cào + mapping danh mục thật/fake), dựng layout dùng chung (Header/Footer/
Floating contact), và hoàn chỉnh 6 trang ưu tiên: Trang chủ, Giới thiệu, Danh mục sản
phẩm, Chi tiết sản phẩm (khuôn mẫu), Tin tức (danh sách), Liên hệ.

**Architecture:** Next.js App Router, server components mặc định (đọc data lúc
render), 1 file `content/category-map.ts` làm nguồn sự thật cho 6 danh mục sản phẩm
(gộp sản phẩm thật lọc theo `sourceId` + sản phẩm fake viết tay cùng type `Product`).
Component chia 4 nhóm: `layout/` (khung trang), `sections/` (khối lặp lại nhiều trang),
`product/`, `article/`.

**Tech Stack:** Next.js 16.2.10, React 19.2.4, TypeScript 5, Tailwind CSS 4,
lucide-react (icon), tsx + node:test (test data layer).

## Global Constraints

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 — copy cấu hình gốc
  từ project tham khảo `d:\Dự án VNPT` (chỉ đọc, không sửa project đó).
- Toàn bộ UI copy bằng tiếng Việt.
- Design token màu: `--color-vnpt: #005baa`, `--color-vnpt-dark: #00468c`,
  `--color-vnpt-darker: #002f5e`, `--color-vnpt-light: #eef4fa`,
  `--color-vnpt-accent: #f26522`. Font: Montserrat (heading) + Be Vietnam Pro (body),
  nạp qua `next/font/google`.
- Dữ liệu thật: copy snapshot 1 lần từ `d:\Dự án VNPT\data\*.json` và
  `d:\Dự án VNPT\public\scraped-images` vào project mới — không đọc runtime từ project
  cũ.
- 6 danh mục sản phẩm chuẩn (slug cố định): `bang-rong-co-dinh`, `di-dong-vinaphone`,
  `hoa-don-thue`, `chu-ky-so`, `cloud-idc`, `chuyen-doi-so`.
- Phạm vi plan này: **chỉ 6 trang "chính"** (Trang chủ, Giới thiệu, Danh mục sản phẩm,
  Chi tiết sản phẩm mẫu, Tin tức danh sách, Liên hệ) + nền tảng dùng chung. 6 trang
  landing danh mục, trang chi tiết tin tức/khuyến mãi, khách hàng, giải pháp theo đối
  tượng (11 trang còn lại) là **plan riêng sau** — một số link trong Header/Footer sẽ
  trỏ tới các route đó và tạm thời 404 cho tới khi plan sau chạy; đây là chủ đích, không
  phải lỗi.
- Form thu lead ở giai đoạn này chỉ validate + hiển thị xác nhận phía client, **chưa**
  gọi API/lưu server.

---

## File Structure

```
package.json, tsconfig.json, next.config.ts, postcss.config.mjs, eslint.config.mjs
.gitignore
app/
  layout.tsx, globals.css, page.tsx
  gioi-thieu/page.tsx
  lien-he/page.tsx
  san-pham/page.tsx
  san-pham/[danhMuc]/[slug]/page.tsx
  tin-tuc/page.tsx
components/
  layout/Shell.tsx        — bọc Header + main + Footer + FloatingContact
  layout/Header.tsx        — top bar + nav + CTA
  layout/Footer.tsx
  layout/FloatingContact.tsx
  layout/Breadcrumb.tsx
  sections/LeadForm.tsx     — client, form đăng ký tư vấn dùng lại nhiều trang
  sections/StatBar.tsx
  product/ProductCard.tsx
  product/PricingTable.tsx
  article/ArticleCard.tsx
lib/
  types.ts, data.ts, data.test.ts
content/
  category-map.ts          — data thuần (categories, fakeProducts, getCategoryBySlug) — KHÔNG import lib/data.ts, an toàn dùng trong "use client"
  category-products.ts     — hàm gộp sản phẩm thật+fake (dùng lib/data.ts, chỉ server component)
  category-map.test.ts
data/            — snapshot copy từ project cũ
public/scraped-images/ — snapshot copy từ project cũ
```

---

### Task 1: Scaffold project (config + build pipeline)

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `.gitignore`
- Create: `app/layout.tsx` (placeholder, hoàn thiện ở Task 2)
- Create: `app/page.tsx` (placeholder, hoàn thiện ở Task 7)

**Interfaces:**
- Produces: script `npm run dev|build|start|lint|test` dùng cho mọi task sau.

- [ ] **Step 1: Tạo `package.json`**

```json
{
  "name": "vnpt-nam-sai-gon",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "tsx --test lib/data.test.ts content/category-map.test.ts"
  },
  "dependencies": {
    "next": "16.2.10",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.10",
    "tailwindcss": "^4",
    "tsx": "^4.23.0",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Tạo `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Tạo `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

- [ ] **Step 4: Tạo `postcss.config.mjs`**

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

- [ ] **Step 5: Tạo `eslint.config.mjs`**

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
```

- [ ] **Step 6: Tạo `.gitignore`**

```
node_modules/
.next/
out/
build/
next-env.d.ts
.env*
!.env.example
*.tsbuildinfo
```

- [ ] **Step 7: Tạo placeholder `app/layout.tsx`**

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VNPT Nam Sài Gòn",
  description: "Đồng hành cùng bạn trên hành trình Chuyển đổi số",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 8: Tạo placeholder `app/page.tsx`**

```tsx
export default function HomePage() {
  return <main>VNPT Nam Sài Gòn — đang xây dựng</main>;
}
```

- [ ] **Step 9: Cài dependencies**

Run: `npm install`
Expected: cài xong, tạo `node_modules/` và `package-lock.json`, không lỗi.

- [ ] **Step 10: Build thử để xác nhận pipeline hoạt động**

Run: `npm run build`
Expected: `Compiled successfully`, thoát code 0.

- [ ] **Step 11: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs eslint.config.mjs .gitignore app/layout.tsx app/page.tsx
git commit -m "chore: scaffold Next.js 16 + React 19 + Tailwind 4 project"
```

---

### Task 2: Design tokens, fonts, root layout

**Files:**
- Create: `app/globals.css`
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces: Tailwind utility classes `bg-vnpt`, `text-vnpt-accent`, `bg-vnpt-light`,
  v.v. (tự sinh từ token `--color-*` trong `@theme`); biến font `--font-sans`,
  `--font-display` dùng trong mọi component sau.

- [ ] **Step 1: Tạo `app/globals.css`**

```css
@import "tailwindcss";

@theme {
  --color-vnpt: #005baa;
  --color-vnpt-dark: #00468c;
  --color-vnpt-darker: #002f5e;
  --color-vnpt-light: #eef4fa;
  --color-vnpt-accent: #f26522;
  --font-sans: var(--font-be-vn), ui-sans-serif, system-ui, "Segoe UI", sans-serif;
  --font-display: var(--font-montserrat), var(--font-be-vn), ui-sans-serif, sans-serif;
}

:root {
  --background: #ffffff;
  --foreground: #0b1220;
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5 {
  font-family: var(--font-display);
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
```

- [ ] **Step 2: Cập nhật `app/layout.tsx` — nạp font + globals.css**

```tsx
import type { Metadata } from "next";
import { Montserrat, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  weight: ["500", "600", "700", "800"],
  subsets: ["vietnamese", "latin"],
  variable: "--font-montserrat",
});

const beVN = Be_Vietnam_Pro({
  weight: ["400", "500", "600", "700"],
  subsets: ["vietnamese", "latin"],
  variable: "--font-be-vn",
});

export const metadata: Metadata = {
  title: "VNPT Nam Sài Gòn - Đồng hành cùng bạn trên hành trình Chuyển đổi số",
  description:
    "Giải pháp số toàn diện cho Cá nhân, Hộ kinh doanh, Doanh nghiệp và Cơ quan Nhà nước.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${montserrat.variable} ${beVN.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-white text-slate-800">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: `Compiled successfully`.

- [ ] **Step 4: Manual check**

Run: `npm run dev`, mở `http://localhost:3000`. Kỳ vọng: chữ "VNPT Nam Sài Gòn — đang
xây dựng" hiển thị đúng font Be Vietnam Pro, không lỗi console. Dừng server (Ctrl+C).

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: design tokens, fonts, root layout"
```

---

### Task 3: Data layer — types + đọc data thật đã cào

**Files:**
- Create: `lib/types.ts`
- Create: `lib/data.ts`
- Create: `lib/data.test.ts`
- Create: `data/*.json` (copy)
- Create: `public/scraped-images/**` (copy)

**Interfaces:**
- Produces: `getSources()`, `getAllProducts()`, `getAllArticles()`,
  `getProductBySlug(slug)`, `getArticleBySlug(slug)`, `getProductsBySource(sourceId)`,
  `getArticlesBySource(sourceId)`, `getCategories()`, `getStats()`,
  `getFeaturedProducts(limit?)` — dùng ở Task 4 trở đi. Type `Product` có thêm field
  optional `isFake?: boolean` để phân biệt sản phẩm viết tay khỏi sản phẩm cào thật.

- [ ] **Step 1: Copy dữ liệu thật từ project tham khảo**

Run:
```bash
mkdir -p "data" "public/scraped-images"
cp "/d/Dự án VNPT/data/"*.json "data/"
cp -r "/d/Dự án VNPT/public/scraped-images/"* "public/scraped-images/"
```
Expected: `data/` có 7 file (`cloud.json`, `digishop.json`, `index.json`,
`metronet.json`, `onesme.json`, `vnpt-technology.json`, `vnptit.json`);
`public/scraped-images/` có các thư mục con theo nguồn.

- [ ] **Step 2: Tạo `lib/types.ts`**

```ts
// Kiểu dữ liệu sản phẩm/bài viết. Product có isFake để đánh dấu entry viết tay
// (chưa cào được), cùng cấu trúc với sản phẩm thật nên mọi UI dùng chung 1 component.

export type Source = {
  id: string;
  name: string;
  url: string;
  logo?: string;
  description?: string;
};

export type Pricing = {
  name?: string;
  columns: string[];
  rows: string[][];
  note?: string;
};

export type Product = {
  id: string;
  slug: string;
  sourceId: string;
  category: string;
  title: string;
  shortDesc: string;
  features: string[];
  pricing: Pricing[];
  images: string[];
  bodyText: string;
  sourceUrl: string;
  isFake?: boolean;
};

export type Article = {
  id: string;
  slug: string;
  sourceId: string;
  title: string;
  date?: string;
  category?: string;
  bodyText: string;
  images: string[];
  sourceUrl: string;
};

export type ScrapeResult = {
  source: Source;
  products: Product[];
  articles: Article[];
};
```

- [ ] **Step 3: Tạo `lib/data.ts`**

```ts
// Lớp đọc & truy vấn dữ liệu đã cào (data/*.json). Chạy ở server component.

import fs from "node:fs";
import path from "node:path";
import type { Article, Product, ScrapeResult, Source } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

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
      products.push(...r.products);
      articles.push(...r.articles);
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
```

- [ ] **Step 4: Viết test `lib/data.test.ts`**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getSources,
  getAllProducts,
  getAllArticles,
  getProductBySlug,
  getProductsBySource,
  getStats,
} from "./data";

test("getSources trả về đúng 6 nguồn đã cào", () => {
  const sources = getSources();
  assert.equal(sources.length, 6);
  assert.ok(sources.some((s) => s.id === "cloud"));
});

test("getAllProducts trả về mảng không rỗng", () => {
  assert.ok(getAllProducts().length > 0);
});

test("getProductBySlug tìm đúng sản phẩm thật đã biết", () => {
  const p = getProductBySlug("cloud-vnpt-cloud-server");
  assert.ok(p);
  assert.equal(p?.sourceId, "cloud");
  assert.equal(p?.title, "VNPT Cloud Server");
});

test("getProductBySlug trả về undefined khi không tồn tại", () => {
  assert.equal(getProductBySlug("khong-ton-tai"), undefined);
});

test("getProductsBySource lọc đúng theo nguồn", () => {
  const cloudProducts = getProductsBySource("cloud");
  assert.ok(cloudProducts.length > 0);
  assert.ok(cloudProducts.every((p) => p.sourceId === "cloud"));
});

test("getStats trả về số liệu khớp getAllProducts/getAllArticles", () => {
  const stats = getStats();
  assert.equal(stats.productCount, getAllProducts().length);
  assert.equal(stats.articleCount, getAllArticles().length);
});
```

- [ ] **Step 5: Chạy test, xác nhận PASS**

Run: `npx tsx --test lib/data.test.ts`
Expected: tất cả 6 test PASS (0 fail).

- [ ] **Step 6: Commit**

```bash
git add lib/types.ts lib/data.ts lib/data.test.ts data public/scraped-images
git commit -m "feat: data layer đọc snapshot dữ liệu đã cào + test"
```

---

### Task 4: `content/category-map.ts` — 6 danh mục sản phẩm (thật + fake)

**Files:**
- Create: `content/category-map.ts`
- Create: `content/category-products.ts`
- Create: `content/category-map.test.ts`

**Interfaces:**
- Consumes: `getProductsBySource(sourceId)` từ `lib/data.ts` (Task 3) — chỉ trong
  `category-products.ts`.
- Produces: `categories: CategoryConfig[]`, `getCategoryBySlug(slug)` (từ
  `category-map.ts`, KHÔNG import `lib/data.ts` nên dùng an toàn trong Client Component
  như Header ở Task 5); `getCategoryProducts(slug)`, `getProductInCatalog(danhMuc, slug)`
  (từ `category-products.ts`, chỉ dùng trong Server Component) — dùng ở mọi trang sản
  phẩm từ Task 7 trở đi.

**Lưu ý quan trọng:** `category-map.ts` và `category-products.ts` tách riêng vì lý do
kỹ thuật: `Header.tsx` (Task 5) là Client Component và cần đọc `categories` để dựng
menu. Nếu `categories` nằm chung file với hàm gọi `lib/data.ts` (dùng `node:fs`), toàn
bộ import tĩnh của file đó — kể cả `fs` — sẽ bị kéo vào bundle trình duyệt và Next.js sẽ
báo lỗi build `Module not found: Can't resolve 'fs'`. Tách file là cách chuẩn để tránh
lỗi này.

- [ ] **Step 1: Tạo `content/category-map.ts`** (data thuần, không import `lib/data.ts`)

```ts
// Ánh xạ 6 danh mục sản phẩm hiển thị trên site với dữ liệu thật đã cào (lọc theo
// sourceId) + sản phẩm viết tay (isFake: true) cho phần chưa có nguồn cào tương ứng.
// Xem docs/superpowers/specs/2026-07-24-vnpt-nam-sai-gon-website-design.md mục 3.

import type { LucideIcon } from "lucide-react";
import { Cloud, FileSignature, Receipt, Smartphone, Wifi, Workflow } from "lucide-react";
import type { Product } from "@/lib/types";

export type CategoryConfig = {
  slug: string;
  name: string;
  shortDesc: string;
  icon: LucideIcon;
  sourceIds: string[];
  fakeProducts: Product[];
};

const bangRongFake: Product[] = [
  {
    id: "fake-bang-rong-internet-gia-dinh",
    slug: "internet-gia-dinh",
    sourceId: "vnpt-nam-sai-gon",
    category: "Băng rộng cố định",
    title: "Internet Gia đình",
    shortDesc: "Cáp quang tốc độ cao, ổn định, phù hợp mọi nhu cầu gia đình.",
    features: ["Tốc độ tới 1000Mbps", "Ổn định 24/7", "Miễn phí lắp đặt", "Modem WiFi 6"],
    pricing: [
      {
        name: "Gói cước Internet Gia đình",
        columns: ["Gói", "Tốc độ", "Giá/tháng"],
        rows: [
          ["Fiber Eco", "150 Mbps", "165.000đ"],
          ["Fiber Plus", "300 Mbps", "220.000đ"],
          ["Fiber Turbo", "500 Mbps", "275.000đ"],
        ],
        note: "Giá chưa bao gồm VAT",
      },
    ],
    images: [],
    bodyText:
      "Internet Gia đình VNPT mang tới đường truyền cáp quang ổn định, tốc độ cao, đáp ứng nhu cầu lướt web, xem phim, học tập và làm việc trực tuyến của cả gia đình.",
    sourceUrl: "#",
    isFake: true,
  },
  {
    id: "fake-bang-rong-internet-doanh-nghiep",
    slug: "internet-doanh-nghiep",
    sourceId: "vnpt-nam-sai-gon",
    category: "Băng rộng cố định",
    title: "Internet Doanh nghiệp",
    shortDesc: "Đường truyền cáp quang chuyên dụng, cam kết băng thông cho doanh nghiệp.",
    features: ["Cam kết tốc độ quốc tế", "IP tĩnh", "Hỗ trợ kỹ thuật 24/7", "SLA rõ ràng"],
    pricing: [
      {
        name: "Gói cước Internet Doanh nghiệp",
        columns: ["Gói", "Tốc độ", "Giá/tháng"],
        rows: [["Fiber VIP", "1000 Mbps", "Liên hệ"]],
      },
    ],
    images: [],
    bodyText:
      "Internet Doanh nghiệp VNPT cung cấp đường truyền cáp quang chuyên dụng, cam kết băng thông và thời gian phản hồi sự cố cho doanh nghiệp vừa và nhỏ.",
    sourceUrl: "#",
    isFake: true,
  },
  {
    id: "fake-bang-rong-mytv",
    slug: "truyen-hinh-mytv",
    sourceId: "vnpt-nam-sai-gon",
    category: "Băng rộng cố định",
    title: "Truyền hình MyTV",
    shortDesc: "Hơn 180 kênh truyền hình đặc sắc, kho phim đa dạng.",
    features: ["180+ kênh truyền hình", "Kho phim VOD khổng lồ", "Xem trên nhiều thiết bị"],
    pricing: [],
    images: [],
    bodyText:
      "MyTV là dịch vụ truyền hình số của VNPT với hơn 180 kênh trong nước và quốc tế, kho phim theo yêu cầu phong phú, xem mọi lúc mọi nơi trên TV, điện thoại, máy tính bảng.",
    sourceUrl: "#",
    isFake: true,
  },
];

const diDongVinaphoneFake: Product[] = [
  {
    id: "fake-vinaphone-max100",
    slug: "vinaphone-max100",
    sourceId: "vnpt-nam-sai-gon",
    category: "Di động Vinaphone",
    title: "VinaPhone MAX100",
    shortDesc: "Gói cước trả trước 30GB data tốc độ cao, ưu đãi gọi nội mạng.",
    features: ["30GB data tốc độ cao", "Miễn phí gọi nội mạng dưới 20 phút", "50 SMS nội mạng"],
    pricing: [
      {
        columns: ["Gói", "Chu kỳ", "Giá"],
        rows: [["VinaPhone MAX100", "30 ngày", "100.000đ"]],
      },
    ],
    images: [],
    bodyText: "Gói cước trả trước MAX100 dành cho khách hàng cá nhân có nhu cầu sử dụng data tốc độ cao và gọi thoại nội mạng thường xuyên.",
    sourceUrl: "#",
    isFake: true,
  },
  {
    id: "fake-vinaphone-vd149",
    slug: "vinaphone-vd149",
    sourceId: "vnpt-nam-sai-gon",
    category: "Di động Vinaphone",
    title: "VinaPhone VD149",
    shortDesc: "Gói cước trả sau 45GB, miễn phí toàn bộ cuộc gọi nội mạng.",
    features: ["45GB data tốc độ cao", "Miễn phí tất cả cuộc gọi nội mạng", "150 phút gọi ngoại mạng"],
    pricing: [
      {
        columns: ["Gói", "Chu kỳ", "Giá"],
        rows: [["VinaPhone VD149", "30 ngày", "149.000đ"]],
      },
    ],
    images: [],
    bodyText: "Gói cước trả sau VD149 phù hợp khách hàng cá nhân và doanh nghiệp cần data lớn và gọi thoại không giới hạn nội mạng.",
    sourceUrl: "#",
    isFake: true,
  },
  {
    id: "fake-vinaphone-esim",
    slug: "esim-vinaphone",
    sourceId: "vnpt-nam-sai-gon",
    category: "Di động Vinaphone",
    title: "eSIM VinaPhone",
    shortDesc: "Kích hoạt SIM số ngay trên điện thoại, không cần SIM vật lý.",
    features: ["Kích hoạt online trong 1 phút", "Không cần SIM vật lý", "Hỗ trợ mọi gói cước"],
    pricing: [],
    images: [],
    bodyText: "eSIM VinaPhone cho phép khách hàng đăng ký và kích hoạt số thuê bao hoàn toàn trực tuyến, không cần chờ giao SIM vật lý.",
    sourceUrl: "#",
    isFake: true,
  },
  {
    id: "fake-vinaphone-roaming",
    slug: "roaming-quoc-te-vinaphone",
    sourceId: "vnpt-nam-sai-gon",
    category: "Di động Vinaphone",
    title: "Roaming quốc tế VinaPhone",
    shortDesc: "Kết nối hơn 200 quốc gia, giá cước ưu đãi khi ra nước ngoài.",
    features: ["200+ quốc gia và vùng lãnh thổ", "Đăng ký nhanh qua ứng dụng", "Gói ngày/gói data linh hoạt"],
    pricing: [],
    images: [],
    bodyText: "Dịch vụ Roaming quốc tế VinaPhone giúp khách hàng giữ liên lạc và sử dụng data khi công tác, du lịch nước ngoài với mức cước ưu đãi.",
    sourceUrl: "#",
    isFake: true,
  },
];

const hoaDonThueFake: Product[] = [
  {
    id: "fake-hoa-don-vnpt-invoice",
    slug: "vnpt-invoice",
    sourceId: "vnpt-nam-sai-gon",
    category: "Hóa đơn - Thuế",
    title: "VNPT Invoice",
    shortDesc: "Giải pháp hóa đơn điện tử toàn diện cho doanh nghiệp",
    features: [
      "Khởi tạo & phát hành nhanh chóng",
      "Kết nối trực tiếp với Tổng cục Thuế",
      "Quản lý hóa đơn tập trung, tra cứu dễ dàng",
      "Lưu trữ hóa đơn an toàn tới 10 năm",
      "Tích hợp linh hoạt với phần mềm kế toán, ERP",
    ],
    pricing: [
      {
        name: "Bảng giá dịch vụ VNPT Invoice",
        columns: ["Gói", "Số hóa đơn/năm", "Giá"],
        rows: [
          ["Gói khởi tạo", "300 hóa đơn/năm", "300.000đ/năm"],
          ["Gói cơ bản", "1.000 hóa đơn/năm", "550.000đ/năm"],
          ["Gói chuyên nghiệp", "3.000 hóa đơn/năm", "1.200.000đ/năm"],
          ["Gói nâng cao", "5.000 hóa đơn/năm", "1.800.000đ/năm"],
        ],
        note: "Giá trên chưa bao gồm VAT",
      },
    ],
    images: [],
    bodyText:
      "VNPT Invoice là giải pháp hóa đơn điện tử do VNPT phát triển, đáp ứng đầy đủ quy định của Tổng cục Thuế, giúp doanh nghiệp khởi tạo, phát hành, gửi, lưu trữ và quản lý hóa đơn điện tử nhanh chóng, an toàn, tiết kiệm chi phí. Đáp ứng Nghị định 123/2020/NĐ-CP và Thông tư 78/2021/TT-BTC.",
    sourceUrl: "#",
    isFake: true,
  },
  {
    id: "fake-hoa-don-may-tinh-tien",
    slug: "hoa-don-tu-may-tinh-tien",
    sourceId: "vnpt-nam-sai-gon",
    category: "Hóa đơn - Thuế",
    title: "Hóa đơn từ máy tính tiền",
    shortDesc: "Kết nối trực tiếp máy tính tiền, tự động phát hành hóa đơn ngay khi bán hàng.",
    features: ["Phát hành hóa đơn tức thời", "Kết nối trực tiếp máy tính tiền", "Phù hợp bán lẻ, F&B"],
    pricing: [],
    images: [],
    bodyText: "Giải pháp hóa đơn điện tử khởi tạo từ máy tính tiền, phù hợp cửa hàng bán lẻ, siêu thị mini, nhà hàng cần xuất hóa đơn nhanh ngay tại quầy.",
    sourceUrl: "#",
    isFake: true,
  },
  {
    id: "fake-smartpos",
    slug: "smartpos",
    sourceId: "vnpt-nam-sai-gon",
    category: "Hóa đơn - Thuế",
    title: "SmartPOS",
    shortDesc: "Giải pháp thanh toán và phát hành hóa đơn ngay trên thiết bị POS.",
    features: ["Thanh toán đa kênh", "Phát hành hóa đơn tự động", "Báo cáo doanh thu thời gian thực"],
    pricing: [],
    images: [],
    bodyText: "SmartPOS tích hợp thanh toán và phát hành hóa đơn điện tử ngay trên một thiết bị, giúp hộ kinh doanh và cửa hàng quản lý bán hàng hiệu quả.",
    sourceUrl: "#",
    isFake: true,
  },
  {
    id: "fake-thue-dien-tu",
    slug: "thue-dien-tu",
    sourceId: "vnpt-nam-sai-gon",
    category: "Hóa đơn - Thuế",
    title: "Thuế điện tử",
    shortDesc: "Kê khai, nộp thuế điện tử nhanh chóng, chính xác, đúng hạn.",
    features: ["Kê khai thuế trực tuyến", "Nộp thuế điện tử", "Nhắc hạn tự động"],
    pricing: [],
    images: [],
    bodyText: "Dịch vụ Thuế điện tử VNPT hỗ trợ doanh nghiệp và hộ kinh doanh kê khai, nộp thuế trực tuyến nhanh chóng, giảm thiểu sai sót và tiết kiệm thời gian.",
    sourceUrl: "#",
    isFake: true,
  },
  {
    id: "fake-bhxh-dien-tu",
    slug: "bhxh-dien-tu-ivan",
    sourceId: "vnpt-nam-sai-gon",
    category: "Hóa đơn - Thuế",
    title: "BHXH điện tử (IVAN)",
    shortDesc: "Giao dịch bảo hiểm xã hội điện tử thuận tiện, đầy đủ, đúng chuẩn.",
    features: ["Giao dịch trực tuyến với cơ quan BHXH", "Đầy đủ nghiệp vụ BHXH", "Bảo mật dữ liệu"],
    pricing: [],
    images: [],
    bodyText: "BHXH điện tử (IVAN) giúp doanh nghiệp thực hiện các thủ tục bảo hiểm xã hội hoàn toàn trực tuyến, đúng chuẩn quy định của BHXH Việt Nam.",
    sourceUrl: "#",
    isFake: true,
  },
];

const chuKySoFake: Product[] = [
  {
    id: "fake-smartca-ca-nhan",
    slug: "smartca-ca-nhan",
    sourceId: "vnpt-nam-sai-gon",
    category: "Chữ ký số",
    title: "SmartCA Cá nhân",
    shortDesc: "Chữ ký số từ xa cho cá nhân, ký mọi lúc mọi nơi không cần USB Token.",
    features: ["Ký trong 3 giây", "Không cần USB Token", "Được pháp luật công nhận"],
    pricing: [
      {
        name: "Bảng giá SmartCA Cá nhân",
        columns: ["Gói", "Thời hạn", "Giá cước"],
        rows: [
          ["SmartCA Cá nhân 1 năm", "12 tháng", "550.000đ"],
          ["SmartCA Cá nhân 2 năm", "24 tháng", "990.000đ"],
          ["SmartCA Cá nhân 3 năm", "36 tháng", "1.320.000đ"],
        ],
        note: "Bảng giá đã bao gồm VAT",
      },
    ],
    images: [],
    bodyText: "SmartCA Cá nhân là dịch vụ chữ ký số từ xa, cho phép cá nhân ký hợp đồng, giao dịch điện tử mọi lúc, mọi nơi chỉ với điện thoại thông minh.",
    sourceUrl: "#",
    isFake: true,
  },
  {
    id: "fake-smartca-doanh-nghiep",
    slug: "smartca-doanh-nghiep",
    sourceId: "vnpt-nam-sai-gon",
    category: "Chữ ký số",
    title: "SmartCA Doanh nghiệp",
    shortDesc: "Chữ ký số từ xa cho doanh nghiệp, ký hóa đơn, hợp đồng, kê khai thuế.",
    features: ["Ký hóa đơn điện tử", "Ký hợp đồng điện tử", "Kê khai thuế, BHXH"],
    pricing: [
      {
        name: "Bảng giá SmartCA Doanh nghiệp",
        columns: ["Gói", "Thời hạn", "Giá cước"],
        rows: [
          ["SmartCA Doanh nghiệp 1 năm", "12 tháng", "1.650.000đ"],
          ["SmartCA Doanh nghiệp 2 năm", "24 tháng", "2.970.000đ"],
          ["SmartCA Doanh nghiệp 3 năm", "36 tháng", "3.960.000đ"],
        ],
        note: "Bảng giá đã bao gồm VAT",
      },
    ],
    images: [],
    bodyText: "SmartCA Doanh nghiệp giúp doanh nghiệp ký số hóa đơn điện tử, hợp đồng, hồ sơ thuế và BHXH nhanh chóng, an toàn theo tiêu chuẩn châu Âu.",
    sourceUrl: "#",
    isFake: true,
  },
  {
    id: "fake-usb-token",
    slug: "usb-token",
    sourceId: "vnpt-nam-sai-gon",
    category: "Chữ ký số",
    title: "USB Token",
    shortDesc: "Chữ ký số truyền thống dạng USB, bảo mật cao cho doanh nghiệp.",
    features: ["Bảo mật phần cứng", "Phù hợp kê khai thuế truyền thống", "Tương thích nhiều phần mềm"],
    pricing: [],
    images: [],
    bodyText: "USB Token VNPT là thiết bị chữ ký số vật lý, phù hợp doanh nghiệp cần ký số ổn định trên máy tính cố định.",
    sourceUrl: "#",
    isFake: true,
  },
  {
    id: "fake-econtract",
    slug: "econtract",
    sourceId: "vnpt-nam-sai-gon",
    category: "Chữ ký số",
    title: "eContract",
    shortDesc: "Nền tảng soạn thảo, ký kết hợp đồng điện tử trực tuyến.",
    features: ["Soạn thảo hợp đồng online", "Ký nhiều bên", "Lưu trữ pháp lý an toàn"],
    pricing: [],
    images: [],
    bodyText: "eContract là nền tảng cho phép doanh nghiệp soạn thảo, gửi và ký kết hợp đồng điện tử với đối tác, khách hàng hoàn toàn trực tuyến.",
    sourceUrl: "#",
    isFake: true,
  },
];

export const categories: CategoryConfig[] = [
  {
    slug: "bang-rong-co-dinh",
    name: "Băng rộng cố định",
    shortDesc: "Kết nối ổn định - Tốc độ vượt trội",
    icon: Wifi,
    sourceIds: ["metronet", "vnpt-technology"],
    fakeProducts: bangRongFake,
  },
  {
    slug: "di-dong-vinaphone",
    name: "Di động Vinaphone",
    shortDesc: "Kết nối mọi lúc - Dẫn đầu trải nghiệm",
    icon: Smartphone,
    sourceIds: [],
    fakeProducts: diDongVinaphoneFake,
  },
  {
    slug: "hoa-don-thue",
    name: "Hóa đơn - Thuế",
    shortDesc: "Giải pháp hóa đơn điện tử toàn diện",
    icon: Receipt,
    sourceIds: [],
    fakeProducts: hoaDonThueFake,
  },
  {
    slug: "chu-ky-so",
    name: "Chữ ký số",
    shortDesc: "Ký số mọi lúc - An toàn tuyệt đối",
    icon: FileSignature,
    sourceIds: [],
    fakeProducts: chuKySoFake,
  },
  {
    slug: "cloud-idc",
    name: "Cloud & IDC",
    shortDesc: "Hạ tầng mạnh mẽ - Bảo mật tối ưu",
    icon: Cloud,
    sourceIds: ["cloud"],
    fakeProducts: [],
  },
  {
    slug: "chuyen-doi-so",
    name: "Chuyển đổi số",
    shortDesc: "Giải pháp toàn diện cho doanh nghiệp",
    icon: Workflow,
    sourceIds: ["vnptit", "onesme"],
    fakeProducts: [],
  },
];

export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return categories.find((c) => c.slug === slug);
}
```

- [ ] **Step 2: Tạo `content/category-products.ts`** (gộp sản phẩm thật + fake, chỉ dùng
  trong Server Component vì cần đọc `lib/data.ts`)

```ts
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
```

- [ ] **Step 3: Cài `lucide-react`**

Run: `npm install lucide-react`
Expected: thêm vào `dependencies` trong `package.json`, cài xong không lỗi.

- [ ] **Step 4: Viết test `content/category-map.test.ts`**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { categories, getCategoryBySlug } from "./category-map";
import { getCategoryProducts, getProductInCatalog } from "./category-products";

test("có đúng 6 danh mục sản phẩm", () => {
  assert.equal(categories.length, 6);
});

test("mỗi danh mục có slug duy nhất", () => {
  const slugs = categories.map((c) => c.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test("cloud-idc có sản phẩm thật, không cần fake", () => {
  const products = getCategoryProducts("cloud-idc");
  assert.ok(products.length > 0);
  assert.ok(products.every((p) => !p.isFake));
});

test("di-dong-vinaphone chỉ có sản phẩm fake (chưa có nguồn cào)", () => {
  const products = getCategoryProducts("di-dong-vinaphone");
  assert.ok(products.length > 0);
  assert.ok(products.every((p) => p.isFake === true));
});

test("getCategoryBySlug trả về undefined với slug không tồn tại", () => {
  assert.equal(getCategoryBySlug("khong-ton-tai"), undefined);
});

test("getProductInCatalog tìm đúng sản phẩm fake theo danh mục + slug", () => {
  const p = getProductInCatalog("hoa-don-thue", "vnpt-invoice");
  assert.ok(p);
  assert.equal(p?.title, "VNPT Invoice");
});
```

- [ ] **Step 5: Chạy toàn bộ test**

Run: `npm test`
Expected: tất cả test ở `lib/data.test.ts` và `content/category-map.test.ts` PASS.

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: không lỗi.

- [ ] **Step 7: Commit**

```bash
git add content package.json package-lock.json
git commit -m "feat: category-map + category-products ánh xạ 6 danh mục sản phẩm thật/fake + test"
```

---

### Task 5: Layout dùng chung — Header, Footer, FloatingContact, Breadcrumb, Shell

**Files:**
- Create: `components/layout/Header.tsx`
- Create: `components/layout/Footer.tsx`
- Create: `components/layout/FloatingContact.tsx`
- Create: `components/layout/Breadcrumb.tsx`
- Create: `components/layout/Shell.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `categories` từ `content/category-map.ts` (Task 4).
- Produces: `<Shell>{children}</Shell>` — dùng trong `app/layout.tsx`, bọc mọi trang từ
  Task 7 trở đi. `<Breadcrumb items={[{label, href?}]} />` dùng trong các trang có
  breadcrumb.

- [ ] **Step 1: Tạo `components/layout/Header.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Mail, MessageCircle, Menu, Phone, Search, X } from "lucide-react";
import { categories } from "@/content/category-map";

const NAV = [
  { label: "Trang chủ", href: "/" },
  { label: "Giới thiệu", href: "/gioi-thieu" },
  {
    label: "Sản phẩm",
    href: "/san-pham",
    children: categories.map((c) => ({ label: c.name, href: `/san-pham/${c.slug}` })),
  },
  { label: "Khuyến mãi", href: "/khuyen-mai" },
  { label: "Tin tức", href: "/tin-tuc" },
  { label: "Khách hàng", href: "/khach-hang" },
  { label: "Liên hệ", href: "/lien-he" },
] as const;

export default function Header() {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="hidden bg-vnpt-darker text-xs text-white md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <span>VNPT Nam Sài Gòn - Đồng hành cùng bạn trên hành trình Chuyển đổi số</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone size={14} /> Hotline: 0838 999 333
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={14} /> Zalo OA
            </span>
            <span className="flex items-center gap-1">
              <Mail size={14} /> Email
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="shrink-0 text-xl font-extrabold text-vnpt">
          VNPT
          <span className="block text-xs font-semibold tracking-wide text-vnpt-accent">
            NAM SÀI GÒN
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV.map((item) =>
            "children" in item ? (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setOpenDropdown(true)}
                onMouseLeave={() => setOpenDropdown(false)}
              >
                <button className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-vnpt">
                  {item.label}
                  <ChevronDown size={14} />
                </button>
                {openDropdown && (
                  <div className="absolute left-0 top-full w-56 rounded-lg border border-slate-100 bg-white py-2 shadow-lg">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-vnpt-light hover:text-vnpt"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-slate-700 hover:text-vnpt"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Search size={18} className="text-slate-500" />
          <Link
            href="/lien-he"
            className="rounded-md bg-vnpt-accent px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            ĐĂNG KÝ TƯ VẤN
          </Link>
        </div>

        <button
          className="lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Mở menu"
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-slate-100 px-6 py-3 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-2 text-sm font-medium text-slate-700"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
```

- [ ] **Step 2: Tạo `components/layout/Footer.tsx`**

```tsx
import Link from "next/link";
import { Facebook, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { categories } from "@/content/category-map";

const HO_TRO = [
  { label: "Hướng dẫn thanh toán", href: "/lien-he" },
  { label: "Câu hỏi thường gặp", href: "/lien-he" },
  { label: "Chính sách bảo mật", href: "/lien-he" },
];

export default function Footer() {
  return (
    <footer className="bg-vnpt-darker text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-4">
        <div>
          <div className="text-xl font-extrabold text-white">
            VNPT
            <span className="block text-xs font-semibold text-vnpt-accent">NAM SÀI GÒN</span>
          </div>
          <p className="mt-3 text-sm text-slate-300">
            Đồng hành cùng doanh nghiệp, cá nhân trên hành trình Chuyển đổi số.
          </p>
          <div className="mt-4 flex gap-3">
            <Facebook size={18} />
            <Youtube size={18} />
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">SẢN PHẨM</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/san-pham/${c.slug}`} className="hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">HỖ TRỢ</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            {HO_TRO.map((h) => (
              <li key={h.label}>
                <Link href={h.href} className="hover:text-white">
                  {h.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">LIÊN HỆ</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              28bis Nguyễn Thị Minh Khai, P. Đa Kao, Quận 1, TP. Hồ Chí Minh
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} /> 0838 999 333
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} /> kinhdoanh@vnptnamsaigon.vn
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} VNPT Nam Sài Gòn. All rights reserved.
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Tạo `components/layout/FloatingContact.tsx`**

```tsx
import Link from "next/link";
import { FileEdit, MessageCircle, Phone } from "lucide-react";

const ITEMS = [
  { icon: Phone, label: "Gọi ngay", href: "tel:0838999333", className: "bg-vnpt" },
  { icon: MessageCircle, label: "Chat Zalo", href: "https://zalo.me", className: "bg-sky-500" },
  { icon: FileEdit, label: "Đăng ký tư vấn", href: "/lien-he", className: "bg-vnpt-accent" },
];

export default function FloatingContact() {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
      {ITEMS.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          title={item.label}
          className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg ${item.className}`}
        >
          <item.icon size={20} />
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Tạo `components/layout/Breadcrumb.tsx`**

```tsx
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = { label: string; href?: string };

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-slate-500">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-2">
          {i > 0 && <ChevronRight size={14} />}
          {item.href ? (
            <Link href={item.href} className="hover:text-vnpt">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-700">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
```

- [ ] **Step 5: Tạo `components/layout/Shell.tsx`**

```tsx
import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import FloatingContact from "./FloatingContact";

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingContact />
    </>
  );
}
```

- [ ] **Step 6: Cập nhật `app/layout.tsx` — bọc children bằng Shell**

```tsx
import type { Metadata } from "next";
import { Montserrat, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import Shell from "@/components/layout/Shell";

const montserrat = Montserrat({
  weight: ["500", "600", "700", "800"],
  subsets: ["vietnamese", "latin"],
  variable: "--font-montserrat",
});

const beVN = Be_Vietnam_Pro({
  weight: ["400", "500", "600", "700"],
  subsets: ["vietnamese", "latin"],
  variable: "--font-be-vn",
});

export const metadata: Metadata = {
  title: "VNPT Nam Sài Gòn - Đồng hành cùng bạn trên hành trình Chuyển đổi số",
  description:
    "Giải pháp số toàn diện cho Cá nhân, Hộ kinh doanh, Doanh nghiệp và Cơ quan Nhà nước.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${montserrat.variable} ${beVN.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-white text-slate-800">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: `Compiled successfully`.

- [ ] **Step 8: Manual check**

Run: `npm run dev`, mở `http://localhost:3000`. Kỳ vọng: thấy top bar xanh đậm, header
với logo VNPT + nav 7 mục, hover "Sản phẩm" xổ ra 6 danh mục, 3 nút nổi góc dưới phải,
footer 4 cột. Dừng server.

- [ ] **Step 9: Commit**

```bash
git add components/layout app/layout.tsx
git commit -m "feat: Header, Footer, FloatingContact, Breadcrumb, Shell"
```

---

### Task 6: Component dùng chung — ProductCard, PricingTable, ArticleCard, LeadForm, StatBar

**Files:**
- Create: `components/product/ProductCard.tsx`
- Create: `components/product/PricingTable.tsx`
- Create: `components/article/ArticleCard.tsx`
- Create: `components/sections/LeadForm.tsx`
- Create: `components/sections/StatBar.tsx`

**Interfaces:**
- Consumes: `Product`, `Article` types từ `lib/types.ts` (Task 3).
- Produces: `<ProductCard product categorySlug />`, `<PricingTable pricing />`,
  `<ArticleCard article />`, `<LeadForm title interestOptions />`,
  `<StatBar items={[{value,label}]} />` — dùng ở mọi trang từ Task 7.

- [ ] **Step 1: Tạo `components/product/ProductCard.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import type { Product } from "@/lib/types";

export default function ProductCard({
  product,
  categorySlug,
}: {
  product: Product;
  categorySlug: string;
}) {
  const href = `/san-pham/${categorySlug}/${product.slug}`;
  return (
    <Link
      href={href}
      className="flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative flex h-40 items-center justify-center bg-vnpt-light">
        {product.images[0] ? (
          <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
        ) : (
          <Package size={40} className="text-vnpt" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold text-slate-800">{product.title}</h3>
        <p className="line-clamp-2 text-sm text-slate-500">{product.shortDesc}</p>
        <span className="mt-auto text-sm font-semibold text-vnpt">Xem chi tiết →</span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Tạo `components/product/PricingTable.tsx`**

```tsx
import type { Pricing } from "@/lib/types";

export default function PricingTable({ pricing }: { pricing: Pricing[] }) {
  if (pricing.length === 0) return null;

  return (
    <div className="space-y-6">
      {pricing.map((table, i) => (
        <div key={table.name ?? i} className="overflow-x-auto rounded-xl border border-slate-100">
          {table.name && (
            <div className="bg-vnpt px-4 py-2 text-sm font-semibold text-white">{table.name}</div>
          )}
          <table className="w-full text-left text-sm">
            <thead className="bg-vnpt-light text-slate-600">
              <tr>
                {table.columns.map((col) => (
                  <th key={col} className="px-4 py-2 font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rIdx) => (
                <tr key={rIdx} className="border-t border-slate-100">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-2 text-slate-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {table.note && <p className="px-4 py-2 text-xs text-slate-400">{table.note}</p>}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Tạo `components/article/ArticleCard.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import type { Article } from "@/lib/types";

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/tin-tuc/${article.slug}`}
      className="flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative flex h-36 items-center justify-center bg-vnpt-darker">
        {article.images[0] ? (
          <Image src={article.images[0]} alt={article.title} fill className="object-cover" />
        ) : (
          <Newspaper size={32} className="text-white" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {article.category && (
          <span className="text-xs font-semibold uppercase text-vnpt-accent">
            {article.category}
          </span>
        )}
        <h3 className="line-clamp-2 font-semibold text-slate-800">{article.title}</h3>
        {article.date && <span className="text-xs text-slate-400">{article.date}</span>}
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Tạo `components/sections/LeadForm.tsx`**

```tsx
"use client";

import { useState, type FormEvent } from "react";

export default function LeadForm({
  title = "Đăng ký tư vấn",
  subtitle = "Chúng tôi sẽ liên hệ với bạn!",
  interestOptions = ["Internet", "MyTV", "Di động Vinaphone", "Hóa đơn điện tử", "Chữ ký số", "Cloud & IDC", "Chuyển đổi số"],
}: {
  title?: string;
  subtitle?: string;
  interestOptions?: string[];
}) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-vnpt/20 bg-vnpt-light p-6 text-center">
        <p className="font-semibold text-vnpt">Cảm ơn bạn đã đăng ký!</p>
        <p className="mt-1 text-sm text-slate-600">
          Đội ngũ VNPT Nam Sài Gòn sẽ liên hệ với bạn trong thời gian sớm nhất.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-white shadow-sm">
      <div className="rounded-t-xl bg-vnpt px-6 py-4">
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-xs text-white/80">{subtitle}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3 p-6">
        <input
          required
          name="hoTen"
          placeholder="Họ và tên*"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-vnpt"
        />
        <input
          required
          name="soDienThoai"
          placeholder="Số điện thoại*"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-vnpt"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-vnpt"
        />
        <select
          name="nhuCau"
          defaultValue=""
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 outline-vnpt"
        >
          <option value="" disabled>
            Nhu cầu quan tâm
          </option>
          {interestOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <textarea
          name="loiNhan"
          placeholder="Lời nhắn (nếu có)"
          rows={3}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-vnpt"
        />
        <button
          type="submit"
          className="w-full rounded-md bg-vnpt-accent py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
        >
          GỬI THÔNG TIN
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: Tạo `components/sections/StatBar.tsx`**

```tsx
export type Stat = { value: string; label: string };

export default function StatBar({ items }: { items: Stat[] }) {
  return (
    <div className="bg-vnpt">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-8 text-center text-white md:grid-cols-4">
        {items.map((item) => (
          <div key={item.label}>
            <div className="text-2xl font-bold">{item.value}</div>
            <div className="text-sm text-white/80">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Type-check + build**

Run: `npx tsc --noEmit && npm run build`
Expected: không lỗi, build thành công.

- [ ] **Step 7: Commit**

```bash
git add components/product components/article components/sections
git commit -m "feat: ProductCard, PricingTable, ArticleCard, LeadForm, StatBar"
```

---

### Task 7: Trang chủ (`app/page.tsx`)

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `categories`, `getCategoryProducts` (Task 4); `getAllArticles` (Task 3);
  `ProductCard`, `ArticleCard`, `LeadForm`, `StatBar` (Task 6).

- [ ] **Step 1: Viết `app/page.tsx`**

```tsx
import Link from "next/link";
import { Headset, ArrowRight } from "lucide-react";
import { categories } from "@/content/category-map";
import { getAllArticles } from "@/lib/data";
import ArticleCard from "@/components/article/ArticleCard";
import LeadForm from "@/components/sections/LeadForm";
import StatBar from "@/components/sections/StatBar";

const DOI_TUONG = [
  { slug: "ca-nhan", label: "Cá nhân" },
  { slug: "ho-kinh-doanh", label: "Hộ kinh doanh" },
  { slug: "doanh-nghiep", label: "Doanh nghiệp" },
  { slug: "co-quan-nha-nuoc", label: "Cơ quan nhà nước" },
  { slug: "truong-hoc", label: "Trường học" },
  { slug: "benh-vien", label: "Bệnh viện" },
];

const KHUYEN_MAI = [
  { title: "Internet siêu tốc độ", discount: "Ưu đãi cực sốc 20%", note: "Gói FiberVNN" },
  { title: "Combo Internet + MyTV", discount: "Chỉ từ 205.000đ/tháng", note: "Ưu đãi thiết bị, phí lắp đặt" },
  { title: "Hóa đơn điện tử", discount: "Tiết kiệm đến 50%", note: "Chi phí khi đăng ký mới" },
  { title: "Chữ ký số SmartCA", discount: "Ưu đãi đến 30%", note: "Khi đăng ký gói 2 năm" },
];

export default function HomePage() {
  const news = getAllArticles().slice(0, 3);

  return (
    <div>
      <section className="bg-gradient-to-br from-vnpt-darker via-vnpt-dark to-vnpt px-6 py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">
              CHUYỂN ĐỔI SỐ TOÀN DIỆN
              <br />
              CÙNG VNPT NAM SÀI GÒN
            </h1>
            <p className="mt-4 max-w-xl text-white/85">
              Giải pháp số tin cậy cho Cá nhân, Hộ kinh doanh, Doanh nghiệp và Cơ quan
              Nhà nước.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/lien-he"
                className="flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-vnpt"
              >
                <Headset size={18} /> TƯ VẤN NGAY
              </Link>
              <Link
                href="/san-pham"
                className="flex items-center gap-2 rounded-md border border-white/60 px-5 py-3 text-sm font-semibold text-white"
              >
                XEM SẢN PHẨM <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <LeadForm />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/san-pham/${cat.slug}`}
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-4 text-center shadow-sm hover:shadow-md"
            >
              <cat.icon size={28} className="text-vnpt" />
              <span className="text-sm font-semibold text-slate-800">{cat.name}</span>
              <span className="text-xs text-slate-500">{cat.shortDesc}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="mb-6 text-xl font-bold text-slate-800">GIẢI PHÁP THEO ĐỐI TƯỢNG</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {DOI_TUONG.map((d) => (
            <Link
              key={d.slug}
              href={`/giai-phap/${d.slug}`}
              className="rounded-xl border border-slate-100 p-4 text-center text-sm font-semibold text-slate-700 shadow-sm hover:shadow-md"
            >
              {d.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">KHUYẾN MÃI NỔI BẬT</h2>
            <Link href="/khuyen-mai" className="text-sm font-semibold text-vnpt">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {KHUYEN_MAI.map((k) => (
              <div key={k.title} className="rounded-xl bg-vnpt p-4 text-white">
                <h3 className="text-sm font-semibold">{k.title}</h3>
                <p className="mt-2 text-lg font-bold text-vnpt-accent">{k.discount}</p>
                <p className="text-xs text-white/70">{k.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">TIN TỨC MỚI</h2>
            <Link href="/tin-tuc" className="text-sm font-semibold text-vnpt">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid gap-4">
            {news.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>
      </section>

      <StatBar
        items={[
          { value: "20+", label: "Năm kinh nghiệm" },
          { value: "100.000+", label: "Khách hàng tin tưởng" },
          { value: "500+", label: "Đối tác toàn quốc" },
          { value: "24/7", label: "Hỗ trợ tận tâm" },
        ]}
      />
    </div>
  );
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: `Compiled successfully`.

- [ ] **Step 3: Manual check**

Run: `npm run dev`, mở `/`. Kỳ vọng: hero xanh + form đăng ký, 6 icon danh mục, 6 thẻ
đối tượng, khuyến mãi + tin tức mới (3 bài viết **thật** từ data đã cào), stat bar dưới
cùng.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: trang chủ"
```

---

### Task 8: Giới thiệu (`app/gioi-thieu/page.tsx`)

**Files:**
- Create: `app/gioi-thieu/page.tsx`

**Interfaces:**
- Consumes: `Breadcrumb` (Task 5), `LeadForm` (Task 6).

- [ ] **Step 1: Viết `app/gioi-thieu/page.tsx`**

```tsx
import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import LeadForm from "@/components/sections/LeadForm";

export const metadata: Metadata = { title: "Giới thiệu — VNPT Nam Sài Gòn" };

const DOI_NGU = [
  { name: "Vũ Tiến Khoa", role: "Trưởng phòng Kinh doanh", phone: "0838 999 333" },
  { name: "Nguyễn Thị Hằng", role: "Phó phòng Kinh doanh", phone: "0936 123 456" },
  { name: "Trần Minh Đức", role: "Chuyên viên Kinh doanh", phone: "0912 345 678" },
  { name: "Lê Thị Thanh Thảo", role: "Chuyên viên Kinh doanh", phone: "0978 456 789" },
  { name: "Phạm Hoàng Nam", role: "Chuyên viên Kinh doanh", phone: "0981 234 567" },
  { name: "Bùi Thùy Linh", role: "Chuyên viên Kinh doanh", phone: "0902 678 910" },
];

export default function GioiThieuPage() {
  return (
    <div>
      <section className="bg-vnpt px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Giới thiệu" }]} />
          <h1 className="mt-3 text-3xl font-extrabold">GIỚI THIỆU</h1>
          <p className="mt-2 text-white/85">
            VNPT Nam Sài Gòn - Đồng hành cùng bạn trên hành trình Chuyển đổi số
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="text-xl font-bold text-slate-800">GIỚI THIỆU TẬP ĐOÀN VNPT</h2>
        <p className="mt-3 max-w-3xl text-slate-600">
          VNPT là Tập đoàn công nghệ hàng đầu Việt Nam, tiên phong trong kiến tạo hạ
          tầng số, cung cấp các dịch vụ Viễn thông, CNTT và Giải pháp số toàn diện cho
          cá nhân, doanh nghiệp và cơ quan Nhà nước. Thành lập 26/6/1995, sứ mệnh "Đồng
          hành cùng Chuyển đổi số quốc gia".
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 rounded-xl border border-slate-100 p-6 shadow-sm md:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="text-xl font-bold text-slate-800">GIỚI THIỆU VNPT NAM SÀI GÒN</h2>
            <p className="mt-3 text-slate-600">
              VNPT Nam Sài Gòn là đơn vị trực thuộc VNPT TP. Hồ Chí Minh, phụ trách cung
              cấp dịch vụ Viễn thông – CNTT – Giải pháp số trên địa bàn Quận 7, Quận 8,
              Nhà Bè và khu vực lân cận. Phục vụ hơn 60.000+ khách hàng cá nhân và
              doanh nghiệp với đội ngũ kỹ thuật – kinh doanh chuyên nghiệp, tận tâm.
            </p>
          </div>
          <div className="space-y-3 text-sm text-slate-600">
            <div>
              <span className="font-semibold text-slate-800">Phạm vi hoạt động: </span>
              Quận 7 - Quận 8 - Nhà Bè và khu vực lân cận
            </div>
            <div>
              <span className="font-semibold text-slate-800">Năm thành lập: </span>
              1996
            </div>
            <div>
              <span className="font-semibold text-slate-800">Cam kết: </span>
              Chất lượng - Uy tín - Đồng hành lâu dài
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="mb-2 text-xl font-bold text-slate-800">ĐỘI NGŨ KINH DOANH</h2>
        <p className="mb-6 text-slate-500">
          Chúng tôi luôn sẵn sàng đồng hành và mang đến giải pháp phù hợp nhất cho bạn.
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {DOI_NGU.map((p) => (
            <div key={p.name} className="rounded-xl border border-slate-100 p-4 text-center shadow-sm">
              <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-vnpt-light" />
              <div className="text-sm font-semibold text-slate-800">{p.name}</div>
              <div className="text-xs text-slate-500">{p.role}</div>
              <div className="mt-1 text-xs text-vnpt">{p.phone}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-xl bg-vnpt-light p-6">
          <h2 className="text-xl font-bold text-slate-800">THÔNG TIN LIÊN HỆ</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <MapPin size={16} className="text-vnpt" /> 28bis Nguyễn Thị Minh Khai, P.
              Đa Kao, Quận 1, TP. Hồ Chí Minh
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-vnpt" /> 0838 999 333
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-vnpt" /> kinhdoanh@vnptnamsaigon.vn
            </li>
          </ul>
        </div>
        <LeadForm title="Tìm hiểu thêm về chúng tôi" />
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Build + manual check**

Run: `npm run build`, sau đó `npm run dev` và mở `/gioi-thieu`.
Expected: build không lỗi; trang hiển thị đủ 5 khối (hero, giới thiệu tập đoàn, giới
thiệu chi nhánh, đội ngũ kinh doanh 6 người, thông tin liên hệ + form).

- [ ] **Step 3: Commit**

```bash
git add app/gioi-thieu
git commit -m "feat: trang giới thiệu"
```

---

### Task 9: Danh mục sản phẩm (`app/san-pham/page.tsx`)

**Files:**
- Create: `app/san-pham/page.tsx`

**Interfaces:**
- Consumes: `categories` từ `content/category-map.ts`, `getCategoryProducts` từ
  `content/category-products.ts` (Task 4).

- [ ] **Step 1: Viết `app/san-pham/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { categories } from "@/content/category-map";
import { getCategoryProducts } from "@/content/category-products";

export const metadata: Metadata = { title: "Danh mục sản phẩm — VNPT Nam Sài Gòn" };

export default function SanPhamPage() {
  return (
    <div>
      <section className="bg-vnpt-light px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Sản phẩm" }]} />
          <h1 className="mt-3 text-3xl font-extrabold text-slate-800">DANH MỤC SẢN PHẨM</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Các sản phẩm - dịch vụ của VNPT giúp cá nhân, doanh nghiệp và tổ chức phát
            triển mạnh mẽ trong kỷ nguyên số.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const products = getCategoryProducts(cat.slug);
            return (
              <div key={cat.slug} className="rounded-xl border border-slate-100 p-6 shadow-sm">
                <cat.icon size={32} className="text-vnpt" />
                <h2 className="mt-3 text-lg font-bold text-slate-800">{cat.name}</h2>
                <p className="text-sm text-slate-500">{cat.shortDesc}</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {products.slice(0, 4).map((p) => (
                    <li key={p.id} className="flex items-center gap-2">
                      <Check size={14} className="text-vnpt" /> {p.title}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={`/san-pham/${cat.slug}`} className="text-sm font-semibold text-vnpt">
                    Xem chi tiết →
                  </Link>
                  {products[0] && (
                    <Link
                      href={`/san-pham/${cat.slug}/${products[0].slug}`}
                      className="text-sm font-semibold text-vnpt-accent"
                    >
                      Xem sản phẩm mẫu →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Build + manual check**

Run: `npm run build`, `npm run dev`, mở `/san-pham`.
Expected: 6 thẻ danh mục, mỗi thẻ có 4 gạch đầu dòng lấy từ sản phẩm thật/fake tương
ứng, link "Xem sản phẩm mẫu" trỏ tới 1 sản phẩm cụ thể tồn tại thật (không 404).

- [ ] **Step 3: Commit**

```bash
git add app/san-pham/page.tsx
git commit -m "feat: trang danh mục sản phẩm"
```

---

### Task 10: Chi tiết sản phẩm (`app/san-pham/[danhMuc]/[slug]/page.tsx`)

**Files:**
- Create: `app/san-pham/[danhMuc]/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getCategoryBySlug`, `categories` từ `content/category-map.ts`;
  `getProductInCatalog`, `getCategoryProducts` từ `content/category-products.ts`
  (Task 4); `PricingTable`, `ProductCard` (Task 6); `Breadcrumb` (Task 5).

- [ ] **Step 1: Viết `app/san-pham/[danhMuc]/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, Package } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import PricingTable from "@/components/product/PricingTable";
import ProductCard from "@/components/product/ProductCard";
import LeadForm from "@/components/sections/LeadForm";
import { categories, getCategoryBySlug } from "@/content/category-map";
import { getCategoryProducts, getProductInCatalog } from "@/content/category-products";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ danhMuc: string; slug: string }>;
}): Promise<Metadata> {
  const { danhMuc, slug } = await params;
  const product = getProductInCatalog(danhMuc, slug);
  return { title: product ? `${product.title} — VNPT Nam Sài Gòn` : "Sản phẩm" };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ danhMuc: string; slug: string }>;
}) {
  const { danhMuc, slug } = await params;
  const category = getCategoryBySlug(danhMuc);
  const product = getProductInCatalog(danhMuc, slug);
  if (!category || !product) notFound();

  const related = getCategoryProducts(category.slug)
    .filter((p) => p.slug !== product.slug)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Sản phẩm", href: "/san-pham" },
          { label: category.name, href: `/san-pham/${category.slug}` },
          { label: product.title },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">{product.title}</h1>
          <p className="mt-2 text-slate-600">{product.shortDesc}</p>

          <div className="relative mt-6 flex h-64 items-center justify-center rounded-xl bg-vnpt-light">
            {product.images[0] ? (
              <Image src={product.images[0]} alt={product.title} fill className="rounded-xl object-cover" />
            ) : (
              <Package size={56} className="text-vnpt" />
            )}
          </div>

          {product.features.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-slate-800">Tính năng nổi bật</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {product.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 rounded-lg border border-slate-100 p-3 text-sm text-slate-700">
                    <Check size={16} className="mt-0.5 shrink-0 text-vnpt" /> {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.pricing.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 text-lg font-bold text-slate-800">Bảng giá</h2>
              <PricingTable pricing={product.pricing} />
            </div>
          )}

          {product.bodyText && (
            <div className="mt-8">
              <h2 className="mb-3 text-lg font-bold text-slate-800">Chi tiết</h2>
              <p className="scraped-body text-sm text-slate-600">{product.bodyText}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <LeadForm title="Đăng ký tư vấn miễn phí" interestOptions={[category.name]} />
          <div>
            <h3 className="mb-3 font-semibold text-slate-800">Danh mục sản phẩm</h3>
            <ul className="space-y-2 text-sm">
              {categories.map((c) => (
                <li key={c.slug}>
                  <a
                    href={`/san-pham/${c.slug}`}
                    className={c.slug === category.slug ? "font-semibold text-vnpt" : "text-slate-600 hover:text-vnpt"}
                  >
                    {c.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Sản phẩm liên quan</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} categorySlug={category.slug} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build + manual check**

Run: `npm run build`, `npm run dev`, mở `/san-pham/hoa-don-thue/vnpt-invoice` (đúng
sản phẩm mẫu trong ảnh `1-trang-chinh/07-chi-tiet-san-pham-mau.jpg`) và
`/san-pham/cloud-idc/cloud-vnpt-cloud-server` (sản phẩm **thật**).
Expected: cả 2 route render đầy đủ tên, mô tả, tính năng, bảng giá (nếu có), sản phẩm
liên quan; route không tồn tại (vd `/san-pham/cloud-idc/khong-ton-tai`) trả về trang
404 chuẩn của Next.js.

- [ ] **Step 3: Commit**

```bash
git add "app/san-pham/[danhMuc]"
git commit -m "feat: trang chi tiết sản phẩm (khuôn mẫu dùng chung)"
```

---

### Task 11: Tin tức danh sách (`app/tin-tuc/page.tsx`)

**Files:**
- Create: `app/tin-tuc/page.tsx`

**Interfaces:**
- Consumes: `getAllArticles` (Task 3); `ArticleCard` (Task 6); `Breadcrumb` (Task 5).

- [ ] **Step 1: Viết `app/tin-tuc/page.tsx`**

```tsx
import type { Metadata } from "next";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ArticleCard from "@/components/article/ArticleCard";
import { getAllArticles } from "@/lib/data";

export const metadata: Metadata = { title: "Tin tức — VNPT Nam Sài Gòn" };

export default function TinTucPage() {
  const articles = getAllArticles();
  const featured = articles[0];
  const rest = articles.slice(1);
  const categoryList = [...new Set(articles.map((a) => a.category).filter(Boolean))] as string[];

  return (
    <div>
      <section className="bg-vnpt-light px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Tin tức" }]} />
          <h1 className="mt-3 text-3xl font-extrabold text-slate-800">TIN TỨC</h1>
          <p className="mt-2 text-slate-600">
            Cập nhật thông tin mới nhất từ VNPT và các giải pháp công nghệ.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[2fr_1fr]">
        <div>
          {featured && (
            <a href={`/tin-tuc/${featured.slug}`} className="mb-8 block rounded-xl border border-slate-100 shadow-sm">
              <div className="flex h-56 items-center justify-center rounded-t-xl bg-vnpt-darker text-white">
                Tin nổi bật
              </div>
              <div className="p-5">
                {featured.category && (
                  <span className="text-xs font-semibold uppercase text-vnpt-accent">
                    {featured.category}
                  </span>
                )}
                <h2 className="mt-1 text-xl font-bold text-slate-800">{featured.title}</h2>
                {featured.date && <p className="mt-1 text-sm text-slate-400">{featured.date}</p>}
              </div>
            </a>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            {rest.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>

        <aside>
          <h3 className="mb-3 font-semibold text-slate-800">Danh mục tin tức</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="font-semibold text-vnpt">Tất cả tin tức</li>
            {categoryList.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </aside>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Build + manual check**

Run: `npm run build`, `npm run dev`, mở `/tin-tuc`.
Expected: 1 tin nổi bật + lưới bài viết còn lại, đều là dữ liệu **thật** (15 bài từ
`digishop` + `vnpt-technology`); click 1 thẻ tin tức dẫn tới `/tin-tuc/[slug]` (404 vì
trang chi tiết là plan sau — đúng như dự kiến).

- [ ] **Step 3: Commit**

```bash
git add app/tin-tuc/page.tsx
git commit -m "feat: trang danh sách tin tức"
```

---

### Task 12: Liên hệ (`app/lien-he/page.tsx`)

**Files:**
- Create: `app/lien-he/page.tsx`

**Interfaces:**
- Consumes: `Breadcrumb` (Task 5), `LeadForm` (Task 6).

- [ ] **Step 1: Viết `app/lien-he/page.tsx`**

```tsx
import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import LeadForm from "@/components/sections/LeadForm";

export const metadata: Metadata = { title: "Liên hệ — VNPT Nam Sài Gòn" };

const INFO_CARDS = [
  { icon: Phone, label: "Hotline", value: "0838 999 333" },
  { icon: MessageCircle, label: "Zalo OA", value: "VNPT Nam Sài Gòn" },
  { icon: Mail, label: "Email", value: "kinhdoanh@vnptnamsaigon.vn" },
  { icon: Phone, label: "Hỗ trợ kỹ thuật", value: "1800 1166 (nhánh 5)" },
];

const CHI_NHANH = [
  { name: "Quận 7", address: "466 Nguyễn Văn Linh, P. Tân Phong, Quận 7" },
  { name: "Quận 8", address: "1249 Phạm Thế Hiển, P. 5, Quận 8" },
  { name: "Nhà Bè", address: "254 Huỳnh Tấn Phát, TT. Nhà Bè, H. Nhà Bè" },
  { name: "Quận Bình Tân", address: "952 Tỉnh lộ 10, P. Tân Tạo, Q. Bình Tân" },
];

const GIO_LAM_VIEC = [
  { label: "Thứ 2 - Thứ 6", value: "07:30 - 17:30" },
  { label: "Thứ 7", value: "07:30 - 12:00" },
  { label: "Chủ nhật & Ngày lễ", value: "Nghỉ" },
];

export default function LienHePage() {
  return (
    <div>
      <section className="bg-vnpt px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Liên hệ" }]} />
          <h1 className="mt-3 text-3xl font-extrabold">LIÊN HỆ VỚI CHÚNG TÔI</h1>
          <p className="mt-2 text-white/85">
            VNPT Nam Sài Gòn luôn sẵn sàng hỗ trợ bạn mọi lúc – mọi nơi.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-4 md:grid-cols-4">
          {INFO_CARDS.map((c) => (
            <div key={c.label} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 shadow-sm">
              <c.icon size={22} className="text-vnpt" />
              <div>
                <div className="text-xs text-slate-500">{c.label}</div>
                <div className="text-sm font-semibold text-slate-800">{c.value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[3fr_2fr]">
        <div>
          <h2 className="mb-4 text-lg font-bold text-slate-800">ĐỊA CHỈ VĂN PHÒNG</h2>
          <iframe
            title="Bản đồ VNPT Nam Sài Gòn"
            className="h-72 w-full rounded-xl border border-slate-100"
            loading="lazy"
            src="https://www.google.com/maps?q=28bis+Nguy%E1%BB%85n+Th%E1%BB%8B+Minh+Khai%2C+%C4%90a+Kao%2C+Qu%E1%BA%ADn+1%2C+TP.HCM&output=embed"
          />
          <div className="mt-4 flex items-start gap-2 text-sm text-slate-600">
            <MapPin size={16} className="mt-0.5 shrink-0 text-vnpt" />
            Trụ sở chính: 28bis Nguyễn Thị Minh Khai, Phường Đa Kao, Quận 1, TP. Hồ Chí
            Minh
          </div>

          <h3 className="mt-8 mb-3 font-semibold text-slate-800">Chi nhánh & điểm giao dịch</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {CHI_NHANH.map((c) => (
              <div key={c.name} className="rounded-lg border border-slate-100 p-3 text-sm">
                <div className="font-semibold text-slate-800">{c.name}</div>
                <div className="text-slate-500">{c.address}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-slate-100 p-4">
            <h3 className="mb-3 font-semibold text-slate-800">Giờ làm việc</h3>
            <table className="w-full text-sm text-slate-600">
              <tbody>
                {GIO_LAM_VIEC.map((g) => (
                  <tr key={g.label} className="border-t border-slate-100">
                    <td className="py-2">{g.label}</td>
                    <td className="py-2 text-right font-semibold text-slate-800">{g.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <LeadForm title="Gửi liên hệ cho chúng tôi" subtitle="Vui lòng điền thông tin, chúng tôi sẽ liên hệ lại bạn sớm nhất." />
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Build + manual check**

Run: `npm run build`, `npm run dev`, mở `/lien-he`.
Expected: 4 thẻ info, bản đồ nhúng hiển thị đúng khu vực Quận 1 TP.HCM, danh sách 4 chi
nhánh, bảng giờ làm việc, form liên hệ bên phải.

- [ ] **Step 3: Commit**

```bash
git add app/lien-he
git commit -m "feat: trang liên hệ"
```

---

### Task 13: Kiểm tra tổng thể toàn bộ nền tảng + 6 trang chính

**Files:** không tạo file mới — chỉ chạy kiểm tra.

- [ ] **Step 1: Type-check toàn bộ project**

Run: `npx tsc --noEmit`
Expected: không lỗi.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: không lỗi (warning nếu có phải fix trước khi coi là xong).

- [ ] **Step 3: Chạy toàn bộ test**

Run: `npm test`
Expected: tất cả test ở `lib/data.test.ts` và `content/category-map.test.ts` PASS.

- [ ] **Step 4: Build production**

Run: `npm run build`
Expected: `Compiled successfully`, liệt kê đủ route: `/`, `/gioi-thieu`, `/lien-he`,
`/san-pham`, `/san-pham/[danhMuc]/[slug]`, `/tin-tuc`.

- [ ] **Step 5: Kiểm tra thủ công toàn site**

Run: `npm run dev`, lần lượt mở và kiểm tra từng trang trong danh sách dưới, so với ảnh
tương ứng trong `1-trang-chinh/`:

| Route | Ảnh đối chiếu |
|---|---|
| `/` | `1-trang-chinh/02-trang-chu.jpg` |
| `/gioi-thieu` | `1-trang-chinh/09-gioi-thieu.jpg` |
| `/san-pham` | `1-trang-chinh/03-danh-muc-san-pham.jpg` |
| `/san-pham/hoa-don-thue/vnpt-invoice` | `1-trang-chinh/07-chi-tiet-san-pham-mau.jpg` |
| `/tin-tuc` | `1-trang-chinh/08-tin-tuc.jpg` |
| `/lien-he` | `1-trang-chinh/14-lien-he.jpg` |

Dừng server sau khi kiểm tra xong.

- [ ] **Step 6: Commit cuối (nếu có thay đổi sửa lỗi từ bước kiểm tra)**

```bash
git add -A
git commit -m "chore: hoàn thiện nền tảng + 6 trang chính, qua toàn bộ kiểm tra"
```
