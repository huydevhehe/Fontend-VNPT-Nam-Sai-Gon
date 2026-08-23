// Danh mục công cụ / plugin cài đặt, tham chiếu từ trang tải về chính thức
// https://smartca.vnpt.vn/download — file tải vẫn trỏ về máy chủ VNPT để luôn
// lấy đúng bản mới nhất, không host lại trên site này.

export type ToolFile = {
  label: string;
  /** Đường dẫn tương đối trên smartca.vnpt.vn */
  path: string;
  /** Định dạng file, hiển thị làm nhãn. */
  kind: "exe" | "pkg" | "pdf" | "docx" | "rar" | "pptx";
};

export type ToolGroup = {
  slug: string;
  title: string;
  desc: string;
  files: ToolFile[];
};

export const SMARTCA_BASE_URL = "https://smartca.vnpt.vn";

export const TOOL_GROUPS: ToolGroup[] = [
  {
    slug: "plugin-ky-so",
    title: "Bộ cài Plugin ký số",
    desc: "Phần mềm cần cài trên máy tính để ký số trên trình duyệt và ứng dụng Office.",
    files: [
      {
        label: "Bộ cài VNPT CA-Plugin (Windows, v1.0.5.0)",
        path: "/download/VNPT-CA Plugin_Office_Setup.exe",
        kind: "exe",
      },
      {
        label: "Bộ cài VNPT CA-Plugin (macOS, v1.0.2.4)",
        path: "/download/VNPT-CA_Plugin_macOS.pkg",
        kind: "pkg",
      },
      {
        label: "Bộ cài plugin CAMS",
        path: "/download/VNPT_CAMS_Plugin_Setup.exe",
        kind: "exe",
      },
    ],
  },
  {
    slug: "driver-token",
    title: "Driver USB Token",
    desc: "Driver thiết bị USB Token cho từng loại token và hệ điều hành.",
    files: [
      {
        label: "Driver eToken - Windows 64bit",
        path: "/download/documents_10052019083946.exe",
        kind: "exe",
      },
      {
        label: "Driver eToken - Windows 32bit",
        path: "/download/documents_10052019084003.exe",
        kind: "exe",
      },
      { label: "Driver Token v8", path: "/download/documents_22082022143217.exe", kind: "exe" },
      {
        label: "Driver CykenToken - Windows",
        path: "/download/documents_10052019084218.exe",
        kind: "exe",
      },
      {
        label: "Pkcs11 Admin v0.3.0",
        path: "/download/documents_31072019145705.rar",
        kind: "rar",
      },
    ],
  },
  {
    slug: "huong-dan",
    title: "Tài liệu hướng dẫn",
    desc: "Hướng dẫn cài đặt, mở khoá token và kiểm tra nguồn gốc file tải về.",
    files: [
      {
        label: "Hướng dẫn cài đặt Driver Token",
        path: "/download/documents_20082021111017.docx",
        kind: "docx",
      },
      {
        label: "Hướng dẫn mở khoá USB Token trên vnpt-ca.vn",
        path: "/download/documents_10052019085248.pdf",
        kind: "pdf",
      },
      {
        label: "Hướng dẫn mở khoá USB Token trên Token AN",
        path: "/download/documents_10052019085648.pdf",
        kind: "pdf",
      },
      {
        label: "Hướng dẫn kiểm tra nguồn gốc file tải về",
        path: "/download/documents_25052021215230.docx",
        kind: "docx",
      },
    ],
  },
  {
    slug: "tich-hop",
    title: "Tài liệu tích hợp",
    desc: "Dành cho đơn vị cần tích hợp ký số vào hệ thống sẵn có.",
    files: [
      {
        label: "Giới thiệu giải pháp tích hợp ký số VNPT-CA",
        path: "/download/Giap_phap_tich_hop_ky_so_Vnpt-CA.pptx",
        kind: "pptx",
      },
      {
        label: "Giới thiệu giải pháp VNPT-CA SignServer",
        path: "/download/Giai_phap_tich_hop_Vnpt-CA_SignServer_Final.pdf",
        kind: "pdf",
      },
      {
        label: "Giới thiệu giải pháp VNPT-CA Plugin",
        path: "/download/Giai_phap_tich_hop_Vnpt-CA_Plugin_Final.pdf",
        kind: "pdf",
      },
    ],
  },
  {
    slug: "quy-che",
    title: "Quy chế chứng thực (CPS)",
    desc: "Văn bản quy chế chứng thực chữ ký số công cộng của VNPT.",
    files: [
      { label: "VNPT-CA CPS", path: "/download/documents_29112019162024.pdf", kind: "pdf" },
      { label: "VNPT SmartCA RS CPS", path: "/download/documents_02062022140456.pdf", kind: "pdf" },
    ],
  },
];

// Đã xác minh từng path thật trên smartca.vnpt.vn (HTTP 200, nội dung riêng, không phải
// trang 404 dùng chung) — không dùng đường dẫn tự đoán. 4 thao tác còn lại trên trang gốc
// (kích hoạt SmartCA, gửi yêu cầu/mở khoá Token, kiểm tra & tải chứng thư số) chỉ mở modal
// yêu cầu đăng nhập (`javascript:void(0);`), không có URL riêng để trỏ tới — nên không đưa
// vào đây, thay bằng "Đăng nhập quản lý chứng thư số" dẫn thẳng cổng đăng nhập.
export const ONLINE_TOOLS = [
  { label: "Đăng nhập quản lý chứng thư số", path: "/sig/signmultiple" },
  { label: "Kích hoạt chứng thư số bằng Plugin", path: "/kich-hoat-chung-thu-so" },
  { label: "Kích hoạt chứng thư số bằng CSR", path: "/kich-hoat-chung-thu-so-csr" },
  { label: "Cấp bù chứng thư số", path: "/cap-bu" },
  { label: "Gia hạn chứng thư số", path: "/gia-han-chung-thu-so" },
  { label: "Thay đổi thông tin chứng thư số", path: "/thay-doi-thong-tin-chung-thu" },
];
