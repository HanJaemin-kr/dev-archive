---
title: 코딩 테스트 학습 계획 (JS/Node.js)
domain: coding
category: notes
tags: [coding, notes]
level: intermediate
status: published
created: 2026-05-16
updated: 2026-05-16
velog: true
related: []
---

# 코딩 테스트 학습 계획 (JS/Node.js)

## 목표
- 국내: 카카오 / 네이버 / 라인 / 토스 수준 대비
- 해외: LeetCode Medium 안정적으로 풀기

---

## Phase 1 — 기초 다지기 (4주)

### Week 1: 배열 · 문자열 · 해시맵
- 투포인터, 슬라이딩 윈도우
- 빈도 카운팅 (Map/Object)
- **목표**: Programmers Level1 전부, LeetCode Easy 20문제

### Week 2: 스택 · 큐 · 재귀
- 괄호 유효성, 모노토닉 스택
- 재귀 → 반복 전환 연습
- **목표**: Programmers Level2 스택/큐 섹션, LeetCode Easy 10 + Medium 5

### Week 3: 정렬 · 이분탐색
- 파라메트릭 서치 (이분탐색으로 최적값 찾기)
- 커스텀 비교함수
- **목표**: LeetCode Medium 이분탐색 10문제

### Week 4: 트리 · BFS · DFS
- 트리 순회 (전위/중위/후위)
- 레벨 탐색 (BFS), 경로 탐색 (DFS)
- **목표**: Programmers Level2 BFS/DFS 섹션 전부

---

## Phase 2 — 핵심 알고리즘 (4주)

### Week 5~6: 동적 프로그래밍
- 1D DP → 2D DP → 메모이제이션
- 대표 유형: 배낭, LCS, LIS, 동전 거스름돈
- **목표**: LeetCode DP Tag Medium 15문제

### Week 7: 그래프
- 다익스트라, 플로이드-워셜
- 위상 정렬, Union-Find
- **목표**: Programmers Level3 그래프 섹션

### Week 8: 백트래킹 · 그리디
- N-Queen, 순열/조합 생성
- 그리디 증명 연습
- **목표**: LeetCode Medium 백트래킹 10문제

---

## Phase 3 — 실전 훈련 (상시)

- **주 2회**: 모의 테스트 (`04_mock-tests/` 에 기록)
  - 90분 타이머, 실제 시험 환경 재현
- **매일 1문제**: 취약 유형 집중 공략
- **주 1회**: 오답 노트 정리 (`06_notes/`)

---

## 유형별 우선순위

| 우선순위 | 유형              | 이유                              |
|----------|-------------------|-----------------------------------|
| ★★★★★ | BFS/DFS           | 카카오/네이버 단골                |
| ★★★★★ | DP                | 거의 모든 기업 출제               |
| ★★★★☆ | 이분탐색          | 최적화 문제 핵심                  |
| ★★★★☆ | 해시맵            | 빠른 구현, 자주 출제              |
| ★★★☆☆ | 그리디            | 증명이 까다롭지만 높은 출제 빈도  |
| ★★★☆☆ | 투포인터          | 배열 문제 최적화 필수             |
| ★★☆☆☆ | Union-Find        | 그래프 문제 효율화                |
| ★★☆☆☆ | 세그먼트 트리     | 고급 문제에서 등장                |

---

## JS 코딩 테스트 주의사항

```js
// 1. 큰 수 연산 → BigInt 사용
const big = BigInt("99999999999999999999");

// 2. Array.sort() 는 기본 문자열 정렬 → 반드시 비교함수 전달
[10, 9, 2].sort((a, b) => a - b);

// 3. 큐를 배열로 쓰면 shift() O(N) → 직접 구현 또는 인덱스 활용

// 4. 재귀 깊이 제한 (~10,000) → 반복 DFS 또는 트램폴린 패턴

// 5. 입력 파싱 (Node.js stdin)
const input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
```
