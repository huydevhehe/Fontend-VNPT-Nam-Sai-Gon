// Dữ liệu khuyến mãi — chưa có nguồn cào thật, toàn bộ viết tay (isFake: true) theo
// đúng nội dung trong ảnh design 2-trang-lam-them/10-khuyen-mai-danh-sach.jpg và
// 11-khuyen-mai-chi-tiet.jpg. Dùng chung cho /khuyen-mai (danh sách) và
// /khuyen-mai/[slug] (chi tiết) để 2 trang không lệch dữ liệu nhau.

export type Promotion = {
  slug: string;
  badge: string;
  categorySlug: string;
  title: string;
  subtitle: string;
  discountLabel: string;
  note: string;
  image: string;
  validFrom: string;
  validUntil: string;
  benefits: string[];
  conditions: string[];
  highlight: { label: string; value: string }[];
  isFake: true;
};

export const promotions: Promotion[] = [
  {
    slug: "combo-internet-mytv",
    badge: "INTERNET & TRUYỀN HÌNH",
    categorySlug: "bang-rong-co-dinh",
    title: "Combo Internet + MyTV",
    subtitle: "Lướt net tốc độ - Giải trí đỉnh cao",
    discountLabel: "Giảm đến 30%",
    note: "Giảm đến 30% cước hàng tháng",
    image: "/images/khuyen-mai/router.jpg",
    validFrom: "01/06/2025",
    validUntil: "30/06/2025",
    benefits: [
      "Giảm ngay 30% cước hàng tháng",
      "Miễn phí hòa mạng & lắp đặt (trị giá 300.000đ)",
      "Tặng thêm 01 tháng cước MyTV gói K+ (nếu có)",
      "Tặng modem WiFi 6 thế hệ mới – tốc độ mạnh mẽ",
      "Cam kết tốc độ quốc tế lên đến 100Mbps",
      "Trang bị đầu thu 4K, điều khiển giọng nói thông minh",
    ],
    conditions: [
      "Áp dụng cho khách hàng cá nhân tại khu vực VNPT Nam Sài Gòn.",
      "Áp dụng khi đăng ký mới từ 01/06/2025 đến 30/06/2025.",
      "Thanh toán cước trước tối thiểu 06 tháng.",
      "Không áp dụng đồng thời với các chương trình khuyến mãi khác.",
      "Ưu đãi có thể thay đổi theo chính sách của VNPT.",
    ],
    highlight: [
      { label: "Tốc độ", value: "100 Mbps" },
      { label: "Giá ưu đãi", value: "165.000đ/tháng" },
    ],
    isFake: true,
  },
  {
    slug: "vinaphone-5g-sieu-toc",
    badge: "VINAPHONE",
    categorySlug: "di-dong-vinaphone",
    title: "VinaPhone 5G – Siêu tốc",
    subtitle: "Trải nghiệm tốc độ vượt trội cùng mạng 5G",
    discountLabel: "Giảm đến 50%",
    note: "Giảm đến 50% khi đăng ký mới",
    image: "/images/khuyen-mai/phone-5g.jpg",
    validFrom: "01/05/2025",
    validUntil: "31/05/2025",
    benefits: [
      "Giảm 50% cước tháng đầu khi đăng ký gói 5G mới",
      "Miễn phí chuyển đổi SIM 5G",
      "Tốc độ data cao gấp nhiều lần 4G",
      "Ưu tiên băng thông tại khu vực phủ sóng 5G",
    ],
    conditions: [
      "Áp dụng cho thuê bao đăng ký gói cước 5G mới.",
      "Áp dụng khi đăng ký từ 01/05/2025 đến 31/05/2025.",
      "Không áp dụng đồng thời với ưu đãi eSIM.",
    ],
    highlight: [{ label: "Giá ưu đãi", value: "Giảm 50% tháng đầu" }],
    isFake: true,
  },
  {
    slug: "chu-ky-so-smartca",
    badge: "SMARTCA",
    categorySlug: "chu-ky-so",
    title: "Chữ ký số SmartCA",
    subtitle: "Ký số mọi lúc, mọi nơi – không cần USB Token",
    discountLabel: "Giảm đến 20%",
    note: "Giảm đến 20% phí dịch vụ",
    image: "/images/khuyen-mai/usb-smartca.jpg",
    validFrom: "01/06/2025",
    validUntil: "30/06/2025",
    benefits: [
      "Giảm 20% phí dịch vụ SmartCA cá nhân & doanh nghiệp",
      "Miễn phí kích hoạt tài khoản",
      "Hỗ trợ xác thực định danh eKYC nhanh chóng",
      "Ký hóa đơn, hợp đồng điện tử ngay trên điện thoại",
    ],
    conditions: [
      "Áp dụng cho khách hàng đăng ký mới SmartCA.",
      "Áp dụng khi đăng ký từ 01/06/2025 đến 30/06/2025.",
      "Không áp dụng cho khách hàng gia hạn.",
    ],
    highlight: [{ label: "Ưu đãi", value: "Giảm 20% phí dịch vụ" }],
    isFake: true,
  },
  {
    slug: "cloud-server",
    badge: "CLOUD & IDC",
    categorySlug: "cloud-idc",
    title: "VNPT Cloud Server",
    subtitle: "Hạ tầng máy chủ đám mây linh hoạt, hiệu năng cao",
    discountLabel: "Giảm 25%",
    note: "Giảm 25% phí thuê Cloud Server khi đăng ký 6 tháng",
    image: "/images/khuyen-mai/server-rack.jpg",
    validFrom: "01/06/2025",
    validUntil: "15/06/2025",
    benefits: [
      "Giảm 25% phí thuê Cloud Server gói Standard trở lên",
      "Miễn phí tư vấn kiến trúc triển khai",
      "Hỗ trợ kỹ thuật 24/7 trong suốt thời gian sử dụng",
      "Cam kết uptime 99,99%",
    ],
    conditions: [
      "Áp dụng cho khách hàng doanh nghiệp đăng ký mới.",
      "Áp dụng khi thanh toán trước tối thiểu 6 tháng.",
      "Áp dụng đến hết 15/06/2025.",
    ],
    highlight: [{ label: "Ưu đãi", value: "Giảm 25% phí thuê 6 tháng" }],
    isFake: true,
  },
  {
    slug: "hoa-don-dien-tu-vnpt",
    badge: "HÓA ĐƠN ĐIỆN TỬ",
    categorySlug: "hoa-don-thue",
    title: "Hóa đơn điện tử VNPT Invoice",
    subtitle: "Khởi tạo, phát hành hóa đơn nhanh chóng, đúng chuẩn",
    discountLabel: "Giảm 20%",
    note: "Giảm 20% phí khởi tạo cho khách hàng mới",
    image: "/images/khuyen-mai/invoice-calc.jpg",
    validFrom: "01/06/2025",
    validUntil: "30/06/2025",
    benefits: [
      "Giảm 20% phí khởi tạo gói dịch vụ VNPT Invoice",
      "Miễn phí đào tạo sử dụng cho kế toán doanh nghiệp",
      "Kết nối trực tiếp với Tổng cục Thuế",
      "Hỗ trợ chuyển đổi dữ liệu từ đơn vị cũ",
    ],
    conditions: [
      "Áp dụng cho khách hàng đăng ký mới VNPT Invoice.",
      "Áp dụng khi đăng ký từ 01/06/2025 đến 30/06/2025.",
    ],
    highlight: [{ label: "Ưu đãi", value: "Giảm 20% phí khởi tạo" }],
    isFake: true,
  },
  {
    slug: "vnpt-camera",
    badge: "CAMERA",
    categorySlug: "bang-rong-co-dinh",
    title: "VNPT Camera",
    subtitle: "Giải pháp camera an ninh thông minh",
    discountLabel: "Giảm 15%",
    note: "Giảm 15% khi lắp đặt mới từ 2 camera trở lên",
    image: "/images/khuyen-mai/camera.jpg",
    validFrom: "01/05/2025",
    validUntil: "31/05/2025",
    benefits: [
      "Giảm 15% chi phí thiết bị khi lắp từ 2 camera",
      "Miễn phí công lắp đặt trong khu vực nội thành",
      "Xem trực tiếp mọi lúc mọi nơi qua ứng dụng",
      "Lưu trữ dữ liệu an toàn trên Cloud",
    ],
    conditions: [
      "Áp dụng cho khách hàng cá nhân và hộ kinh doanh.",
      "Áp dụng khi lắp đặt mới từ 01/05/2025 đến 31/05/2025.",
    ],
    highlight: [{ label: "Ưu đãi", value: "Giảm 15% từ 2 camera" }],
    isFake: true,
  },
  {
    slug: "internet-doanh-nghiep",
    badge: "INTERNET",
    categorySlug: "bang-rong-co-dinh",
    title: "Internet Doanh nghiệp",
    subtitle: "Đường truyền chuyên dụng, cam kết băng thông",
    discountLabel: "Giảm 20%",
    note: "Giảm 20% cước tháng đầu khi đăng ký mới",
    image: "/images/khuyen-mai/network-switch.jpg",
    validFrom: "01/06/2025",
    validUntil: "30/06/2025",
    benefits: [
      "Giảm 20% cước tháng đầu tiên",
      "Miễn phí khảo sát và lắp đặt",
      "Cam kết băng thông, hỗ trợ kỹ thuật ưu tiên",
    ],
    conditions: [
      "Áp dụng cho khách hàng doanh nghiệp đăng ký mới.",
      "Áp dụng khi đăng ký từ 01/06/2025 đến 30/06/2025.",
    ],
    highlight: [{ label: "Ưu đãi", value: "Giảm 20% tháng đầu" }],
    isFake: true,
  },
  {
    slug: "mytv-giai-tri-dinh-cao",
    badge: "MYTV",
    categorySlug: "bang-rong-co-dinh",
    title: "MyTV – Giải trí đỉnh cao",
    subtitle: "Hơn 180 kênh, kho phim đa dạng",
    discountLabel: "Giảm đến 30%",
    note: "Giảm 30% cước gói K+ khi đăng ký 12 tháng",
    image: "/images/khuyen-mai/tv-remote.jpg",
    validFrom: "01/05/2025",
    validUntil: "31/05/2025",
    benefits: [
      "Giảm 30% cước gói K+ khi đăng ký gói 12 tháng",
      "Tặng đầu thu 4K khi đăng ký mới",
      "Kho phim, chương trình bản quyền đa dạng",
    ],
    conditions: [
      "Áp dụng cho khách hàng đăng ký gói cước 12 tháng.",
      "Áp dụng khi đăng ký từ 01/05/2025 đến 31/05/2025.",
    ],
    highlight: [{ label: "Ưu đãi", value: "Giảm 30% gói K+" }],
    isFake: true,
  },
  {
    slug: "goi-cuoc-tra-sau-vinaphone",
    badge: "VINAPHONE",
    categorySlug: "di-dong-vinaphone",
    title: "Gói cước trả sau VinaPhone",
    subtitle: "Data lớn, gọi thoại thoải mái",
    discountLabel: "Giảm 15%",
    note: "Giảm 15% cước gói tháng đầu",
    image: "/images/khuyen-mai/phone-5g.jpg",
    validFrom: "01/05/2025",
    validUntil: "31/05/2025",
    benefits: [
      "Giảm 15% cước tháng đầu khi đăng ký gói trả sau",
      "Miễn phí chuyển đổi từ SIM trả trước",
      "Ưu đãi tích điểm Vinaphone Plus",
    ],
    conditions: [
      "Áp dụng cho thuê bao đăng ký gói cước trả sau mới.",
      "Áp dụng khi đăng ký từ 01/05/2025 đến 31/05/2025.",
    ],
    highlight: [{ label: "Ưu đãi", value: "Giảm 15% tháng đầu" }],
    isFake: true,
  },
  {
    slug: "smartca-doanh-nghiep",
    badge: "SMARTCA",
    categorySlug: "chu-ky-so",
    title: "SmartCA Doanh nghiệp",
    subtitle: "Ký số hóa đơn, hợp đồng, hồ sơ thuế",
    discountLabel: "Giảm 20%",
    note: "Giảm 20% phí dịch vụ khi đăng ký mới",
    image: "/images/khuyen-mai/usb-smartca.jpg",
    validFrom: "01/06/2025",
    validUntil: "30/06/2025",
    benefits: [
      "Giảm 20% phí dịch vụ SmartCA Doanh nghiệp",
      "Hỗ trợ tích hợp với hệ thống hóa đơn điện tử",
      "Miễn phí hướng dẫn sử dụng và kỹ thuật",
    ],
    conditions: [
      "Áp dụng cho doanh nghiệp đăng ký mới SmartCA.",
      "Áp dụng khi đăng ký từ 01/06/2025 đến 30/06/2025.",
    ],
    highlight: [{ label: "Ưu đãi", value: "Giảm 20% phí dịch vụ" }],
    isFake: true,
  },
  {
    slug: "colocation-rack",
    badge: "DATA CENTER",
    categorySlug: "cloud-idc",
    title: "Colocation Rack",
    subtitle: "Đặt máy chủ tại Data Center chuẩn quốc tế",
    discountLabel: "Giảm 10%",
    note: "Giảm 10% phí thuê chỗ đặt Rack khi đăng ký 6 tháng",
    image: "/images/khuyen-mai/server-rack.jpg",
    validFrom: "01/06/2025",
    validUntil: "30/06/2025",
    benefits: [
      "Giảm 10% phí thuê chỗ đặt Rack khi đăng ký 6 tháng",
      "Hạ tầng đạt chuẩn Tier III, giám sát 24/7",
      "Kết nối băng thông quốc tế ổn định",
    ],
    conditions: [
      "Áp dụng cho khách hàng doanh nghiệp đăng ký mới.",
      "Áp dụng khi thanh toán trước tối thiểu 6 tháng.",
    ],
    highlight: [{ label: "Ưu đãi", value: "Giảm 10% phí thuê 6 tháng" }],
    isFake: true,
  },
];

export function getAllPromotions(): Promotion[] {
  return promotions;
}

export function getPromotionBySlug(slug: string): Promotion | undefined {
  return promotions.find((p) => p.slug === slug);
}
