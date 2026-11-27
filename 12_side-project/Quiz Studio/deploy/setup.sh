#!/bin/bash
# Oracle Cloud Ubuntu VM 초기 세팅 스크립트
# 실행: bash setup.sh

set -e

echo "=== 1. 시스템 업데이트 ==="
sudo apt update && sudo apt upgrade -y

echo "=== 2. Node.js 20 설치 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo "=== 3. PM2 설치 (프로세스 관리자) ==="
sudo npm install -g pm2

echo "=== 4. 방화벽 포트 3000 열기 ==="
sudo iptables -I INPUT -p tcp --dport 3000 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo apt install -y iptables-persistent
sudo netfilter-persistent save

echo "=== 5. 앱 폴더로 이동 및 패키지 설치 ==="
cd ~/quiz-app
npm install --omit=dev

echo "=== 6. PM2로 앱 시작 ==="
pm2 start server.js --name quiz-app
pm2 save
pm2 startup | tail -1 | sudo bash

echo ""
echo "✅ 완료! 서버가 포트 3000에서 실행 중입니다."
echo "   접속: http://$(curl -s ifconfig.me):3000"
