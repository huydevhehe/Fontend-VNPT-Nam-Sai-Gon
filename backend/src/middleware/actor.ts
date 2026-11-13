import { Request } from "express";
import { query } from "../database/db.js";

/**
 * Lấy tên nhân viên hiện tại từ DB theo `req.user.id` (KHÔNG tin `name` ghi
 * trong JWT — token có thể được phát hành trước khi nhân viên bị đổi tên).
 * Trả `null` nếu không tìm thấy user (không nên xảy ra sau `requireAuth`,
 * nhưng vẫn xử lý để nơi gọi ép về giá trị không khớp bất kỳ nhân viên nào).
 */
export async function resolveActorName(req: Request): Promise<string | null> {
  const userId = req.user?.id;
  if (!userId) {
    return null;
  }
  const rows = await query<{ name: string | null }>("SELECT name FROM users WHERE id = ?", [userId]);
  const name = rows[0]?.name;
  return typeof name === "string" && name.trim() ? name : null;
}
