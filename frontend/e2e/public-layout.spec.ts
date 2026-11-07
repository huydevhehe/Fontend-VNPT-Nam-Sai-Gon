import { expect, test } from "@playwright/test";
import { loginAs } from "./fixtures/auth";

test.describe("Header marketing trên trang công khai", () => {
  for (const path of ["/cong-tac-vien", "/lien-he"]) {
    test(`${path} có link "Sim số" ở header`, async ({ page }) => {
      await page.goto(path);
      await expect(
        page.locator("header").getByRole("link", { name: "Sim số" }).first()
      ).toBeVisible();
    });
  }

  test("/admin/dashboard không có link \"Sim số\" sau khi đăng nhập admin", async ({
    page,
  }) => {
    await loginAs(page, "admin");
    await page.goto("/admin/dashboard");
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Sim số" })).toHaveCount(0);
  });
});
