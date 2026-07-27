#!/usr/bin/env bash
# Script deploy thủ công cho VNPT Nam Sài Gòn FE trên server (chạy bằng nohup, chưa có BE).
# Cách dùng: ./deploy.sh   (chạy trên server, trong thư mục project)
# Tự động: pull code mới -> install -> build -> kill bản cũ đang chạy (nohup) -> chạy lại.

set -e

PORT=3000

echo "==> Pulling latest code..."
git pull

echo "==> Installing dependencies..."
npm install

echo "==> Building production..."
npm run build

echo "==> Stopping old process on port $PORT (if any)..."
OLD_PID=$(lsof -ti:$PORT || true)
if [ -n "$OLD_PID" ]; then
  kill "$OLD_PID"
  sleep 2
  echo "==> Killed old process (PID $OLD_PID)."
else
  echo "==> No process running on port $PORT."
fi

echo "==> Starting app with nohup..."
nohup npm start > nohup.out 2>&1 &
disown

echo "==> Done. App is running again on port $PORT."
echo "==> Check logs with: tail -f nohup.out"
