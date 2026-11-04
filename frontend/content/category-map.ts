// Ánh xạ 6 danh mục sản phẩm hiển thị trên site với dữ liệu thật đã cào (lọc theo
// sourceId) + sản phẩm viết tay (isFake: true) cho phần chưa có nguồn cào tương ứng.
// Xem docs/superpowers/specs/2026-07-24-vnpt-nam-sai-gon-website-design.md mục 3.

import type { LucideIcon } from "lucide-react";
import { Cloud, FileSignature, Receipt, Smartphone, Wifi, Workflow } from "lucide-react";
import type { Product } from "@/lib/types";

export type CategoryConfig = {
  slug: string;
  name: string;
  shortDesc: string;
  icon: LucideIcon;
  sourceIds: string[];
  fakeProducts: Product[];
};

const bangRongFake: Product[] = [
  {
    id: "fake-bang-rong-internet-gia-dinh",
    slug: "internet-gia-dinh",
    sourceId: "vnpt-nam-sai-gon",
    category: "Băng rộng cố định",
    title: "Internet Gia đình",
    shortDesc: "Cáp quang tốc độ cao, ổn định, phù hợp mọi nhu cầu gia đình.",
    features: ["Tốc độ tới 1000Mbps", "Ổn định 24/7", "Miễn phí lắp đặt", "Modem WiFi 6"],
    pricing: [
      {
        name: "Gói cước Internet Gia đình",
        columns: ["Gói", "Tốc độ", "Giá/tháng"],
        rows: [
          ["Fiber Eco", "150 Mbps", "165.000đ"],
          ["Fiber Plus", "300 Mbps", "220.000đ"],
          ["Fiber Turbo", "500 Mbps", "275.000đ"],
        ],
        note: "Giá chưa bao gồm VAT",
      },
    ],
    images: [],
    bodyText:
      "Internet Gia đình VNPT mang tới đường truyền cáp quang ổn định, tốc độ cao, đáp ứng nhu cầu lướt web, xem phim, học tập và làm việc trực tuyến của cả gia đình.",
    sourceUrl: "#",
    isFake: true,
  },
  {
    id: "fake-bang-rong-internet-doanh-nghiep",
    slug: "internet-doanh-nghiep",
    sourceId: "vnpt-nam-sai-gon",
    category: "Băng rộng cố định",
    title: "Internet Doanh nghiệp",
    shortDesc: "Đường truyền cáp quang chuyên dụng, cam kết băng thông cho doanh nghiệp.",
    features: ["Cam kết tốc độ quốc tế", "IP tĩnh", "Hỗ trợ kỹ thuật 24/7", "SLA rõ ràng"],
    pricing: [
      {
        name: "Gói cước Internet Doanh nghiệp",
        columns: ["Gói", "Tốc độ", "Giá/tháng"],
        rows: [["Fiber VIP", "1000 Mbps", "Liên hệ"]],
      },
    ],
    images: [],
    bodyText:
      "Internet Doanh nghiệp VNPT cung cấp đường truyền cáp quang chuyên dụng, cam kết băng thông và thời gian phản hồi sự cố cho doanh nghiệp vừa và nhỏ.",
    sourceUrl: "#",
    isFake: true,
  },
  {
    id: "fake-bang-rong-mytv",
    slug: "truyen-hinh-mytv",
    sourceId: "vnpt-nam-sai-gon",
    category: "Băng rộng cố định",
    title: "Truyền hình MyTV",
    shortDesc: "Hơn 180 kênh truyền hình đặc sắc, kho phim đa dạng.",
    features: ["180+ kênh truyền hình", "Kho phim VOD khổng lồ", "Xem trên nhiều thiết bị"],
    pricing: [],
    images: [],
    bodyText:
      "MyTV là dịch vụ truyền hình số của VNPT với hơn 180 kênh trong nước và quốc tế, kho phim theo yêu cầu phong phú, xem mọi lúc mọi nơi trên TV, điện thoại, máy tính bảng.",
    sourceUrl: "#",
    isFake: true,
  },
];

