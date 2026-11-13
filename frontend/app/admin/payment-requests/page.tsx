"use client";

import { useEffect, useState, FormEvent, useMemo } from "react";
import { FileText, Download, AlertTriangle, X, Search, RefreshCw } from "lucide-react";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import {
  getContracts,
  listPaymentExports,
  getPaymentRequestPreview,
  PaymentExportRecordDto,
} from "@/lib/api/contracts.api";
import { ContractRecord } from "@/lib/crm/types/crm.types";
import { API_BASE_URL, getToken } from "@/lib/api/client";

export default function PaymentRequestsPage() {
  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const [exportsList, setExportsList] = useState<PaymentExportRecordDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search order
  const [searchOrderQuery, setSearchOrderQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<ContractRecord | null>(null);

  // Export Modal state
  const [docNumber, setDocNumber] = useState("");
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [exportError, setExportError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  // Filter exporter
  const [filterExporter, setFilterExporter] = useState("ALL");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [contractsData, exportsData] = await Promise.all([
        getContracts(),
        listPaymentExports(),
      ]);
      setContracts(contractsData);
      setExportsList(exportsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectOrder(order: ContractRecord) {
    setSelectedOrder(order);
    setExportError(null);
    try {
      const preview = await getPaymentRequestPreview(order.id);
      setDocNumber(preview.suggestedDocNumber || "1");
      setMissingFields(preview.missingFields || []);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Không thể tải xem trước");
    }
  }

  async function handleDownload(orderId: string, transactionCode: string, num: string) {
    if (!num.trim()) {
      setExportError("Số văn bản là bắt buộc");
      return;
    }

    setDownloading(true);
    setExportError(null);
    try {
      const token = getToken();
      const url = `${API_BASE_URL}/contracts/${orderId}/payment-request?docNumber=${encodeURIComponent(
        num.trim()
      )}`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || `Lỗi xuất file (${res.status})`);
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `De-nghi-thanh-toan_${transactionCode}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      // Reload exports log
      const updatedExports = await listPaymentExports();
      setExportsList(updatedExports);
      setSelectedOrder(null);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Không thể xuất file");
    } finally {
      setDownloading(false);
    }
  }

  const matchingOrders = useMemo(() => {
    if (!searchOrderQuery.trim()) return [];
    const q = searchOrderQuery.toLowerCase();
    return contracts.filter(
      (c) =>
        c.transactionCode.toLowerCase().includes(q) ||
        c.customerName.toLowerCase().includes(q) ||
        (c.taxCode && c.taxCode.includes(q))
    ).slice(0, 8);
  }, [contracts, searchOrderQuery]);

  const uniqueExporters = useMemo(() => {
    const set = new Set<string>();
    exportsList.forEach((e) => {
      if (e.exportedBy) set.add(e.exportedBy);
    });
    return Array.from(set);
  }, [exportsList]);

  const visibleExports = useMemo(() => {
    if (filterExporter === "ALL") return exportsList;
    return exportsList.filter((e) => e.exportedBy === filterExporter);
  }, [exportsList, filterExporter]);

  const columns: Column<PaymentExportRecordDto>[] = [
    {
      header: "Số văn bản",
      accessorKey: "docNumber",
      cell: (item) => (
        <span className="font-mono font-bold text-vnpt">Số: {item.docNumber}</span>
      ),
    },
    {
      header: "Mã giao dịch",
      accessorKey: "transactionCode",
      cell: (item) => (
        <span className="font-mono text-slate-800">{item.transactionCode || "—"}</span>
      ),
    },
    {
      header: "Khách hàng",
      accessorKey: "customerName",
      cell: (item) => (
        <span className="font-medium text-slate-900">{item.customerName || "—"}</span>
      ),
    },
    {
      header: "Người xuất",
      accessorKey: "exportedBy",
      cell: (item) => (
        <span className="text-slate-700">{item.exportedBy || "Hệ thống"}</span>
      ),
    },
    {
      header: "Thời điểm xuất",
      accessorKey: "exportedAt",
      cell: (item) => (
        <span className="text-slate-500">
          {new Date(item.exportedAt).toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      header: "Thao tác",
      accessorKey: "id",
      cell: (item) => (
        <button
          type="button"
          onClick={() => handleDownload(item.contractId, item.transactionCode || item.docNumber, item.docNumber)}
          className="flex h-7 items-center gap-1 rounded-lg bg-sky-50 px-2 text-xs font-semibold text-sky-700 border border-sky-200 hover:bg-sky-100"
          title="Tải lại file Word này"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Tải lại</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Đề nghị thanh toán
          </h2>
          <p className="text-xs text-slate-500">
            Tìm đơn hàng để xuất văn bản "Thông báo đề nghị thanh toán" và quản lý lịch sử xuất
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Select Order Box */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <h3 className="mb-3 text-sm font-bold text-slate-900">
          Chọn đơn hàng để xuất đề nghị thanh toán
        </h3>
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={searchOrderQuery}
            onChange={(e) => setSearchOrderQuery(e.target.value)}
            placeholder="Gõ mã giao dịch hoặc tên khách hàng..."
            className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-sm focus:border-vnpt focus:outline-none"
          />
        </div>

        {matchingOrders.length > 0 && (
          <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
            {matchingOrders.map((ord) => (
              <div
                key={ord.id}
                className="flex items-center justify-between p-3 hover:bg-slate-50"
              >
                <div>
                  <span className="font-mono font-bold text-vnpt mr-2">{ord.transactionCode}</span>
                  <span className="font-medium text-slate-800">{ord.customerName}</span>
                  <span className="ml-3 text-xs text-slate-500">
                    Giá trị: <b>{ord.totalValue.toLocaleString("vi-VN")} ₫</b>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectOrder(ord)}
                  className="flex items-center gap-1 rounded-lg bg-vnpt px-3 py-1.5 text-xs font-bold text-white hover:bg-vnpt-dark"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Xuất văn bản</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Lọc theo người xuất:</span>
          <select
            value={filterExporter}
            onChange={(e) => setFilterExporter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs focus:border-vnpt focus:outline-none"
          >
            <option value="ALL">Tất cả người xuất</option>
            {uniqueExporters.map((exp) => (
              <option key={exp} value={exp}>
                {exp}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-10 text-center">
            <AlertTriangle className="h-6 w-6 text-rose-500" />
            <p className="text-sm font-semibold text-rose-700">Không thể tải dữ liệu</p>
            <p className="text-xs text-rose-600">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500">
            Đang tải nhật ký xuất văn bản...
          </div>
        ) : (
          <DataTable
            title="Nhật ký các lần xuất đề nghị thanh toán"
            subtitle="Theo dõi số văn bản, đơn hàng và người thực hiện tải file"
            columns={columns}
            data={visibleExports}
            searchPlaceholder="Tìm theo số văn bản, mã giao dịch, khách hàng..."
            exportFileName="nhat_ky_de_nghi_thanh_toan"
          />
        )}
      </div>

      {/* Export Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Xuất đề nghị thanh toán
                </h3>
                <p className="text-xs text-slate-500">
                  Mã GD: <span className="font-mono font-bold text-vnpt">{selectedOrder.transactionCode}</span> ·{" "}
                  <span className="font-semibold text-slate-800">{selectedOrder.customerName}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleDownload(selectedOrder.id, selectedOrder.transactionCode, docNumber);
              }}
              className="space-y-4"
            >
              {missingFields.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Cảnh báo: Đơn hàng còn thiếu thông tin
                  </div>
                  <p className="mt-1">
                    Còn thiếu: <span className="font-semibold">{missingFields.join(", ")}</span>.
                  </p>
                  <p className="mt-0.5 text-[11px] text-amber-700">
                    Vẫn có thể xuất văn bản (chỗ thiếu sẽ để trống trong file Word).
                  </p>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Số văn bản <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder="VD: 706"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Gợi ý tự động tăng theo năm hiện tại
                </p>
              </div>

              {exportError && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                  {exportError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={downloading}
                  className="flex items-center gap-1.5 rounded-xl bg-vnpt px-4 py-2 text-xs font-bold text-white hover:bg-vnpt-dark disabled:opacity-60"
                >
                  <Download className="h-4 w-4" />
                  <span>{downloading ? "Đang tạo file..." : "Tải file Word"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
