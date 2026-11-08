import { CTV_COMMISSION_RATE } from "../../constants/org.js";

export const CTV_COMMISSION_TYPE = "Hoa hồng chi kênh";
export const CTV_COMMISSION_INITIAL_STATUS = "Chờ chi";

/** Hoa hồng CTV = tỷ lệ cố định x giá trị hợp đồng, làm tròn đến đồng. */
export function calcCtvCommission(totalValue: number): number {
  return Math.round(totalValue * CTV_COMMISSION_RATE);
}