const diDongVinaphoneFake: Product[] = [
  {
    id: "fake-vinaphone-max100",
    slug: "vinaphone-max100",
    sourceId: "vnpt-nam-sai-gon",
    category: "Di động Vinaphone",
    title: "VinaPhone MAX100",
    shortDesc: "Gói cước trả trước 30GB data tốc độ cao, ưu đãi gọi nội mạng.",
    features: ["30GB data tốc độ cao", "Miễn phí gọi nội mạng dưới 20 phút", "50 SMS nội mạng"],
    pricing: [
      {
        columns: ["Gói", "Chu kỳ", "Giá"],
        rows: [["VinaPhone MAX100", "30 ngày", "100.000đ"]],
      },
    ],
    images: [],
    bodyText: "Gói cước trả trước MAX100 dành cho khách hàng cá nhân có nhu cầu sử dụng data tốc độ cao và gọi thoại nội mạng thường xuyên.",
    sourceUrl: "#",
    isFake: true,
  },
  {
    id: "fake-vinaphone-vd149",
    slug: "vinaphone-vd149",
    sourceId: "vnpt-nam-sai-gon",
    category: "Di động Vinaphone",
    title: "VinaPhone VD149",
    shortDesc: "Gói cước trả sau 45GB, miễn phí toàn bộ cuộc gọi nội mạng.",
    features: ["45GB data tốc độ cao", "Miễn phí tất cả cuộc gọi nội mạng", "150 phút gọi ngoại mạng"],
    pricing: [
      {
        columns: ["Gói", "Chu kỳ", "Giá"],
        rows: [["VinaPhone VD149", "30 ngày", "149.000đ"]],
      },
    ],
    images: [],
    bodyText: "Gói cước trả sau VD149 phù hợp khách hàng cá nhân và doanh nghiệp cần data lớn và gọi thoại không giới hạn nội mạng.",
    sourceUrl: "#",
    isFake: true,
  },
  {
    id: "fake-vinaphone-esim",
    slug: "esim-vinaphone",
    sourceId: "vnpt-nam-sai-gon",
    category: "Di động Vinaphone",
    title: "eSIM VinaPhone",
    shortDesc: "Kích hoạt SIM số ngay trên điện thoại, không cần SIM vật lý.",
    features: ["Kích hoạt online trong 1 phút", "Không cần SIM vật lý", "Hỗ trợ mọi gói cước"],
    pricing: [],
    images: [],
    bodyText: "eSIM VinaPhone cho phép khách hàng đăng ký và kích hoạt số thuê bao hoàn toàn trực tuyến, không cần chờ giao SIM vật lý.",
    sourceUrl: "#",
    isFake: true,
  },
  {
    id: "fake-vinaphone-roaming",
    slug: "roaming-quoc-te-vinaphone",
    sourceId: "vnpt-nam-sai-gon",
    category: "Di động Vinaphone",
    title: "Roaming quốc tế VinaPhone",
    shortDesc: "Kết nối hơn 200 quốc gia, giá cước ưu đãi khi ra nước ngoài.",
    features: ["200+ quốc gia và vùng lãnh thổ", "Đăng ký nhanh qua ứng dụng", "Gói ngày/gói data linh hoạt"],
    pricing: [],
    images: [],
    bodyText: "Dịch vụ Roaming quốc tế VinaPhone giúp khách hàng giữ liên lạc và sử dụng data khi công tác, du lịch nước ngoài với mức cước ưu đãi.",
    sourceUrl: "#",
    isFake: true,
  },
];

