import { query, run } from "../../database/db.js";
import { HttpError } from "../auth/auth.service.js";
import { KPI_KEYS, type KpiKey } from "../../constants/org.js";
import { DEFAULT_KPI_FORMULAS, validateSegments, type KpiSegment } from "./kpi-formula.js";

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
}
