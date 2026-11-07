export const ROLES = {
  ADMIN: "Admin",
  AM: "AM",
  AM_BAN_CHAM: "AM Bán chăm",
  CTV: "CTV",
} as const;

export const USER_STATUS = {
  ACTIVE: "Đang hoạt động",
  PENDING: "Chờ duyệt",
  REJECTED: "Từ chối",
} as const;

export const LEAD_CHANNELS = ["Online", "CTV giới thiệu", "Khách hàng hiện hữu", "Đối tác", "Chiến dịch"] as const;

export const LEAD_GROUPS = ["Khách hàng mới", "Khách hiện hữu mua thêm", "Gia hạn dịch vụ"] as const;

export const CUSTOMER_GROUPS = ["Tự phát triển", "Tập hiện hữu"] as const;

export const WARD_UNITS: readonly { unit: string; positions: readonly string[] }[] = [
  { unit: "Lãnh đạo Phường", positions: ["Bí thư", "Chủ tịch", "Phó chủ tịch"] },
  { unit: "Phòng Kinh tế hạ tầng", positions: ["Trưởng phòng", "Phó phòng"] },
  { unit: "Phòng Nội vụ", positions: ["Trưởng phòng", "Phó phòng"] },
  { unit: "Phòng Văn hóa", positions: ["Trưởng phòng", "Phó phòng"] },
];

export const CTV_COMMISSION_RATE = 0.1;

export const UNASSIGNED_STAFF = "Chưa phân công";
