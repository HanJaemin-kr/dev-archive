---
title: GitHub Actions + SSH 배포 파이프라인 (자동 롤백 포함)
domain: infra
category: CI-CD
tags: [infra, ci-cd, github-actions, git-flow, docker-compose, deploy, rollback, healthcheck]
level: intermediate
status: published
created: 2026-11-27
updated: 2026-11-27
velog: false
related: ["[[nginx-reverse-proxy-subpath]]", "[[nginx-docker-ops-pitfalls]]"]
---

# GitHub Actions + SSH 배포 파이프라인

> 사내 서버(Docker Compose) 2대 — 개발/운영 — 에 GitHub Actions로 CI/CD를 붙이며 설계한 내용을 일반화한 정리.

## 핵심 개념

### 브랜치 전략 (git-flow 축약)
```
master   ──────────────▶ 운영 서버 (수동 배포)
            ↑ PR + 리뷰
develop  ──────────────▶ 개발 서버 (push 시 자동 배포)
            ↑ PR (CI 통과 필수)
feature/*   hotfix/* (master에서 분기 → master와 develop 양쪽에 반영)
```

### 워크플로 3분리
| 파일 | 트리거 | 역할 |
|---|---|---|
| `ci.yml` | develop/main 대상 PR (+경로 필터) | 타입체크·린트·빌드. 실패 시 merge 차단 |
| `cd-development.yml` | develop push | 검증 빌드 → SSH로 개발서버 배포 스크립트 실행 |
| `cd-production.yml` | `workflow_dispatch` (배포 사유 입력) | SSH로 운영 배포 스크립트 → 성공 시 릴리즈 태그 |

### 설계 포인트
- **CI 분리**: CD에서도 빌드하지만 PR 단계에서 미리 막아야 develop이 깨지지 않는다.
- **Actions 빌드 + 서버 빌드 이중 실행**: Actions는 환경 독립 조기검출, 서버 빌드는 실제 컨테이너 환경의 산출물.
- **운영은 수동 트리거**: GitHub Free 플랜의 private 레포는 Environment **Required reviewers**를 쓸 수 없다. 그래서 `push: master` 자동배포 대신 `workflow_dispatch` + 사유 입력을 승인 게이트로 사용.
- **concurrency**: CI는 같은 PR의 이전 실행 취소(`cancel-in-progress: true`), 배포는 겹치지 않게 큐잉(`false`).
- **운영만 자동 롤백**: 운영은 가용성이 최우선, 개발은 빠른 반복이 우선이라 롤백 없음.
- **릴리즈 태그** `prod-YYYYMMDD-sha7`: 롤백 기준점이 된다.

## 예제 코드

### CI (PR 검사)
```yaml
name: CI
on:
  pull_request:
    branches: [develop, main]
    paths: ['frontend/**', 'src/**', 'package*.json', 'tsconfig*.json']
concurrency:
  group: ci-${{ github.head_ref }}
  cancel-in-progress: true
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run build --if-present
```

### CD (운영, 수동 + 태그)
```yaml
name: Deploy Production
on:
  workflow_dispatch:
    inputs:
      reason: { description: '배포 사유', required: true, type: string }
concurrency: { group: deploy-prod, cancel-in-progress: false }
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production          # Deployment branches: master만 허용
    steps:
      - uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.PROD_SSH_HOST }}
          username: ${{ secrets.PROD_SSH_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          command_timeout: 15m
          script: /home/deploy/deploy-prod.sh
      - uses: actions/github-script@v7
        with:
          script: |
            const tag = `prod-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${context.sha.slice(0,7)}`
            await github.rest.git.createRef({ ...context.repo, ref: `refs/tags/${tag}`, sha: context.sha })
```

### 운영 배포 스크립트 — 헬스체크 + 자동 롤백
```sh
#!/bin/sh
set -e
APP=web-server
PREV_IMAGE=$(docker inspect --format='{{.Image}}' "$APP" 2>/dev/null || echo "")  # [0] 롤백 기준

git fetch origin && git reset --hard origin/master                # [1]
docker compose build app --no-cache                                # [2] 기존 컨테이너는 서비스 중
docker compose up -d app                                           # [3] 교체

for i in $(seq 1 12); do                                           # [4] 최대 60초
  [ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:6001/health)" = "200" ] && OK=1 && break
  sleep 5
done

if [ -z "$OK" ]; then                                              # 실패 → 이전 이미지로 복구
  docker stop "$APP" || true; docker rm "$APP" || true
  docker run -d --name "$APP" --network app-net -p 6001:6001 --restart unless-stopped "$PREV_IMAGE"
  exit 1                                                           # Actions에 실패 표시
fi
docker exec nginx nginx -s reload
```
- 주의: 롤백을 `docker run`으로 하면 compose 정의(env·volume·네트워크)와 어긋나기 쉽다. 이미지에 태그(`:prev`)를 달고 compose로 되돌리는 편이 재현성이 좋다.
- `git reset --hard`는 서버의 미커밋 수정을 날린다 — 서버에서 직접 고치는 습관이 있다면 위험.
- "push 했는데 사이트가 그대로"는 대개 배포 스크립트가 안 돌았거나(트리거·워크플로 파일이 해당 브랜치에 없음), 컨테이너가 옛 이미지/옛 dist를 서빙하는 경우.

### 핫픽스 흐름
```bash
git checkout master && git pull
git checkout -b hotfix/login-null
# 수정·커밋 → master로 PR → merge → Actions에서 수동 배포
git checkout develop && git merge hotfix/login-null   # develop에도 반드시 반영
```

## 면접 예상 질문

- **Q. CI와 CD를 왜 분리했나?**
  A. PR 단계에서 오류를 막아 통합 브랜치를 항상 배포 가능 상태로 유지하기 위해. CD는 배포만 책임진다.
- **Q. 운영 배포 승인 게이트를 어떻게 구현했나?**
  A. 플랜 제약으로 Required reviewers를 못 써서 수동 `workflow_dispatch`와 사유 입력, environment의 배포 브랜치 제한으로 대체했다.
- **Q. 무중단/롤백은 어떻게 보장하나?**
  A. 빌드는 기존 컨테이너가 서비스 중일 때 수행, 교체 후 헬스체크, 실패 시 저장해 둔 이전 이미지로 복구. 더 나아가면 블루그린으로 트래픽 전환.
- **Q. hotfix를 develop에도 반영해야 하는 이유는?**
  A. 안 하면 다음 develop→master 머지 때 수정이 사라지는 회귀가 생긴다.
