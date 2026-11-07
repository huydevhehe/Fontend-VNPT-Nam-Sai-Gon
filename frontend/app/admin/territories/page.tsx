"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MapPin, Building, Users, TrendingUp, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import KpiCard from "@/components/admin/shared/KpiCard";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import { TerritoryRecord } from "@/lib/crm/types/crm.types";
import { getTerritories, updateTerritoryHouseholds } from "@/lib/api/territories.api";

export default function TerritoriesPage() {
  const [data, setData] = useState<TerritoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);

  // State cho pattern click-to-edit số hộ dân inline trên bảng.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);
  const rowErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref luôn giữ giá trị editingId MỚI NHẤT (khác với biến trong closure của
  // saveEditHousehold vốn bị "đứng" ở giá trị lúc gọi hàm) — dùng để kiểm tra
  // lại sau khi await API xong, tránh đóng nhầm ô edit của dòng khác nếu
  // người dùng đã click sang sửa dòng khác trong lúc đang chờ API trả về.
  const editingIdRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (rowErrorTimerRef.current) {
        clearTimeout(rowErrorTimerRef.current);
      }
    };
  }, []);

  function showRowError(id: string, message: string) {
    if (rowErrorTimerRef.current) {
      clearTimeout(rowErrorTimerRef.current);
    }
    setRowError({ id, message });
    rowErrorTimerRef.current = setTimeout(() => {
      setRowError(null);
    }, 4000);
  }

  function startEditHousehold(item: TerritoryRecord) {
    editingIdRef.current = item.id;
    setEditingId(item.id);
    setEditValue(String(item.householdCount));
    setRowError(null);
  }

  function cancelEditHousehold() {
    editingIdRef.current = null;
    setEditingId(null);
    setEditValue("");
  }

  async function saveEditHousehold(item: TerritoryRecord) {
    // Tránh lưu 2 lần khi cả onBlur và Enter đều kích hoạt.
    if (editingIdRef.current !== item.id) {
      return;
    }

    const raw = editValue.trim();
    const parsed = Number(raw);
    if (raw === "" || Number.isNaN(parsed)) {
      showRowError(item.id, "Số hộ dân không hợp lệ");
      if (editingIdRef.current === item.id) {
        cancelEditHousehold();
      }
      return;
    }

    if (parsed === item.householdCount) {
      if (editingIdRef.current === item.id) {
        cancelEditHousehold();
      }
      return;
    }

    setSavingId(item.id);
    try {
      await updateTerritoryHouseholds(item.id, parsed);
      setData((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, householdCount: parsed } : t))
      );
      // Chỉ đóng edit nếu nó vẫn đang thuộc đúng dòng này — trong lúc chờ
      // API, người dùng có thể đã click sang sửa dòng khác (editingIdRef đã
      // đổi); nếu vậy không được đóng/xóa nội dung đang gõ của dòng khác.
      if (editingIdRef.current === item.id) {
        cancelEditHousehold();
      }
    } catch (err) {
      showRowError(
        item.id,
        err instanceof Error ? err.message : "Cập nhật số hộ dân thất bại"
      );
      if (editingIdRef.current === item.id) {
        cancelEditHousehold();
      }
    } finally {
      setSavingId(null);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadTerritories() {
      setLoading(true);
      setError(null);
      try {
        const territories = await getTerritories();
        if (isMounted) {
          setData(territories);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải dữ liệu địa bàn. Vui lòng thử lại."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTerritories();

    return () => {
      isMounted = false;
    };
  }, []);

  const columns: Column<TerritoryRecord>[] = [
    {
      header: "Phường / Địa bàn",
      accessorKey: "wardName",
      cell: (item) => (
        <Link
          href={`/admin/territories/${item.id}`}
          className="flex items-center gap-2 hover:underline"
          title="Xem chi tiết phường"
        >
          <MapPin className="h-4 w-4 text-blue-600" />
          <span className="font-bold text-slate-900">{item.wardName}</span>
        </Link>
      ),
    },
    {
      header: "Số khu phố",
      accessorKey: "quarterCount",
      cell: (item) => <span className="font-semibold">{item.quarterCount}</span>,
    },
    {
      header: "Số hộ dân (Cập nhật CRM)",
      accessorKey: "householdCount",
      cell: (item) => {
        if (editingId === item.id) {
          return (
            <input
              type="number"
              min={0}
              autoFocus
              value={editValue}
              disabled={savingId === item.id}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => saveEditHousehold(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                } else if (e.key === "Escape") {
                  cancelEditHousehold();
                }
              }}
              className="w-24 rounded-lg border border-blue-400 px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          );
        }
        return (
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => startEditHousehold(item)}
              className="w-fit rounded-lg px-1.5 py-0.5 text-left font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-700"
              title="Nhấn để sửa số hộ dân"
            >
              {item.householdCount.toLocaleString("vi-VN")}
            </button>
            {rowError?.id === item.id && (
              <span className="text-[10px] font-semibold text-rose-600">
                {rowError.message}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Cơ hội kinh doanh / CĐS",
      accessorKey: "opportunityCount",
      cell: (item) => (
        <span className="font-semibold text-blue-700">{item.opportunityCount}</span>
      ),
    },
    {
      header: "Đã triển khai*",
      accessorKey: "deployedCount",
      cell: (item) => (
        <span className="font-bold text-emerald-600">
          {item.deployedCount} ({Math.round((item.deployedCount / item.opportunityCount) * 100)}%)
        </span>
      ),
    },
    {
      header: "Nhân viên phụ trách",
      accessorKey: "staffName",
    },
    {
      header: "Đầu mối lãnh đạo",
      accessorKey: "leadershipContact",
      cell: (item) => (
        <span className="text-slate-600">{item.leadershipContact}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Địa bàn Phường / Khu phố & Cơ hội Chuyển đổi số
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý 7 phường Nam Sài Gòn, số hộ dân cập nhật trực tiếp; *Đã triển khai = Đã ký HĐ và có doanh thu
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowList((v) => !v)}
          className="flex items-center gap-2 self-start rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100 sm:self-auto"
        >
          {showList ? (
            <>
              Ẩn danh sách phường <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Xem danh sách phường <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="ĐỊA BÀN PHƯỜNG"
          value="7"
          subtitle="Tân Hưng, Tân Thuận, Xóm Chiếu..."
          icon={MapPin}
        />
        <KpiCard
          title="TỔNG KHU PHỐ"
          value="112"
          subtitle="Trực thuộc các phường"
          icon={Building}
        />
        <KpiCard
          title="TỔNG HỘ DÂN"
          value="81.250"
          subtitle="Cập nhật trực tiếp trên CRM"
          icon={Users}
        />
        <KpiCard
          title="CƠ HỘI / ĐÃ TRIỂN KHAI"
          value="211 / 134"
          subtitle="Tỷ lệ phủ: 63.5%"
          icon={TrendingUp}
        />
      </div>

      {/* Table */}
      {showList &&
        (error ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-10 text-center">
            <AlertTriangle className="h-6 w-6 text-rose-500" />
            <p className="text-sm font-semibold text-rose-700">
              Không thể tải dữ liệu địa bàn
            </p>
            <p className="text-xs text-rose-600">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500">
            Đang tải dữ liệu địa bàn...
          </div>
        ) : (
          <DataTable
            title="Danh sách địa bàn & đầu mối"
            subtitle="Cho phép cập nhật số hộ dân, thông tin lãnh đạo phường và trường học địa bàn"
            columns={columns}
            data={data}
            searchPlaceholder="Tìm theo tên phường, nhân viên, lãnh đạo..."
            exportFileName="vnpt_dia_ban"
          />
        ))}
    </div>
  );
}

