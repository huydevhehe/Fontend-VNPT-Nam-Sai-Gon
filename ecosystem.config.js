// Cấu hình PM2 để chạy Next.js production trên server (chưa có BE, chỉ FE này).
// Dùng: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: "vnpt-nam-sai-gon-fe",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
