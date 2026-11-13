"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import Link from "next/link";
import {
  MailWarning,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  PlayCircle,
  Trash2,
  Upload,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { getServices } from "@/lib/api/services.api";
import type { ServiceRecord } from "@/lib/crm/types/crm.types";
import {
  getReminderSettings,
  updateReminderSettings,
  runReminderNow,
  getReminderLogs,
  getReminderBatches,
  inspectReminderFile,
  importReminderFile,
  updateReminderBatch,
  deleteReminderBatch,
  type ReminderSettings,
  type ReminderLog,
  type ReminderBatchSummary,
  type InspectReminderFileResult,
  type ImportReminderColumns,
} from "@/lib/api/reminders.api";

type TabKey = "service" | "file" | "logs";

const TABS: { key: TabKey; label: string }[] = [
  { key: "service", label: "Dịch vụ sắp hết hạn" },
  { key: "file", label: "Nhắc theo file Excel" },
  { key: "logs", label: "Lịch sử gửi" },
];

const STATUS_LABELS: Record<string, string> = {
  sent: "Đã gửi",
  failed: "Lỗi",
  skipped_no_smtp: "Bỏ qua — chưa cấu hình SMTP",
  skipped_no_recipient: "Bỏ qua — không có người nhận",
};

export default function RemindersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [tab, setTab] = useState<TabKey>("service");

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-10 text-center">
        <ShieldAlert className="h-6 w-6 text-rose-500" />
        <p className="text-sm font-medium text-rose-700">
          Chỉ Admin được phép xem Nhắc hết hạn (Email).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Nhắc hết hạn (Email)</h1>
        <p className="text-sm text-slate-500">
          Tự động gửi email nhắc dịch vụ sắp hết hạn, hoặc nhắc hạn theo file Excel tự import.
        </p>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-semibold ${
              tab === t.key
                ? "border-b-2 border-vnpt text-vnpt"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "service" && <ServiceReminderTab />}
      {tab === "file" && <FileReminderTab />}
      {tab === "logs" && <LogsTab />}
    </div>
  );
}

