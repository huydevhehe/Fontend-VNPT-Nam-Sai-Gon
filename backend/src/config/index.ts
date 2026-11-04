import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 8087,
  corsOrigin: process.env.CORS_ORIGIN || "*",
  jwtSecret: process.env.JWT_SECRET || "vnpt-crm-nam-sai-gon-dev-secret-key",
};

