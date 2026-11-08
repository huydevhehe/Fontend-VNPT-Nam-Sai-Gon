import { test } from "node:test";
import assert from "node:assert/strict";

const { initDatabase, run } = await import("../../database/db.js");
const { CommissionService } = await import("./commission.service.js");

await initDatabase();

test("createForContract rethrows a non-unique constraint violation instead of swallowing it", async () => {
  const ctvId = "USR-CTV-TEST-NULLNAME";
  // Tạo CTV với name NULL để lần INSERT commissions vi phạm NOT NULL trên
  // recipient_name — một lỗi SQLITE_CONSTRAINT KHÁC với unique index
  // (contract_id, ctv_id), phải được ném lại, không được coi là "đã tồn tại".
  await run(
    "INSERT INTO users (id, username, password_hash, name, role, email, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [ctvId, "ctv-test-nullname", "x", null, "CTV", null, "Đang hoạt động"]
  );

  const service = new CommissionService();
  await assert.rejects(() =>
    service.createForContract({
      id: "CTR-TEST-NULLNAME",
      transaction_code: "GD-TEST-NULLNAME",
      total_value: 1000000,
      referred_by_ctv_id: ctvId,
    })
  );
});