function ServiceReminderTab() {
  const [settings, setSettings] = useState<ReminderSettings | null>(null);
  const [daysBeforeInput, setDaysBeforeInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [runningNow, setRunningNow] = useState(false);
  const [runResult, setRunResult] = useState<string | null>(null);
  const [preview, setPreview] = useState<ServiceRecord[]>([]);

  async function load() {
    setLoading(true);
    try {
      const data = await getReminderSettings();
      setSettings(data);
      setDaysBeforeInput(data.daysBefore.join(", "));
      const services = await getServices({ expiringWithinDays: 30 });
      setPreview(services);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const daysBefore = daysBeforeInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map(Number);
      const updated = await updateReminderSettings({
        enabled: settings.enabled,
        runTime: settings.runTime,
        daysBefore,
        notifyStaff: settings.notifyStaff,
        notifyCustomer: settings.notifyCustomer,
        extraCc: settings.extraCc,
      });
      setSettings(updated);
      setDaysBeforeInput(updated.daysBefore.join(", "));
      setSaveMessage({ ok: true, text: "Đã lưu cấu hình nhắc hết hạn." });
    } catch (err) {
      setSaveMessage({
        ok: false,
        text: err instanceof Error ? err.message : "Lưu thất bại.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleRunNow() {
    setRunningNow(true);
    setRunResult(null);
    try {
      const result = await runReminderNow();
      setRunResult(`Đã gửi ${result.sent}, lỗi ${result.failed}, bỏ qua ${result.skipped}.`);
      const data = await getReminderSettings();
      setSettings(data);
    } catch (err) {
      setRunResult(err instanceof Error ? err.message : "Chạy thất bại.");
    } finally {
      setRunningNow(false);
    }
  }

  if (loading || !settings) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <MailWarning className="h-4.5 w-4.5 text-vnpt" />
          <h2 className="text-sm font-bold text-slate-900">Cấu hình nhắc hết hạn dịch vụ</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
            />
            Bật nhắc hết hạn tự động
          </label>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Giờ chạy (HH:MM)</label>
            <input
              value={settings.runTime}
              onChange={(e) => setSettings({ ...settings, runTime: e.target.value })}
              placeholder="08:00"
              className="w-full max-w-[150px] rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Số ngày nhắc trước (cách nhau dấu phẩy)
            </label>
            <input
              value={daysBeforeInput}
              onChange={(e) => setDaysBeforeInput(e.target.value)}
              placeholder="30, 7, 1"
              className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={settings.notifyStaff}
              onChange={(e) => setSettings({ ...settings, notifyStaff: e.target.checked })}
            />
            Gửi cho AM phụ trách
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={settings.notifyCustomer}
              onChange={(e) => setSettings({ ...settings, notifyCustomer: e.target.checked })}
            />
            Gửi cho khách hàng
          </label>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-600">CC thêm (cách nhau dấu phẩy)</label>
            <input
              value={settings.extraCc}
              onChange={(e) => setSettings({ ...settings, extraCc: e.target.value })}
              placeholder="quanly@vnptnamsaigon.vn"
              className="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
            />
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Lần chạy gần nhất: {settings.lastRunDate || "(chưa chạy)"}. Lưu ý: nếu máy chủ tắt
          đúng hôm còn N ngày, hôm sau sẽ KHÔNG gửi bù mốc N đã lỡ.
        </p>

        {!settings && null}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-vnpt px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0066a6] disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : "Lưu cấu hình"}
          </button>
          <button
            onClick={handleRunNow}
            disabled={runningNow}
            className="flex items-center gap-1.5 rounded-lg border border-vnpt px-4 py-2.5 text-sm font-semibold text-vnpt hover:bg-blue-50 disabled:opacity-60"
          >
            <PlayCircle className="h-4 w-4" />
            {runningNow ? "Đang chạy..." : "Chạy ngay"}
          </button>
        </div>

        {saveMessage && (
          <p className={`mt-2 text-sm ${saveMessage.ok ? "text-emerald-600" : "text-rose-600"}`}>
            {saveMessage.text}
          </p>
        )}
        {runResult && <p className="mt-2 text-sm text-slate-600">{runResult}</p>}

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Chưa cấu hình SMTP thật? Vào{" "}
          <Link href="/admin/system-settings" className="font-semibold underline">
            Cài đặt hệ thống
          </Link>{" "}
          để cấu hình trước khi bật nhắc hết hạn.
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-bold text-slate-900">
          Dịch vụ sẽ được nhắc trong 30 ngày tới
        </h2>
        {preview.length === 0 ? (
          <p className="text-sm text-slate-500">Không có dịch vụ nào sắp hết hạn trong 30 ngày tới.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <th className="py-2 pr-4">Khách hàng</th>
                  <th className="py-2 pr-4">Dịch vụ</th>
                  <th className="py-2 pr-4">AM phụ trách</th>
                  <th className="py-2 pr-4">Ngày hết hạn</th>
                  <th className="py-2 pr-4">Còn lại</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4">{s.customerName}</td>
                    <td className="py-2 pr-4">{s.serviceName}</td>
                    <td className="py-2 pr-4">{s.staffName}</td>
                    <td className="py-2 pr-4">{s.expirationDate}</td>
                    <td className="py-2 pr-4">{s.daysRemaining} ngày</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function FileReminderTab() {
  const [batches, setBatches] = useState<ReminderBatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await getReminderBatches();
      setBatches(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleToggle(batch: ReminderBatchSummary) {
    await updateReminderBatch(batch.id, { enabled: !batch.enabled });
    await load();
  }

  async function handleDelete(batch: ReminderBatchSummary) {
    if (!window.confirm(`Xóa đợt nhắc hạn "${batch.name}"?`)) return;
    await deleteReminderBatch(batch.id);
    await load();
  }

  return (
    <div className="space-y-4">
      <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
        Dữ liệu ở đây chỉ dùng để nhắc hạn, không tạo khách hàng.
      </p>

      <div className="flex justify-end">
        <button
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-1.5 rounded-lg bg-vnpt px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0066a6]"
        >
          <Upload className="h-4 w-4" />
          Import file nhắc hạn
        </button>
      </div>

      {showWizard && (
        <ImportWizard
          onClose={() => setShowWizard(false)}
          onImported={() => {
            setShowWizard(false);
            load();
          }}
        />
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        {loading ? (
          <p className="text-sm text-slate-500">Đang tải...</p>
        ) : batches.length === 0 ? (
          <p className="text-sm text-slate-500">Chưa có đợt nhắc hạn nào.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-2 pr-4">Tên đợt</th>
                <th className="py-2 pr-4">Số mục</th>
                <th className="py-2 pr-4">Số ngày nhắc</th>
                <th className="py-2 pr-4">Bật/Tắt</th>
                <th className="py-2 pr-4" />
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{b.name}</td>
                  <td className="py-2 pr-4">{b.itemCount}</td>
                  <td className="py-2 pr-4">{b.daysBefore.join(", ")}</td>
                  <td className="py-2 pr-4">
                    <button
                      onClick={() => handleToggle(b)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        b.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {b.enabled ? "Đang bật" : "Đã tắt"}
                    </button>
                  </td>
                  <td className="py-2 pr-4">
                    <button
                      onClick={() => handleDelete(b)}
                      className="text-rose-500 hover:text-rose-700"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ImportWizard({
  onClose,
  onImported,
}: {
  onClose: () => void;
  onImported: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [inspectResult, setInspectResult] = useState<InspectReminderFileResult | null>(null);
  const [name, setName] = useState("");
  const [daysBeforeInput, setDaysBeforeInput] = useState("30, 7, 1");
  const [columns, setColumns] = useState<ImportReminderColumns>({ expiryDate: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: { rowNumber: number; message: string }[] } | null>(
    null
  );

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setBusy(true);
    try {
      const inspected = await inspectReminderFile(f);
      setInspectResult(inspected);
      setName(f.name.replace(/\.[^.]+$/, ""));
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không đọc được file.");
    } finally {
      setBusy(false);
    }
  }

  async function handleImport() {
    if (!file || !columns.expiryDate) {
      setError("Vui lòng chọn cột ngày hết hạn.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const daysBefore = daysBeforeInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map(Number);
      const imported = await importReminderFile(file, name, daysBefore, columns);
      setResult(imported);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import thất bại.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Import file nhắc hạn (bước {step}/3)</h3>
        <button onClick={onClose} className="text-xs text-slate-500 hover:text-slate-800">
          Đóng
        </button>
      </div>

      {error && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {step === 1 && (
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Chọn file Excel (.xlsx)</label>
          <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} disabled={busy} />
        </div>
      )}

      {step === 2 && inspectResult && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Tên đợt nhắc hạn</label>
            <input
              aria-label="Tên đợt nhắc hạn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Số ngày nhắc trước (cách nhau dấu phẩy)
            </label>
            <input
              value={daysBeforeInput}
              onChange={(e) => setDaysBeforeInput(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(
              [
                ["expiryDate", "Cột ngày hết hạn (*)"],
                ["title", "Cột tên/tiêu đề"],
                ["customerName", "Cột tên khách hàng"],
                ["subscriberCode", "Cột mã thuê bao"],
                ["recipientEmail", "Cột email người nhận"],
                ["staffName", "Cột AM phụ trách"],
              ] as [keyof ImportReminderColumns, string][]
            ).map(([key, label]) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
                <select
                  aria-label={label}
                  value={columns[key] || ""}
                  onChange={(e) => setColumns({ ...columns, [key]: e.target.value || undefined })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                >
                  <option value="">(không chọn)</option>
                  {inspectResult.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div>
            <h4 className="mb-2 text-xs font-semibold text-slate-600">5 dòng mẫu</h4>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50">
                    {inspectResult.headers.map((h) => (
                      <th key={h} className="px-3 py-2 font-semibold text-slate-600">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inspectResult.sampleRows.map((row, idx) => (
                    <tr key={idx} className="border-t border-slate-100">
                      {inspectResult.headers.map((h) => (
                        <td key={h} className="px-3 py-2">
                          {String(row[h] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={handleImport}
            disabled={busy}
            className="rounded-lg bg-vnpt px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0066a6] disabled:opacity-60"
          >
            {busy ? "Đang import..." : "Import"}
          </button>
        </div>
      )}

      {step === 3 && result && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Đã import {result.imported} dòng, {result.errors.length} lỗi.
          </div>
          {result.errors.length > 0 && (
            <ul className="list-inside list-disc text-xs text-rose-600">
              {result.errors.map((e) => (
                <li key={e.rowNumber}>
                  Dòng {e.rowNumber}: {e.message}
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={onImported}
            className="rounded-lg bg-vnpt px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0066a6]"
          >
            Xong
          </button>
        </div>
      )}
    </div>
  );
}

function LogsTab() {
  const [logs, setLogs] = useState<ReminderLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getReminderLogs();
        setLogs(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = logs.filter((l) => {
    if (sourceFilter && l.source !== sourceFilter) return false;
    if (statusFilter && l.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
        >
          <option value="">Tất cả nguồn</option>
          <option value="service">Dịch vụ</option>
          <option value="file">File Excel</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Đang tải...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-500">Chưa có lịch sử gửi.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-2 pr-4">Thời gian</th>
                <th className="py-2 pr-4">Nguồn</th>
                <th className="py-2 pr-4">Mục</th>
                <th className="py-2 pr-4">Mốc ngày</th>
                <th className="py-2 pr-4">Người nhận</th>
                <th className="py-2 pr-4">Trạng thái</th>
                <th className="py-2 pr-4">Lỗi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{new Date(l.sent_at).toLocaleString("vi-VN")}</td>
                  <td className="py-2 pr-4">{l.source === "service" ? "Dịch vụ" : "File Excel"}</td>
                  <td className="py-2 pr-4">{l.item_id}</td>
                  <td className="py-2 pr-4">{l.days_before}</td>
                  <td className="py-2 pr-4">{l.recipients || "(không có)"}</td>
                  <td className="py-2 pr-4">{STATUS_LABELS[l.status] || l.status}</td>
                  <td className="py-2 pr-4 text-rose-600">{l.error || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
