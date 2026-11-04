"use client";

import { useEffect, useState } from "react";
import { FileText, Plus, CheckCircle, Clock, Banknote, ShieldCheck, AlertTriangle } from "lucide-react";
import KpiCard from "@/components/admin/shared/KpiCard";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import { getContracts } from "@/lib/api/contracts.api";
import { ContractRecord } from "@/lib/crm/types/crm.types";

export default function ContractsPage() {
  const [data, setData] = useState<ContractRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadContracts() {
      setLoading(true);
      setError(null);
      try {
        const contracts = await getContracts();
        if (isMounted) {
          setData(contracts);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải dữ liệu Hợp đồng. Vui lòng thử lại."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadContracts();

    return () => {
      isMounted = false;
    };
  }, []);

  const columns: Column<ContractRecord>[] = [
    {
      header: "Mã giao dịch",
      accessorKey: "transactionCode",
      cell: (item) => (
        <span className="font-mono font-bold text-vnpt">
          {item.transactionCode}
        </span>
      ),
    },
    {
      header: "Khách hàng",
      accessorKey: "customerName",
      cell: (item) => (
        <span className="font-bold text-slate-900">{item.customerName}</span>
      ),
    },
    {
      header: "Mã thuê bao (Gom theo GD)",
      accessorKey: "subscriberCodes",
      cell: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.subscriberCodes.map((code, idx) => (
            <span
              key={idx}
              className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-700 font-semibold"
            >
              {code}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Giá trị hợp đồng",
      accessorKey: "totalValue",
      cell: (item) => (
        <span className="font-bold text-slate-900">
          {item.totalValue.toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
    {
      header: "Kênh phát triển",
      accessorKey: "channel",
    },
    {
      header: "Triển khai",
      accessorKey: "deploymentStatus",
      cell: (item) => <StatusBadge status={item.deploymentStatus} />,
    },
    {
      header: "Thanh toán",
      accessorKey: "paymentStatus",
      cell: (item) => <StatusBadge status={item.paymentStatus} />,
    },
    {
      header: "Trạng thái hồ sơ",
      accessorKey: "documentStatus",
      cell: (item) => <StatusBadge status={item.documentStatus} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Hợp đồng & Mã giao dịch
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý theo mã giao dịch nguồn; 1 mã giao dịch có thể chứa nhiều mã thuê bao
          </p>
        </div>
        <button
          onClick={() => alert("Mở form thêm hợp đồng")}
          className="flex h-9 items-center gap-1.5 rounded-xl bg-vnpt px-3.5 text-xs font-bold text-white shadow-xs hover:bg-vnpt-dark"
        >
          <Plus className="h-4 w-4" />
          <span className="btn-label">Thêm hợp đồng</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="HỢP ĐỒNG THÁNG NÀY"
          value="126"
          subtitle="Tạo từ Lead chốt thành công"
          icon={FileText}
        />
        <KpiCard
          title="TRIỂN KHAI HOÀN TẤT"
          value="89"
          subtitle="Đã triển khai & có doanh thu"
          icon={CheckCircle}
        />
        <KpiCard
          title="CHƯA THANH TOÁN"
          value="24"
          subtitle="Cần theo dõi công nợ"
          icon={Banknote}
        />
        <KpiCard
          title="HỒ SƠ CẦN BÀN GIAO"
          value="12"
          subtitle="Còn thiếu chữ ký / biên bản"
          icon={ShieldCheck}
        />
      </div>

      {/* Table */}
      {error ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-10 text-center">
          <AlertTriangle className="h-6 w-6 text-rose-500" />
          <p className="text-sm font-semibold text-rose-700">
            Không thể tải dữ liệu Hợp đồng
          </p>
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500">
          Đang tải dữ liệu Hợp đồng...
        </div>
      ) : (
        <DataTable
          title="Danh sách hợp đồng & giao dịch"
          subtitle="Theo dõi tiến độ triển khai kỹ thuật, tình trạng thanh toán và chứng từ bàn giao"
          columns={columns}
          data={data}
          searchPlaceholder="Tìm theo mã giao dịch, khách hàng, mã thuê bao..."
          exportFileName="vnpt_hop_dong"
        />
      )}
    </div>
  );
}

