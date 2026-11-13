"use client";

import { useState, FormEvent } from "react";
import { X } from "lucide-react";
import {
  CustomerRecord,
  CustomerType,
  CustomerGroup,
  TerritoryRecord,
} from "@/lib/crm/types/crm.types";
import { CustomerTeamRecord } from "@/lib/api/customer-teams.api";
import { CUSTOMER_GROUP_LABEL } from "@/lib/crm/constants/org.constants";
import { LEAD_CHANNELS } from "@/lib/crm/constants/org.constants";

const TYPE_OPTIONS: CustomerType[] = ["Doanh nghiệp", "Hộ kinh doanh", "Cá nhân"];
const GROUP_OPTIONS: CustomerGroup[] = ["Tự phát triển", "Tập hiện hữu", "PTM địa bàn"];

export interface CustomerFormValues {
  name: string;
  identityCode: string;
  type: CustomerType;
  customerGroup: CustomerGroup;
  customerCode: string;
  status: string;
  teamId: string;
  salesChannel: string;
  territoryId: string;
  address: string;
  note: string;
  phone: string; // SĐT liên hệ
  contactName: string;
  contactEmail: string;
  billingName: string;
  billingPhone: string;
  billingEmail: string;
}

export const EMPTY_CUSTOMER_FORM: CustomerFormValues = {
  name: "",
  identityCode: "",
  type: TYPE_OPTIONS[0],
  customerGroup: GROUP_OPTIONS[0],
  customerCode: "",
  status: "",
  teamId: "",
  salesChannel: "",
  territoryId: "",
  address: "",
  note: "",
  phone: "",
  contactName: "",
  contactEmail: "",
  billingName: "",
  billingPhone: "",
  billingEmail: "",
};

export function customerToFormValues(customer: CustomerRecord): CustomerFormValues {
  return {
    name: customer.name,
    identityCode: customer.identityCode || "",
    type: customer.type,
    customerGroup: customer.group,
    customerCode: customer.customerCode || "",
    status: customer.status || "",
    teamId: customer.teamId || "",
    salesChannel: customer.salesChannel || "",
    territoryId: customer.territoryId || "",
    address: customer.address || "",
    note: customer.note || "",
    phone: customer.phone || "",
    contactName: customer.contactName || "",
    contactEmail: customer.contactEmail || "",
    billingName: customer.billingName || "",
    billingPhone: customer.billingPhone || "",
    billingEmail: customer.billingEmail || "",
  };
}

interface CustomerFormProps {
  mode: "create" | "edit";
  initialValues?: CustomerFormValues;
  territories: TerritoryRecord[];
  teams: CustomerTeamRecord[];
  submitting?: boolean;
  error?: string | null;
  onSubmit: (values: CustomerFormValues) => void | Promise<void>;
  onCancel: () => void;
  title?: string;
}

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none";
const labelClass = "mb-1 block text-xs font-semibold text-slate-600";

