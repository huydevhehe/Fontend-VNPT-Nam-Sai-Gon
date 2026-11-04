import { query } from "../../database/db.js";

export interface AuditLogRow {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface AuditLogRecordDto {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface ReportSummaryDto {
  totalImmediateDebt: number;
  totalCumulativeDebt: number;
  totalCollectedAmount: number;
  debtRecordCount: number;
  totalRenewals: number;
  completedRenewals: number;
  totalContracts: number;
  totalContractValue: number;
}

function toAuditLogRecord(row: AuditLogRow): AuditLogRecordDto {
  return {
    id: row.id,
    timestamp: row.timestamp,
    user: row.user,
    action: row.action,
    details: row.details,
  };
}

export class ReportService {
  async getAuditLogs(): Promise<AuditLogRecordDto[]> {
    const rows = await query<AuditLogRow>(
      "SELECT * FROM audit_logs ORDER BY timestamp DESC"
    );
    return rows.map(toAuditLogRecord);
  }

  async getSummary(): Promise<ReportSummaryDto> {
    const [debtRow] = await query<{
      total_immediate_debt: number;
      total_cumulative_debt: number;
      total_collected_amount: number;
      debt_record_count: number;
    }>(
      `SELECT
        COALESCE(SUM(immediate_debt), 0) AS total_immediate_debt,
        COALESCE(SUM(cumulative_debt), 0) AS total_cumulative_debt,
        COALESCE(SUM(collected_amount), 0) AS total_collected_amount,
        COUNT(*) AS debt_record_count
      FROM debts`
    );

    const [renewalRow] = await query<{
      total_renewals: number;
      completed_renewals: number;
    }>(
      `SELECT
        COUNT(*) AS total_renewals,
        COALESCE(SUM(CASE WHEN status = 'Hoàn thành' THEN 1 ELSE 0 END), 0) AS completed_renewals
      FROM renewals`
    );

    const [contractRow] = await query<{
      total_contracts: number;
      total_contract_value: number;
    }>(
      `SELECT
        COUNT(*) AS total_contracts,
        COALESCE(SUM(total_value), 0) AS total_contract_value
      FROM contracts`
    );

    return {
      totalImmediateDebt: debtRow?.total_immediate_debt ?? 0,
      totalCumulativeDebt: debtRow?.total_cumulative_debt ?? 0,
      totalCollectedAmount: debtRow?.total_collected_amount ?? 0,
      debtRecordCount: debtRow?.debt_record_count ?? 0,
      totalRenewals: renewalRow?.total_renewals ?? 0,
      completedRenewals: renewalRow?.completed_renewals ?? 0,
      totalContracts: contractRow?.total_contracts ?? 0,
      totalContractValue: contractRow?.total_contract_value ?? 0,
    };
  }
}
