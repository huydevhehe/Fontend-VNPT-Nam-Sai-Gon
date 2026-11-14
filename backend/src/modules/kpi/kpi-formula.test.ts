import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_KPI_FORMULAS,
  scoreKpi,
  validateSegments,
  type KpiSegment,
} from "./kpi-formula.js";

test("scoreKpi thu_ngay matches VNPT reference points", () => {
  const segments = DEFAULT_KPI_FORMULAS.thu_ngay;
  assert.equal(scoreKpi(segments, 0.97), 1);
  assert.equal(scoreKpi(segments, 0.98), 1);
  assert.equal(scoreKpi(segments, 0.99), 2.5);
  assert.equal(scoreKpi(segments, 1.0), 4);
  assert.equal(scoreKpi(segments, 1.004), 4.5);
  assert.equal(scoreKpi(segments, 1.008), 5);
  assert.equal(scoreKpi(segments, 1.2), 5);
});

test("scoreKpi ghtt_t matches VNPT reference points", () => {
  const segments = DEFAULT_KPI_FORMULAS.ghtt_t;
  assert.equal(scoreKpi(segments, 0.79), 1);
  assert.equal(scoreKpi(segments, 0.8), 1);
  assert.equal(scoreKpi(segments, 0.9), 3);
  assert.equal(scoreKpi(segments, 1.0), 5);
  assert.equal(scoreKpi(segments, 1.05), 5);
});

test("scoreKpi ghtt_t1 matches VNPT reference points", () => {
  const segments = DEFAULT_KPI_FORMULAS.ghtt_t1;
  assert.equal(scoreKpi(segments, 0.81), 1);
  assert.equal(scoreKpi(segments, 0.82), 1); // 22.22*0.82-17.22 = 1.0004 -> round2 -> 1
  assert.equal(scoreKpi(segments, 0.91), 3);
  assert.equal(scoreKpi(segments, 1.0), 5);
});

test("scoreKpi returns null for null rate", () => {
  assert.equal(scoreKpi(DEFAULT_KPI_FORMULAS.thu_ngay, null), null);
});

test("validateSegments accepts every default VNPT formula", () => {
  for (const key of Object.keys(DEFAULT_KPI_FORMULAS) as Array<keyof typeof DEFAULT_KPI_FORMULAS>) {
    assert.equal(validateSegments(DEFAULT_KPI_FORMULAS[key]), null, `${key} phải hợp lệ`);
  }
});

test("validateSegments rejects a gap below 0.98", () => {
  const segments: KpiSegment[] = [
    { from: null, fromInclusive: false, to: 0.98, toInclusive: false, a: 0, b: 1 },
    { from: 1.0, fromInclusive: true, to: null, toInclusive: false, a: 0, b: 5 },
  ];
  const err = validateSegments(segments);
  assert.ok(err, "phải báo lỗi khe hở");
  assert.match(err as string, /khe hở|liền kề/i);
});

test("validateSegments rejects a gap at the top end (missing >= 1.00)", () => {
  const segments: KpiSegment[] = [
    { from: null, fromInclusive: false, to: 1.0, toInclusive: false, a: 0, b: 1 },
  ];
  const err = validateSegments(segments);
  assert.ok(err, "phải báo lỗi vì khoảng cuối không mở tới +∞");
});

test("validateSegments rejects overlap at the same inclusive boundary (1.00)", () => {
  const segments: KpiSegment[] = [
    { from: null, fromInclusive: false, to: 1.0, toInclusive: true, a: 0, b: 1 },
    { from: 1.0, fromInclusive: true, to: null, toInclusive: false, a: 0, b: 5 },
  ];
  const err = validateSegments(segments);
  assert.ok(err, "phải báo lỗi chồng lấn");
  assert.match(err as string, /chồng lấn/i);
});

test("validateSegments rejects missing negative-infinity first segment", () => {
  const segments: KpiSegment[] = [
    { from: 0, fromInclusive: true, to: null, toInclusive: false, a: 0, b: 5 },
  ];
  const err = validateSegments(segments);
  assert.ok(err, "phải báo lỗi thiếu khoảng âm vô cùng");
  assert.match(err as string, /âm vô cùng/i);
});

test("validateSegments rejects NaN coefficients", () => {
  const segments: KpiSegment[] = [
    { from: null, fromInclusive: false, to: null, toInclusive: false, a: NaN, b: 1 },
  ];
  const err = validateSegments(segments);
  assert.ok(err, "phải báo lỗi a là NaN");
  assert.match(err as string, /a và b|số hợp lệ/i);
});

test("validateSegments accepts a table with a score jump (BSC style) as long as ranges stay continuous", () => {
  const segments: KpiSegment[] = [
    { from: null, fromInclusive: false, to: 1.0, toInclusive: false, a: 100, b: -97 },
    { from: 1.0, fromInclusive: true, to: null, toInclusive: false, a: 25, b: -22 },
  ];
  assert.equal(validateSegments(segments), null);
});

test("validateSegments rejects empty table", () => {
  const err = validateSegments([]);
  assert.ok(err);
});
