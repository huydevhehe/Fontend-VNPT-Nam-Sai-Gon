import { Mail, MessageCircle, Phone } from "lucide-react";
import CtvTopbar from "@/components/ctv/CtvTopbar";

const FAQ = [
  {
    q: "Khi nào hoa hồng được thanh toán?",
    a: "Hoa hồng được đối soát và thanh toán vào ngày 05 hàng tháng cho các hợp đồng đã duyệt trong tháng trước đó.",
  },
  {
    q: "Làm sao để tạo link giới thiệu?",
    a: "Vào mục \"Link giới thiệu\" ở thanh điều hướng bên trái, sao chép link chung hoặc link theo từng dịch vụ để chia sẻ cho khách hàng.",
  },
  {
    q: "Tỷ lệ hoa hồng được tính như thế nào?",
    a: "Tỷ lệ hoa hồng áp dụng theo từng nhóm sản phẩm, xem chi tiết tại mục \"Sản phẩm\".",
  },
  {
    q: "Hợp đồng của tôi đang ở trạng thái \"Đang xử lý\", bao lâu thì được duyệt?",
    a: "Hợp đồng thường được xử lý trong 1-3 ngày làm việc kể từ khi khách hàng hoàn tất thủ tục.",
  },
];

export default function HoTroPage() {
  return (
    <div>
      <CtvTopbar title="Hỗ trợ" subtitle="Câu hỏi thường gặp và kênh liên hệ hỗ trợ Cộng tác viên" />

      <div className="grid gap-4 p-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-800">Câu hỏi thường gặp</h2>
          <div className="divide-y divide-slate-100">
            {FAQ.map((f) => (
              <div key={f.q} className="py-3">
                <div className="text-sm font-semibold text-slate-800">{f.q}</div>
                <p className="mt-1 text-xs text-slate-500">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-slate-800">Liên hệ hỗ trợ</h2>
            <div className="space-y-3 text-sm">
              <a href="tel:0838999333" className="flex items-center gap-2.5 text-slate-600 hover:text-vnpt">
                <Phone size={15} className="text-vnpt" /> Hotline: 0838 999 333
              </a>
              <a href="mailto:ctv@vnptnamsaigon.vn" className="flex items-center gap-2.5 text-slate-600 hover:text-vnpt">
                <Mail size={15} className="text-vnpt" /> ctv@vnptnamsaigon.vn
              </a>
              <a href="https://zalo.me" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-slate-600 hover:text-vnpt">
                <MessageCircle size={15} className="text-vnpt" /> Zalo OA hỗ trợ CTV
              </a>
            </div>
          </div>
          <div className="rounded-xl bg-vnpt-light p-4 text-sm text-slate-600">
            Giờ làm việc hỗ trợ: Thứ 2 - Thứ 7, 7:30 - 21:00.
          </div>
        </div>
      </div>
    </div>
  );
}
