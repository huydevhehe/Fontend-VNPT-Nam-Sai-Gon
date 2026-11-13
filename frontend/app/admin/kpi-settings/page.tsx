"use client";

import { useEffect, useState } from "react";
import { Settings2, RotateCcw, Calculator, AlertCircle, ClipboardCopy } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import {
  DEFAULT_KPI_FORMULAS,
  scoreKpi,
  validateSegments,
  type KpiKey,
  type KpiSegment,
} from "@/lib/kpi-formula";
import {
  getKpiFormulas,
  getKpiPerformance,
  resetKpiFormula,
  saveKpiFormula,
  saveKpiTargets,
  type KpiFormulas,
  type KpiTargetItem,
} from "@/lib/api/kpi.api";

const KPI_CARDS: { key: KpiKey; label: string }[] = [
  { key: "thu_ngay", label: "Tỷ lệ thu ngay" },
  { key: "ghtt_t", label: "GHTT tháng T" },
  { key: "ghtt_t1", label: "GHTT tháng T+1" },
];

/** Khoảng hiển thị trên UI theo %, chuyển sang thập phân (chia 100) khi gửi API. */
interface SegmentForm {
  from: string; // "" = -∞ / +∞ tuỳ vị trí
  fromInclusive: boolean;
  to: string;
  toInclusive: boolean;
  a: string;
  b: string;
}

function segmentToForm(s: KpiSegment): SegmentForm {
  return {
    from: s.from === null ? "" : String(s.from * 100),
    fromInclusive: s.fromInclusive,
    to: s.to === null ? "" : String(s.to * 100),
    toInclusive: s.toInclusive,
    a: String(s.a),
    b: String(s.b),
  };
}

function formToSegment(f: SegmentForm): KpiSegment {
  const from = f.from.trim() === "" ? null : Number(f.from) / 100;
  const to = f.to.trim() === "" ? null : Number(f.to) / 100;
  return {
    from,
    fromInclusive: f.fromInclusive,
    to,
    toInclusive: f.toInclusive,
    a: Number(f.a),
    b: Number(f.b),
  };
}

