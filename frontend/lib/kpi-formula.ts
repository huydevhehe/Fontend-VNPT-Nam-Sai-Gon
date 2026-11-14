/**
 * Logic chấm điểm KPI theo bảng khoảng — bản sao thuần phía frontend của
 * `backend/src/modules/kpi/kpi-formula.ts`, dùng cho ô "thử tính" ở trang
 * Cấu hình KPI (không gọi API, tính ngay trên client). Giữ đúng cùng công
 * thức/edge-case với backend; mọi thay đổi ở 1 bên phải soi lại bên kia.
 */

export type KpiKey = "thu_ngay" | "ghtt_t" | "ghtt_t1";

export interface KpiSegment {
  from: number | null;
  fromInclusive: boolean;
  to: number | null;
  toInclusive: boolean;
  a: number;
  b: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function segmentContains(segment: KpiSegment, rate: number): boolean {
  const lowerOk =
    segment.from === null ? true : segment.fromInclusive ? rate >= segment.from : rate > segment.from;
  const upperOk = segment.to === null ? true : segment.toInclusive ? rate <= segment.to : rate < segment.to;
  return lowerOk && upperOk;
}

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
