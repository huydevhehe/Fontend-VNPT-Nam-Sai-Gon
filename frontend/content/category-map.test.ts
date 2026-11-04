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
