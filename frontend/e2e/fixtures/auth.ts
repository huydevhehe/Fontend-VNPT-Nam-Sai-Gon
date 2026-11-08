import { expect, type Page } from "@playwright/test";

export type Role = "admin" | "am";

interface DemoAccount {
  username: string;
  password: string;
}

const DEMO_ACCOUNTS: Record<Role, DemoAccount> = {
  admin: { username: "admin", password: "admin@Vnpt2026" },
  am: { username: "VNPT-AM-01", password: "VNPT-AM-01@Vnpt2026" },
};

/**
 * Điền form đăng nhập tại /login bằng tài khoản demo thật theo role, submit và
 * đợi redirect sang /admin/dashboard xong mới return.
 */
export async function loginAs(page: Page, role: Role): Promise<void> {
  const account = DEMO_ACCOUNTS[role];

  await page.goto("/login");
  await page.getByLabel("Tên đăng nhập").fill(account.username);
  await page.getByLabel("Mật khẩu").fill(account.password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  await page.waitForURL("**/admin/dashboard", { waitUntil: "domcontentloaded" });
  await expect(page.locator("h1").first()).toBeVisible();
}
