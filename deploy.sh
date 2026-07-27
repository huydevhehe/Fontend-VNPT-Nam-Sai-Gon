#!/usr/bin/env bash
# Script deploy thủ công cho VNPT Nam Sài Gòn FE trên server (chạy bằng nohup, chưa có BE).
# Cách dùng: ./deploy.sh   (chạy trên server, trong thư mục project)
# Tự động: pull code mới -> install -> build -> kill bản cũ đang chạy (nohup) -> chạy lại.

set -e

PORT=3000

BEFORE_COMMIT=$(git rev-parse HEAD)

echo "==> Pulling latest code..."
git pull

AFTER_COMMIT=$(git rev-parse HEAD)

if git diff --name-only "$BEFORE_COMMIT" "$AFTER_COMMIT" | grep -qE "^(package\.json|package-lock\.json)$"; then
  echo "==> package.json changed, installing dependencies..."
  npm install
else
  echo "==> package.json unchanged, skipping npm install."
fi

echo "==> Building production..."
npm run build

echo "==> Stopping old process on port $PORT (if any)..."
OLD_PIDS=$(lsof -ti:$PORT || true)
if [ -n "$OLD_PIDS" ]; then
  echo "$OLD_PIDS" | xargs kill
  sleep 2
  # Nếu vẫn còn sống sau 2s (không chịu tắt) thì buộc kill -9
  STILL_ALIVE=$(lsof -ti:$PORT || true)
  if [ -n "$STILL_ALIVE" ]; then
    echo "$STILL_ALIVE" | xargs kill -9
    sleep 1
  fi
  echo "==> Killed old process(es): $OLD_PIDS"
else
  echo "==> No process running on port $PORT."
fi

echo "==> Starting app with nohup..."
nohup npm start > nohup.out 2>&1 &
disown

echo "==> Done. App is running again on port $PORT."
echo "==> Check logs with: tail -f nohup.out"
