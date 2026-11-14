"use client";

import { useMemo, useState, ChangeEvent } from "react";
import { X, UploadCloud, AlertTriangle, CheckCircle2, FileSpreadsheet } from "lucide-react";
import { TerritoryRecord } from "@/lib/crm/types/crm.types";
import {
  previewCustomerImport,
  commitCustomerImport,
  ClassifiedRow,
  ImportPreviewResult,
  CommitImportResult,
  CommitAction,
  CommitDecisionInput,
} from "@/lib/api/customer-import.api";

interface RowState {
  classified: ClassifiedRow;
  action: CommitAction | null;
  targetCustomerId?: string;
  customerGroup: string;
  staffName: string;
  selected: boolean;
}

type TabKey = "new" | "duplicate" | "ptm" | "error";

const CUSTOMER_GROUP_OPTIONS = ["Tự phát triển", "Tập hiện hữu", "PTM địa bàn"];

interface CustomerImportWizardProps {
  territories: TerritoryRecord[];
  staffNames: string[];
  onClose: () => void;
  onImported: () => void;
}

function buildInitialRowState(classified: ClassifiedRow): RowState {
  const defaultMatch = classified.matches.find((m) => m.customerId);
  return {
    classified,
    action: classified.status === "new" ? "create" : null,
    targetCustomerId: defaultMatch?.customerId,
    customerGroup: classified.ptmConflict ? "PTM địa bàn" : "",
    staffName: classified.resolvedStaffName || "",
    selected: false,
  };
}

