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

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "VNPT CRM Nam Sài Gòn Backend API",
    version: "2.0.0",
    database: "SQLite (crm.sqlite)",
    timestamp: new Date().toISOString(),
  });
});

// Mount CRM API Modules
app.use("/api/auth", authRouter);
app.use("/api/debts", debtRouter);
app.use("/api/renewals", renewalRouter);
app.use("/api/customers", customerRouter);
app.use("/api/territories", territoryRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/services", serviceRouter);
app.use("/api/leads", leadRouter);
app.use("/api/contracts", contractRouter);
app.use("/api/commissions", commissionRouter);
app.use("/api/staff", staffRouter);

// Initialize DB and Start Server
async function start() {
  try {
    await initDatabase();
    app.listen(config.port, () => {
      console.log(`[VNPT CRM Backend] Server is running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("[VNPT CRM Backend] Failed to start server:", error);
    process.exit(1);
  }
}

start();
