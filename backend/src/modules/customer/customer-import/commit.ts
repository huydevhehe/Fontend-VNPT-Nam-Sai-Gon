import type { TransactionClient } from "../../../database/pg-adapter.js";
import { todayVn } from "../../../utils/date-vn.js";
import { normalizeTaxCode } from "../../../utils/tax-code.js";
import { classifyRows, type ExistingCustomer } from "./classify.js";
import type { ImportRow } from "./parse.js";

export type CommitAction = "create" | "keep_old" | "use_new" | "create_new" | "skip";

export interface CommitDecision {
  row: ImportRow;
  action: CommitAction;
  targetCustomerId?: string;
  customerGroup?: string;
  staffName?: string | null;
}

export interface CommitInput {
  territoryId: string | null;
  handoverBatch?: string;
  decisions: CommitDecision[];
}

export interface CommitResult {
  created: number;
  updated: number;
  kept: number;
  skipped: number;
  errors: { rowNumber: number; message: string }[];
}

const EXISTING_SELECT = `
  SELECT id, name, identity_code, customer_code, phone, billing_phone,
         contact_email, billing_email, customer_group, am_caring_staff, territory_id
  FROM customers
`;

function nonEmpty(value: string | undefined | null): string {
  return value && value.trim() ? value.trim() : "";
}

async function findTeamId(tx: TransactionClient, teamName: string): Promise<string | null> {
  const name = nonEmpty(teamName);
  if (!name) return null;
  const rows = await tx.query<{ id: string }>(
    "SELECT id FROM customer_teams WHERE LOWER(name) = LOWER(?)",
    [name]
  );
  return rows[0]?.id ?? null;
}

async function insertCustomerFromRow(
  tx: TransactionClient,
  row: ImportRow,
  opts: { territoryId: string | null; handoverBatch?: string; staffName: string | null; customerGroup?: string }
): Promise<ExistingCustomer> {
  const id = `KH-IMP-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const taxCode = row.taxCode ? normalizeTaxCode(row.taxCode) : "";
  const teamId = await findTeamId(tx, row.teamName);
  const customerGroup = opts.customerGroup || "Tập hiện hữu";
  const staffName = opts.staffName || null;
  const batch = nonEmpty(opts.handoverBatch);

  await tx.run(
    `INSERT INTO customers (
      id, name, identity_code, type, customer_group, phone, address, services, am_staff, am_caring_staff,
      handover_batch, handover_date, territory_id, customer_code, status, team_id, sales_channel,
      contact_name, contact_email, billing_name, billing_phone, billing_email, note
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      row.name,
      taxCode || null,
      "Doanh nghiệp",
      customerGroup,
      row.phone || null,
      row.address || null,
      null,
      staffName,
      staffName,
      batch || null,
      batch ? todayVn() : null,
      opts.territoryId || null,
      row.customerCode || null,
      null,
      teamId,
      row.salesChannel || null,
      row.contactName || null,
      row.email || null,
      row.billingName || null,
      row.billingPhone || null,
      row.billingEmail || null,
      row.note || null,
    ]
  );

  return {
    id,
    name: row.name,
    identity_code: taxCode || null,
    customer_code: row.customerCode || null,
    phone: row.phone || null,
    billing_phone: row.billingPhone || null,
    contact_email: row.email || null,
    billing_email: row.billingEmail || null,
    customer_group: customerGroup,
    am_caring_staff: staffName,
    territory_id: opts.territoryId || null,
  };
}

/**
 * `use_new`: chỉ ghi đè các trường của dòng mới KHÁC RỖNG (Review Focus #5);
 * territory_id/am_caring_staff/handover_batch luôn cập nhật nếu input có giá
 * trị, không phụ thuộc dòng Excel.
 */
