import type { CustomerGroup, DocumentType, LeadRecord } from "../types/crm.types";

export const CUSTOMER_GROUP_LABEL: Record<CustomerGroup, string> = {
  "Tự phát triển": "KH PTM",
  "Tập hiện hữu": "KH địa bàn",
  "PTM địa bàn": "PTM địa bàn",
};

export const DOCUMENT_TYPES: readonly DocumentType[] = ["GPKD", "CCCD", "KHAC"];

export const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  GPKD: "GPKD/QĐ thành lập",
  CCCD: "CCCD người đại diện PL",
  KHAC: "Khác (GUQ, Giấy giới thiệu…)",
};

export const LEAD_GROUP_LABEL: Record<LeadRecord["group"], string> = {
  "Lead KH mới": "Lead KH mới",
  "Lead bán chéo DV": "Lead bán chéo DV",
  "Lead gia hạn": "Lead gia hạn",
};

export const LEAD_CHANNELS = ["Online", "CTV giới thiệu", "Khách hàng hiện hữu", "Đối tác", "Chiến dịch"] as const;

export const WARD_UNITS: readonly { unit: string; positions: readonly string[] }[] = [
  { unit: "Lãnh đạo Phường", positions: ["Bí thư", "Chủ tịch", "Phó chủ tịch"] },
  { unit: "Phòng Kinh tế hạ tầng", positions: ["Trưởng phòng", "Phó phòng"] },
  { unit: "Phòng Nội vụ", positions: ["Trưởng phòng", "Phó phòng"] },
  { unit: "Phòng Văn hóa", positions: ["Trưởng phòng", "Phó phòng"] },
];
