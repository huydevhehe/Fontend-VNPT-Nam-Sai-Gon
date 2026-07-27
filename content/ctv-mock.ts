// Dữ liệu mock cho Dashboard Cộng tác viên (CTV) — demo, không nối API thật.

export const CTV_PROFILE = {
  name: "Nguyễn Văn Minh",
  code: "CTV-HCM0123",
  role: "Cộng tác viên",
  avatar: "/images/vnpt_logo.png",
};

export const CTV_STATS = [
  { label: "Doanh số phát sinh", value: "125.400.000đ", change: "+18,6%", changeLabel: "so với tháng trước", up: true },
  { label: "Số hợp đồng", value: "48", change: "+20%", changeLabel: "so với tháng trước", up: true },
  { label: "Hoa hồng ước tính", value: "12.540.000đ", change: "+15,3%", changeLabel: "so với tháng trước", up: true },
  { label: "Hoa hồng đã thanh toán", value: "8.750.000đ", change: "+12,7%", changeLabel: "so với tháng trước", up: true },
];

export const REVENUE_CHART = [
  { date: "01/05", doanhSo: 3.1, hoaHong: 1.6 },
  { date: "05/05", doanhSo: 3.8, hoaHong: 1.8 },
  { date: "10/05", doanhSo: 3.4, hoaHong: 1.9 },
  { date: "15/05", doanhSo: 4.6, hoaHong: 2.2 },
  { date: "20/05", doanhSo: 4.2, hoaHong: 2.4 },
  { date: "25/05", doanhSo: 5.3, hoaHong: 2.6 },
  { date: "31/05", doanhSo: 5.9, hoaHong: 2.9 },
];

export const PRODUCT_RATIO = [
  { name: "Internet", value: 45, color: "#0068b3" },
  { name: "MyTV", value: 25, color: "#22c55e" },
  { name: "Vinaphone", value: 15, color: "#f59e0b" },
  { name: "Cloud & IDC", value: 10, color: "#06b6d4" },
  { name: "Khác", value: 5, color: "#94a3b8" },
];

export const TOP_SAN_PHAM = [
  { name: "Internet FiberVIP", count: 18, percent: 100 },
  { name: "MyTV", count: 14, percent: 78 },
  { name: "Vinaphone trả sau", count: 11, percent: 61 },
  { name: "Chữ ký số SmartCA", count: 8, percent: 44 },
  { name: "Cloud Server", count: 6, percent: 33 },
];

export type ContractStatus = "Đang xử lý" | "Đã duyệt" | "Từ chối";

export const HOP_DONG_MOI_NHAT: {
  id: string;
  product: string;
  value: string;
  date: string;
  status: ContractStatus;
}[] = [
  { id: "HD00397", product: "Internet FiberVIP", value: "1.200.000đ", date: "04/05/2025", status: "Đang xử lý" },
  { id: "HD00396", product: "MyTV Gia đình", value: "350.000đ", date: "03/05/2025", status: "Đã duyệt" },
  { id: "HD00395", product: "Internet VIP", value: "1.500.000đ", date: "02/05/2025", status: "Đã duyệt" },
  { id: "HD00394", product: "Vinaphone trả sau", value: "600.000đ", date: "30/04/2025", status: "Đang xử lý" },
  { id: "HD00393", product: "Cloud Server Basic", value: "2.350.000đ", date: "28/04/2025", status: "Đã duyệt" },
];

export const HOA_HONG_CHO_THANH_TOAN = {
  total: "3.790.000đ",
  months: [
    { month: "05/2025", value: "3.790.000đ" },
    { month: "04/2025", value: "2.450.000đ" },
    { month: "03/2025", value: "2.120.000đ" },
  ],
};

export const THONG_BAO = [
  { title: "Chương trình khuyến mãi nội bộ tháng 5", date: "01/05/2025" },
  { title: "Cập nhật chính sách hoa hồng tháng 5", date: "28/04/2025" },
  { title: "Hướng dẫn sử dụng hệ thống CTV", date: "20/04/2025" },
];

export const TAI_LIEU_HO_TRO = [
  { title: "Hướng dẫn CTV.pdf", size: "2.4 MB" },
  { title: "Banner quảng cáo 2025.zip", size: "18 MB" },
  { title: "Catalogue sản phẩm.pdf", size: "6.1 MB" },
  { title: "Mẫu hợp đồng.doc", size: "180 KB" },
];

export type KhachHang = {
  id: string;
  name: string;
  phone: string;
  product: string;
  status: "Đang chăm sóc" | "Đã chốt" | "Tiềm năng";
  date: string;
};

