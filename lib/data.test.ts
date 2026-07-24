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
