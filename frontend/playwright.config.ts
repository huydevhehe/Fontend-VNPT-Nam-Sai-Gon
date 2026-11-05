import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL || "http://localhost:3005";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  // Backend (cổng 8099) và frontend (cổng 3005) phải được khởi động sẵn thủ công
  // trước khi chạy test, nên KHÔNG khai báo webServer ở đây:
  //   cd backend && PORT=8099 CORS_ORIGIN=http://localhost:3005 npm run dev
  //   cd frontend && NEXT_PUBLIC_API_URL=http://localhost:8099/api npm run dev -- -p 3005
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
