"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, User, Pencil, AlertTriangle } from "lucide-react";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import {
  CustomerRecord,
  TerritoryRecord,
} from "@/lib/crm/types/crm.types";
import { getCustomer, updateCustomer } from "@/lib/api/customers.api";
import { getTerritories } from "@/lib/api/territories.api";
import { getCustomerTeams, CustomerTeamRecord } from "@/lib/api/customer-teams.api";
import { getContracts } from "@/lib/api/contracts.api";
import { ContractRecord } from "@/lib/crm/types/crm.types";
import { CUSTOMER_GROUP_LABEL } from "@/lib/crm/constants/org.constants";
import { useAuth } from "@/lib/auth/auth-context";
import CustomerForm, {
  CustomerFormValues,
  customerToFormValues,
} from "@/components/admin/customer/CustomerForm";
import CustomerDocuments from "@/components/admin/customer/CustomerDocuments";
import CustomerServices from "@/components/admin/customer/CustomerServices";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const customerId = params.id;
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [customer, setCustomer] = useState<CustomerRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [territories, setTerritories] = useState<TerritoryRecord[]>([]);
  const [teams, setTeams] = useState<CustomerTeamRecord[]>([]);
  const [contracts, setContracts] = useState<ContractRecord[]>([]);

  const [showEdit, setShowEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCustomer(customerId);
        if (isMounted) setCustomer(data);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Không thể tải thông tin khách hàng");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    getTerritories()
      .then((t) => isMounted && setTerritories(t))
      .catch(() => {});
    getCustomerTeams()
      .then((t) => isMounted && setTeams(t))
      .catch(() => {});
    getContracts()
      .then((c) => isMounted && setContracts(c))
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [customerId]);

  const canEdit =
    isAdmin ||
    (customer && user?.name && [customer.amStaff, customer.amCaringStaff].includes(user.name));

  async function handleEditSubmit(values: CustomerFormValues) {
    setEditError(null);
    setSubmitting(true);
    try {
      const updated = await updateCustomer(customerId, {
        name: values.name,
        identityCode: values.identityCode || undefined,
        type: values.type,
        customerGroup: values.customerGroup,
        customerCode: values.customerCode || undefined,
        status: values.status || undefined,
        teamId: values.teamId || undefined,
        salesChannel: values.salesChannel || undefined,
        territoryId: values.territoryId || undefined,
        phone: values.phone || undefined,
        address: values.address || undefined,
        note: values.note || undefined,
        contactName: values.contactName || undefined,
        contactEmail: values.contactEmail || undefined,
        billingName: values.billingName || undefined,
        billingPhone: values.billingPhone || undefined,
        billingEmail: values.billingEmail || undefined,
      });
      setCustomer(updated);
      setShowEdit(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Không thể sửa khách hàng");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500">
        Đang tải thông tin khách hàng...
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-10 text-center">
        <AlertTriangle className="h-6 w-6 text-rose-500" />
        <p className="text-sm font-semibold text-rose-700">Không thể tải khách hàng</p>
        <p className="text-xs text-rose-600">{error || "Không tìm thấy khách hàng"}</p>
        <Link href="/admin/customers" className="mt-2 text-xs font-semibold text-vnpt hover:underline">
          Về danh sách khách hàng
        </Link>
      </div>
    );
  }

  const customerContracts = contracts.filter((c) => c.customerId === customerId);

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/admin/customers")}
        className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-vnpt"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Về danh sách khách hàng
      </button>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-vnpt">
            {customer.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{customer.name}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                {customer.type === "Doanh nghiệp" ? (
                  <Building2 className="h-3 w-3" />
                ) : (
                  <User className="h-3 w-3" />
                )}
                {customer.type}
              </span>
              <StatusBadge
                status={CUSTOMER_GROUP_LABEL[customer.group] ?? customer.group}
                variant={customer.group === "Tự phát triển" ? "green" : "blue"}
              />
              {customer.territoryName && (
                <StatusBadge status={customer.territoryName} variant="slate" />
              )}
              {customer.teamName && <StatusBadge status={customer.teamName} variant="amber" />}
            </div>
          </div>
        </div>
        {canEdit && (
          <button
            onClick={() => {
              setEditError(null);
              setShowEdit(true);
            }}
            className="flex h-9 items-center gap-1.5 self-start rounded-xl bg-vnpt px-3.5 text-xs font-bold text-white shadow-xs hover:bg-vnpt-dark sm:self-auto"
          >
            <Pencil className="h-4 w-4" />
            Sửa thông tin
          </button>
        )}
      </div>

      {/* Thông tin chung */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-bold text-slate-900">Thông tin chung</h3>
        <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
          <InfoItem label="Mã khách hàng" value={customer.customerCode} />
          <InfoItem label="MST / CCCD" value={customer.identityCode} />
          <InfoItem label="Trạng thái" value={customer.status} />
          <InfoItem label="Kênh bán" value={customer.salesChannel} />
          <InfoItem label="AM phụ trách (bán hàng)" value={customer.amStaff} />
          <InfoItem label="AM chăm sóc (CSKH)" value={customer.amCaringStaff} />
          <InfoItem label="Địa chỉ" value={customer.address} className="sm:col-span-3" />
          <InfoItem label="Ghi chú" value={customer.note} className="sm:col-span-3" />
        </div>
      </section>

      {/* Liên hệ & thanh toán */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-bold text-slate-900">Thông tin liên hệ</h3>
          <div className="space-y-2 text-xs">
            <InfoItem label="Họ tên" value={customer.contactName} />
            <InfoItem label="Số điện thoại" value={customer.phone} />
            <InfoItem label="Email" value={customer.contactEmail} />
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-bold text-slate-900">Thông tin thanh toán</h3>
          <div className="space-y-2 text-xs">
            <InfoItem label="Họ tên" value={customer.billingName} />
            <InfoItem label="Số điện thoại" value={customer.billingPhone} />
            <InfoItem label="Email" value={customer.billingEmail} />
          </div>
        </section>
      </div>

      {/* Giấy tờ */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-bold text-slate-900">Giấy tờ đính kèm</h3>
        <CustomerDocuments customerId={customerId} canDelete={isAdmin} />
      </section>

      {/* Dịch vụ đang dùng */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-bold text-slate-900">Dịch vụ đang dùng</h3>
        <CustomerServices customerId={customerId} canManage={Boolean(canEdit)} />
      </section>

      {/* Đơn hàng của khách */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-bold text-slate-900">Đơn hàng của khách</h3>
        {customerContracts.length === 0 ? (
          <p className="text-xs text-slate-400">Chưa có đơn hàng nào gắn với khách này</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Mã giao dịch</th>
                  <th className="px-3 py-2">Giá trị</th>
                  <th className="px-3 py-2">Triển khai</th>
                  <th className="px-3 py-2">Thanh toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerContracts.map((c) => (
                  <tr key={c.id}>
                    <td className="px-3 py-2 font-mono">{c.transactionCode}</td>
                    <td className="px-3 py-2">{c.totalValue.toLocaleString("vi-VN")} đ</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={c.deploymentStatus} />
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={c.paymentStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showEdit && (
        <CustomerForm
          mode="edit"
          initialValues={customerToFormValues(customer)}
          territories={territories}
          teams={teams}
          submitting={submitting}
          error={editError}
          onSubmit={handleEditSubmit}
          onCancel={() => setShowEdit(false)}
          customerId={customer.id}
          canDeleteDocuments={isAdmin}
        />
      )}
    </div>
  );
}

function InfoItem({
  label,
  value,
  className,
}: {
  label: string;
  value?: string | null;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-0.5 text-slate-800">{value || "—"}</div>
    </div>
  );
}
