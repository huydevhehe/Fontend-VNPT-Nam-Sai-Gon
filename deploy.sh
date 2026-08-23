#!/usr/bin/env bash
# Script deploy thủ công cho VNPT Nam Sài Gòn FE trên server (chạy bằng nohup, chưa có BE).
# Cách dùng: ./deploy.sh   (chạy trên server, trong thư mục project)
# Tự động: pull code mới -> install -> kill bản cũ đang chạy (nohup) -> build -> chạy lại.
#
# Lưu ý: dừng server cũ TRƯỚC khi build (không build song song với server đang chạy)
# để tránh lỗi 500 do server cũ đọc phải file .next đang bị build mới ghi đè dở dang.

set -e

PORT=8010

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

# lsof không nhận diện được process trên server này (không hiện gì dù cổng đang bị chiếm),
# nên dò bằng `ss` (đáng tin cậy hơn) thay vì lsof.
find_port_pids() {
  ss -ltnp 2>/dev/null | grep ":$PORT " | sed -n 's/.*pid=\([0-9]\+\).*/\1/p' | sort -u
}

echo "==> Stopping old process on port $PORT (if any)..."
OLD_PIDS=$(find_port_pids)
if [ -n "$OLD_PIDS" ]; then
  echo "$OLD_PIDS" | xargs kill -9
  sleep 2
  STILL_ALIVE=$(find_port_pids)
  if [ -n "$STILL_ALIVE" ]; then
    echo "==> ERROR: port $PORT still occupied by PID(s): $STILL_ALIVE — aborting."
    exit 1
  fi
  echo "==> Killed old process(es): $OLD_PIDS"
else
  echo "==> No process running on port $PORT."
fi

echo "==> Building production..."
npm run build

echo "==> Starting app with nohup on port $PORT..."
PORT=$PORT nohup npm start > nohup.out 2>&1 &
disown

# Đợi và xác nhận server mới thực sự lên (tránh báo "Done" giả khi start thất bại,
# ví dụ EADDRINUSE do vẫn còn tiến trình cũ chiếm cổng).
echo "==> Waiting for server to respond on port $PORT..."
READY=0
for i in $(seq 1 15); do
  if curl -s -o /dev/null -m 2 "http://localhost:$PORT/"; then
    READY=1
    break
  fi
  sleep 1
done

if [ "$READY" -eq 1 ]; then
  echo "==> Done. App is running again on port $PORT."
else
  echo "==> ERROR: server did not respond on port $PORT after 15s. Last log lines:"
  tail -30 nohup.out
  exit 1
fi

echo "==> Check logs with: tail -f nohup.out"
