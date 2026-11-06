#!/usr/bin/env bash
# Script deploy cho VNPT Nam Sài Gòn BE trên server dùng PM2.
# Cách dùng: chạy trong thư mục backend/ trên server: ./deploy.sh
# Tự động: pull code mới -> install (nếu package.json đổi) -> build -> restart PM2 -> health check.

set -e

PORT=3005
APP_NAME="vnpt-backend-api"

cd "$(dirname "$0")/.."

BEFORE_COMMIT=$(git rev-parse HEAD)

echo "==> Pulling latest code..."
git pull

AFTER_COMMIT=$(git rev-parse HEAD)

cd backend

if git diff --name-only "$BEFORE_COMMIT" "$AFTER_COMMIT" | grep -qE "^backend/(package\.json|package-lock\.json)$"; then
  echo "==> package.json changed, installing dependencies..."
  npm install
else
  echo "==> package.json unchanged, skipping npm install."
fi

echo "==> Building production..."
npm run build

echo "==> Restarting app via PM2 on port $PORT..."
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
  pm2 restart "$APP_NAME" --update-env
else
  pm2 start npm --name "$APP_NAME" -- start
fi
pm2 save

echo "==> Waiting for server to respond on port $PORT..."
READY=0
for i in $(seq 1 15); do
  if curl -s -o /dev/null -m 2 "http://localhost:$PORT/api/health"; then
    READY=1
    break
  fi
  sleep 1
done

if [ "$READY" -eq 1 ]; then
  echo "==> Done. Backend is running again on port $PORT (pm2 name: $APP_NAME)."
  curl -s "http://localhost:$PORT/api/health"
  echo
else
  echo "==> ERROR: server did not respond on port $PORT after 15s. Last logs:"
  pm2 logs "$APP_NAME" --lines 30 --nostream
  exit 1
fi

echo "==> Check logs with: pm2 logs $APP_NAME"
