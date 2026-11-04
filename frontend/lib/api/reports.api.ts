import { apiFetch } from "./client";
import { AuditLogRecord } from "@/lib/crm/types/crm.types";

export interface ReportSummary {
  totalImmediateDebt: number;
  totalCumulativeDebt: number;
  totalCollectedAmount: number;
  debtRecordCount: number;
  totalRenewals: number;
  completedRenewals: number;
  totalContracts: number;
  totalContractValue: number;
}

export function getAuditLogs(): Promise<AuditLogRecord[]> {
  return apiFetch<AuditLogRecord[]>("/reports/audit-logs");
}

export function getReportSummary(): Promise<ReportSummary> {
  return apiFetch<ReportSummary>("/reports/summary");
}