async function applyUseNew(
  tx: TransactionClient,
  customerId: string,
  row: ImportRow,
  opts: { territoryId: string | null; handoverBatch?: string; staffName?: string | null; customerGroup?: string }
): Promise<void> {
  const sets: string[] = [];
  const params: unknown[] = [];

  const addIfNonEmpty = (column: string, value: string) => {
    const v = nonEmpty(value);
    if (v) {
      sets.push(`${column} = ?`);
      params.push(v);
    }
  };

  addIfNonEmpty("name", row.name);
  if (nonEmpty(row.taxCode)) {
    sets.push("identity_code = ?");
    params.push(normalizeTaxCode(row.taxCode));
  }
  addIfNonEmpty("customer_code", row.customerCode);
  addIfNonEmpty("phone", row.phone);
  addIfNonEmpty("contact_email", row.email);
  addIfNonEmpty("address", row.address);
  addIfNonEmpty("contact_name", row.contactName);
  addIfNonEmpty("billing_name", row.billingName);
  addIfNonEmpty("billing_phone", row.billingPhone);
  addIfNonEmpty("billing_email", row.billingEmail);
  addIfNonEmpty("sales_channel", row.salesChannel);
  addIfNonEmpty("note", row.note);

  const teamId = await findTeamId(tx, row.teamName);
  if (teamId) {
    sets.push("team_id = ?");
    params.push(teamId);
  }

  if (opts.territoryId) {
    sets.push("territory_id = ?");
    params.push(opts.territoryId);
  }
  if (nonEmpty(opts.staffName ?? undefined)) {
    sets.push("am_caring_staff = ?");
    params.push(nonEmpty(opts.staffName ?? undefined));
  }
  if (nonEmpty(opts.handoverBatch)) {
    sets.push("handover_batch = ?", "handover_date = ?");
    params.push(nonEmpty(opts.handoverBatch), todayVn());
  }
  if (opts.customerGroup) {
    sets.push("customer_group = ?");
    params.push(opts.customerGroup);
  }

  if (sets.length === 0) return;
  params.push(customerId);
  await tx.run(`UPDATE customers SET ${sets.join(", ")} WHERE id = ?`, params);
}

/**
 * Ghi dữ liệu theo quyết định admin (preview → commit, xem Architecture
 * dot-08.md). Server KHÔNG tin kết quả preview: `create` được phân loại lại
 * với DB hiện tại (Review Focus #3) trước khi ghi.
 */
export async function commitImportRows(
  tx: TransactionClient,
  input: CommitInput,
  _operator: string
): Promise<CommitResult> {
  const { territoryId, handoverBatch, decisions } = input;
  let created = 0;
  let updated = 0;
  let kept = 0;
  let skipped = 0;
  const errors: { rowNumber: number; message: string }[] = [];

  const liveExisting = await tx.query<ExistingCustomer>(EXISTING_SELECT);

  for (const decision of decisions) {
    const { row, action } = decision;

    if (action === "skip") {
      skipped++;
      continue;
    }

    if (action === "keep_old") {
      kept++;
      continue;
    }

    if (action === "create" || action === "create_new") {
      if (action === "create") {
        const [reclassified] = classifyRows([row], liveExisting, new Map(), null);
        if (reclassified.status === "duplicate") {
          errors.push({
            rowNumber: row.rowNumber,
            message: "Dòng đã trùng với khách vừa được tạo, hãy xem lại",
          });
          continue;
        }
      }

      const newCustomer = await insertCustomerFromRow(tx, row, {
        territoryId,
        handoverBatch,
        staffName: decision.staffName ?? null,
        customerGroup: decision.customerGroup,
      });
      liveExisting.push(newCustomer);
      created++;
      continue;
    }

    if (action === "use_new") {
      if (!decision.targetCustomerId) {
        errors.push({ rowNumber: row.rowNumber, message: "Thiếu khách hàng đích để ghi đè" });
        continue;
      }

      const targetRows = await tx.query<ExistingCustomer>(
        `${EXISTING_SELECT} WHERE id = ?`,
        [decision.targetCustomerId]
      );
      const target = targetRows[0];
      if (!target) {
        errors.push({ rowNumber: row.rowNumber, message: "Không tìm thấy khách hàng để ghi đè" });
        continue;
      }
      if (target.customer_group === "Tự phát triển" && !decision.customerGroup) {
        errors.push({
          rowNumber: row.rowNumber,
          message: "Khách đang là KH PTM, vui lòng chọn loại khách hàng",
        });
        continue;
      }

      await applyUseNew(tx, target.id, row, {
        territoryId,
        handoverBatch,
        staffName: decision.staffName,
        customerGroup: decision.customerGroup,
      });
      updated++;
      continue;
    }

    errors.push({ rowNumber: row.rowNumber, message: `Hành động không hợp lệ: ${action}` });
  }

  return { created, updated, kept, skipped, errors };
}