export default function CustomerImportWizard({
  territories,
  staffNames,
  onClose,
  onImported,
}: CustomerImportWizardProps) {
  const [step, setStep] = useState<"upload" | "review" | "result">("upload");

  // Bước 1
  const [file, setFile] = useState<File | null>(null);
  const [territoryId, setTerritoryId] = useState("");
  const [defaultStaff, setDefaultStaff] = useState("");
  const [handoverBatch, setHandoverBatch] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  // Bước 2
  const [rowStates, setRowStates] = useState<RowState[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("new");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Bước 3
  const [result, setResult] = useState<CommitImportResult | null>(null);

  async function handleCheckFile() {
    if (!file) {
      setUploadError("Vui lòng chọn file Excel");
      return;
    }
    setUploadError(null);
    setChecking(true);
    try {
      const preview: ImportPreviewResult = await previewCustomerImport(file, {
        defaultStaff: defaultStaff.trim() || undefined,
      });
      setRowStates(preview.rows.map(buildInitialRowState));
      setActiveTab(preview.summary.new > 0 ? "new" : preview.summary.duplicate > 0 ? "duplicate" : "error");
      setStep("review");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Kiểm tra file thất bại");
    } finally {
      setChecking(false);
    }
  }

  const newRows = useMemo(() => rowStates.filter((r) => r.classified.status === "new"), [rowStates]);
  const duplicateRows = useMemo(
    () => rowStates.filter((r) => r.classified.status === "duplicate"),
    [rowStates]
  );
  const ptmRows = useMemo(() => rowStates.filter((r) => r.classified.ptmConflict), [rowStates]);
  const errorRows = useMemo(() => rowStates.filter((r) => r.classified.status === "error"), [rowStates]);

  const visibleRows = useMemo(() => {
    if (activeTab === "new") return newRows;
    if (activeTab === "duplicate") return duplicateRows;
    if (activeTab === "ptm") return ptmRows;
    return errorRows;
  }, [activeTab, newRows, duplicateRows, ptmRows, errorRows]);

  const pendingDuplicateCount = duplicateRows.filter((r) => !r.action).length;
  const canSubmit = pendingDuplicateCount === 0 && (newRows.length > 0 || duplicateRows.length > 0);

  function updateRow(rowNumber: number, patch: Partial<RowState>) {
    setRowStates((prev) =>
      prev.map((r) => (r.classified.row.rowNumber === rowNumber ? { ...r, ...patch } : r))
    );
  }

  function toggleSelectAllVisible(checked: boolean) {
    const visibleNumbers = new Set(visibleRows.map((r) => r.classified.row.rowNumber));
    setRowStates((prev) =>
      prev.map((r) =>
        visibleNumbers.has(r.classified.row.rowNumber) ? { ...r, selected: checked } : r
      )
    );
  }

  function applyBulkAction(action: CommitAction) {
    const selectedNumbers = new Set(
      visibleRows.filter((r) => r.selected).map((r) => r.classified.row.rowNumber)
    );
    if (selectedNumbers.size === 0) return;
    setRowStates((prev) =>
      prev.map((r) => (selectedNumbers.has(r.classified.row.rowNumber) ? { ...r, action } : r))
    );
  }

  async function handleSubmit() {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const decisions: CommitDecisionInput[] = [];
      for (const r of [...newRows, ...duplicateRows]) {
        if (!r.action) continue;
        decisions.push({
          row: r.classified.row,
          action: r.action,
          targetCustomerId: r.targetCustomerId,
          customerGroup: r.customerGroup || undefined,
          staffName: r.staffName || undefined,
        });
      }

      const res = await commitCustomerImport({
        territoryId: territoryId || null,
        handoverBatch: handoverBatch.trim() || undefined,
        decisions,
      });
      setResult(res);
      setStep("result");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Nhập dữ liệu thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  function renderDuplicateCompare(row: RowState) {
    const match = row.classified.matches.find((m) => m.existing) || row.classified.matches[0];
    const existing = match?.existing;
    const fieldsHighlighted = new Set(
      row.classified.matches.flatMap((m) => m.matchedFields)
    );

    const compareFields: { label: string; oldValue?: string | null; newValue: string }[] = existing
      ? [
          { label: "Tên", oldValue: existing.name, newValue: row.classified.row.name },
          { label: "MST/CCCD", oldValue: existing.identity_code, newValue: row.classified.row.taxCode },
          { label: "Mã KH", oldValue: existing.customer_code, newValue: row.classified.row.customerCode },
          { label: "SĐT", oldValue: existing.phone, newValue: row.classified.row.phone },
          { label: "Email", oldValue: existing.contact_email, newValue: row.classified.row.email },
        ]
      : [];

    return (
      <div className="space-y-2">
        {row.classified.matches.some((m) => m.matchedRowNumber) && (
          <p className="text-[11px] text-amber-700">
            Trùng với dòng số {row.classified.matches.find((m) => m.matchedRowNumber)?.matchedRowNumber} trong cùng file.
          </p>
        )}
        {existing ? (
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-slate-400">
                <th className="text-left font-medium">Trường</th>
                <th className="text-left font-medium">Bản cũ</th>
                <th className="text-left font-medium">Bản mới</th>
              </tr>
            </thead>
            <tbody>
              {compareFields.map((f) => (
                <tr
                  key={f.label}
                  className={fieldsHighlighted.has(f.label) ? "bg-amber-50" : ""}
                >
                  <td className="py-0.5 pr-2 font-semibold text-slate-600">{f.label}</td>
                  <td className="py-0.5 pr-2 text-slate-700">{f.oldValue || "—"}</td>
                  <td className="py-0.5 text-slate-900">{f.newValue || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
        <p className="text-[11px] font-medium text-amber-700">
          Trùng: {Array.from(fieldsHighlighted).join(", ")}
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vnpt/10 text-vnpt">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Nhập khách hàng (xử lý trùng)</h3>
              <p className="text-[11px] text-slate-500">
                Hỗ trợ file &quot;Tập khách địa bàn&quot; của VNPT và sheet &quot;Khách hàng&quot; (tiêu đề 2 dòng)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {step === "upload" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Phường / Địa bàn (tuỳ chọn)
                  </label>
                  <select
                    value={territoryId}
                    onChange={(e) => setTerritoryId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  >
                    <option value="">Không chọn</option>
                    {territories.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.wardName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    AM chăm sóc mặc định (tuỳ chọn)
                  </label>
                  <input
                    list="customer-import-staff-names"
                    value={defaultStaff}
                    onChange={(e) => setDefaultStaff(e.target.value)}
                    placeholder="Dùng khi không khớp được mã HRM"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Mã đợt giao (tuỳ chọn)
                </label>
                <input
                  value={handoverBatch}
                  onChange={(e) => setHandoverBatch(e.target.value)}
                  placeholder="Ví dụ: DOT-2026-11"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  File Excel (.xlsx, .xls) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-vnpt/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-vnpt hover:file:bg-vnpt/20"
                />
              </div>

              {uploadError && (
                <div className="flex items-start gap-2 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          )}

          {step === "review" && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-2">
                {([
                  ["new", `Khách mới (${newRows.length})`],
                  ["duplicate", `Trùng cần quyết (${duplicateRows.length})`],
                  ["ptm", `Cảnh báo PTM (${ptmRows.length})`],
                  ["error", `Lỗi (${errorRows.length})`],
                ] as [TabKey, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      activeTab === key
                        ? "bg-vnpt text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {(activeTab === "duplicate" || activeTab === "ptm") && visibleRows.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-2.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <input
                      type="checkbox"
                      aria-label="Chọn tất cả dòng trong tab"
                      onChange={(e) => toggleSelectAllVisible(e.target.checked)}
                    />
                    Chọn tất cả
                  </label>
                  <button
                    onClick={() => applyBulkAction("keep_old")}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Giữ bản cũ
                  </button>
                  <button
                    onClick={() => applyBulkAction("use_new")}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Dùng bản mới
                  </button>
                  <button
                    onClick={() => applyBulkAction("create_new")}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Tạo mới riêng
                  </button>
                  <button
                    onClick={() => applyBulkAction("skip")}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Bỏ qua
                  </button>
                </div>
              )}

              <div className="space-y-2">
                {visibleRows.length === 0 && (
                  <p className="py-6 text-center text-xs text-slate-400">Không có dòng nào</p>
                )}
                {visibleRows.map((row) => (
                  <div
                    key={row.classified.row.rowNumber}
                    className="rounded-xl border border-slate-200 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        {(activeTab === "duplicate" || activeTab === "ptm") && (
                          <input
                            type="checkbox"
                            checked={row.selected}
                            onChange={(e) =>
                              updateRow(row.classified.row.rowNumber, { selected: e.target.checked })
                            }
                            className="mt-1"
                          />
                        )}
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            Dòng {row.classified.row.rowNumber} — {row.classified.row.name || "(không có tên)"}
                          </p>
                          {row.classified.status === "error" ? (
                            <p className="text-xs text-rose-600">{row.classified.notes.join("; ")}</p>
                          ) : (
                            <p className="text-[11px] text-slate-500">
                              MST: {row.classified.row.taxCode || "—"} · SĐT: {row.classified.row.phone || "—"}
                            </p>
                          )}
                          {row.classified.ptmConflict && (
                            <p className="mt-1 text-[11px] font-semibold text-rose-600">
                              Khách đang là KH PTM
                            </p>
                          )}
                          {row.classified.status === "duplicate" && renderDuplicateCompare(row)}
                        </div>
                      </div>

                      {row.classified.status === "duplicate" && (
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <select
                            value={row.action ?? ""}
                            onChange={(e) =>
                              updateRow(row.classified.row.rowNumber, {
                                action: (e.target.value || null) as CommitAction | null,
                              })
                            }
                            className="rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-vnpt focus:outline-none"
                          >
                            <option value="">— Chọn quyết định —</option>
                            <option value="keep_old">Giữ bản cũ</option>
                            <option value="use_new">Dùng bản mới</option>
                            <option value="create_new">Tạo mới riêng</option>
                            <option value="skip">Bỏ qua</option>
                          </select>
                          {row.classified.ptmConflict && row.action === "use_new" && (
                            <select
                              value={row.customerGroup}
                              onChange={(e) =>
                                updateRow(row.classified.row.rowNumber, { customerGroup: e.target.value })
                              }
                              className="rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-vnpt focus:outline-none"
                            >
                              {CUSTOMER_GROUP_OPTIONS.map((g) => (
                                <option key={g} value={g}>
                                  {g}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {submitError && (
                <div className="flex items-start gap-2 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}
            </div>
          )}

          {step === "result" && result && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                <span>
                  Tạo mới {result.created}, cập nhật {result.updated}, giữ nguyên {result.kept}, bỏ
                  qua {result.skipped}
                  {result.errors.length > 0 ? `, lỗi ${result.errors.length}` : ""}.
                </span>
              </div>
              {result.errors.length > 0 && (
                <div className="space-y-1 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
                  {result.errors.map((e, i) => (
                    <p key={i}>
                      Dòng {e.rowNumber}: {e.message}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 p-5">
          {step === "upload" && (
            <>
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={handleCheckFile}
                disabled={checking}
                className="flex items-center gap-1.5 rounded-xl bg-vnpt px-4 py-2 text-xs font-bold text-white hover:bg-vnpt-dark disabled:opacity-60"
              >
                <UploadCloud className="h-4 w-4" />
                {checking ? "Đang kiểm tra..." : "Kiểm tra file"}
              </button>
            </>
          )}
          {step === "review" && (
            <>
              <button
                onClick={() => setStep("upload")}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Quay lại
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                title={
                  pendingDuplicateCount > 0
                    ? `Còn ${pendingDuplicateCount} dòng trùng chưa có quyết định`
                    : undefined
                }
                className="rounded-xl bg-vnpt px-4 py-2 text-xs font-bold text-white hover:bg-vnpt-dark disabled:opacity-60"
              >
                {submitting ? "Đang nhập dữ liệu..." : "Nhập dữ liệu"}
              </button>
            </>
          )}
          {step === "result" && (
            <button
              onClick={() => {
                onImported();
                onClose();
              }}
              className="rounded-xl bg-vnpt px-4 py-2 text-xs font-bold text-white hover:bg-vnpt-dark"
            >
              Đóng
            </button>
          )}
        </div>
      </div>

      <datalist id="customer-import-staff-names">
        {staffNames.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
    </div>
  );
}
