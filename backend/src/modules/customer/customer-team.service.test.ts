import { test } from "node:test";
import assert from "node:assert/strict";

const { initDatabase } = await import("../../database/db.js");
const { CustomerTeamService, CustomerTeamServiceError } = await import("./customer-team.service.js");
const { CustomerService } = await import("./customer.service.js");

await initDatabase();

test("create rejects duplicate name case-insensitively", async () => {
  const service = new CustomerTeamService();
  const suffix = Date.now();
  const name = `NOVA Test ${suffix}`;

  await service.create({ name });

  await assert.rejects(
    async () => {
      await service.create({ name: name.toUpperCase() });
    },
    (err: any) => {
      assert.ok(err instanceof CustomerTeamServiceError);
      assert.equal(err.status, 409);
      return true;
    }
  );
});

test("list returns customer counts", async () => {
  const teamService = new CustomerTeamService();
  const customerService = new CustomerService();
  const suffix = Date.now();
  const name = `Vantage Test ${suffix}`;

  const team = await teamService.create({ name });
  await customerService.create({
    name: `Công ty Team A ${suffix}`,
    type: "Doanh nghiệp",
    customerGroup: "Tự phát triển",
    teamId: team.id,
  });
  await customerService.create({
    name: `Công ty Team B ${suffix}`,
    type: "Doanh nghiệp",
    customerGroup: "Tự phát triển",
    teamId: team.id,
  });

  const list = await teamService.list();
  const found = list.find((t) => t.id === team.id);
  assert.ok(found, "Phải tìm thấy team vừa tạo");
  assert.equal(found!.customerCount, 2);
});

test("remove blocked when team has customers", async () => {
  const teamService = new CustomerTeamService();
  const customerService = new CustomerService();
  const suffix = Date.now();
  const name = `Dragon Test ${suffix}`;

  const team = await teamService.create({ name });
  await customerService.create({
    name: `Công ty Dragon ${suffix}`,
    type: "Doanh nghiệp",
    customerGroup: "Tự phát triển",
    teamId: team.id,
  });

  await assert.rejects(
    async () => {
      await teamService.remove(team.id);
    },
    (err: any) => {
      assert.ok(err instanceof CustomerTeamServiceError);
      assert.equal(err.status, 409);
      return true;
    }
  );
});

test("remove succeeds when team has no customers", async () => {
  const teamService = new CustomerTeamService();
  const suffix = Date.now();
  const team = await teamService.create({ name: `Team Trống ${suffix}` });

  await teamService.remove(team.id);

  const list = await teamService.list();
  assert.ok(!list.some((t) => t.id === team.id));
});

test("assignTeam sets team for many customers", async () => {
  const teamService = new CustomerTeamService();
  const customerService = new CustomerService();
  const suffix = Date.now();

  const team = await teamService.create({ name: `Assign Test ${suffix}` });
  const c1 = await customerService.create({
    name: `Công ty Assign 1 ${suffix}`,
    type: "Doanh nghiệp",
    customerGroup: "Tự phát triển",
  });
  const c2 = await customerService.create({
    name: `Công ty Assign 2 ${suffix}`,
    type: "Doanh nghiệp",
    customerGroup: "Tự phát triển",
  });

  const updated = await customerService.assignTeam([c1.customer.id, c2.customer.id], team.id);
  assert.equal(updated, 2);

  const after1 = await customerService.getById(c1.customer.id);
  const after2 = await customerService.getById(c2.customer.id);
  assert.equal(after1.team_id, team.id);
  assert.equal(after2.team_id, team.id);
});
