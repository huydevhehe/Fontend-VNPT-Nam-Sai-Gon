export type CustomerType = "Doanh nghiệp" | "Hộ kinh doanh" | "Cá nhân";
export type CustomerGroup = "Tự phát triển" | "Tập hiện hữu";
export type StaffRole = "Admin" | "AM" | "AM Bán chăm" | "Người xem";
export type UserRole = "Admin" | "AM" | "AM Bán chăm" | "CTV";

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
  handoverBatch?: string; // Đợt giao (rỗng nếu chưa có)
  handoverDate?: string; // Ngày giao (rỗng nếu chưa có)
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
  channel: "Online" | "CTV giới thiệu" | "Đối tác" | "Khách hàng hiện hữu" | "Chiến dịch";
  staffName: string;
  status: LeadStatus;
  expectedValue: number;
  demandDescription: string;
  territoryId?: string;
  referredByCtvId?: string;
  referredByCtvName?: string;
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
  leadId?: string;
  territoryId?: string;
  referredByCtvId?: string;
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
  ctvId?: string;
  contractId?: string;
  note?: string | null;
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
  population: number; // Dân số
  schoolMamnon: number; // Số trường Mầm non
  schoolTieuhoc: number; // Số trường Tiểu học
  schoolThcs: number; // Số trường THCS
  schoolThpt: number; // Số trường THPT
  revenue: number; // Doanh thu đã triển khai
}

// 8b. Ward contact (đầu mối nhân sự theo Đơn vị/Phòng ban trong 1 phường)
export interface WardContactRecord {
  id: string;
  territoryId: string;
  unit: string; // Đơn vị: Trạm Y tế, UBND, Đảng ủy, Trường học...
  department: string; // Phòng ban: Hành chính nhân sự, Mầm non, THCS...
  fullName: string; // Họ tên
  position: string; // Chức: Trưởng phòng, Hiệu trưởng...
  phone: string;
  amInCharge: string; // AM phụ trách
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

// 12. Chi tiết Phường (lãnh đạo, khu phố, lead dự án, hợp đồng)
export interface WardOfficialRecord {
  id: string;
  territoryId: string;
  unit: string;
  position: string;
  fullName: string;
  phone: string;
}

export interface QuarterRecord {
  id: string;
  territoryId: string;
  name: string;
  headName: string;
  secretaryName: string;
  mttqName: string;
  householdCount: number;
  population: number;
}

export interface TerritoryDetail {
  territory: {
    id: string;
    wardName: string;
    quarterCount: number;
    householdCount: number;
    opportunityCount: number;
    deployedCount: number;
    staffName: string;
    leadershipContact: string;
    population: number;
    schoolMamnon: number;
    schoolTieuhoc: number;
    schoolThcs: number;
    schoolThpt: number;
    revenue: number;
  };
  officials: WardOfficialRecord[];
  quarters: QuarterRecord[];
  leads: {
    id: string;
    customerName: string;
    status: LeadStatus;
    expectedValue: number;
    channel: string;
    staffName: string;
  }[];
  contracts: {
    id: string;
    transactionCode: string;
    customerName: string;
    totalValue: number;
    deploymentStatus: DeploymentStatus;
    paymentStatus: PaymentStatus;
  }[];
  totals: {
    quarterCount: number;
    householdCount: number;
    population: number;
    leadCount: number;
    contractCount: number;
    contractValue: number;
  };
}

// 13. Cộng tác viên (CTV)
export interface CtvAccountRecord {
  id: string;
  username: string;
  name: string;
  phone: string;
  email: string;
  referralCode: string;
  status: "Đang hoạt động" | "Chờ duyệt" | "Từ chối";
  createdAt: string;
  approvedAt: string;
}

export interface CtvProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  referralCode: string;
}

export interface CtvSummary {
  totalLeads: number;
  successfulLeads: number;
  failedLeads: number;
  totalContracts: number;
  completedContracts: number;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
}

export interface CtvLeadRecord {
  id: string;
  customerName: string;
  maskedPhone: string;
  group: LeadRecord["group"];
  status: LeadStatus;
  expectedValue: number;
  createdAt: string;
  contractStatus: string;
}

export interface CtvContractRecord {
  id: string;
  transactionCode: string;
  customerName: string;
  totalValue: number;
  deploymentStatus: DeploymentStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface CtvCommissionRecord {
  id: string;
  transactionCode: string;
  amount: number;
  status: CommissionRecord["status"];
  date: string;
}
