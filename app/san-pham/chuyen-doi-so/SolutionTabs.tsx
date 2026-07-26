"use client";

import Image from "next/image";
import { useState } from "react";
import { Landmark, Plane, Sprout } from "lucide-react";

type TabGroup = {
  title: string;
  items: { name: string; desc: string }[];
};

type Tab = {
  key: string;
  label: string;
  image?: string;
  fallbackIcon?: typeof Landmark;
  groups: TabGroup[];
};

const TABS: Tab[] = [
  {
    key: "doanh-nghiep",
    label: "Doanh nghiệp",
    image: "/images/doi-tuong/doanh-nghiep.jpg",
    groups: [
      {
        title: "Quản trị & Điều hành",
        items: [
          { name: "iOffice", desc: "Nền tảng quản trị công việc toàn diện" },
          { name: "ERP", desc: "Quản trị nguồn lực doanh nghiệp" },
          { name: "HRM", desc: "Quản trị nhân sự" },
          { name: "CRM", desc: "Quản lý quan hệ khách hàng" },
        ],
      },
      {
        title: "Tài chính – Kế toán",
        items: [
          { name: "Kế toán điện tử", desc: "" },
          { name: "Hóa đơn điện tử", desc: "" },
          { name: "Quản lý chi tiêu", desc: "" },
          { name: "Báo cáo BI", desc: "" },
        ],
      },
      {
        title: "Vận hành & Sản xuất",
        items: [
          { name: "Quản lý kho", desc: "" },
          { name: "Quản lý chuỗi cung ứng", desc: "" },
          { name: "Quản lý sản xuất", desc: "" },
          { name: "Giám sát IoT", desc: "" },
        ],
      },
      {
        title: "Kinh doanh & Marketing",
        items: [
          { name: "Quản lý bán hàng", desc: "" },
          { name: "CSKH đa kênh", desc: "" },
          { name: "Marketing automation", desc: "" },
          { name: "Phân tích khách hàng", desc: "" },
        ],
      },
    ],
  },
  {
    key: "giao-duc",
    label: "Giáo dục",
    image: "/images/doi-tuong/truong-hoc.jpg",
    groups: [
      {
        title: "Quản lý nhà trường",
        items: [
          { name: "vnEdu", desc: "Quản lý trường học toàn diện" },
          { name: "Sổ liên lạc điện tử", desc: "" },
          { name: "Quản lý tuyển sinh", desc: "" },
        ],
      },
      {
        title: "Dạy và học",
        items: [
          { name: "Lớp học trực tuyến", desc: "" },
          { name: "Kho học liệu số", desc: "" },
          { name: "Kiểm tra – đánh giá online", desc: "" },
        ],
      },
      {
        title: "Thanh toán & Kết nối",
        items: [
          { name: "Thanh toán học phí", desc: "" },
          { name: "Kết nối phụ huynh", desc: "" },
          { name: "Báo cáo giáo dục", desc: "" },
        ],
      },
    ],
  },
  {
    key: "y-te",
    label: "Y tế",
    image: "/images/doi-tuong/benh-vien.jpg",
    groups: [
      {
        title: "Quản lý bệnh viện",
        items: [
          { name: "HIS", desc: "Hệ thống thông tin bệnh viện" },
          { name: "HMIS", desc: "Quản lý y tế cơ sở" },
          { name: "Bệnh án điện tử", desc: "" },
        ],
      },
      {
        title: "Khám chữa bệnh",
        items: [
          { name: "Đặt lịch khám online", desc: "" },
          { name: "Tư vấn khám từ xa", desc: "" },
          { name: "Quản lý xét nghiệm", desc: "" },
        ],
      },
      {
        title: "Dược & Viện phí",
        items: [
          { name: "Pharmacy", desc: "Quản lý nhà thuốc" },
          { name: "Thanh toán viện phí", desc: "" },
          { name: "Bảo hiểm y tế điện tử", desc: "" },
        ],
      },
    ],
  },
  {
    key: "chinh-quyen",
    label: "Chính quyền",
    image: "/images/doi-tuong/co-quan-nha-nuoc.jpg",
    groups: [
      {
        title: "Chính phủ điện tử",
        items: [
          { name: "eGov", desc: "Nền tảng Chính phủ điện tử" },
          { name: "Một cửa liên thông", desc: "" },
          { name: "Văn bản điều hành", desc: "" },
        ],
      },
      {
        title: "Dịch vụ công",
        items: [
          { name: "Cổng thông tin điện tử", desc: "" },
          { name: "Dịch vụ công trực tuyến", desc: "" },
          { name: "Xác thực định danh (IDP)", desc: "" },
        ],
      },
      {
        title: "Quản trị nội bộ",
        items: [
          { name: "Quản lý cán bộ công chức", desc: "" },
          { name: "Lưu trữ điện tử", desc: "" },
          { name: "Báo cáo, thống kê (OLAP)", desc: "" },
        ],
      },
    ],
  },
  {
    key: "do-thi-thong-minh",
    label: "Đô thị thông minh",
    fallbackIcon: Landmark,
    groups: [
      {
        title: "Điều hành đô thị",
        items: [
          { name: "IOC", desc: "Trung tâm điều hành thông minh" },
          { name: "Giám sát camera AI", desc: "" },
          { name: "Cảnh báo sự cố thời gian thực", desc: "" },
        ],
      },
      {
        title: "Tiện ích đô thị",
        items: [
          { name: "Giao thông thông minh", desc: "" },
          { name: "Chiếu sáng thông minh", desc: "" },
          { name: "Môi trường thông minh", desc: "" },
        ],
      },
      {
        title: "Tương tác công dân",
        items: [
          { name: "Phản ánh hiện trường", desc: "" },
          { name: "Công dân số", desc: "" },
          { name: "An ninh trật tự", desc: "" },
        ],
      },
    ],
  },
  {
    key: "nong-nghiep",
    label: "Nông nghiệp",
    fallbackIcon: Sprout,
    groups: [
      {
        title: "Sản xuất thông minh",
        items: [
          { name: "Smart Agriculture", desc: "Giám sát nông trại thông minh" },
          { name: "Cảm biến IoT nông nghiệp", desc: "" },
          { name: "Tưới tiêu tự động", desc: "" },
        ],
      },
      {
        title: "Quản lý & Truy xuất",
        items: [
          { name: "Truy xuất nguồn gốc", desc: "" },
          { name: "Nhật ký canh tác điện tử", desc: "" },
          { name: "Quản lý mùa vụ", desc: "" },
        ],
      },
      {
        title: "Kết nối thị trường",
        items: [
          { name: "Sàn thương mại nông sản", desc: "" },
          { name: "Dự báo thời tiết – sâu bệnh", desc: "" },
          { name: "Kết nối tiêu thụ", desc: "" },
        ],
      },
    ],
  },
  {
    key: "du-lich",
    label: "Du lịch",
    fallbackIcon: Plane,
    groups: [
      {
        title: "Trải nghiệm du khách",
        items: [
          { name: "Smart Tourism", desc: "Du lịch thông minh" },
          { name: "Thuyết minh đa ngôn ngữ", desc: "" },
          { name: "Bản đồ số điểm đến", desc: "" },
        ],
      },
      {
        title: "Quản lý điểm đến",
        items: [
          { name: "Vé điện tử", desc: "" },
          { name: "Quản lý lưu trú", desc: "" },
          { name: "Giám sát lượng khách", desc: "" },
        ],
      },
      {
        title: "Quảng bá & Kết nối",
        items: [
          { name: "Cổng thông tin du lịch", desc: "" },
          { name: "Đặt tour trực tuyến", desc: "" },
          { name: "Phân tích dữ liệu du khách", desc: "" },
        ],
      },
    ],
  },
];

export default function SolutionTabs() {
  const [active, setActive] = useState(TABS[0].key);
  const tab = TABS.find((t) => t.key === active) ?? TABS[0];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActive(t.key)}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              t.key === active
                ? "bg-vnpt text-white"
                : "border border-slate-200 text-slate-600 hover:border-vnpt hover:text-vnpt"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="relative hidden h-full min-h-[220px] overflow-hidden rounded-xl bg-vnpt-darker lg:block">
          {tab.image ? (
            <Image
              src={tab.image}
              alt={tab.label}
              fill
              sizes="(max-width: 1024px) 0px, 220px"
              className="object-cover"
            />
          ) : (
            tab.fallbackIcon && (
              <div className="flex h-full items-center justify-center">
                <tab.fallbackIcon size={56} className="text-white/70" />
              </div>
            )
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tab.groups.map((g) => (
            <div key={g.title}>
              <h3 className="mb-3 text-sm font-bold text-vnpt">{g.title}</h3>
              <ul className="space-y-2">
                {g.items.map((it) => (
                  <li key={it.name} className="text-sm">
                    <span className="font-semibold text-slate-800">{it.name}</span>
                    {it.desc && <p className="text-xs text-slate-500">{it.desc}</p>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
