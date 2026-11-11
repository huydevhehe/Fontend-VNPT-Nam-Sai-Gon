import { randomBytes } from "node:crypto";
import { query, run } from "../../database/db.js";
import { LEAD_CHANNELS, LEAD_GROUPS, ROLES, UNASSIGNED_STAFF, USER_STATUS } from "../../constants/org.js";

export const NAME_MIN = 2;
export const NAME_MAX = 100;
export const DEMAND_MAX = 500;
export const REF_CODE_MAX = 64;
const PHONE_PATTERN = /^0\d{9,10}$/;

export class PublicValidationError extends Error {}

export interface PublicLeadInput {
  name?: unknown;
  phone?: unknown;
  demand?: unknown;
  refCode?: unknown;
}

interface ValidatedLead {
  name: string;
  phone: string;
  demand: string;
  refCode: string;
}

function validate(input: PublicLeadInput): ValidatedLead {
  if (typeof input.name !== "string") {
    throw new PublicValidationError("Vui lòng nhập họ và tên");
  }
  const name = input.name.trim();
  if (name.length < NAME_MIN || name.length > NAME_MAX) {
    throw new PublicValidationError(`Họ và tên phải từ ${NAME_MIN} đến ${NAME_MAX} ký tự`);
  }

  if (typeof input.phone !== "string" || !PHONE_PATTERN.test(input.phone.trim())) {
    throw new PublicValidationError("Số điện thoại không hợp lệ (bắt đầu bằng 0, gồm 10-11 chữ số)");
  }
  const phone = input.phone.trim();

  let demand = "";
  if (input.demand !== undefined && input.demand !== null) {
    if (typeof input.demand !== "string") {
      throw new PublicValidationError("Nội dung liên hệ không hợp lệ");
    }
    demand = input.demand.trim();
    if (demand.length > DEMAND_MAX) {
      throw new PublicValidationError(`Nội dung liên hệ tối đa ${DEMAND_MAX} ký tự`);
    }
  }

  // Mã giới thiệu sai định dạng không gây lỗi: lead vẫn được ghi nhận như khách Online.
  const refCode =
    typeof input.refCode === "string" && input.refCode.trim().length <= REF_CODE_MAX
      ? input.refCode.trim()
      : "";

  return { name, phone, demand, refCode };
}

export class PublicService {
  /** Trả id CTV đang hoạt động sở hữu mã giới thiệu, hoặc null. */
  async findActiveCtvIdByRefCode(refCode: string): Promise<string | null> {
    if (!refCode || refCode.length > REF_CODE_MAX) {
      return null;
    }
    const rows = await query<{ id: string }>(
      "SELECT id FROM users WHERE referral_code = ? AND role = ? AND status = ?",
      [refCode, ROLES.CTV, USER_STATUS.ACTIVE]
    );
    return rows[0]?.id ?? null;
  }

  async isValidRefCode(code: string): Promise<boolean> {
    return (await this.findActiveCtvIdByRefCode(code)) !== null;
  }

  async createLead(input: PublicLeadInput): Promise<void> {
    const { name, phone, demand, refCode } = validate(input);
    const ctvId = await this.findActiveCtvIdByRefCode(refCode);
    const channel = ctvId ? LEAD_CHANNELS[1] : LEAD_CHANNELS[0];
    const id = `LEAD-${Date.now()}-${randomBytes(3).toString("hex")}`;

    await run(
      `INSERT INTO leads (
        id, customer_name, phone, group_name, channel, staff_name,
        status, expected_value, demand_description, referred_by_ctv_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, phone, LEAD_GROUPS[0], channel, UNASSIGNED_STAFF, "Mới tiếp nhận", 0, demand, ctvId]
    );
  }
}