const hoaDonThueFake: Product[] = [
  {
    id: "fake-hoa-don-vnpt-invoice",
    slug: "vnpt-invoice",
    sourceId: "vnpt-nam-sai-gon",
    category: "Hóa đơn - Thuế",
    title: "VNPT Invoice",
    shortDesc: "Giải pháp hóa đơn điện tử toàn diện cho doanh nghiệp",
    features: [
      "Khởi tạo & phát hành nhanh chóng",
      "Kết nối trực tiếp với Tổng cục Thuế",
      "Quản lý hóa đơn tập trung, tra cứu dễ dàng",
      "Lưu trữ hóa đơn an toàn tới 10 năm",
      "Tích hợp linh hoạt với phần mềm kế toán, ERP",
    ],
    pricing: [
      {
        name: "Bảng giá dịch vụ VNPT Invoice",
        columns: ["Gói", "Số hóa đơn/năm", "Giá"],
        rows: [
          ["Gói khởi tạo", "300 hóa đơn/năm", "300.000đ/năm"],
          ["Gói cơ bản", "1.000 hóa đơn/năm", "550.000đ/năm"],
          ["Gói chuyên nghiệp", "3.000 hóa đơn/năm", "1.200.000đ/năm"],
          ["Gói nâng cao", "5.000 hóa đơn/năm", "1.800.000đ/năm"],
        ],
        note: "Giá trên chưa bao gồm VAT",
      },
    ],
    images: [],
    bodyText:
      "VNPT Invoice là giải pháp hóa đơn điện tử do VNPT phát triển, đáp ứng đầy đủ quy định của Tổng cục Thuế, giúp doanh nghiệp khởi tạo, phát hành, gửi, lưu trữ và quản lý hóa đơn điện tử nhanh chóng, an toàn, tiết kiệm chi phí. Đáp ứng Nghị định 123/2020/NĐ-CP và Thông tư 78/2021/TT-BTC.",
    sourceUrl: "#",
    isFake: true,
  },
  {
    id: "fake-hoa-don-may-tinh-tien",
    slug: "hoa-don-tu-may-tinh-tien",
    sourceId: "vnpt-nam-sai-gon",
    category: "Hóa đơn - Thuế",
    title: "Hóa đơn từ máy tính tiền",
    shortDesc: "Kết nối trực tiếp máy tính tiền, tự động phát hành hóa đơn ngay khi bán hàng.",
    features: ["Phát hành hóa đơn tức thời", "Kết nối trực tiếp máy tính tiền", "Phù hợp bán lẻ, F&B"],
    pricing: [],
    images: [],
    bodyText: "Giải pháp hóa đơn điện tử khởi tạo từ máy tính tiền, phù hợp cửa hàng bán lẻ, siêu thị mini, nhà hàng cần xuất hóa đơn nhanh ngay tại quầy.",
    sourceUrl: "#",
    isFake: true,
  },
  {
    id: "fake-smartpos",
    slug: "smartpos",
    sourceId: "vnpt-nam-sai-gon",
    category: "Hóa đơn - Thuế",
    title: "SmartPOS",
    shortDesc: "Giải pháp thanh toán và phát hành hóa đơn ngay trên thiết bị POS.",
    features: ["Thanh toán đa kênh", "Phát hành hóa đơn tự động", "Báo cáo doanh thu thời gian thực"],
    pricing: [],
    images: [],
    bodyText: "SmartPOS tích hợp thanh toán và phát hành hóa đơn điện tử ngay trên một thiết bị, giúp hộ kinh doanh và cửa hàng quản lý bán hàng hiệu quả.",
    sourceUrl: "#",
    isFake: true,
  },
  {
    id: "fake-thue-dien-tu",
    slug: "thue-dien-tu",
    sourceId: "vnpt-nam-sai-gon",
    category: "Hóa đơn - Thuế",
    title: "Thuế điện tử",
    shortDesc: "Kê khai, nộp thuế điện tử nhanh chóng, chính xác, đúng hạn.",
    features: ["Kê khai thuế trực tuyến", "Nộp thuế điện tử", "Nhắc hạn tự động"],
    pricing: [],
    images: [],
    bodyText: "Dịch vụ Thuế điện tử VNPT hỗ trợ doanh nghiệp và hộ kinh doanh kê khai, nộp thuế trực tuyến nhanh chóng, giảm thiểu sai sót và tiết kiệm thời gian.",
    sourceUrl: "#",
    isFake: true,
  },
  {
    id: "fake-bhxh-dien-tu",
    slug: "bhxh-dien-tu-ivan",
    sourceId: "vnpt-nam-sai-gon",
    category: "Hóa đơn - Thuế",
    title: "BHXH điện tử (IVAN)",
    shortDesc: "Giao dịch bảo hiểm xã hội điện tử thuận tiện, đầy đủ, đúng chuẩn.",
    features: ["Giao dịch trực tuyến với cơ quan BHXH", "Đầy đủ nghiệp vụ BHXH", "Bảo mật dữ liệu"],
    pricing: [],
    images: [],
    bodyText: "BHXH điện tử (IVAN) giúp doanh nghiệp thực hiện các thủ tục bảo hiểm xã hội hoàn toàn trực tuyến, đúng chuẩn quy định của BHXH Việt Nam.",
    sourceUrl: "#",
    isFake: true,
  },
];

