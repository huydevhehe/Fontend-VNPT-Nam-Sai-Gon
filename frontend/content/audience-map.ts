// Cấu hình dùng chung cho 6 trang "Giải pháp theo đối tượng" (app/giai-phap/[doiTuong]).
// Mỗi entry gộp: hero, danh sách dịch vụ (trỏ tới sản phẩm thật/fake trong content/category-*),
// 5 lợi ích và khối "khách hàng tiêu biểu". Xem 2-trang-lam-them/17-giai-phap-theo-doi-tuong.jpg.

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Cloud,
  FileText,
  GraduationCap,
  HeartPulse,
  Landmark,
  Network,
  PenTool,
  Receipt,
  ShieldCheck,
  Smartphone,
  Tv,
  Users,
  Wifi,
  Workflow,
  Zap,
  Clock,
  Award,
  Headset,
  CreditCard,
  TrendingUp,
  Lock,
  BadgeCheck,
  Handshake,
  ClipboardList,
  Globe,
  Layers,
} from "lucide-react";

export type ServiceItem = {
  icon: LucideIcon;
  title: string;
  desc: string;
  price?: string;
  href: string;
};

export type BenefitItem = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

export type AudienceConfig = {
  slug: string;
  label: string;
  heroDesc: string;
  heroBullets: string[];
  image: string;
  services: ServiceItem[];
  benefits: BenefitItem[];
  customerTitle: string;
  customerName: string;
  customerQuote: string;
  stats: { value: string; label: string }[];
};

