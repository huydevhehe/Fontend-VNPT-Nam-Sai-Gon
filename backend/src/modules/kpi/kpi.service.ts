import { query, run } from "../../database/db.js";
import { HttpError } from "../auth/auth.service.js";
import { KPI_KEYS, ROLES, DEFAULT_KPI_TARGETS, type KpiKey } from "../../constants/org.js";
import { DEFAULT_KPI_FORMULAS, scoreKpi, validateSegments, type KpiSegment } from "./kpi-formula.js";

function isKpiKey(value: string): value is KpiKey {
  return (KPI_KEYS as readonly string[]).includes(value);
}

export function assertKpiKey(value: string): KpiKey {
  if (!isKpiKey(value)) {
    throw new HttpError(400, `Chỉ số KPI không hợp lệ: ${value}`);
  }
  return value;
}

interface KpiFormulaRow {
  kpi_key: string;
  segments: string;
  updated_by: string | null;
  updated_at: string | null;
}

/** Trả `YYYY-MM-05` của tháng `month` (dạng `YYYY-MM`) cộng thêm `offsetMonths` tháng (xử lý đúng rollover qua năm, vd tháng 12). */
export function ghttDeadline(month: string, offsetMonths: 1 | 2): string {
  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const monthIndex0 = Number(monthStr) - 1; // 0-11
  const total = monthIndex0 + offsetMonths;
  const newYear = year + Math.floor(total / 12);
  const newMonthIndex0 = ((total % 12) + 12) % 12;
  return `${newYear}-${String(newMonthIndex0 + 1).padStart(2, "0")}-05`;
}

export interface KpiCell {
  numerator: number;
  denominator: number;
  actualRate: number | null;
  targetRate: number | null;
  completion: number | null;
  score: number | null;
}

export interface StaffKpiRow {
  staffName: string;
  thuNgay: KpiCell;
  ghttT: KpiCell;
  ghttT1: KpiCell;
}

function computeCell(
  numerator: number,
  denominator: number,
  targetRate: number | null,
  segments: KpiSegment[]
): KpiCell {
  const actualRate = denominator > 0 ? numerator / denominator : null;
  const completion =
    actualRate !== null && targetRate !== null && targetRate > 0 ? actualRate / targetRate : null;
  const score = completion === null ? null : scoreKpi(segments, completion);
  return { numerator, denominator, actualRate, targetRate, completion, score };
}

export class KpiService {
  /** Trả bảng công thức hiện tại của cả 3 chỉ số; chưa có dòng DB → dùng mặc định. */
  async getFormulas(): Promise<Record<KpiKey, KpiSegment[]>> {
    const rows = await query<KpiFormulaRow>("SELECT * FROM kpi_formulas", []);
    const byKey = new Map(rows.map((r) => [r.kpi_key, r]));

    const result = {} as Record<KpiKey, KpiSegment[]>;
    for (const key of KPI_KEYS) {
      const row = byKey.get(key);
      if (row) {
        try {
          result[key] = JSON.parse(row.segments) as KpiSegment[];
        } catch {
          result[key] = DEFAULT_KPI_FORMULAS[key];
        }
      } else {
        result[key] = DEFAULT_KPI_FORMULAS[key];
      }
    }
    return result;
  }

  async getFormula(key: KpiKey): Promise<KpiSegment[]> {
    const rows = await query<KpiFormulaRow>("SELECT * FROM kpi_formulas WHERE kpi_key = ?", [key]);
    if (!rows.length) {
      return DEFAULT_KPI_FORMULAS[key];
    }
    try {
      return JSON.parse(rows[0].segments) as KpiSegment[];
    } catch {
      return DEFAULT_KPI_FORMULAS[key];
    }
  }