const chuKySoFake: Product[] = [
  {
    id: "fake-smartca-ca-nhan",
    slug: "smartca-ca-nhan",
    sourceId: "vnpt-nam-sai-gon",
    category: "Chữ ký số",
    title: "SmartCA Cá nhân",
    shortDesc: "Chữ ký số từ xa cho cá nhân, ký mọi lúc mọi nơi không cần USB Token.",
    features: ["Ký trong 3 giây", "Không cần USB Token", "Được pháp luật công nhận"],
    pricing: [
      {
        name: "Bảng giá SmartCA Cá nhân",
        columns: ["Gói", "Thời hạn", "Giá cước"],
        rows: [
          ["SmartCA Cá nhân 1 năm", "12 tháng", "550.000đ"],
          ["SmartCA Cá nhân 2 năm", "24 tháng", "990.000đ"],
          ["SmartCA Cá nhân 3 năm", "36 tháng", "1.320.000đ"],
        ],
        note: "Bảng giá đã bao gồm VAT",
      },
    ],
    images: [],
    bodyText: "SmartCA Cá nhân là dịch vụ chữ ký số từ xa, cho phép cá nhân ký hợp đồng, giao dịch điện tử mọi lúc, mọi nơi chỉ với điện thoại thông minh.",
    sourceUrl: "#",
    isFake: true,
  },
  {
    id: "fake-smartca-doanh-nghiep",
    slug: "smartca-doanh-nghiep",
    sourceId: "vnpt-nam-sai-gon",
    category: "Chữ ký số",
    title: "SmartCA Doanh nghiệp",
    shortDesc: "Chữ ký số từ xa cho doanh nghiệp, ký hóa đơn, hợp đồng, kê khai thuế.",
    features: ["Ký hóa đơn điện tử", "Ký hợp đồng điện tử", "Kê khai thuế, BHXH"],
    pricing: [
      {
        name: "Bảng giá SmartCA Doanh nghiệp",
        columns: ["Gói", "Thời hạn", "Giá cước"],
        rows: [
          ["SmartCA Doanh nghiệp 1 năm", "12 tháng", "1.650.000đ"],
          ["SmartCA Doanh nghiệp 2 năm", "24 tháng", "2.970.000đ"],
          ["SmartCA Doanh nghiệp 3 năm", "36 tháng", "3.960.000đ"],
        ],
        note: "Bảng giá đã bao gồm VAT",
      },
    ],
    images: [],
    bodyText: "SmartCA Doanh nghiệp giúp doanh nghiệp ký số hóa đơn điện tử, hợp đồng, hồ sơ thuế và BHXH nhanh chóng, an toàn theo tiêu chuẩn châu Âu.",
    sourceUrl: "#",
    isFake: true,
  },
  {
    id: "fake-smartca-ho-kinh-doanh",
    slug: "smartca-ho-kinh-doanh",
    sourceId: "vnpt-nam-sai-gon",
    category: "Chữ ký số",
    title: "SmartCA Hộ kinh doanh",
    shortDesc: "Chữ ký số từ xa cho hộ kinh doanh, ký hóa đơn điện tử, tờ khai thuế.",
    features: ["Ký hóa đơn điện tử", "Ký tờ khai thuế", "Không cần USB Token"],
    pricing: [
      {
        name: "Bảng giá SmartCA Hộ kinh doanh",
        columns: ["Gói", "Thời hạn", "Giá cước"],
        rows: [
          ["SmartCA Hộ kinh doanh 1 năm", "12 tháng", "900.000đ"],
          ["SmartCA Hộ kinh doanh 2 năm", "24 tháng", "1.620.000đ"],
          ["SmartCA Hộ kinh doanh 3 năm", "36 tháng", "2.160.000đ"],
        ],
        note: "Giá tham khảo, có thể thay đổi tuỳ thời điểm và chính sách",
      },
    ],
    images: [],
    bodyText: "SmartCA Hộ kinh doanh giúp hộ kinh doanh cá thể ký số hóa đơn điện tử, tờ khai thuế nhanh chóng, không cần USB Token.",
    sourceUrl: "#",
    isFake: true,
  },
  {
    id: "fake-usb-token",
    slug: "usb-token",
    sourceId: "vnpt-nam-sai-gon",
    category: "Chữ ký số",
    title: "USB Token",
    shortDesc: "Chữ ký số truyền thống dạng USB, bảo mật cao cho doanh nghiệp.",
    features: ["Bảo mật phần cứng", "Phù hợp kê khai thuế truyền thống", "Tương thích nhiều phần mềm"],
    pricing: [],
    images: [],
    bodyText: "USB Token VNPT là thiết bị chữ ký số vật lý, phù hợp doanh nghiệp cần ký số ổn định trên máy tính cố định.",
    sourceUrl: "#",
    isFake: true,
  },
  {
    id: "fake-econtract",
    slug: "econtract",
    sourceId: "vnpt-nam-sai-gon",
    category: "Chữ ký số",
    title: "eContract",
    shortDesc: "Nền tảng soạn thảo, ký kết hợp đồng điện tử trực tuyến.",
    features: ["Soạn thảo hợp đồng online", "Ký nhiều bên", "Lưu trữ pháp lý an toàn"],
    pricing: [],
    images: [],
    bodyText: "eContract là nền tảng cho phép doanh nghiệp soạn thảo, gửi và ký kết hợp đồng điện tử với đối tác, khách hàng hoàn toàn trực tuyến.",
    sourceUrl: "#",
    isFake: true,
  },
];

