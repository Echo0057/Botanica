-- Botanica 快速启动器:确保本地服务器在跑,然后打开浏览器
do shell script "/bin/bash /Users/echo/Botanica/scripts/start-dev-server.sh >/dev/null 2>&1"
delay 2
open location "http://127.0.0.1:5173"