export const AUDIENCE_CONFIG: AudienceConfig[] = [
  {
    slug: "ca-nhan",
    label: "Cá nhân",
    heroDesc: "Kết nối nhanh - Giải trí tiện lợi - Tiện ích cho cuộc sống hiện đại",
    heroBullets: [
      "Dễ đăng ký - Chi phí hợp lý",
      "Dịch vụ chính hãng VNPT - Hỗ trợ tận tâm",
      "Thanh toán linh hoạt - Nhiều ưu đãi khi đăng ký mới",
    ],
    image: "/images/doi-tuong/ca-nhan.jpg",
    services: [
      {
        icon: Wifi,
        title: "Internet Gia đình",
        desc: "Tốc độ cao, ổn định, wifi mượt cả nhà",
        price: "Chỉ từ 165.000đ/tháng",
        href: "/san-pham/bang-rong-co-dinh/internet-gia-dinh",
      },
      {
        icon: Tv,
        title: "MyTV",
        desc: "Truyền hình 180+ kênh, kho phim đa dạng",
        price: "Nhiều gói ưu đãi",
        href: "/san-pham/bang-rong-co-dinh/truyen-hinh-mytv",
      },
      {
        icon: Smartphone,
        title: "Di động trả trước",
        desc: "Data tốc độ cao, ưu đãi gọi nội mạng",
        price: "Chỉ từ 100.000đ/tháng",
        href: "/san-pham/di-dong-vinaphone/vinaphone-max100",
      },
      {
        icon: Receipt,
        title: "Hóa đơn điện tử cá nhân",
        desc: "Khởi tạo, tra cứu hóa đơn nhanh chóng",
        price: "Chỉ từ 300.000đ/năm",
        href: "/san-pham/hoa-don-thue/vnpt-invoice",
      },
      {
        icon: PenTool,
        title: "SmartCA cá nhân",
        desc: "Ký số từ xa, không cần USB Token",
        price: "Chỉ từ 550.000đ/năm",
        href: "/san-pham/chu-ky-so/smartca-ca-nhan",
      },
    ],
    benefits: [
      { icon: BadgeCheck, title: "Kết nối ổn định", desc: "Trải nghiệm mượt mà" },
      { icon: Users, title: "Nhiều ưu đãi", desc: "Dành riêng cho khách hàng" },
      { icon: Clock, title: "Dễ đăng ký", desc: "Đăng ký nhanh chóng" },
      { icon: Headset, title: "Hỗ trợ tận tâm", desc: "24/7 - Mọi lúc mọi nơi" },
      { icon: ShieldCheck, title: "An toàn bảo mật", desc: "Bảo vệ thông tin khách hàng" },
    ],
    customerTitle: "Khách hàng tiêu biểu",
    customerName: "Gia đình anh Tuấn - Quận 7",
    customerQuote:
      "“Internet nhanh, MyTV nhiều kênh, cả nhà ai cũng hài lòng!”",
    stats: [
      { value: "200.000+", label: "Khách hàng cá nhân" },
      { value: "4.8/5", label: "Đánh giá hài lòng" },
      { value: "30+", label: "Gói cước ưu đãi" },
    ],
  },
  {
    slug: "ho-kinh-doanh",
    label: "Hộ kinh doanh",
    heroDesc: "Quản lý dễ dàng - Kinh doanh hiệu quả - Tuân thủ đúng quy định",
    heroBullets: [
      "Chi phí hợp lý - Triển khai nhanh chóng",
      "Dễ xử lý hóa đơn, thanh toán, tiết kiệm chi phí",
      "Hỗ trợ tận tâm - Đồng hành lâu dài",
    ],
    image: "/images/doi-tuong/ho-kinh-doanh.jpg",
    services: [
      {
        icon: Wifi,
        title: "Combo Internet + MyTV",
        desc: "Internet tốc độ cao và truyền hình trọn gói",
        price: "Chỉ từ 205.000đ/tháng",
        href: "/san-pham/bang-rong-co-dinh",
      },
      {
        icon: Receipt,
        title: "Hóa đơn điện tử",
        desc: "Xuất hóa đơn nhanh, đúng quy định thuế",
        price: "Chỉ từ 300.000đ/năm",
        href: "/san-pham/hoa-don-thue/vnpt-invoice",
      },
      {
        icon: CreditCard,
        title: "SmartPOS",
        desc: "Thanh toán và phát hành hóa đơn ngay tại quầy",
        href: "/san-pham/hoa-don-thue/smartpos",
      },
      {
        icon: PenTool,
        title: "Chữ ký số (SmartCA)",
        desc: "Ký hợp đồng, kê khai thuế nhanh chóng",
        price: "Chỉ từ 550.000đ/năm",
        href: "/san-pham/chu-ky-so/smartca-ca-nhan",
      },
    ],
    benefits: [
      { icon: Zap, title: "Tiết kiệm chi phí", desc: "Ưu đãi dành riêng hộ kinh doanh" },
      { icon: Clock, title: "Triển khai nhanh chóng", desc: "Sẵn sàng sử dụng ngay" },
      { icon: ClipboardList, title: "Quản lý dễ dàng", desc: "Vận hành, báo cáo tập trung" },
      { icon: TrendingUp, title: "Thanh toán thuận tiện", desc: "Nhanh chóng, an toàn" },
      { icon: Headset, title: "Hỗ trợ chuyên biệt", desc: "Tận tâm - Nhanh chóng" },
    ],
    customerTitle: "Khách hàng tiêu biểu",
    customerName: "Quán cà phê Mộc - Thủ Đức",
    customerQuote:
      "“Sử dụng combo VNPT giúp quán quản lý bán hàng, xuất hóa đơn nhanh gọn.”",
    stats: [
      { value: "50.000+", label: "Hộ kinh doanh tin dùng" },
      { value: "99%", label: "Hài lòng dịch vụ" },
      { value: "24/7", label: "Hỗ trợ tận tâm" },
    ],
  },
  {
    slug: "doanh-nghiep",
    label: "Doanh nghiệp",
    heroDesc: "Giải pháp toàn diện - Bảo mật - Linh hoạt - Hiệu quả",
    heroBullets: [
      "Tối ưu vận hành - Tăng năng lực cạnh tranh",
      "Tiết kiệm chi phí đầu tư hạ tầng",
      "Đáp ứng mọi quy mô doanh nghiệp - Hỗ trợ 24/7",
    ],
    image: "/images/doi-tuong/doanh-nghiep.jpg",
    services: [
      {
        icon: Cloud,
        title: "Cloud & Data Center",
        desc: "Hạ tầng Cloud linh hoạt, bảo mật vượt trội",
        href: "/san-pham/cloud-idc",
      },
      {
        icon: PenTool,
        title: "Chữ ký số doanh nghiệp",
        desc: "Ký hóa đơn, hợp đồng, kê khai thuế - BHXH",
        price: "Chỉ từ 1.650.000đ/năm",
        href: "/san-pham/chu-ky-so/smartca-doanh-nghiep",
      },
      {
        icon: Receipt,
        title: "Hóa đơn điện tử",
        desc: "Quản lý hóa đơn tập trung, tiết kiệm chi phí",
        price: "Chỉ từ 300.000đ/năm",
        href: "/san-pham/hoa-don-thue/vnpt-invoice",
      },
      {
        icon: Workflow,
        title: "CRM / ERP",
        desc: "Quản trị doanh nghiệp toàn diện",
        href: "/san-pham/chuyen-doi-so/vnptit-vnpt-erp",
      },
      {
        icon: Network,
        title: "Kênh thuê riêng MetroNet",
        desc: "Đường truyền chuyên dụng, băng thông ổn định",
        href: "/san-pham/bang-rong-co-dinh/internet-doanh-nghiep",
      },
    ],
    benefits: [
      { icon: Zap, title: "Hạ tầng mạnh mẽ", desc: "Ổn định, bảo mật" },
      { icon: Layers, title: "Giải pháp linh hoạt", desc: "Dễ mở rộng theo quy mô" },
      { icon: TrendingUp, title: "Tiết kiệm chi phí", desc: "Tối ưu vận hành" },
      { icon: Headset, title: "Đội ngũ chuyên nghiệp", desc: "Hỗ trợ 24/7" },
      { icon: Handshake, title: "Đối tác tin cậy", desc: "Của các doanh nghiệp lớn" },
    ],
    customerTitle: "Khách hàng tiêu biểu",
    customerName: "Công ty CP Xây dựng An Phát",
    customerQuote:
      "“Triển khai Cloud, Hóa đơn điện tử, SmartCA cho toàn bộ chi nhánh, tiết kiệm 30% chi phí vận hành.”",
    stats: [
      { value: "5.000+", label: "Doanh nghiệp tin dùng" },
      { value: "30%+", label: "Tiết kiệm chi phí" },
      { value: "99.9%", label: "Uptime hạ tầng" },
    ],
  },
  {
    slug: "co-quan-nha-nuoc",
    label: "Cơ quan nhà nước",
    heroDesc: "Chính quyền số - Dịch vụ công hiện đại - Phục vụ người dân tốt hơn",
    heroBullets: [
      "Nâng cao hiệu quả quản lý",
      "Minh bạch - Kết nối - An toàn",
      "Đáp ứng Chuyển đổi số quốc gia",
    ],
    image: "/images/doi-tuong/co-quan-nha-nuoc.jpg",
    services: [
      {
        icon: Landmark,
        title: "eGov",
        desc: "Giải pháp Chính phủ điện tử toàn diện",
        href: "/san-pham/chuyen-doi-so/vnptit-vnpt-egov-2-0-giai-phap-chinh-phu-dien-tu",
      },
      {
        icon: Workflow,
        title: "Một cửa liên thông",
        desc: "Xử lý TTHC nhanh chóng, liên thông cấp",
        href: "/san-pham/chuyen-doi-so/vnptit-he-thong-mot-cua-lien-thong",
      },
      {
        icon: FileText,
        title: "Văn bản điều hành",
        desc: "Quản lý văn bản, hồ sơ số hóa",
        href: "/san-pham/chuyen-doi-so/vnptit-he-thong-van-ban-dieu-hanh",
      },
      {
        icon: Globe,
        title: "Cổng thông tin điện tử",
        desc: "Tương tác người dân thuận tiện",
        href: "/san-pham/chuyen-doi-so/vnptit-cong-thong-tin-dien-tu",
      },
      {
        icon: Activity,
        title: "IOC",
        desc: "Trung tâm điều hành thông minh - Giám sát, phân tích",
        href: "/san-pham/chuyen-doi-so",
      },
    ],
    benefits: [
      { icon: TrendingUp, title: "Hiệu quả quản lý", desc: "Nâng cao hiệu suất công việc" },
      { icon: ShieldCheck, title: "Minh bạch thông tin", desc: "Công khai - Rõ ràng" },
      { icon: Users, title: "Phục vụ người dân tốt hơn", desc: "Nhanh chóng - Thuận tiện" },
      { icon: Lock, title: "An toàn bảo mật", desc: "Bảo vệ dữ liệu quốc gia" },
      { icon: Network, title: "Liên kết đồng bộ", desc: "Kết nối liên thông các cấp" },
    ],
    customerTitle: "Cơ quan tiêu biểu",
    customerName: "UBND Phường Tân Hưng",
    customerQuote:
      "“Triển khai IOC giúp giải quyết thủ tục hành chính nhanh hơn 40%, tiết kiệm thời gian xử lý hồ sơ.”",
    stats: [
      { value: "100%", label: "Dịch vụ công trực tuyến" },
      { value: "40%", label: "Giảm thời gian xử lý" },
      { value: "24/7", label: "Vận hành ổn định" },
    ],
  },
  {
    slug: "truong-hoc",
    label: "Trường học",
    heroDesc: "Chuyển đổi số giáo dục - Quản lý thông minh - Dạy và học hiệu quả",
    heroBullets: [
      "Nền tảng giáo dục toàn diện",
      "Kết nối nhà trường - Giáo viên - Học sinh - Phụ huynh",
      "An toàn - Ổn định - Dễ sử dụng",
    ],
    image: "/images/doi-tuong/truong-hoc.jpg",
    services: [
      {
        icon: GraduationCap,
        title: "vnEdu",
        desc: "Quản lý nhà trường toàn diện - Kết nối phụ huynh",
        href: "/san-pham/chuyen-doi-so/onesme-giao-duc-so",
      },
      {
        icon: Wifi,
        title: "Hạ tầng Internet trường học",
        desc: "Internet tốc độ cao - Wifi phủ khắp trường",
        price: "Ổn định - Bảo mật",
        href: "/san-pham/bang-rong-co-dinh/internet-doanh-nghiep",
      },
      {
        icon: PenTool,
        title: "Chữ ký số cho giáo viên/Hiệu trưởng",
        desc: "Ký số học bạ, hồ sơ điện tử nhanh chóng - Bảo mật",
        price: "Chỉ từ 550.000đ/năm",
        href: "/san-pham/chu-ky-so/smartca-ca-nhan",
      },
    ],
    benefits: [
      { icon: ClipboardList, title: "Quản lý hiệu quả", desc: "Tối ưu vận hành nhà trường" },
      { icon: BadgeCheck, title: "Kết nối toàn diện", desc: "Nhà trường - Phụ huynh - Học sinh" },
      { icon: GraduationCap, title: "Dạy và học hiện đại", desc: "Ứng dụng công nghệ số" },
      { icon: ShieldCheck, title: "An toàn bảo mật", desc: "Bảo vệ dữ liệu học sinh" },
      { icon: Headset, title: "Hỗ trợ tận tâm", desc: "Đồng hành cùng nhà trường" },
    ],
    customerTitle: "Trường tiêu biểu",
    customerName: "Trường THPT Lê Thánh Tông",
    customerQuote:
      "“Sử dụng vnEdu giúp trường quản lý học sinh, kết nối phụ huynh hiệu quả hơn.”",
    stats: [
      { value: "500+", label: "Trường học sử dụng" },
      { value: "98%", label: "Giáo viên hài lòng" },
      { value: "24/7", label: "Hỗ trợ chuyên nghiệp" },
    ],
  },
  {
    slug: "benh-vien",
    label: "Bệnh viện",
    heroDesc: "Chuyển đổi số y tế - Quản lý thông minh - Nâng cao chất lượng",
    heroBullets: [
      "Quản lý bệnh viện toàn diện",
      "Dữ liệu an toàn - Vận hành hiệu quả",
      "Kết nối liên thông - Dịch vụ tốt hơn",
    ],
    image: "/images/doi-tuong/benh-vien.jpg",
    services: [
      {
        icon: HeartPulse,
        title: "HIS (Hệ thống thông tin y tế)",
        desc: "Quản lý khám chữa bệnh toàn diện",
        href: "/san-pham/chuyen-doi-so/vnptit-vnpt-his",
      },
      {
        icon: Receipt,
        title: "Hóa đơn điện tử",
        desc: "Quản lý hóa đơn viện phí - Tiết kiệm chi phí",
        price: "Chỉ từ 300.000đ/năm",
        href: "/san-pham/hoa-don-thue/vnpt-invoice",
      },
      {
        icon: PenTool,
        title: "Chữ ký số",
        desc: "Ký số hồ sơ bệnh án, đơn thuốc - An toàn",
        price: "Chỉ từ 1.650.000đ/năm",
        href: "/san-pham/chu-ky-so/smartca-doanh-nghiep",
      },
      {
        icon: Cloud,
        title: "Hạ tầng Cloud lưu trữ dữ liệu y tế",
        desc: "Lưu trữ an toàn - Dự phòng sẵn sàng",
        href: "/san-pham/cloud-idc",
      },
    ],
    benefits: [
      { icon: ClipboardList, title: "Quản lý toàn diện", desc: "Tối ưu quy trình vận hành" },
      { icon: Lock, title: "Dữ liệu an toàn", desc: "Bảo mật hồ sơ bệnh nhân" },
      { icon: Network, title: "Kết nối liên thông", desc: "BHYT - Cổng giám định" },
      { icon: Award, title: "Nâng cao chất lượng", desc: "Phục vụ người bệnh tốt hơn" },
      { icon: Headset, title: "Hỗ trợ 24/7", desc: "Đội ngũ chuyên nghiệp" },
    ],
    customerTitle: "Bệnh viện tiêu biểu",
    customerName: "Bệnh viện Đa khoa khu vực Thủ Đức",
    customerQuote:
      "“Triển khai HIS và VNPT Cloud giúp quản lý hồ sơ, lưu trữ dữ liệu 10TB an toàn.”",
    stats: [
      { value: "70%", label: "Giảm thời gian xử lý" },
      { value: "10TB+", label: "Dữ liệu lưu trữ" },
      { value: "100%", label: "Hài lòng dịch vụ" },
    ],
  },
];

export function getAudienceBySlug(slug: string): AudienceConfig | undefined {
  return AUDIENCE_CONFIG.find((a) => a.slug === slug);
}
