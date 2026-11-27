---
title: TMUX 기본 사용법
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

# TMUX 기본 사용법

## TMUX를 쓰는 이유

### 핵심 특징

| 특징 | 설명 |
|------|------|
| **세션 유지** | 터미널을 닫거나 SSH 연결이 끊겨도 세션이 백그라운드에서 계속 실행된다 |
| **다중 파인** | 하나의 터미널에서 여러 창을 동시에 띄울 수 있다 |
| **스크립터블** | `send-keys`, `capture-pane` 등으로 외부에서 파인을 원격 제어할 수 있다 |
| **어디서든 재접속** | `tmux attach`로 다른 기기나 다른 터미널에서 같은 세션에 붙을 수 있다 |

### 팀 에이전트에서 TMUX가 필요한 이유

```
일반 터미널:   claude 1개 실행  → 하나의 컨텍스트, 순차 처리
TMUX:          파인마다 claude  → 역할 분리, 병렬 처리
```

- **독립된 컨텍스트** — 파인별로 Claude Code 인스턴스가 분리되어 있어 역할 간 컨텍스트가 섞이지 않는다
- **병렬 실행** — PM이 설계하는 동안 개발자가 구현을 시작할 수 있다
- **자동화 가능** — 팀장이 `send-keys`로 여러 팀원에게 동시에 지시를 내릴 수 있다
- **세션 지속** — 로컬을 벗어나 Remote-Control로 붙어도 세션이 그대로 살아있다

---

## 구조

```
세션 (Session)
  └── 윈도우 (Window)   ← 탭 개념
        └── 파인 (Pane) ← 화면 분할 단위, 각각 독립된 셸
```

팀 에이전트에서는 **하나의 세션 + 하나의 윈도우 + 여러 파인** 구조를 주로 사용한다.

---

## 세션 관리

```bash
# 새 세션 생성 (포어그라운드)
tmux new-session -s team

# 새 세션 생성 (백그라운드)
tmux new-session -d -s team

# 세션 목록 확인
tmux ls

# 세션 접속
tmux attach -t team

# 세션 분리 (백그라운드로 전환, 세션 유지)
# 단축키: Ctrl+B → D

# 세션 종료
tmux kill-session -t team
```

---

## 파인 분할

모든 단축키는 `Ctrl+B` 를 먼저 누른 뒤 키를 입력한다.

| 단축키 | 동작 |
|--------|------|
| `Ctrl+B %` | 좌우 분할 |
| `Ctrl+B "` | 상하 분할 |
| `Ctrl+B 방향키` | 파인 이동 |
| `Ctrl+B z` | 현재 파인 전체화면 토글 |
| `Ctrl+B x` | 현재 파인 종료 |
| `Ctrl+B Ctrl+방향키` | 파인 크기 조절 |

---

## 스크립트에서 파인 제어

팀 에이전트의 핵심 — 팀장이 팀원 파인에 명령을 전송하는 방법이다.

```bash
# 형식: 세션이름:윈도우번호.파인번호
# team 세션의 0번 윈도우, 1번 파인

# 텍스트만 전송 (Enter 없음)
tmux send-keys -t team:0.1 "ls -la"

# 명령 실행 (Enter 포함)
tmux send-keys -t team:0.1 "ls -la" Enter

# 파인 화면 텍스트 읽기 (결과 확인용)
tmux capture-pane -t team:0.1 -p
```

실제 팀장 → 팀원 지시 예시:

```bash
tmux send-keys -t team:0.1 "민준아, 결제 모듈 설계안 작성해줘" Enter
tmux send-keys -t team:0.4 "서연아, 설계안 보고 구현 시작해" Enter
tmux send-keys -t team:0.5 "태양아, 구현 끝나면 리뷰 부탁해" Enter
```

---

## 레이아웃 자동 정렬

파인이 많아지면 레이아웃 명령으로 정렬한다.

```bash
# 좌우 균등
tmux select-layout -t team:0 even-horizontal

# 상하 균등
tmux select-layout -t team:0 even-vertical

# 왼쪽 크게 + 나머지 세로 배열 (팀장을 왼쪽에 크게 둘 때 유용)
tmux select-layout -t team:0 main-vertical

# 격자 배열 (6명 팀에 적합)
tmux select-layout -t team:0 tiled
```

---

## 파인 제목 설정

누가 어느 파인인지 한눈에 보이게 한다.

```bash
# 제목 표시 활성화
tmux set-option -t team pane-border-status top
tmux set-option -t team pane-border-format " #{pane_title} "

# 각 파인에 이름 부여
tmux select-pane -t team:0.0 -T "쭌 (팀장)"
tmux select-pane -t team:0.1 -T "민준 (PM)"
tmux select-pane -t team:0.2 -T "지훈 (리서쳐)"
tmux select-pane -t team:0.3 -T "수아 (디자이너)"
tmux select-pane -t team:0.4 -T "서연 (개발자)"
tmux select-pane -t team:0.5 -T "태양 (리뷰어)"
```

결과:

```
┌─ 쭌 (팀장) ──┬─ 민준 (PM) ──┬─ 지훈 (리서쳐) ─┐
│  claude      │  claude      │  claude          │
├─ 수아 (디자이너) ┼─ 서연 (개발자) ┼─ 태양 (리뷰어) ─┤
│  claude      │  claude      │  claude          │
└──────────────┴──────────────┴──────────────────┘
```

---

## 실습: 2파인 세션 만들기

```bash
# 1. 백그라운드로 세션 생성
tmux new-session -d -s practice

# 2. 좌우로 파인 분할
tmux split-window -t practice:0.0 -h

# 3. 각 파인에 명령 실행
tmux send-keys -t practice:0.0 "echo 'Pane 0 작동 중'" Enter
tmux send-keys -t practice:0.1 "echo 'Pane 1 작동 중'" Enter

# 4. 접속해서 확인
tmux attach -t practice

# 5. 정리
tmux kill-session -t practice
```
