import { test } from "node:test";
import assert from "node:assert/strict";
import type { NextFunction, Request, Response } from "express";
import { requireAdmin, requireCtv, requireStaff } from "./require-role.js";

type Middleware = (req: Request, res: Response, next: NextFunction) => void;

function run(middleware: Middleware, role: string | undefined) {
  let nextCalled = false;
  let statusCode: number | undefined;
  let body: unknown;

  const req = { user: role ? { id: "u1", role } : undefined } as Request;
  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: unknown) {
      body = payload;
      return this;
    },
  } as unknown as Response;

  middleware(req, res, () => {
    nextCalled = true;
  });

  return { nextCalled, statusCode, body };
}

const FORBIDDEN = { success: false, message: "Không có quyền truy cập" };

test("requireStaff cho qua Admin, AM, AM Bán chăm", () => {
  for (const role of ["Admin", "AM", "AM Bán chăm"]) {
    const result = run(requireStaff, role);
    assert.equal(result.nextCalled, true, role);
    assert.equal(result.statusCode, undefined, role);
  }
});

test("requireStaff chặn CTV bằng 403", () => {
  const result = run(requireStaff, "CTV");
  assert.equal(result.nextCalled, false);
  assert.equal(result.statusCode, 403);
  assert.deepEqual(result.body, FORBIDDEN);
});

test("requireStaff chặn request chưa có req.user bằng 403", () => {
  const result = run(requireStaff, undefined);
  assert.equal(result.nextCalled, false);
  assert.equal(result.statusCode, 403);
});

test("requireAdmin chỉ cho Admin", () => {
  assert.equal(run(requireAdmin, "Admin").nextCalled, true);
  for (const role of ["AM", "AM Bán chăm", "CTV"]) {
    const result = run(requireAdmin, role);
    assert.equal(result.nextCalled, false, role);
    assert.equal(result.statusCode, 403, role);
    assert.deepEqual(result.body, FORBIDDEN, role);
  }
});

test("requireCtv chỉ cho CTV", () => {
  assert.equal(run(requireCtv, "CTV").nextCalled, true);
  for (const role of ["Admin", "AM", "AM Bán chăm"]) {
    const result = run(requireCtv, role);
    assert.equal(result.nextCalled, false, role);
    assert.equal(result.statusCode, 403, role);
    assert.deepEqual(result.body, FORBIDDEN, role);
  }
});
