"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building,
  Users,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  UserPlus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import KpiCard from "@/components/admin/shared/KpiCard";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import { TerritoryRecord, WardContactRecord } from "@/lib/crm/types/crm.types";
import {
  getTerritories,
  getWardContacts,
  createWardContact,
  updateWardContact,
  deleteWardContact,
  updateTerritoryStats,
  CreateWardContactInput,
} from "@/lib/api/territories.api";

const EMPTY_CONTACT_FORM: CreateWardContactInput = {
  unit: "",
  department: "",
  fullName: "",
  position: "",
  phone: "",
  amInCharge: "",
};

const EMPTY_STATS_FORM = {
  population: "",
  schoolMamnon: "",
  schoolTieuhoc: "",
  schoolThcs: "",
  schoolThpt: "",
  revenue: "",
};

export default function TerritoryDetailPage() {
  const params = useParams<{ id: string }>();
  const territoryId = params.id;

  const [territory, setTerritory] = useState<TerritoryRecord | null>(null);
  const [contacts, setContacts] = useState<WardContactRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<WardContactRecord | null>(null);
  const [contactForm, setContactForm] = useState<CreateWardContactInput>(EMPTY_CONTACT_FORM);
  const [contactFormError, setContactFormError] = useState<string | null>(null);
  const [submittingContact, setSubmittingContact] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showStatsForm, setShowStatsForm] = useState(false);
  const [statsForm, setStatsForm] = useState(EMPTY_STATS_FORM);
  const [statsFormError, setStatsFormError] = useState<string | null>(null);
  const [submittingStats, setSubmittingStats] = useState(false);

  useEffect(() => {
    if (!territoryId) return;
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [territories, wardContacts] = await Promise.all([
          getTerritories(),
          getWardContacts(territoryId),
        ]);
        if (isMounted) {
          const found = territories.find((t) => t.id === territoryId) || null;
          setTerritory(found);
          setContacts(wardContacts);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Không thể tải dữ liệu phường. Vui lòng thử lại."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [territoryId]);

  function openCreateContact() {
    setEditingContact(null);
    setContactForm(EMPTY_CONTACT_FORM);
    setContactFormError(null);
    setShowContactForm(true);
  }

  function openEditContact(contact: WardContactRecord) {
    setEditingContact(contact);
    setContactForm({
      unit: contact.unit,
      department: contact.department,
      fullName: contact.fullName,
      position: contact.position,
      phone: contact.phone,
      amInCharge: contact.amInCharge,
    });
    setContactFormError(null);
    setShowContactForm(true);
  }

  async function handleContactSubmit(e: FormEvent) {
    e.preventDefault();
    setContactFormError(null);
    setSubmittingContact(true);

    try {
      if (editingContact) {
        const updated = await updateWardContact(editingContact.id, contactForm);
        setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await createWardContact(territoryId, contactForm);
        setContacts((prev) => [...prev, created]);
      }
      setShowContactForm(false);
      setContactForm(EMPTY_CONTACT_FORM);
      setEditingContact(null);
    } catch (err) {
      // Lỗi trùng dữ liệu (trùng SĐT, hoặc trùng họ tên/đơn vị/phòng ban/chức vụ)
      // được backend trả về message tiếng Việt rõ ràng, hiển thị thẳng cho người dùng.
      setContactFormError(
        err instanceof Error ? err.message : "Không thể lưu đầu mối. Vui lòng thử lại."
      );
    } finally {
      setSubmittingContact(false);
    }
  }

  async function handleDeleteContact(contact: WardContactRecord) {
    if (!window.confirm(`Xóa đầu mối "${contact.fullName}" khỏi phường?`)) {
      return;
    }
    setDeletingId(contact.id);
    try {
      await deleteWardContact(contact.id);
      setContacts((prev) => prev.filter((c) => c.id !== contact.id));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Không thể xóa đầu mối. Vui lòng thử lại.");
    } finally {
      setDeletingId(null);
    }
  }

  function openEditStats() {
    if (!territory) return;
    setStatsForm({
      population: String(territory.population),
      schoolMamnon: String(territory.schoolMamnon),
      schoolTieuhoc: String(territory.schoolTieuhoc),
      schoolThcs: String(territory.schoolThcs),
      schoolThpt: String(territory.schoolThpt),
      revenue: String(territory.revenue),
    });
    setStatsFormError(null);
    setShowStatsForm(true);
  }

  async function handleStatsSubmit(e: FormEvent) {
    e.preventDefault();
    setStatsFormError(null);
    setSubmittingStats(true);

    try {
      const updated = await updateTerritoryStats(territoryId, {
        population: Number(statsForm.population) || 0,
        schoolMamnon: Number(statsForm.schoolMamnon) || 0,
        schoolTieuhoc: Number(statsForm.schoolTieuhoc) || 0,
        schoolThcs: Number(statsForm.schoolThcs) || 0,
        schoolThpt: Number(statsForm.schoolThpt) || 0,
        revenue: Number(statsForm.revenue) || 0,
      });
      setTerritory(updated);
      setShowStatsForm(false);
    } catch (err) {
      setStatsFormError(
        err instanceof Error ? err.message : "Không thể cập nhật chỉ số. Vui lòng thử lại."
      );
    } finally {
      setSubmittingStats(false);
    }
  }

  const contactColumns: Column<WardContactRecord>[] = [
    { header: "Đơn vị", accessorKey: "unit" },
    { header: "Phòng ban", accessorKey: "department" },
    {
      header: "Họ tên",
      accessorKey: "fullName",
      cell: (item) => <span className="font-bold text-slate-900">{item.fullName}</span>,
    },
    {
      header: "Chức",
      accessorKey: "position",
      cell: (item) => <span className="font-semibold text-vnpt">{item.position}</span>,
    },
    { header: "SĐT", accessorKey: "phone" },
    { header: "AM phụ trách", accessorKey: "amInCharge" },
    {
      header: "",
      cell: (item) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => openEditContact(item)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-vnpt"
            title="Sửa"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteContact(item)}
            disabled={deletingId === item.id}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
            title="Xóa"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/territories"
            className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-vnpt"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Quay lại danh sách phường
          </Link>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {territory ? territory.wardName : "Đang tải..."}
          </h2>
          <p className="text-xs text-slate-500">
            Thống kê, trường học và đầu mối nhân sự trên địa bàn
          </p>
        </div>
        {territory && (
          <button
            type="button"
            onClick={openEditStats}
            className="flex h-9 items-center gap-1.5 self-start rounded-xl border border-blue-200 bg-blue-50/70 px-3.5 text-xs font-bold text-vnpt hover:bg-blue-100 sm:self-auto"
          >
            <Pencil className="h-4 w-4" />
            <span className="btn-label">Sửa chỉ số</span>
          </button>
        )}
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-10 text-center">
          <AlertTriangle className="h-6 w-6 text-rose-500" />
          <p className="text-sm font-semibold text-rose-700">Không thể tải dữ liệu phường</p>
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500">
          Đang tải dữ liệu phường...
        </div>
      ) : !territory ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center">
          <p className="text-sm font-semibold text-slate-700">Không tìm thấy phường này</p>
        </div>
      ) : (
        <>
          {/* Mini board thống kê */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="KHU PHỐ / HỘ DÂN"
              value={`${territory.quarterCount} / ${territory.householdCount.toLocaleString("vi-VN")}`}
              subtitle={`Dân số: ${territory.population.toLocaleString("vi-VN")}`}
              icon={Building}
            />
            <KpiCard
              title="SỐ TRƯỜNG HỌC"
              value={
                territory.schoolMamnon +
                territory.schoolTieuhoc +
                territory.schoolThcs +
                territory.schoolThpt
              }
              subtitle={`MN ${territory.schoolMamnon} · TH ${territory.schoolTieuhoc} · THCS ${territory.schoolThcs} · THPT ${territory.schoolThpt}`}
              icon={GraduationCap}
            />
            <KpiCard
              title="CƠ HỘI / ĐÃ TRIỂN KHAI"
              value={`${territory.opportunityCount} / ${territory.deployedCount}`}
              subtitle={
                territory.opportunityCount > 0
                  ? `Tỷ lệ phủ: ${Math.round((territory.deployedCount / territory.opportunityCount) * 100)}%`
                  : "Chưa có cơ hội"
              }
              icon={Users}
            />
            <KpiCard
              title="DOANH THU"
              value={`${territory.revenue.toLocaleString("vi-VN")} ₫`}
              subtitle={`Đầu mối lãnh đạo: ${territory.leadershipContact || "Chưa có"}`}
              icon={TrendingUp}
            />
          </div>

          {/* Bảng đầu mối nhân sự */}
          <DataTable
            title="Đầu mối nhân sự theo Đơn vị / Phòng ban"
            subtitle="Trạm Y tế, UBND, Đảng ủy, Trường học Mầm non/TH/THCS/THPT, Trung tâm Phục vụ HCC..."
            columns={contactColumns}
            data={contacts}
            searchPlaceholder="Tìm theo đơn vị, phòng ban, họ tên, chức..."
            exportFileName={`vnpt_dau_moi_${territory.wardName}`}
            actionButton={
              <button
                type="button"
                onClick={openCreateContact}
                className="flex h-9 items-center gap-1.5 rounded-xl bg-vnpt px-3.5 text-xs font-bold text-white shadow-xs hover:bg-vnpt-dark"
              >
                <UserPlus className="h-4 w-4" />
                <span className="btn-label">Thêm đầu mối</span>
              </button>
            }
          />
        </>
      )}

      {/* Modal thêm/sửa đầu mối */}
      {showContactForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingContact ? "Sửa đầu mối" : "Thêm đầu mối"}
              </h3>
              <button
                onClick={() => setShowContactForm(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Đơn vị
                  </label>
                  <input
                    required
                    placeholder="UBND, Đảng ủy, Trường học..."
                    value={contactForm.unit}
                    onChange={(e) => setContactForm({ ...contactForm, unit: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Phòng ban
                  </label>
                  <input
                    required
                    placeholder="Hành chính nhân sự, Mầm non..."
                    value={contactForm.department}
                    onChange={(e) => setContactForm({ ...contactForm, department: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Họ tên</label>
                <input
                  required
                  value={contactForm.fullName}
                  onChange={(e) => setContactForm({ ...contactForm, fullName: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Chức</label>
                  <input
                    required
                    placeholder="Trưởng phòng, Hiệu trưởng..."
                    value={contactForm.position}
                    onChange={(e) => setContactForm({ ...contactForm, position: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">SĐT</label>
                  <input
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  AM phụ trách
                </label>
                <input
                  value={contactForm.amInCharge}
                  onChange={(e) => setContactForm({ ...contactForm, amInCharge: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>

              {contactFormError && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                  {contactFormError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingContact}
                  className="btn-label rounded-xl bg-vnpt px-3.5 py-2 text-white hover:bg-vnpt-dark disabled:opacity-60"
                >
                  {submittingContact ? "Đang lưu..." : editingContact ? "Lưu thay đổi" : "Thêm đầu mối"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal sửa chỉ số thống kê */}
      {showStatsForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Sửa chỉ số phường</h3>
              <button
                onClick={() => setShowStatsForm(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleStatsSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Dân số
                </label>
                <input
                  type="number"
                  min={0}
                  value={statsForm.population}
                  onChange={(e) => setStatsForm({ ...statsForm, population: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Số trường Mầm non
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={statsForm.schoolMamnon}
                    onChange={(e) => setStatsForm({ ...statsForm, schoolMamnon: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Số trường Tiểu học
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={statsForm.schoolTieuhoc}
                    onChange={(e) => setStatsForm({ ...statsForm, schoolTieuhoc: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Số trường THCS
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={statsForm.schoolThcs}
                    onChange={(e) => setStatsForm({ ...statsForm, schoolThcs: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Số trường THPT
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={statsForm.schoolThpt}
                    onChange={(e) => setStatsForm({ ...statsForm, schoolThpt: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Doanh thu đã triển khai (₫)
                </label>
                <input
                  type="number"
                  min={0}
                  value={statsForm.revenue}
                  onChange={(e) => setStatsForm({ ...statsForm, revenue: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>

              {statsFormError && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                  {statsFormError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatsForm(false)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingStats}
                  className="btn-label rounded-xl bg-vnpt px-3.5 py-2 text-white hover:bg-vnpt-dark disabled:opacity-60"
                >
                  {submittingStats ? "Đang lưu..." : "Lưu chỉ số"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
