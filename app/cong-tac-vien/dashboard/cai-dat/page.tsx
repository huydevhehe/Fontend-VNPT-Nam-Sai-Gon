import CtvTopbar from "@/components/ctv/CtvTopbar";
import CtvSettingsForm from "@/components/ctv/CtvSettingsForm";

export default function CaiDatPage() {
  return (
    <div>
      <CtvTopbar title="Cài đặt" subtitle="Thông tin tài khoản và cấu hình nhận thanh toán hoa hồng" />

      <div className="p-6">
        <div className="max-w-2xl rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-slate-800">Thông tin Cộng tác viên</h2>
          <CtvSettingsForm />
        </div>
      </div>
    </div>
  );
}
