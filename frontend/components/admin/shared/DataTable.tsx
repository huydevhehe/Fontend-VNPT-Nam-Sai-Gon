"use client";

import { useState } from "react";
import { Search, Download } from "lucide-react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  title?: string;
  subtitle?: string;
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  exportFileName?: string;
  actionButton?: React.ReactNode;
}

export default function DataTable<T extends Record<string, any>>({
  title,
  subtitle,
  columns,
  data,
  searchPlaceholder = "Tìm kiếm trong bảng...",
  exportFileName = "vnpt_crm_export",
  actionButton,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(row).some((val) => {
      if (val === null || val === undefined) return false;
      if (Array.isArray(val)) return val.join(" ").toLowerCase().includes(term);
      return String(val).toLowerCase().includes(term);
    });
  });

  const handleExportCsv = () => {
    if (!data.length) return;

    const headers = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`);
    const rows = filteredData.map((row) =>
      columns.map((col) => {
        let val = col.accessorKey ? row[col.accessorKey] : "";
        if (Array.isArray(val)) val = val.join("; ");
        if (typeof val === "object" && val !== null) val = JSON.stringify(val);
        return `"${String(val ?? "").replace(/"/g, '""')}"`;
      })
    );

    const csvContent =
      "\ufeff" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${exportFileName}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      {/* Header bar */}
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {title && (
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          )}
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute top-2.5 left-3 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 w-48 rounded-xl border border-slate-200 bg-slate-50/70 pr-3 pl-8 text-xs text-slate-800 transition-all focus:border-blue-500 focus:bg-white focus:outline-hidden sm:w-60"
            />
          </div>

          {/* Export CSV button */}
          <button
            onClick={handleExportCsv}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            title="Xuất file Excel / CSV"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Xuất CSV</span>
          </button>

          {/* Optional Action Button */}
          {actionButton}
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-160 text-left text-xs">
          <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-4 py-3 ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredData.length > 0 ? (
              filteredData.map((row, rIdx) => (
                <tr
                  key={row.id || rIdx}
                  className="transition-colors hover:bg-blue-50/30"
                >
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      className={`px-4 py-3.5 whitespace-nowrap ${
                        col.className || ""
                      }`}
                    >
                      {col.cell
                        ? col.cell(row)
                        : col.accessorKey
                        ? Array.isArray(row[col.accessorKey])
                          ? row[col.accessorKey].join(", ")
                          : String(row[col.accessorKey] ?? "—")
                        : "—"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-xs text-slate-400"
                >
                  Không tìm thấy dữ liệu phù hợp với tìm kiếm
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
        <span>
          Hiển thị <strong>{filteredData.length}</strong> /{" "}
          <strong>{data.length}</strong> bản ghi
        </span>
        <span className="text-[11px] text-slate-400">
          VNPT Nam Sài Gòn · CRM V2
        </span>
      </div>
    </div>
  );
}

