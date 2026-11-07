import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 8087,
  corsOrigin: process.env.CORS_ORIGIN || "*",
  jwtSecret: process.env.JWT_SECRET || "vnpt-crm-nam-sai-gon-dev-secret-key",
  databaseUrl: process.env.DATABASE_URL || "",
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  zalo: {
    oaId: process.env.ZALO_OA_ID || "",
    oaToken: process.env.ZALO_OA_TOKEN || "",
  },
};

