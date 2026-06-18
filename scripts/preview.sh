#!/usr/bin/env bash
# preview.sh — 由控制面 deploy_preview.sh 在 quality-plane 调用
# 在 $PREVIEW_PORT（默认 8080）起服务供验收
set -euo pipefail

PORT="${PREVIEW_PORT:-8080}"
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_DIR"

echo "[preview] Starting preview on :${PORT} from ${APP_DIR}"

# ---- 检测项目类型 ----
if [ -f "package.json" ]; then
  echo "[preview] Node.js project detected"

  if [ -f "yarn.lock" ]; then
    yarn install --frozen-lockfile
  else
    npm ci
  fi

  if grep -q '"build"' package.json 2>/dev/null; then
    npm run build
    pkill -f "serve -l ${PORT}" 2>/dev/null || true
    npx serve -l "${PORT}" -s dist >/tmp/preview.log 2>&1 &
    echo "[preview] Static preview up on :${PORT}"
  else
    # Frontend dev server or API server
    if grep -q '"dev"' package.json 2>/dev/null; then
      npm run dev -- --port "${PORT}" --host 0.0.0.0 >/tmp/preview.log 2>&1 &
      echo "[preview] Dev server up on :${PORT}"
    else
      npm start -- --port "${PORT}" >/tmp/preview.log 2>&1 &
      echo "[preview] Started npm start on :${PORT}"
    fi
  fi

elif [ -f "requirements.txt" ] || [ -f "Pipfile" ]; then
  echo "[preview] Python project detected"
  [ ! -d ".venv" ] && python3 -m venv .venv
  source .venv/bin/activate
  pip install -r requirements.txt 2>/dev/null || pip install -e .
  pkill -f "uvicorn" 2>/dev/null || true
  nohup uvicorn app.main:app --host 0.0.0.0 --port "${PORT}" >/tmp/preview.log 2>&1 &
  echo "[preview] FastAPI/ASGI preview up on :${PORT}"

elif [ -f "docker-compose.yml" ] || [ -f "Dockerfile" ]; then
  echo "[preview] Docker project detected"
  docker compose up -d --build
  echo "[preview] Docker preview up on :${PORT}"

else
  echo "[preview] Unknown project type — serving static files"
  pkill -f "python3 -m http.server ${PORT}" 2>/dev/null || true
  nohup python3 -m http.server "${PORT}" --bind 0.0.0.0 >/tmp/preview.log 2>&1 &
  echo "[preview] Static file server up on :${PORT}"
fi

# Print status
sleep 2
if pgrep -f "preview.log" >/dev/null 2>&1; then
  echo "[preview] OK — process running"
else
  echo "[preview] WARNING — process may have exited, check /tmp/preview.log"
fi
echo "[preview] PID: $(pgrep -f 'serve\|uvicorn\|http.server\|npm start\|npm run' | head -3 | tr '\n' ' ')"
