import { test } from "node:test";
import assert from "node:assert/strict";
import type { Request, Response } from "express";
import { createRateLimiter } from "./rate-limit.js";

function run(limiter: ReturnType<typeof createRateLimiter>, ip: string): number {
  let status = 200;
  let passed = false;
  const res = {
    status(code: number) {
      status = code;
      return this;
    },
    json() {
      return this;
    },
  } as unknown as Response;
  limiter({ ip } as Request, res, () => {
    passed = true;
  });
  return passed ? 200 : status;
}

test("chặn sau max lần và không ảnh hưởng IP khác", () => {
  const limiter = createRateLimiter({ max: 2, windowMs: 60_000 });
  assert.equal(run(limiter, "1.1.1.1"), 200);
  assert.equal(run(limiter, "1.1.1.1"), 200);
  assert.equal(run(limiter, "1.1.1.1"), 429);
  assert.equal(run(limiter, "2.2.2.2"), 200);
});

test("cửa sổ hết hạn thì cho phép lại", async () => {
  const limiter = createRateLimiter({ max: 1, windowMs: 30 });
  assert.equal(run(limiter, "3.3.3.3"), 200);
  assert.equal(run(limiter, "3.3.3.3"), 429);
  await new Promise((r) => setTimeout(r, 50));
  assert.equal(run(limiter, "3.3.3.3"), 200);
});

test("chạm trần số key: IP mới bị 429, IP đã biết vẫn được tính theo hạn mức", () => {
  const limiter = createRateLimiter({ max: 5, windowMs: 60_000, maxKeys: 2 });
  assert.equal(run(limiter, "a"), 200);
  assert.equal(run(limiter, "b"), 200);
  assert.equal(run(limiter, "c"), 429);
  assert.equal(run(limiter, "a"), 200);
});

test("chạm trần số key: mục hết hạn được dọn trước khi từ chối", async () => {
  const limiter = createRateLimiter({ max: 5, windowMs: 30, maxKeys: 2 });
  assert.equal(run(limiter, "a"), 200);
  assert.equal(run(limiter, "b"), 200);
  await new Promise((r) => setTimeout(r, 50));
  assert.equal(run(limiter, "c"), 200);
});
