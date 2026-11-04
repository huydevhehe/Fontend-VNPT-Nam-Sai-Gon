import { query, run } from "../../database/db.js";

export interface ContractRow {
  id: string;
  transaction_code: string;
  customer_name: string;
  subscriber_codes: string;
  total_value: number;
  channel: string;
  deployment_status: string;
  payment_status: string;
  document_status: string;
  has_revenue: number;
}

export interface ContractRecordDto {
  id: string;
  transactionCode: string;
  customerName: string;
  subscriberCodes: string[];
  totalValue: number;
  channel: string;
  deploymentStatus: string;
  paymentStatus: string;
  documentStatus: string;
  hasRevenue: boolean;
}

export interface UpdateContractStatusInput {
  deploymentStatus?: string;
  paymentStatus?: string;
  documentStatus?: string;
  totalValue?: number;
}

function toContractRecord(row: ContractRow): ContractRecordDto {
  let subscriberCodes: string[] = [];
  try {
    const parsed = JSON.parse(row.subscriber_codes);
    subscriberCodes = Array.isArray(parsed) ? parsed : [];
  } catch {
    subscriberCodes = [];
  }

  return {
    id: row.id,
    transactionCode: row.transaction_code,
    customerName: row.customer_name,
    subscriberCodes,
    totalValue: row.total_value,
    channel: row.channel,
    deploymentStatus: row.deployment_status,
    paymentStatus: row.payment_status,
    documentStatus: row.document_status,
    hasRevenue: row.has_revenue === 1,
  };
}

export class ContractService {
  async getAll(): Promise<ContractRecordDto[]> {
    const rows = await query<ContractRow>("SELECT * FROM contracts ORDER BY created_at DESC");
    return rows.map(toContractRecord);
  }

  async updateStatus(id: string, patch: UpdateContractStatusInput): Promise<ContractRecordDto> {
    const existing = await query<ContractRow>("SELECT * FROM contracts WHERE id = ?", [id]);
    if (!existing.length) {
      throw new Error("Không tìm thấy Hợp đồng");
    }

    if (
      patch.deploymentStatus === undefined &&
      patch.paymentStatus === undefined &&
      patch.documentStatus === undefined &&
      patch.totalValue === undefined
    ) {
      throw new Error("Thiếu thông tin cần cập nhật");
    }

    if (patch.totalValue !== undefined) {
      if (typeof patch.totalValue !== "number" || Number.isNaN(patch.totalValue)) {
        throw new Error("Giá trị hợp đồng phải là một số hợp lệ");
      }
      if (patch.totalValue < 0) {
        throw new Error("Giá trị hợp đồng không được âm");
      }
    }

    const current = existing[0];
    const nextDeploymentStatus = patch.deploymentStatus ?? current.deployment_status;
    const nextPaymentStatus = patch.paymentStatus ?? current.payment_status;
    const nextDocumentStatus = patch.documentStatus ?? current.document_status;
    const nextTotalValue = patch.totalValue ?? current.total_value;

    await run(
      `UPDATE contracts SET
        deployment_status = ?,
        payment_status = ?,
        document_status = ?,
        total_value = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [nextDeploymentStatus, nextPaymentStatus, nextDocumentStatus, nextTotalValue, id]
    );

    const updated = await query<ContractRow>("SELECT * FROM contracts WHERE id = ?", [id]);
    return toContractRecord(updated[0]);
  }
}
