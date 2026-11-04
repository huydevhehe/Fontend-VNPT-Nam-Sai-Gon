import { MousePointerClick, Share2, UserPlus } from "lucide-react";
import CtvTopbar from "@/components/ctv/CtvTopbar";
import CopyLinkBox from "@/components/ctv/CopyLinkBox";
import { CTV_PROFILE } from "@/content/ctv-mock";
import { categories } from "@/content/category-map";

const REFERRAL_STATS = [
  { icon: MousePointerClick, value: "1.284", label: "Lượt click" },
  { icon: UserPlus, value: "96", label: "Khách hàng đăng ký" },
  { icon: Share2, value: "7,5%", label: "Tỷ lệ chuyển đổi" },
];

export default function LinkGioiThieuPage() {
  const baseLink = `https://vnptnamsaigon.vn/ref/${CTV_PROFILE.code}`;

  return (
    <div>
      <CtvTopbar title="Link giới thiệu" subtitle="Tạo và chia sẻ link giới thiệu để nhận hoa hồng" />

      <div className="space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {REFERRAL_STATS.map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-vnpt-light text-vnpt">
                <s.icon size={18} />
              </span>
              <div className="mt-3 text-xl font-extrabold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-800">Link giới thiệu chung</h2>
          <CopyLinkBox link={baseLink} />
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-800">Link giới thiệu theo dịch vụ</h2>
          <div className="space-y-3">
            {categories.map((c) => (
              <div key={c.slug} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-vnpt-light text-vnpt">
                  <c.icon size={15} />
                </span>
                <span className="w-40 shrink-0 text-sm font-medium text-slate-700">{c.name}</span>
                <div className="flex-1">
                  <CopyLinkBox link={`${baseLink}?src=${c.slug}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
