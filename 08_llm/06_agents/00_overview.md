---
title: Claude Code 팀 자동화
domain: llm
category: agents
tags: [llm, agents]
level: intermediate
status: published
created: 2026-05-14
updated: 2026-05-14
velog: false
related: []
---

# Claude Code 팀 자동화

Windows WSL + TMUX 환경에서 Claude Code CLI를 활용한 팀 자동화 학습 정리.

## 학습 목표

- WSL + TMUX 기반 Claude Code 개발 환경 구성
- Claude Code 훅(Hooks), 슬래시 커맨드, MCP 서버 활용
- 팀 워크플로우 자동화 패턴 습득

## 목차

| 폴더 | 내용 |
|------|------|
| `01_wsl-tmux-setup/` | WSL2 + TMUX 환경 구성, Claude Code 설치 |
| `02_claude-code-basics/` | CLI 기본 사용법, 설정(settings.json), 권한 |
| `03_team-workflows/` | 훅, 슬래시 커맨드, 자동화 패턴 |
| `04_experiments/` | 직접 만들어본 자동화 실험 |

## 환경

- OS: Windows 11 + WSL2 (Ubuntu)
- 터미널 멀티플렉서: TMUX
- Claude Code: CLI (`claude` 명령어)