function FormulaCard({
  kpiKey,
  label,
  segments,
  isAdmin,
  onSaved,
}: {
  kpiKey: KpiKey;
  label: string;
  segments: KpiSegment[];
  isAdmin: boolean;
  onSaved: (key: KpiKey, segments: KpiSegment[]) => void;
}) {
  // `rows` chỉ cần khởi tạo 1 lần từ `segments` — khi `segments` đổi sau khi
  // lưu/khôi phục, cha (KpiSettingsPage) đổi `key` trên component này để ép
  // remount thay vì dùng effect đồng bộ state từ prop.
  const [rows, setRows] = useState<SegmentForm[]>(() => segments.map(segmentToForm));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [testRate, setTestRate] = useState("");

  function updateRow(idx: number, patch: Partial<SegmentForm>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { from: "", fromInclusive: true, to: "", toInclusive: false, a: "0", b: "0" }]);
  }

  function removeRow(idx: number) {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setError(null);
    const parsed = rows.map(formToSegment);
    const validationError = validateSegments(parsed);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    try {
      const saved = await saveKpiFormula(kpiKey, parsed);
      onSaved(kpiKey, saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lưu công thức thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setSaving(true);
    setError(null);
    try {
      const reset = await resetKpiFormula(kpiKey);
      onSaved(kpiKey, reset);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Khôi phục mặc định thất bại.");
    } finally {
      setSaving(false);
    }
  }

  const currentSegments = rows.map(formToSegment);
  const testRateNum = testRate.trim() === "" ? null : Number(testRate) / 100;
  const testScore = validateSegments(currentSegments) ? null : scoreKpi(currentSegments, testRateNum);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <h3 className="mb-3 text-sm font-bold text-slate-900">{label}</h3>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-xs">
          <thead className="text-[11px] font-bold uppercase text-slate-500">
            <tr>
              <th className="px-2 py-1.5">Từ (%)</th>
              <th className="px-2 py-1.5">Gồm</th>
              <th className="px-2 py-1.5">Đến (%)</th>
              <th className="px-2 py-1.5">Gồm</th>
              <th className="px-2 py-1.5">a</th>
              <th className="px-2 py-1.5">b</th>
              {isAdmin && <th className="px-2 py-1.5" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td className="px-2 py-1.5">
                  <input
                    disabled={!isAdmin}
                    value={row.from}
                    placeholder="-∞"
                    onChange={(e) => updateRow(idx, { from: e.target.value })}
                    className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-xs disabled:bg-slate-50"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="checkbox"
                    disabled={!isAdmin}
                    checked={row.fromInclusive}
                    onChange={(e) => updateRow(idx, { fromInclusive: e.target.checked })}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    disabled={!isAdmin}
                    value={row.to}
                    placeholder="+∞"
                    onChange={(e) => updateRow(idx, { to: e.target.value })}
                    className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-xs disabled:bg-slate-50"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="checkbox"
                    disabled={!isAdmin}
                    checked={row.toInclusive}
                    onChange={(e) => updateRow(idx, { toInclusive: e.target.checked })}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    disabled={!isAdmin}
                    value={row.a}
                    onChange={(e) => updateRow(idx, { a: e.target.value })}
                    className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-xs disabled:bg-slate-50"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    disabled={!isAdmin}
                    value={row.b}
                    onChange={(e) => updateRow(idx, { b: e.target.value })}
                    className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-xs disabled:bg-slate-50"
                  />
                </td>
                {isAdmin && (
                  <td className="px-2 py-1.5">
                    <button
                      onClick={() => removeRow(idx)}
                      className="text-[11px] font-semibold text-rose-500 hover:underline"
                    >
                      Xóa
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-[11px] text-slate-400">
        Điểm = a × TL + b, TL = tỷ lệ hoàn thành (100% = 1).
      </p>

      {error && (
        <p className="mt-2 flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </p>
      )}

      {isAdmin && (
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={addRow}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            + Thêm khoảng
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-vnpt px-3 py-1.5 text-xs font-bold text-white hover:bg-vnpt-dark disabled:opacity-60"
          >
            Lưu
          </button>
          <button
            onClick={handleReset}
            disabled={saving}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Khôi phục mặc định VNPT
          </button>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
        <Calculator className="h-4 w-4 text-slate-400" />
        <label className="text-xs font-semibold text-slate-600">Thử tính: TL =</label>
        <input
          value={testRate}
          onChange={(e) => setTestRate(e.target.value)}
          placeholder="VD: 98.5"
          className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-xs"
        />
        <span className="text-xs text-slate-500">%</span>
        <span className="text-xs text-slate-500">→ Điểm:</span>
        <span className="text-sm font-bold text-vnpt">
          {testRateNum === null ? "—" : testScore === null ? "—" : testScore}
        </span>
      </div>
    </div>
  );
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function previousMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const total = (y * 12 + (m - 1)) - 1;
  const newYear = Math.floor(total / 12);
  const newMonth = (total % 12) + 1;
  return `${newYear}-${String(newMonth).padStart(2, "0")}`;
}

interface TargetRow {
  staffName: string;
  thuNgay: string;
  ghttT: string;
  ghttT1: string;
}

function KpiTargetsTab() {
  const [month, setMonth] = useState(currentMonth());
  const [rows, setRows] = useState<TargetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const performance = await getKpiPerformance(month);
      setRows(
        performance.map((p) => ({
          staffName: p.staffName,
          thuNgay: p.thuNgay.targetRate === null ? "" : String(p.thuNgay.targetRate * 100),
          ghttT: p.ghttT.targetRate === null ? "" : String(p.ghttT.targetRate * 100),
          ghttT1: p.ghttT1.targetRate === null ? "" : String(p.ghttT1.targetRate * 100),
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải chỉ tiêu KPI.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [month]);

  function updateCell(staffName: string, field: "thuNgay" | "ghttT" | "ghttT1", value: string) {
    setRows((prev) => prev.map((r) => (r.staffName === staffName ? { ...r, [field]: value } : r)));
  }

  async function handleCopyFromPreviousMonth() {
    setError(null);
    try {
      const prev = await getKpiPerformance(previousMonth(month));
      const byName = new Map(prev.map((p) => [p.staffName, p]));
      setRows((current) =>
        current.map((row) => {
          const p = byName.get(row.staffName);
          if (!p) return row;
          return {
            staffName: row.staffName,
            thuNgay: p.thuNgay.targetRate === null ? "" : String(p.thuNgay.targetRate * 100),
            ghttT: p.ghttT.targetRate === null ? "" : String(p.ghttT.targetRate * 100),
            ghttT1: p.ghttT1.targetRate === null ? "" : String(p.ghttT1.targetRate * 100),
          };
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể sao chép từ tháng trước.");
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const items: KpiTargetItem[] = [];
      for (const row of rows) {
        (["thuNgay", "ghttT", "ghttT1"] as const).forEach((field, idx) => {
          const raw = row[field];
          if (raw.trim() === "") return;
          const kpiKey: KpiKey = (["thu_ngay", "ghtt_t", "ghtt_t1"] as const)[idx];
          items.push({ staffName: row.staffName, kpiKey, targetRate: Number(raw) / 100 });
        });
      }
      await saveKpiTargets(month, items);
      setMessage("Đã lưu chỉ tiêu.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lưu chỉ tiêu thất bại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <label className="text-xs font-semibold text-slate-600">Tháng</label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
        />
        <button
          onClick={handleCopyFromPreviousMonth}
          className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <ClipboardCopy className="h-3.5 w-3.5" /> Sao chép từ tháng trước
        </button>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="rounded-lg bg-vnpt px-3 py-1.5 text-xs font-bold text-white hover:bg-vnpt-dark disabled:opacity-60"
        >
          {saving ? "Đang lưu..." : "Lưu chỉ tiêu"}
        </button>
        {message && <span className="text-xs font-semibold text-emerald-600">{message}</span>}
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{error}</p>
      )}

      {loading ? (
        <p className="py-6 text-center text-xs text-slate-500">Đang tải...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-xs">
            <thead className="text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Nhân viên</th>
                <th className="px-3 py-2">Thu ngay (%)</th>
                <th className="px-3 py-2">GHTT T (%)</th>
                <th className="px-3 py-2">GHTT T+1 (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.staffName}>
                  <td className="px-3 py-2 font-semibold text-slate-800">{row.staffName}</td>
                  <td className="px-3 py-2">
                    <input
                      value={row.thuNgay}
                      placeholder="Chưa có chỉ tiêu"
                      onChange={(e) => updateCell(row.staffName, "thuNgay", e.target.value)}
                      className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-xs"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={row.ghttT}
                      onChange={(e) => updateCell(row.staffName, "ghttT", e.target.value)}
                      className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-xs"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={row.ghttT1}
                      onChange={(e) => updateCell(row.staffName, "ghttT1", e.target.value)}
                      className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-xs"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function KpiSettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [tab, setTab] = useState<"formulas" | "targets">("formulas");

  const [formulas, setFormulas] = useState<KpiFormulas>(DEFAULT_KPI_FORMULAS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Tăng lên mỗi khi 1 thẻ công thức được lưu/khôi phục để ép FormulaCard đó
  // remount (đọc lại `segments` mới làm giá trị khởi tạo) — xem chú thích ở
  // `useState(() => segments.map(segmentToForm))` trong FormulaCard.
  const [formulaVersion, setFormulaVersion] = useState<Record<KpiKey, number>>({
    thu_ngay: 0,
    ghtt_t: 0,
    ghtt_t1: 0,
  });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getKpiFormulas();
      setFormulas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải công thức KPI.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleSaved(key: KpiKey, segments: KpiSegment[]) {
    setFormulas((prev) => ({ ...prev, [key]: segments }));
    setFormulaVersion((prev) => ({ ...prev, [key]: prev[key] + 1 }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
          <Settings2 className="h-5 w-5 text-vnpt" /> Cấu hình KPI
        </h2>
        <p className="text-xs text-slate-500">
          Bảng công thức theo khoảng cho Tỷ lệ thu ngay và GHTT tháng T / T+1. Điểm = a × TL + b.
          {!isAdmin && " Chỉ Admin được sửa; bạn đang xem ở chế độ chỉ đọc."}
        </p>
      </div>

      {isAdmin && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setTab("formulas")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              tab === "formulas" ? "bg-vnpt text-white" : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Công thức
          </button>
          <button
            onClick={() => setTab("targets")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              tab === "targets" ? "bg-vnpt text-white" : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Chỉ tiêu
          </button>
        </div>
      )}

      {tab === "targets" && isAdmin ? (
        <KpiTargetsTab />
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-10 text-center text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
          Đang tải công thức KPI...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {KPI_CARDS.map((card) => (
            <FormulaCard
              key={`${card.key}-${formulaVersion[card.key]}`}
              kpiKey={card.key}
              label={card.label}
              segments={formulas[card.key]}
              isAdmin={isAdmin}
              onSaved={handleSaved}
            />
          ))}
        </div>
      )}
    </div>
  );
}
