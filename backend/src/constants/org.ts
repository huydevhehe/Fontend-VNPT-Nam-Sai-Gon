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

export const LEAD_GROUPS = [
  "Lead KH mới",
  "Lead gia hạn",
  "Lead bán chéo DV",
] as const;

export const LEAD_GROUP_RENAMES: Record<string, string> = {
  "Khách hàng mới": "Lead KH mới",
  "Gia hạn dịch vụ": "Lead gia hạn",
  "Khách hiện hữu mua thêm": "Lead bán chéo DV",
};

export const CUSTOMER_GROUPS = ["Tự phát triển", "Tập hiện hữu"] as const;

export const WARD_UNITS: readonly { unit: string; positions: readonly string[] }[] = [
  { unit: "Lãnh đạo Phường", positions: ["Bí thư", "Chủ tịch", "Phó chủ tịch"] },
  { unit: "Phòng Kinh tế hạ tầng", positions: ["Trưởng phòng", "Phó phòng"] },
  { unit: "Phòng Nội vụ", positions: ["Trưởng phòng", "Phó phòng"] },
  { unit: "Phòng Văn hóa", positions: ["Trưởng phòng", "Phó phòng"] },
];

export const CTV_COMMISSION_RATE = 0.1;

export const UNASSIGNED_STAFF = "Chưa phân công";

export const RANDOM_STAFF_TOKEN = "__RANDOM__";

export const ACTIVE_AM_ROLES = [ROLES.AM, ROLES.AM_BAN_CHAM] as const;

export const STAFF_TYPES = ["Chính thức", "Cộng tác viên"] as const;
export type StaffType = (typeof STAFF_TYPES)[number];

export const STAFF_STATUSES = ["Đang hoạt động", "Đình chỉ", "Ngừng hoạt động"] as const;
export type StaffStatus = (typeof STAFF_STATUSES)[number];

export const INACTIVE_USER_STATUS = "Ngừng hoạt động";