  async saveFormula(key: KpiKey, segments: KpiSegment[], admin: string): Promise<KpiSegment[]> {
    const error = validateSegments(segments);
    if (error) {
      throw new HttpError(400, error);
    }

    const now = new Date().toISOString();
    const existing = await query<{ kpi_key: string }>("SELECT kpi_key FROM kpi_formulas WHERE kpi_key = ?", [key]);
    if (existing.length) {
      await run("UPDATE kpi_formulas SET segments = ?, updated_by = ?, updated_at = ? WHERE kpi_key = ?", [
        JSON.stringify(segments),
        admin,
        now,
        key,
      ]);
    } else {
      await run(
        "INSERT INTO kpi_formulas (kpi_key, segments, updated_by, updated_at) VALUES (?, ?, ?, ?)",
        [key, JSON.stringify(segments), admin, now]
      );
    }
    return segments;
  }

  async resetFormula(key: KpiKey): Promise<KpiSegment[]> {
    await run("DELETE FROM kpi_formulas WHERE kpi_key = ?", [key]);
    return DEFAULT_KPI_FORMULAS[key];
  }

  /** Admin nhập/sửa chỉ tiêu theo tháng cho danh sách (nhân viên, chỉ số). */
  async upsertTargets(
    month: string,
    items: { staffName: string; kpiKey: KpiKey; targetRate: number }[],
    admin: string
  ): Promise<{ staffName: string; kpiKey: KpiKey; targetRate: number }[]> {
    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new HttpError(400, "Tháng phải theo định dạng YYYY-MM");
    }

    for (const item of items) {
      const targetRate = Number(item.targetRate);
      if (!Number.isFinite(targetRate) || targetRate <= 0 || targetRate > 2) {
        throw new HttpError(400, `Chỉ tiêu của ${item.staffName} phải lớn hơn 0 và không quá 200%`);
      }
      const staffName = (item.staffName || "").trim();
      if (!staffName) {
        throw new HttpError(400, "Thiếu tên nhân viên");
      }
      const staffRows = await query<{ id: string }>("SELECT id FROM staff WHERE name = ?", [staffName]);
      if (!staffRows.length) {
        throw new HttpError(400, `Nhân viên không tồn tại: ${staffName}`);
      }
    }

