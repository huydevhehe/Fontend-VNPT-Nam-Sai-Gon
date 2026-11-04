export type CustomerType = "Doanh nghiệp" | "Hộ kinh doanh" | "Cá nhân";
export type CustomerGroup = "Tự phát triển" | "Tập hiện hữu";
export type StaffRole = "Admin" | "AM" | "AM Bán chăm" | "Người xem";

export type DebtStatus = "Đã gạch nợ" | "Nợ cước";
export type RenewalStatus = "Chưa xử lý" | "Khách hẹn thanh toán" | "Hoàn thành" | "Thất bại";
export type RenewalFailureReason = "Tạm ngưng" | "Thanh lý";

export type DeploymentStatus = "Chưa triển khai" | "Đang triển khai" | "Hoàn tất" | "Tạm dừng" | "Hủy";
export type PaymentStatus = "Chưa thanh toán" | "Đã thanh toán";
export type DocumentStatus = "Soạn thảo" | "Khách trình ký" | "Hoàn thiện bàn giao";

export type LeadStatus = "Mới tiếp nhận" | "Đã liên hệ" | "Đang tư vấn" | "Chốt thành công" | "Thất bại";
export type TaskStatus = "Mới" | "Đang làm" | "Hoàn tất" | "Quá hạn";
export type TaskPriority = "Thấp" | "Vừa" | "Cao";

// 1. Debt (Khớp Sheet 1: THU NGAY , LŨY KẾ)
export interface DebtRecord {
  id: string;
  staffName: string; // TÊN NHÂN VIÊN CHĂM
  serviceGroup: string; // NHOM_DV
  paymentCode: string; // MA_THANH TOÁN
  subscriberCode: string; // MA_THUÊ BAO
  customerName: string; // TEN_THUÊ BAO
  installationAddress: string; // DIACHI_LD
  immediateDebt: number; // CONNO_THUNGAY
  cumulativeDebt: number; // CONNO_LUYKE
  collectedAmount: number;
  status: DebtStatus;
  documentRef?: string;
  month: string;
}

// 2. Renewal (Khớp Sheet 2: GIA HẠN)
export interface RenewalRecord {
  id: string;
  transactionCode: string; // MÃ GIAO DỊCH
  subscriberCode: string; // MA_THUÊ BAO
  customerName: string; // TEN_THUÊ BAO
  paymentCode: string; // MA_THANH TOÁN
  installationAddress: string; // DIACHI_LD
  staffName: string; // TÊN NHÂN VIÊN CHĂM
  termAmount: number;
  durationMonths: number;
  cohort: "THÁNG T" | "THÁNG T-1";
  status: RenewalStatus;
  failureReason?: RenewalFailureReason;
}

// 3. Customer
export interface CustomerRecord {
  id: string;
  name: string;
  identityCode: string; // MST (10/14) hoặc CCCD (12)
  type: CustomerType;
  group: CustomerGroup;
  phone: string;
  address: string;
  services: string[];
  nearestExpiration: string;
  amStaff: string;
  amCaringStaff: string;
}

// 4. Service & Alert
export interface ServiceRecord {
  id: string;
  customerName: string;
  serviceName: string;
  serviceCode: string;
  startDate: string;
  expirationDate: string;
  daysRemaining: number;
  staffName: string;
  isExpired: boolean;
}

// 5. Lead
export interface LeadRecord {
  id: string;
  customerName: string;
  phone: string;
  group: "Khách hàng mới" | "Khách hiện hữu mua thêm" | "Gia hạn dịch vụ";
  channel: "Online" | "Đối tác" | "Khách hàng hiện hữu" | "Chiến dịch";
  staffName: string;
  status: LeadStatus;
  expectedValue: number;
  demandDescription: string;
}

// 6. Contract
export interface ContractRecord {
  id: string;
  transactionCode: string;
  customerName: string;
  subscriberCodes: string[];
  totalValue: number;
  channel: string;
  deploymentStatus: DeploymentStatus;
  paymentStatus: PaymentStatus;
  documentStatus: DocumentStatus;
  hasRevenue: boolean;
}

// 7. Commission
export interface CommissionRecord {
  id: string;
  recipientName: string;
  type: "Hoa hồng nội bộ" | "Hoa hồng chi kênh";
  transactionCode: string;
  amount: number;
  status: "Đã nhận" | "Chờ nhận" | "Đã chi" | "Chờ chi";
  date: string;
}

// 8. Territory (7 Phường)
export interface TerritoryRecord {
  id: string;
  wardName: string;
  quarterCount: number; // Khu phố
  householdCount: number; // Hộ dân
  opportunityCount: number; // Cơ hội CĐS
  deployedCount: number; // Đã ký HĐ và có doanh thu
  staffName: string;
  leadershipContact: string;
}

// 9. Staff
export interface StaffRecord {
  id: string;
  code: string;
  name: string;
  role: "AM" | "AM Bán chăm" | "Admin";
  territory: string;
  assignedCustomers: number;
  monthlyLeads: number;
  monthlyContracts: number;
  revenueExecuted: number;
  collectionRate: number;
  renewalRate: number;
  status: "Đang hoạt động" | "Tạm nghỉ";
  email: string;
}

// 10. Task
export interface TaskRecord {
  id: string;
  title: string;
  relatedTarget: string;
  assignee: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  notes?: string;
}

// 11. Audit Log
export interface AuditLogRecord {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

