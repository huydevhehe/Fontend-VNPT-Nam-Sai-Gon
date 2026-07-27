#!/usr/bin/env bash
# Script deploy thủ công cho VNPT Nam Sài Gòn FE trên server (chưa có BE).
# Cách dùng: ./deploy.sh   (chạy trên server, trong thư mục project)
# Yêu cầu: đã cài Node.js + PM2 (npm install -g pm2) trên server.

set -e

echo "==> Pulling latest code..."
git pull

echo "==> Installing dependencies..."
npm install

echo "==> Building production..."
npm run build

echo "==> Restarting app with PM2..."
if pm2 describe vnpt-nam-sai-gon-fe > /dev/null 2>&1; then
  pm2 restart vnpt-nam-sai-gon-fe
else
  pm2 start ecosystem.config.js
fi

pm2 save

echo "==> Done. App is running via PM2 as 'vnpt-nam-sai-gon-fe'."
echo "==> Check logs with: pm2 logs vnpt-nam-sai-gon-fe"
