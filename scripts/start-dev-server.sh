#!/bin/bash
# 确保 Botanica 本地开发服务器在跑(nohup 后台常驻)
APP_DIR="/Users/echo/Botanica"
URL="http://127.0.0.1:5173"

# 让 node / npm 可用(nvm 管理)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" >/dev/null 2>&1
if ! command -v npm >/dev/null 2>&1; then
  export PATH="/Users/echo/.nvm/versions/node/v22.23.2/bin:$PATH"
fi

cd "$APP_DIR" || exit 1

# 若没在跑,则后台启动 vite
if ! curl -s -o /dev/null --max-time 1 "$URL"; then
  nohup npm run dev -- --host 127.0.0.1 --port 5173 >/tmp/botanica-vite.log 2>&1 &
  disown || true
fi
