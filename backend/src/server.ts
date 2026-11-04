import express from "express";
import cors from "cors";
import { config } from "./config/index.js";

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
    timestamp: new Date().toISOString(),
  });
});

// Mock Initial Modules
app.get("/api/crm/stats", (_req, res) => {
  res.json({
    collectionRateImmediate: 98.0,
    collectionRateCumulative: 78.0,
    renewalRateCurrentMonth: 57.0,
    renewalRatePreviousMonth: 65.0,
    totalLeads: 320,
    leadsConverted: 184,
    contractsCreated: 126,
    contractsDeployedWithRevenue: 89,
  });
});

app.listen(config.port, () => {
  console.log(`[VNPT CRM Backend] Server running on http://localhost:${config.port}`);
});

