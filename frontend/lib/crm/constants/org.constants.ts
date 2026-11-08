import type { CustomerGroup, LeadRecord } from "../types/crm.types";

export const CUSTOMER_GROUP_LABEL: Record<CustomerGroup, string> = {
  "Tự phát triển": "KH PTM (phát triển mới)",
  "Tập hiện hữu": "KHDN chăm (địa bàn giao)",
};

export const LEAD_GROUP_LABEL: Record<LeadRecord["group"], string> = {
  "Khách hàng mới": "Lead KH mới",
  "Khách hiện hữu mua thêm": "Lead bán chéo",
  "Gia hạn dịch vụ": "Lead gia hạn",
};

export const LEAD_CHANNELS = ["Online", "CTV giới thiệu", "Khách hàng hiện hữu", "Đối tác", "Chiến dịch"] as const;

export const WARD_UNITS: readonly { unit: string; positions: readonly string[] }[] = [
  { unit: "Lãnh đạo Phường", positions: ["Bí thư", "Chủ tịch", "Phó chủ tịch"] },
  { unit: "Phòng Kinh tế hạ tầng", positions: ["Trưởng phòng", "Phó phòng"] },
  { unit: "Phòng Nội vụ", positions: ["Trưởng phòng", "Phó phòng"] },
  { unit: "Phòng Văn hóa", positions: ["Trưởng phòng", "Phó phòng"] },
];