export default function CustomerForm({
  mode,
  initialValues,
  territories,
  teams,
  submitting,
  error,
  onSubmit,
  onCancel,
  title,
}: CustomerFormProps) {
  const [values, setValues] = useState<CustomerFormValues>(initialValues ?? EMPTY_CUSTOMER_FORM);

  function set<K extends keyof CustomerFormValues>(key: K, value: CustomerFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function copyContactToBilling() {
    setValues((prev) => ({
      ...prev,
      billingName: prev.contactName,
      billingPhone: prev.phone,
      billingEmail: prev.contactEmail,
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit(values);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            {title || (mode === "create" ? "Thêm khách hàng" : "Sửa thông tin khách hàng")}
          </h3>
          <button
            onClick={onCancel}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Thông tin chung */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Thông tin chung
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label htmlFor="cf-name" className={labelClass}>
                  Tên khách hàng <span className="text-rose-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="cf-name"
                  required
                  value={values.name}
                  onChange={(e) => set("name", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="cf-customer-code" className={labelClass}>
                  Mã KH
                </label>
                <input
                  id="cf-customer-code"
                  value={values.customerCode}
                  onChange={(e) => set("customerCode", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="cf-identity-code" className={labelClass}>
                  MST / CCCD
                </label>
                <input
                  id="cf-identity-code"
                  value={values.identityCode}
                  onChange={(e) => set("identityCode", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="cf-type" className={labelClass}>
                  Loại khách hàng
                </label>
                <select
                  id="cf-type"
                  value={values.type}
                  onChange={(e) => set("type", e.target.value as CustomerType)}
                  className={inputClass}
                >
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="cf-group" className={labelClass}>
                  Loại khách <span className="text-rose-500" aria-hidden="true">*</span>
                </label>
                <select
                  id="cf-group"
                  value={values.customerGroup}
                  onChange={(e) => set("customerGroup", e.target.value as CustomerGroup)}
                  className={inputClass}
                >
                  {GROUP_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {CUSTOMER_GROUP_LABEL[g]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="cf-status" className={labelClass}>
                  Trạng thái
                </label>
                <input
                  id="cf-status"
                  value={values.status}
                  onChange={(e) => set("status", e.target.value)}
                  placeholder="Hoạt động bình thường"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="cf-team" className={labelClass}>
                  Team
                </label>
                <select
                  id="cf-team"
                  value={values.teamId}
                  onChange={(e) => set("teamId", e.target.value)}
                  className={inputClass}
                >
                  <option value="">— Không thuộc team —</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="cf-sales-channel" className={labelClass}>
                  Kênh bán
                </label>
                <select
                  id="cf-sales-channel"
                  value={values.salesChannel}
                  onChange={(e) => set("salesChannel", e.target.value)}
                  className={inputClass}
                >
                  <option value="">— Chưa xác định —</option>
                  {LEAD_CHANNELS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="cf-territory" className={labelClass}>
                  Phường / địa bàn
                </label>
                <select
                  id="cf-territory"
                  value={values.territoryId}
                  onChange={(e) => set("territoryId", e.target.value)}
                  className={inputClass}
                >
                  <option value="">— Chưa gán —</option>
                  {territories.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.wardName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label htmlFor="cf-address" className={labelClass}>
                  Địa chỉ
                </label>
                <input
                  id="cf-address"
                  value={values.address}
                  onChange={(e) => set("address", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="col-span-2">
                <label htmlFor="cf-note" className={labelClass}>
                  Ghi chú
                </label>
                <textarea
                  id="cf-note"
                  value={values.note}
                  onChange={(e) => set("note", e.target.value)}
                  rows={2}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Thông tin liên hệ */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Thông tin liên hệ
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="cf-contact-name" className={labelClass}>
                  Họ tên
                </label>
                <input
                  id="cf-contact-name"
                  value={values.contactName}
                  onChange={(e) => set("contactName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="cf-contact-phone" className={labelClass}>
                  Số điện thoại
                </label>
                <input
                  id="cf-contact-phone"
                  value={values.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="cf-contact-email" className={labelClass}>
                  Email
                </label>
                <input
                  id="cf-contact-email"
                  type="email"
                  value={values.contactEmail}
                  onChange={(e) => set("contactEmail", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Thông tin thanh toán */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Thông tin thanh toán
              </h4>
              <button
                type="button"
                onClick={copyContactToBilling}
                className="text-[11px] font-semibold text-vnpt hover:underline"
              >
                Giống thông tin liên hệ
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="cf-billing-name" className={labelClass}>
                  Họ tên
                </label>
                <input
                  id="cf-billing-name"
                  value={values.billingName}
                  onChange={(e) => set("billingName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="cf-billing-phone" className={labelClass}>
                  Số điện thoại
                </label>
                <input
                  id="cf-billing-phone"
                  value={values.billingPhone}
                  onChange={(e) => set("billingPhone", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="cf-billing-email" className={labelClass}>
                  Email
                </label>
                <input
                  id="cf-billing-email"
                  type="email"
                  value={values.billingEmail}
                  onChange={(e) => set("billingEmail", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-label rounded-xl bg-vnpt px-3.5 py-2 text-white hover:bg-vnpt-dark disabled:opacity-60"
            >
              {submitting ? "Đang lưu..." : mode === "create" ? "Thêm khách hàng" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
