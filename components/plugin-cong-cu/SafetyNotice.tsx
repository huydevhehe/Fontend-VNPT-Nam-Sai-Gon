import { Phone, ShieldAlert } from "lucide-react";

export default function SafetyNotice() {
  return (
    <section className="py-6">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-6 rounded-xl border border-amber-200 bg-amber-50 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-vnpt-accent/10 text-vnpt-accent">
              <ShieldAlert size={26} />
            </span>
            <div>
              <h3 className="text-vnpt-accent">CẢNH BÁO AN TOÀN</h3>
              <p className="mt-2 text-sm text-slate-600">
                Chỉ tải phần mềm, driver và tài liệu từ tên miền chính thức của VNPT.
              </p>
              <p className="text-sm text-slate-600">
                Không tải từ các nguồn không rõ ràng để tránh rủi ro về bảo mật.
              </p>
            </div>
          </div>

          <div className="lg:border-l lg:border-amber-200 lg:pl-8">
            <p className="text-sm text-slate-600">Nếu cần hỗ trợ cài đặt, vui lòng liên hệ:</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <a
                href="tel:0838999333"
                className="flex items-center gap-2 text-xl font-bold text-vnpt transition hover:text-vnpt-dark"
              >
                <Phone size={20} />
                0838 999 333
              </a>
              <span className="text-xs text-slate-500">Hỗ trợ kỹ thuật 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
