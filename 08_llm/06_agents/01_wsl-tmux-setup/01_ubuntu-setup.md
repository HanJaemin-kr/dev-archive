---
title: Ubuntu / WSL2 환경 구성
domain: llm
category: agents
tags: [llm, agents, wsl-tmux-setup]
level: intermediate
status: published
created: 2026-05-14
updated: 2026-05-14
velog: false
related: []
---

# Ubuntu / WSL2 환경 구성

## 설치 순서

### 1. Node.js (nvm 방식 권장)

```bash
# nvm 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 셸 재시작 후
nvm install --lts
nvm use --lts
node -v   # v20.x.x 확인
```

### 2. 기본 도구

```bash
sudo apt update && sudo apt install -y \
  git \
  curl \
  wget \
  unzip \
  build-essential
```

### 3. Claude Code

```bash
npm install -g @anthropic-ai/claude-code

# 설치 확인
claude --version
```

### 4. TMUX

```bash
sudo apt install -y tmux

# 설치 확인
tmux -V   # tmux 3.x 확인
```

---

## WSL2 특이사항

- Windows 터미널(Windows Terminal) 사용 권장 — 폰트·색상 지원 좋음
- 파일 경로: `/mnt/c/Users/...` 로 Windows 드라이브 접근 가능
- TMUX 세션은 WSL 프로세스가 살아있는 한 유지됨 (Windows 재부팅 시 초기화)
