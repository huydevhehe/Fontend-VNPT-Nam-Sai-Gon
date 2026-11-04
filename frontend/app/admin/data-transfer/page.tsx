"use client";

import { useEffect, useState } from "react";
import { UploadCloud, FileSpreadsheet, Download, AlertCircle, Database, BarChart3 } from "lucide-react";
import { getReportSummary, ReportSummary } from "@/lib/api/reports.api";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}

export default function DataTransferPage() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      setSummaryLoading(true);
      setSummaryError(null);
      try {
        const data = await getReportSummary();
        if (isMounted) {
          setSummary(data);
        }
      } catch (err) {
        if (isMounted) {
          setSummaryError(
            err instanceof Error
              ? err.message
              : "Không thể tải số liệu báo cáo tổng hợp. Vui lòng thử lại."
          );
        }
      } finally {
        if (isMounted) {
          setSummaryLoading(false);
        }
      }
    }

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Nhập / Xuất dữ liệu & Quản lý file mẫu
        </h2>
        <p className="text-xs text-slate-500">
          Quy trình chuẩn hóa nhập liệu Excel theo PRD V2, chống ghi nhận trùng lặp giao dịch
        </p>
      </div>

      {/* 3 Overview Action Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-vnpt">
            <UploadCloud className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-sm font-bold text-slate-900">
            Import dữ liệu Excel
          </h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Nhập file nợ thu ngay, nợ lũy kế, gia hạn tháng T & T-1 theo đúng định dạng chuẩn.
          </p>
          <button
            onClick={() => alert("Chọn file Excel để tải lên")}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-vnpt py-2.5 text-xs font-bold text-white hover:bg-vnpt-dark"
          >
            <UploadCloud className="h-4 w-4" />
            <span className="btn-label">Tải lên file dữ liệu</span>
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-sm font-bold text-slate-900">
            Tải file mẫu chuẩn (Template)
          </h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Tải file mẫu Excel chuẩn `import+CSKH.xlsx` gồm 2 sheet: Thu ngay, Lũy kế và Gia hạn.
          </p>
          <button
            onClick={() => alert("Đang tải file mẫu import+CSKH.xlsx...")}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Tải mẫu import+CSKH.xlsx</span>
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Database className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-sm font-bold text-slate-900">
            Sao lưu dữ liệu tự động
          </h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Cơ chế sao lưu định kỳ cơ sở dữ liệu CRM Nam Sài Gòn, bảo toàn lịch sử biến động.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800">
            <span>Đang kích hoạt tự động 00:00 hàng ngày</span>
          </div>
        </div>
      </div>

      {/* 4-Step Import Pipeline */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900">
          Quy trình kiểm soát Import 4 bước (PRD V2)
        </h3>
        <p className="text-xs text-slate-500">
          Đảm bảo không bao giờ nhân đôi bản ghi nợ hoặc ghi nhận trùng mã giao dịch gia hạn
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-blue-800">
                BƯỚC 1
              </span>
            </div>
            <div className="mt-3 font-bold text-slate-900 text-xs">
              Chọn phân hệ & File
            </div>
            <div className="mt-1 text-[11px] text-slate-500 leading-relaxed">
              Chọn nhập Nợ thu ngay, Nợ lũy kế hoặc Gia hạn T/T-1.
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-blue-800">
                BƯỚC 2
              </span>
            </div>
            <div className="mt-3 font-bold text-slate-900 text-xs">
              Kiểm tra cấu trúc & Cảnh báo trùng
            </div>
            <div className="mt-1 text-[11px] text-slate-500 leading-relaxed">
              Quét mã giao dịch, kiểm tra cột bắt buộc và định dạng tiền tệ.
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-blue-800">
                BƯỚC 3
              </span>
            </div>
            <div className="mt-3 font-bold text-slate-900 text-xs">
              Xem trước & Tải file lỗi
            </div>
            <div className="mt-1 text-[11px] text-slate-500 leading-relaxed">
              Hiển thị số dòng hợp lệ/lỗi và cho phép tải file lỗi để chỉnh sửa lại.
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                BƯỚC 4
              </span>
            </div>
            <div className="mt-3 font-bold text-emerald-950 text-xs">
              Xác nhận ghi & Lưu nhật ký
            </div>
            <div className="mt-1 text-[11px] text-emerald-800 leading-relaxed">
              Ghi vào cơ sở dữ liệu, ghi log người thực hiện và số lượng bản ghi thành công.
            </div>
          </div>
        </div>
      </div>

      {/* Báo cáo tổng hợp số liệu */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-vnpt" />
          <h3 className="text-sm font-bold text-slate-900">
            Báo cáo tổng hợp số liệu
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Tổng hợp nhanh số liệu nợ, gia hạn và hợp đồng hiện có trong hệ thống
        </p>

        {summaryError ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4" />
            {summaryError}
          </div>
        ) : summaryLoading ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-6 text-center text-xs text-slate-500">
            Đang tải số liệu báo cáo tổng hợp...
          </div>
        ) : summary ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="text-[11px] font-semibold text-slate-500">
                Tổng nợ thu ngay
              </div>
              <div className="mt-1 text-sm font-bold text-slate-900">
                {formatCurrency(summary.totalImmediateDebt)}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="text-[11px] font-semibold text-slate-500">
                Tổng nợ lũy kế
              </div>
              <div className="mt-1 text-sm font-bold text-slate-900">
                {formatCurrency(summary.totalCumulativeDebt)}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="text-[11px] font-semibold text-slate-500">
                Đã thu / Số bản ghi nợ
              </div>
              <div className="mt-1 text-sm font-bold text-slate-900">
                {formatCurrency(summary.totalCollectedAmount)} ({summary.debtRecordCount})
              </div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
              <div className="text-[11px] font-semibold text-emerald-700">
                Gia hạn hoàn thành / Tổng gia hạn
              </div>
              <div className="mt-1 text-sm font-bold text-emerald-950">
                {summary.completedRenewals} / {summary.totalRenewals}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="text-[11px] font-semibold text-slate-500">
                Tổng số hợp đồng
              </div>
              <div className="mt-1 text-sm font-bold text-slate-900">
                {summary.totalContracts}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="text-[11px] font-semibold text-slate-500">
                Tổng giá trị hợp đồng
              </div>
              <div className="mt-1 text-sm font-bold text-slate-900">
                {formatCurrency(summary.totalContractValue)}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

