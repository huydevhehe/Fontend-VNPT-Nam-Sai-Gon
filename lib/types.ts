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