    const now = new Date().toISOString();
    const saved: { staffName: string; kpiKey: KpiKey; targetRate: number }[] = [];
    for (const item of items) {
      const staffName = item.staffName.trim();
      const existing = await query<{ id: string }>(
        "SELECT id FROM kpi_targets WHERE staff_name = ? AND month = ? AND kpi_key = ?",
        [staffName, month, item.kpiKey]
      );
      if (existing.length) {
        await run(
          "UPDATE kpi_targets SET target_rate = ?, updated_by = ?, updated_at = ? WHERE id = ?",
          [item.targetRate, admin, now, existing[0].id]
        );
      } else {
        await run(
          `INSERT INTO kpi_targets (id, staff_name, month, kpi_key, target_rate, updated_by, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [`KPI-TGT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, staffName, month, item.kpiKey, item.targetRate, admin, now]
        );
      }
      saved.push({ staffName, kpiKey: item.kpiKey, targetRate: item.targetRate });
    }
    return saved;
  }

  async getTargets(month: string): Promise<{ staffName: string; kpiKey: KpiKey; targetRate: number }[]> {
    const rows = await query<{ staff_name: string; kpi_key: string; target_rate: number }>(
      "SELECT staff_name, kpi_key, target_rate FROM kpi_targets WHERE month = ?",
      [month]
    );
    return rows.map((r) => ({
      staffName: r.staff_name,
      kpiKey: r.kpi_key as KpiKey,
      targetRate: Number(r.target_rate),
    }));
  }

  /**
   * Bảng % thực hiện + điểm KPI từng nhân viên cho 1 tháng. Không phải Admin
   * → chỉ trả dòng của chính mình (ép ở tầng service, không chỉ ẩn ở UI).
   */
  async getPerformance(month: string, actor: { role: string; name: string }): Promise<StaffKpiRow[]> {
    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new HttpError(400, "Tháng phải theo định dạng YYYY-MM");
    }

    const activeAmRows = await query<{ name: string }>(
      "SELECT name FROM staff WHERE status = 'Đang hoạt động' AND role IN ('AM', 'AM Bán chăm')",
      []
    );
    const debtStaffRows = await query<{ staff_name: string }>(
      "SELECT DISTINCT staff_name FROM debts WHERE month = ?",
      [month]
    );
    const renewalStaffRows = await query<{ staff_name: string }>(
      "SELECT DISTINCT staff_name FROM renewals WHERE expiry_date LIKE ?",
      [`${month}-%`]
    );

    const staffNames = new Set<string>();
    for (const r of activeAmRows) staffNames.add(r.name.trim());
    for (const r of debtStaffRows) if (r.staff_name) staffNames.add(r.staff_name.trim());
    for (const r of renewalStaffRows) if (r.staff_name) staffNames.add(r.staff_name.trim());

    const relevantNames =
      actor.role === ROLES.ADMIN ? Array.from(staffNames) : Array.from(staffNames).filter((n) => n === actor.name.trim());

    const formulas = await this.getFormulas();
    const targets = await this.getTargets(month);
    const targetByStaffKey = new Map<string, number>();
    for (const t of targets) {
      targetByStaffKey.set(`${t.staffName}::${t.kpiKey}`, t.targetRate);
    }
    function resolveTarget(staffName: string, key: KpiKey): number | null {
      const explicit = targetByStaffKey.get(`${staffName}::${key}`);
      if (explicit !== undefined) return explicit;
      return DEFAULT_KPI_TARGETS[key] ?? null;
    }

    const deadline1 = ghttDeadline(month, 1);
    const deadline2 = ghttDeadline(month, 2);

    const rows: StaffKpiRow[] = [];
    for (const staffName of relevantNames) {
      const debtAgg = await query<{ denom: string | number | null; numer: string | number | null }>(
        "SELECT SUM(immediate_debt) as denom, SUM(collected_amount) as numer FROM debts WHERE month = ? AND staff_name = ?",
        [month, staffName]
      );
      const immediateDebtSum = Number(debtAgg[0]?.denom ?? 0);
      const collectedSum = Number(debtAgg[0]?.numer ?? 0);

      const ghttDenomRows = await query<{ cnt: string | number }>(
        "SELECT COUNT(*) as cnt FROM renewals WHERE expiry_date LIKE ? AND staff_name = ?",
        [`${month}-%`, staffName]
      );
      const ghttDenom = Number(ghttDenomRows[0]?.cnt ?? 0);

      const ghttTNumerRows = await query<{ cnt: string | number }>(
        "SELECT COUNT(*) as cnt FROM renewals WHERE expiry_date LIKE ? AND staff_name = ? AND renewed_at IS NOT NULL AND renewed_at <= ?",
        [`${month}-%`, staffName, deadline1]
      );
      const ghttTNumer = Number(ghttTNumerRows[0]?.cnt ?? 0);

      const ghttT1NumerRows = await query<{ cnt: string | number }>(
        "SELECT COUNT(*) as cnt FROM renewals WHERE expiry_date LIKE ? AND staff_name = ? AND renewed_at IS NOT NULL AND renewed_at <= ?",
        [`${month}-%`, staffName, deadline2]
      );
      const ghttT1Numer = Number(ghttT1NumerRows[0]?.cnt ?? 0);

      rows.push({
        staffName,
        thuNgay: computeCell(collectedSum, immediateDebtSum, resolveTarget(staffName, "thu_ngay"), formulas.thu_ngay),
        ghttT: computeCell(ghttTNumer, ghttDenom, resolveTarget(staffName, "ghtt_t"), formulas.ghtt_t),
        ghttT1: computeCell(ghttT1Numer, ghttDenom, resolveTarget(staffName, "ghtt_t1"), formulas.ghtt_t1),
      });
    }

    return rows;
  }
}
