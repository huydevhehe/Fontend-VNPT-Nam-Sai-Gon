import { expect, test, type Page } from "@playwright/test";
import {
  ADMIN,
  API_URL,
  apiLogin,
  bearer,
  createApprovedCtv,
  uniquePhone,
} from "./api/helpers";

// Backend giới hạn 5 lần/10 phút theo IP. Trình duyệt test luôn đi từ loopback,
// nên gắn X-Forwarded-For ngẫu nhiên riêng cho mỗi lần gửi để các lần chạy không chạm giới hạn.
async function useDistinctForwardedIp(page: Page): Promise<void> {
  const n = () => Math.floor(Math.random() * 254) + 1;
  const ip = `198.${n()}.${n()}.${n()}`;
  await page.route("**/public/leads", (route) =>
    route.continue({ headers: { ...route.request().headers(), "x-forwarded-for": ip } })
  );
}

async function fillContactForm(page: Page, name: string, phone: string) {
  await page.getByLabel("Họ và tên").fill(name);
  await page.getByLabel("Số điện thoại").fill(phone);
  await page.getByLabel("Nội dung liên hệ").fill("Cần tư vấn gói Internet cho gia đình");
  await page.getByRole("checkbox").check();
}

async function findLeadByName(
  request: Parameters<typeof apiLogin>[0],
  name: string
): Promise<{ channel: string; staffName: string } | undefined> {
  const token = await apiLogin(request, ADMIN.username, ADMIN.password);
  const res = await request.get(`${API_URL}/leads`, { headers: bearer(token) });
  expect(res.status()).toBe(200);
  const leads: Array<{ customerName: string; channel: string; staffName: string }> = (
    await res.json()
  ).data;
  return leads.find((l) => l.customerName === name);
}

test.describe("Mã giới thiệu CTV và form liên hệ công khai", () => {
  test("/ref/<mã>?to=/lien-he lưu mã, gửi form → lead kênh CTV giới thiệu", async ({
    page,
    request,
  }) => {
    const adminToken = await apiLogin(request, ADMIN.username, ADMIN.password);
    const ctv = await createApprovedCtv(request, adminToken);
    await useDistinctForwardedIp(page);

    await page.goto(`/ref/${ctv.referralCode}?to=/lien-he`);
    await page.waitForURL((url) => url.pathname === "/lien-he");

    const stored = await page.evaluate(() => window.localStorage.getItem("vnpt_ref"));
    expect(stored, "localStorage phải có vnpt_ref").toBeTruthy();
    expect(stored).toContain(ctv.referralCode);

    const name = `Khách ref UI ${Date.now()}`;
    await fillContactForm(page, name, uniquePhone());
    await page.getByRole("button", { name: "GỬI THÔNG TIN" }).click();
    await expect(page.getByText("Cảm ơn bạn đã liên hệ!")).toBeVisible({ timeout: 10_000 });

    const lead = await findLeadByName(request, name);
    expect(lead, "admin phải thấy lead vừa gửi").toBeTruthy();
    expect(lead!.channel).toBe("CTV giới thiệu");
  });

  test("?ref= trên trang công khai bất kỳ cũng được lưu", async ({ page }) => {
    await page.goto("/lien-he?ref=CTVABC123");
    await expect
      .poll(() => page.evaluate(() => window.localStorage.getItem("vnpt_ref")))
      .toContain("CTVABC123");
  });

  // Mỗi giá trị `to` độc hại là một test riêng (không phải vòng lặp trên
  // cùng 1 trang): nhiều lần page.goto liên tiếp trên cùng page đôi khi đua
  // với chính router.replace() phía client của lần điều hướng trước, khiến
  // page.goto ném net::ERR_ABORTED hoặc waitForURL treo — tách test để mỗi
  // lần có page sạch, không còn đua.
  for (const to of ["//evil.com", "https://evil.com", "/\\evil.com", "javascript:alert(1)"]) {
    test(`to=${to} về trang chủ, không rời domain`, async ({ page }) => {
      // Trang /ref/[code] tự chuyển hướng gần như ngay lập tức bằng router
      // phía client; đôi khi điều hướng đó "vượt mặt" chính page.goto và
      // khiến nó ném net::ERR_ABORTED dù trang vẫn hoạt động đúng — bỏ qua
      // lỗi điều hướng của goto, chỉ xác nhận nơi dừng cuối cùng.
      await page.goto(`/ref/x?to=${encodeURIComponent(to)}`).catch(() => {});
      await page.waitForURL((url) => url.pathname === "/" && url.hostname === "localhost", {
        timeout: 10_000,
      });
      expect(new URL(page.url()).hostname, `to=${to}`).toBe("localhost");
    });
  }

  test("gửi form khi chưa có ref → lead kênh Online", async ({ page, request }) => {
    await useDistinctForwardedIp(page);
    await page.goto("/lien-he");
    const name = `Khách web UI ${Date.now()}`;
    await fillContactForm(page, name, uniquePhone());
    await page.getByRole("button", { name: "GỬI THÔNG TIN" }).click();
    await expect(page.getByText("Cảm ơn bạn đã liên hệ!")).toBeVisible({ timeout: 10_000 });

    const lead = await findLeadByName(request, name);
    expect(lead, "admin phải thấy lead vừa gửi").toBeTruthy();
    expect(lead!.channel).toBe("Online");
    expect(lead!.staffName).toBe("Chưa phân công");
  });

  test("SĐT sai → hiện lỗi, không hiện lời cảm ơn", async ({ page }) => {
    await useDistinctForwardedIp(page);
    await page.goto("/lien-he");
    await fillContactForm(page, `Khách lỗi ${Date.now()}`, "123");
    await page.getByRole("button", { name: "GỬI THÔNG TIN" }).click();

    await expect(page.getByText("Số điện thoại không hợp lệ")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Cảm ơn bạn đã liên hệ!")).toHaveCount(0);
  });
});
