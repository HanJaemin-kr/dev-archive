# Coding Test Study (JS/Node.js)

> 카카오 / 네이버 코딩 테스트 합격을 목표로 하는 JS 풀이 저장소

---

## 시작하기

### 1. 환경 확인
```bash
node --version   # v18 이상 권장
```

### 2. 새 문제 풀기
```bash
# 템플릿을 복사해서 시작
cp 05_templates/problem-template.js 03_platforms/programmers/level1/문제이름.js
```

### 3. 풀이 실행
```bash
node 03_platforms/programmers/level1/문제이름.js
# → TC 1: PASS, TC 2: PASS ... 확인
```

### 4. 스니펫 재사용
```js
// 문제 파일 상단에서 불러오기
const { MinHeap, Queue, UnionFind } = require("../../../05_templates/ds-snippets");
```

---

## 폴더 구조

```
coding-test/
├── 01_data-structures/        # 자료구조 개념 + 직접 구현 예제
│   ├── array/
│   ├── string/
│   ├── linked-list/
│   ├── stack/
│   ├── queue/
│   ├── heap/
│   ├── hash-map/
│   ├── tree/
│   ├── graph/
│   └── trie/
│
├── 02_algorithms/             # 알고리즘 개념 + 예제
│   ├── sorting/
│   ├── binary-search/
│   ├── two-pointers/
│   ├── sliding-window/
│   ├── recursion/
│   ├── dynamic-programming/
│   ├── greedy/
│   ├── backtracking/
│   ├── bfs-dfs/
│   └── divide-and-conquer/
│
├── 03_platforms/              # 플랫폼별 실제 풀이
│   ├── programmers/
│   │   ├── level1/            ← 시작점
│   │   ├── level2/
│   │   └── level3/
│   ├── leetcode/
│   │   ├── easy/
│   │   ├── medium/
│   │   └── hard/
│   └── boj/
│
├── 04_mock-tests/             # 90분 모의테스트 기록
├── 05_templates/
│   ├── problem-template.js   ← 새 문제마다 복사해서 사용
│   └── ds-snippets.js        ← Stack/Queue/Heap/UnionFind 등 재사용 구현체
└── 06_notes/
    ├── study-plan.md          ← 8주 커리큘럼
    ├── complexity-cheatsheet.md
    └── wrong-answers.md       ← 오답 노트
```

---

## 매일 루틴

```
[매일 — 30~60분]
1. 05_templates/problem-template.js 복사
2. 문제 읽고 접근 방법 주석으로 먼저 작성
3. 구현 → node로 테스트 통과 확인
4. 못 풀면 15분 후 풀이 보기 (1시간 이상 막히지 말 것)
5. 다음날 같은 문제 다시 풀기 (복습)

[주 1회]
- 04_mock-tests/ 에 90분 모의테스트 기록 (실제 시험 환경 재현)

[오답은 반드시]
- 06_notes/wrong-answers.md 에 틀린 이유 + 핵심 아이디어 기록
```

---

## 8주 커리큘럼

| 주차 | 주제 | 목표 문제 |
|------|------|-----------|
| 1주 | 배열 · 문자열 · 해시맵 | Programmers Level1 전부 |
| 2주 | 스택 · 큐 · 재귀 | Level2 스택/큐 섹션 |
| 3주 | 정렬 · 이분탐색 | Level2 정렬 + LeetCode Easy 10 |
| 4주 | 트리 · BFS · DFS | Level2 BFS/DFS 전부 |
| 5~6주 | 동적 프로그래밍 | LeetCode Medium DP 15문제 |
| 7주 | 그래프 (다익스트라·유니온파인드) | Level3 그래프 섹션 |
| 8주 | 백트래킹 · 그리디 | LeetCode 백트래킹 10문제 |

---

## JS 코딩 테스트 주의사항

```js
// ❌ 기본 sort는 문자열 정렬
[10, 9, 2].sort()           // [10, 2, 9]

// ✅ 반드시 비교함수 전달
[10, 9, 2].sort((a, b) => a - b)   // [2, 9, 10]

// ❌ shift()는 O(N) — 큐를 배열로 쓰지 말 것
queue.shift()

// ✅ ds-snippets.js의 Queue 사용 (O(1) dequeue)
const q = new Queue();

// Node.js 표준 입력 (BOJ 등)
const input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
```

---

## 카카오 출제 유형 우선순위

| 우선순위 | 유형 | 집중 시기 |
|----------|------|-----------|
| ★★★★★ | 구현 / 시뮬레이션 | 3주차~ |
| ★★★★★ | BFS / DFS | 4주차 |
| ★★★★☆ | 동적 프로그래밍 | 5~6주차 |
| ★★★☆☆ | 이분탐색 | 2주차 |
| ★★★☆☆ | 그리디 | 8주차 |