export const KHACH_HANG_LIST: KhachHang[] = [
  { id: "KH0231", name: "Trần Thị Bích", phone: "0901 234 567", product: "Internet FiberVIP", status: "Đã chốt", date: "04/05/2025" },
  { id: "KH0230", name: "Lê Văn Hoàng", phone: "0912 345 678", product: "MyTV Gia đình", status: "Đang chăm sóc", date: "03/05/2025" },
  { id: "KH0229", name: "Phạm Thị Ngọc", phone: "0987 654 321", product: "Vinaphone trả sau", status: "Tiềm năng", date: "02/05/2025" },
  { id: "KH0228", name: "Nguyễn Văn Tâm", phone: "0977 123 456", product: "Cloud Server", status: "Đã chốt", date: "30/04/2025" },
  { id: "KH0227", name: "Đỗ Thị Lan", phone: "0965 888 999", product: "Chữ ký số SmartCA", status: "Đang chăm sóc", date: "28/04/2025" },
  { id: "KH0226", name: "Vũ Minh Quân", phone: "0933 222 111", product: "Internet VIP", status: "Tiềm năng", date: "26/04/2025" },
];

export type DonHang = {
  id: string;
  customer: string;
  product: string;
  amount: string;
  date: string;
  status: "Chờ xử lý" | "Hoàn tất" | "Đã hủy";
};

export const DON_HANG_LIST: DonHang[] = [
  { id: "DH1042", customer: "Trần Thị Bích", product: "Internet FiberVIP", amount: "1.200.000đ", date: "04/05/2025", status: "Hoàn tất" },
  { id: "DH1041", customer: "Lê Văn Hoàng", product: "MyTV Gia đình", amount: "350.000đ", date: "03/05/2025", status: "Chờ xử lý" },
  { id: "DH1040", customer: "Phạm Thị Ngọc", product: "Vinaphone trả sau", amount: "600.000đ", date: "02/05/2025", status: "Chờ xử lý" },
  { id: "DH1039", customer: "Nguyễn Văn Tâm", product: "Cloud Server", amount: "2.350.000đ", date: "30/04/2025", status: "Hoàn tất" },
  { id: "DH1038", customer: "Đỗ Thị Lan", product: "Chữ ký số SmartCA", amount: "550.000đ", date: "28/04/2025", status: "Đã hủy" },
];

export const DOANH_SO_THEO_THANG = [
  { month: "T12/2024", value: 78.2 },
  { month: "T1/2025", value: 85.6 },
  { month: "T2/2025", value: 92.4 },
  { month: "T3/2025", value: 88.9 },
  { month: "T4/2025", value: 105.7 },
  { month: "T5/2025", value: 125.4 },
];

export type HoaHongRecord = {
  month: string;
  revenue: string;
  rate: string;
  commission: string;
  status: "Đã thanh toán" | "Chờ thanh toán";
};

export const HOA_HONG_LIST: HoaHongRecord[] = [
  { month: "05/2025", revenue: "125.400.000đ", rate: "10%", commission: "12.540.000đ", status: "Chờ thanh toán" },
  { month: "04/2025", revenue: "105.700.000đ", rate: "10%", commission: "10.570.000đ", status: "Đã thanh toán" },
  { month: "03/2025", revenue: "88.900.000đ", rate: "10%", commission: "8.890.000đ", status: "Đã thanh toán" },
  { month: "02/2025", revenue: "92.400.000đ", rate: "10%", commission: "9.240.000đ", status: "Đã thanh toán" },
];

export type ThanhToanRecord = {
  id: string;
  date: string;
  amount: string;
  method: string;
  status: "Thành công" | "Đang xử lý";
};

export const THANH_TOAN_LIST: ThanhToanRecord[] = [
  { id: "TT2045", date: "05/04/2025", amount: "10.570.000đ", method: "Chuyển khoản - Vietcombank ***456", status: "Thành công" },
  { id: "TT1988", date: "05/03/2025", amount: "8.890.000đ", method: "Chuyển khoản - Vietcombank ***456", status: "Thành công" },
  { id: "TT1932", date: "05/02/2025", amount: "9.240.000đ", method: "Chuyển khoản - Vietcombank ***456", status: "Thành công" },
];

export const SAN_PHAM_GIOI_THIEU = [
  { name: "Internet FiberVIP", commission: "8% giá trị hợp đồng", desc: "Cáp quang tốc độ cao, ổn định." },
  { name: "MyTV", commission: "5% giá trị hợp đồng", desc: "Truyền hình 180+ kênh, kho phim đa dạng." },
  { name: "Vinaphone trả sau", commission: "10% cước tháng đầu", desc: "Data lớn, gọi thoại thoải mái." },
  { name: "Chữ ký số SmartCA", commission: "15% giá trị hợp đồng", desc: "Ký số mọi lúc, mọi nơi." },
  { name: "Cloud Server", commission: "12% giá trị hợp đồng", desc: "Hạ tầng máy chủ đám mây linh hoạt." },
];
