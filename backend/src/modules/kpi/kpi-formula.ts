import type { KpiKey } from "../../constants/org.js";

/**
 * 1 khoảng của bảng công thức chấm điểm KPI theo từng chỉ số: điểm = a × TL + b.
 * `from = null` nghĩa là -∞ (không có cận dưới), `to = null` nghĩa là +∞
 * (không có cận trên). `TL` (tỷ lệ hoàn thành) là số thập phân, 1 = 100%.
 */
export interface KpiSegment {
  from: number | null;
  fromInclusive: boolean;
  to: number | null;
  toInclusive: boolean;
  a: number;
  b: number;
}

export type { KpiKey };

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function segmentContains(segment: KpiSegment, rate: number): boolean {
  const lowerOk =
    segment.from === null ? true : segment.fromInclusive ? rate >= segment.from : rate > segment.from;
  const upperOk = segment.to === null ? true : segment.toInclusive ? rate <= segment.to : rate < segment.to;
  return lowerOk && upperOk;
}

/**
 * Validate 1 bảng công thức (danh sách khoảng đã sắp theo `from` tăng dần).
 * Trả câu lỗi tiếng Việt mô tả chỗ sai, hoặc `null` nếu hợp lệ. Yêu cầu:
 * - Không rỗng.
 * - Khoảng đầu tiên `from = null` (-∞), khoảng cuối cùng `to = null` (+∞).
 * - Mỗi khoảng kế tiếp: `from` của khoảng sau = `to` của khoảng trước (không
 *   khe hở, không nhảy cóc), và đúng MỘT trong hai đầu nối là inclusive
 *   (không chồng lấn tại điểm nối, không bỏ sót điểm nối).
 * - `a`, `b` là số hữu hạn ở mọi khoảng.
 * Bảng vẫn hợp lệ dù điểm (a×TL+b) nhảy cóc giữa 2 khoảng — chỉ domain (TL)
 * mới cần liên tục, không bắt buộc hàm số liên tục.
 */
export function validateSegments(segments: KpiSegment[]): string | null {
  if (!Array.isArray(segments) || segments.length === 0) {
    return "Bảng công thức không được để trống";
  }

  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    if (!Number.isFinite(s.a) || !Number.isFinite(s.b)) {
      return `Khoảng thứ ${i + 1}: hệ số a và b phải là số hợp lệ`;
    }
    if (s.from !== null && s.to !== null && s.from >= s.to) {
      return `Khoảng thứ ${i + 1}: giá trị "Từ" phải nhỏ hơn giá trị "Đến"`;
    }
  }

  if (segments[0].from !== null) {
    return "Khoảng đầu tiên phải bắt đầu từ âm vô cùng (không giới hạn cận dưới)";
  }
  if (segments[segments.length - 1].to !== null) {
    return "Khoảng cuối cùng phải kết thúc ở dương vô cùng (không giới hạn cận trên)";
  }

  for (let i = 0; i < segments.length - 1; i++) {
    const cur = segments[i];
    const next = segments[i + 1];

    if (cur.to === null || next.from === null || cur.to !== next.from) {
      const curTo = cur.to === null ? "+∞" : cur.to;
      const nextFrom = next.from === null ? "-∞" : next.from;
      return `Khoảng thứ ${i + 1} và ${i + 2} có khe hở hoặc không liền kề (${curTo} ≠ ${nextFrom})`;
    }

    if (cur.toInclusive === next.fromInclusive) {
      return cur.toInclusive
        ? `Khoảng thứ ${i + 1} và ${i + 2} chồng lấn tại ${cur.to} (cả hai đều gồm điểm này)`
        : `Khoảng thứ ${i + 1} và ${i + 2} có khe hở tại ${cur.to} (không khoảng nào gồm điểm này)`;
    }
  }

  return null;
}

/**
 * Tính điểm KPI theo bảng khoảng cho 1 tỷ lệ hoàn thành `rate` (thập phân,
 * 1 = 100%). `rate = null` (mẫu số 0, không có chỉ tiêu...) → trả `null`.
 * Điểm được làm tròn 2 chữ số thập phân.
 */
export function scoreKpi(segments: KpiSegment[], rate: number | null): number | null {
  if (rate === null || rate === undefined || !Number.isFinite(rate)) {
    return null;
  }
  for (const segment of segments) {
    if (segmentContains(segment, rate)) {
      return round2(segment.a * rate + segment.b);
    }
  }
  return null;
}

/**
 * Bảng công thức mặc định VNPT (đã chốt với anh Huy — xem Global Constraints
 * ở `docs/superpowers/plans/2026-11-11-feedback-l1/dot-09.md`).
 */
export const DEFAULT_KPI_FORMULAS: Record<KpiKey, KpiSegment[]> = {
  thu_ngay: [
    { from: null, fromInclusive: false, to: 0.98, toInclusive: false, a: 0, b: 1 },
    { from: 0.98, fromInclusive: true, to: 1.0, toInclusive: false, a: 150, b: -146 },
    { from: 1.0, fromInclusive: true, to: 1.008, toInclusive: false, a: 125, b: -121 },
    { from: 1.008, fromInclusive: true, to: null, toInclusive: false, a: 0, b: 5 },
  ],
  ghtt_t: [
    { from: null, fromInclusive: false, to: 0.8, toInclusive: false, a: 0, b: 1 },
    { from: 0.8, fromInclusive: true, to: 1.0, toInclusive: true, a: 20, b: -15 },
    { from: 1.0, fromInclusive: false, to: null, toInclusive: false, a: 0, b: 5 },
  ],
  ghtt_t1: [
    { from: null, fromInclusive: false, to: 0.82, toInclusive: false, a: 0, b: 1 },
    { from: 0.82, fromInclusive: true, to: 1.0, toInclusive: true, a: 22.22, b: -17.22 },
    { from: 1.0, fromInclusive: false, to: null, toInclusive: false, a: 0, b: 5 },
  ],
};
