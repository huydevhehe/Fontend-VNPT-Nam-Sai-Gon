import express from "express";
import cors from "cors";
import { config } from "./config/index.js";
import { initDatabase } from "./database/db.js";
import { debtRouter } from "./modules/debt/debt.controller.js";
import { renewalRouter } from "./modules/renewal/renewal.controller.js";
import { customerRouter } from "./modules/customer/customer.controller.js";
import { territoryRouter } from "./modules/territory/territory.controller.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.controller.js";
import { authRouter } from "./modules/auth/auth.controller.js";
import { serviceRouter } from "./modules/service/service.controller.js";
import { leadRouter } from "./modules/lead/lead.controller.js";
import { contractRouter } from "./modules/contract/contract.controller.js";
import { commissionRouter } from "./modules/commission/commission.controller.js";
import { staffRouter } from "./modules/staff/staff.controller.js";
import { taskRouter } from "./modules/task/task.controller.js";
import { reportRouter } from "./modules/report/report.controller.js";
import { settingsRouter } from "./modules/settings/settings.controller.js";
import { ctvRouter } from "./modules/ctv/ctv.controller.js";
import { ctvAccountsRouter } from "./modules/ctv/ctv-accounts.controller.js";
import { publicRouter } from "./modules/public/public.controller.js";
import { kpiRouter } from "./modules/kpi/kpi.controller.js";
import { reminderRouter } from "./modules/reminder/reminder.controller.js";
import { startReminderScheduler } from "./modules/reminder/reminder-scheduler.js";
import { requireAuth } from "./middleware/require-auth.js";
import { requireAdmin, requireCtv, requireStaff } from "./middleware/require-role.js";

const app = express();

// "trust proxy" = 1: Express tin entry NGOÀI CÙNG BÊN PHẢI của header
// X-Forwarded-For là IP client thật (dùng cho rate limiter theo req.ip).
// Giả định này chỉ an toàn khi:
//   (1) Node chỉ được truy cập qua ĐÚNG MỘT lớp reverse proxy (nginx) — proxy
//       đó phải tự ghi đè X-Forwarded-For (dùng $proxy_add_x_forwarded_for
//       hoặc $remote_addr trong site conf, không đọc thẳng giá trị client gửi
//       lên), hoặc không có hop nào phía trước proxy mà client có thể chạm tới;
//   (2) cổng Node (nội bộ, phía sau proxy) KHÔNG được mở trực tiếp ra Internet.
// Nếu một trong hai điều kiện trên sai, client có thể tự gửi X-Forwarded-For
// giả để bypass mọi rate limiter theo IP trong app này (leads, register-ctv,
// tra mã giới thiệu, và login) — xem Task 10 ở plan để xác nhận trên server.
app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      return callback(null, config.corsOrigin === "*" ? true : origin === config.corsOrigin);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "VNPT CRM Nam Sài Gòn Backend API",
    version: "2.0.0",
    database: "PostgreSQL",
    timestamp: new Date().toISOString(),
  });
});

// Mount CRM API Modules
// Mở công khai: đăng nhập và các endpoint public (form, đăng ký CTV).
app.use("/api/auth", authRouter);
app.use("/api/public", publicRouter);

// Khu vực nhân viên: phải đăng nhập và không phải CTV.
app.use("/api/debts", requireAuth, requireStaff, debtRouter);
app.use("/api/renewals", requireAuth, requireStaff, renewalRouter);
app.use("/api/customers", requireAuth, requireStaff, customerRouter);
app.use("/api/territories", requireAuth, requireStaff, territoryRouter);
app.use("/api/dashboard", requireAuth, requireStaff, dashboardRouter);
app.use("/api/services", requireAuth, requireStaff, serviceRouter);
app.use("/api/leads", requireAuth, requireStaff, leadRouter);
app.use("/api/contracts", requireAuth, requireStaff, contractRouter);
app.use("/api/commissions", requireAuth, requireStaff, commissionRouter);
app.use("/api/staff", requireAuth, requireStaff, staffRouter);
app.use("/api/tasks", requireAuth, requireStaff, taskRouter);
app.use("/api/reports", requireAuth, requireStaff, reportRouter);
app.use("/api/settings", requireAuth, requireStaff, settingsRouter);
app.use("/api/kpi", requireAuth, requireStaff, kpiRouter);
app.use("/api/reminders", requireAuth, requireAdmin, reminderRouter);

// Khu vực CTV và quản lý tài khoản CTV.
app.use("/api/ctv", requireAuth, requireCtv, ctvRouter);
app.use("/api/ctv-accounts", requireAuth, requireAdmin, ctvAccountsRouter);

// Initialize DB and Start Server
async function start() {
  try {
    await initDatabase();
    startReminderScheduler();
    app.listen(config.port, () => {
      console.log(`[VNPT CRM Backend] Server is running on http://localhost:${config.port}`);
    });
    if (Number(config.port) !== 8087) {
      // `listen()` báo lỗi (vd cổng 8087 đang bị chiếm bởi một tiến trình
      // backend khác) qua event 'error' bất đồng bộ, không ném exception nên
      // try/catch không bắt được — phải đăng ký handler 'error' mới "ignore"
      // được thật, nếu không tiến trình sẽ crash vì unhandled error event.
      const compatServer = app.listen(8087, () => {
        console.log("[VNPT CRM Backend] Also listening on http://localhost:8087");
      });
      compatServer.on("error", () => {
        // Cổng 8087 có thể đang bị chiếm (bởi backend ở worktree khác) — bỏ qua.
      });
    }
  } catch (error) {
    console.error("[VNPT CRM Backend] Failed to start server:", error);
    process.exit(1);
  }
}

start();
