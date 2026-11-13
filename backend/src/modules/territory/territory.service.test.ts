import { test } from "node:test";
import assert from "node:assert/strict";

const { initDatabase, query, run } = await import("../../database/db.js");
const { normalizeWardName } = await import("./ward-name.js");
const { TerritoryService, TerritoryServiceError } = await import("./territory.service.js");

await initDatabase();

test("normalizeWardName matches regardless of prefix, diacritics, case and spacing", () => {
  const variants = [
    "Phường Cầu Ông Lãnh",
    "  cầu   ông lãnh ",
    "P. Cầu Ông Lãnh",
    "cau ong lanh",
  ];
  const normalized = variants.map((v) => normalizeWardName(v));
  for (const value of normalized) {
    assert.equal(value, "cau ong lanh");
  }
});

test("createTerritory creates ward", async () => {
  const service = new TerritoryService();
  const suffix = Date.now();
  const wardName = `Phường Tạo Mới ${suffix}`;

  const created = await service.createTerritory({ wardName });

  assert.equal(created.wardName, wardName);
  assert.ok(typeof created.id === "string" && created.id.startsWith("TB-"));

  const rows = await query<any>("SELECT * FROM territories WHERE id = ?", [created.id]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].ward_name, wardName);
});

test("createTerritory rejects duplicate ignoring case and prefix", async () => {
  const service = new TerritoryService();
  const suffix = Date.now();
  const wardName = `Phường Trùng Tên ${suffix}`;

  await service.createTerritory({ wardName });

  await assert.rejects(
    async () => {
      await service.createTerritory({ wardName: `  ${wardName.toLowerCase()}  ` });
    },
    (err: any) => {
      assert.ok(err instanceof TerritoryServiceError);
      assert.equal(err.status, 409);
      assert.equal(err.message, "Phường đã tồn tại");
      return true;
    }
  );
});

test("createTerritory rejects duplicate differing only by 'Phường' prefix and diacritics", async () => {
  const service = new TerritoryService();
  const suffix = Date.now();
  const wardName = `Cầu Ông Lãnh ${suffix}`;

  await service.createTerritory({ wardName: `Phường ${wardName}` });

  await assert.rejects(
    async () => {
      await service.createTerritory({ wardName: `cau ong lanh ${suffix}` });
    },
    (err: any) => {
      assert.ok(err instanceof TerritoryServiceError);
      assert.equal(err.status, 409);
      return true;
    }
  );
});

test("createTerritory with unknown staffName rejects", async () => {
  const service = new TerritoryService();
  const suffix = Date.now();

  await assert.rejects(
    async () => {
      await service.createTerritory({
        wardName: `Phường Nhân Viên Lạ ${suffix}`,
        staffName: `Không Tồn Tại ${suffix}`,
      });
    },
    (err: any) => {
      assert.ok(err instanceof TerritoryServiceError);
      assert.equal(err.status, 400);
      return true;
    }
  );
});

test("createTerritory accepts existing staffName", async () => {
  const service = new TerritoryService();
  const suffix = Date.now();
  const staffName = `AM Test Tạo Phường ${suffix}`;

  await run("INSERT INTO staff (id, name, code, role, status) VALUES (?, ?, ?, ?, ?)", [
    `STF-WARD-${suffix}`,
    staffName,
    `NV-WARD-${suffix}`,
    "AM",
    "Đang hoạt động",
  ]);

  const created = await service.createTerritory({
    wardName: `Phường Có Nhân Viên ${suffix}`,
    staffName,
  });

  assert.equal(created.staffName, staffName);
});

test("createTerritory rejects name shorter than 2 chars or longer than 100", async () => {
  const service = new TerritoryService();

  await assert.rejects(async () => {
    await service.createTerritory({ wardName: "A" });
  });

  await assert.rejects(async () => {
    await service.createTerritory({ wardName: "A".repeat(101) });
  });
});