export const categories: CategoryConfig[] = [
  {
    slug: "bang-rong-co-dinh",
    name: "Băng rộng cố định",
    shortDesc: "Kết nối ổn định - Tốc độ vượt trội",
    icon: Wifi,
    sourceIds: ["metronet", "vnpt-technology"],
    fakeProducts: bangRongFake,
  },
  {
    slug: "di-dong-vinaphone",
    name: "Di động Vinaphone",
    shortDesc: "Kết nối mọi lúc - Dẫn đầu trải nghiệm",
    icon: Smartphone,
    sourceIds: [],
    fakeProducts: diDongVinaphoneFake,
  },
  {
    slug: "hoa-don-thue",
    name: "Hóa đơn - Thuế",
    shortDesc: "Giải pháp hóa đơn điện tử toàn diện",
    icon: Receipt,
    sourceIds: [],
    fakeProducts: hoaDonThueFake,
  },
  {
    slug: "chu-ky-so",
    name: "Chữ ký số",
    shortDesc: "Ký số mọi lúc - An toàn tuyệt đối",
    icon: FileSignature,
    sourceIds: [],
    fakeProducts: chuKySoFake,
  },
  {
    slug: "cloud-idc",
    name: "Cloud & IDC",
    shortDesc: "Hạ tầng mạnh mẽ - Bảo mật tối ưu",
    icon: Cloud,
    sourceIds: ["cloud"],
    fakeProducts: [],
  },
  {
    slug: "chuyen-doi-so",
    name: "Chuyển đổi số",
    shortDesc: "Giải pháp toàn diện cho doanh nghiệp",
    icon: Workflow,
    sourceIds: ["vnptit", "onesme"],
    fakeProducts: [],
  },
];

export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return categories.find((c) => c.slug === slug);
}
