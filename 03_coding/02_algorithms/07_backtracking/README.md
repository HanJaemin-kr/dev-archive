# 07. Backtracking (백트래킹)

## 1. 백트래킹이란?

**DFS로 모든 후보를 탐색하되, 조건 위반 시 즉시 되돌아가는 기법.**
"가능한 경로를 따라가다가 막다른 길이면 뒤로 한 발 물러나서 다른 선택".
완전 탐색 + 가지치기(pruning).

### 도식 — 결정 트리

```
   부분집합 [1, 2, 3] 모두 나열:

                    {}
              ┌─────┴─────┐
            +1            -1
            /              \
          {1}              {}
        +2 / \-2        +2 / \-2
         {1,2} {1}      {2}  {}
       +3 /\-3 +3 /\-3 +3 /\-3 +3 /\-3
      {1,2,3}{1,2}{1,3}{1}{2,3}{2}{3}{}

   각 원소마다 "포함/미포함" 두 가지 분기.
   막다른 끝 (idx === n) 에서 결과 처리.
   조건 위반 시 더 깊이 안 들어가고 백 (= pruning).
```

## 2. 시간복잡도

| 문제 | 시간 |
|------|------|
| 모든 부분집합 | O(2ⁿ) |
| 모든 순열 | O(n!) |
| 모든 조합 (n,k) | O(C(n,k)) |
| N-Queens | O(N!) — 사실상 가지치기로 훨씬 빠름 |

> **가지치기가 약하면 곧 TLE**. 가지치기 조건을 강하게 잡는 게 핵심 기술.

## 3. JS 구현 템플릿

### 기본 골격

```js
function backtrack(idx, state, n) {
  if (idx === n) {
    // 결과 처리
    return;
  }
  for (const choice of candidates(idx, state)) {
    if (!isValid(choice, state)) continue;   // 가지치기
    state.push(choice);
    backtrack(idx + 1, state, n);
    state.pop();                              // ⚠️ 상태 복원 필수
  }
}
```

### 포함/미포함 분기 (부분집합)

```js
function subsets(nums) {
  const out = [];
  const path = [];
  const dfs = (i) => {
    if (i === nums.length) { out.push([...path]); return; }
    // 미포함
    dfs(i + 1);
    // 포함
    path.push(nums[i]);
    dfs(i + 1);
    path.pop();
  };
  dfs(0);
  return out;
}
```

### 순열

```js
function permutations(nums) {
  const out = [];
  const used = new Array(nums.length).fill(false);
  const path = [];
  const dfs = () => {
    if (path.length === nums.length) { out.push([...path]); return; }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      path.push(nums[i]);
      dfs();
      path.pop();
      used[i] = false;
    }
  };
  dfs();
  return out;
}
```

## 4. 대표 패턴

### 패턴 A — 모든 부분집합 / 순열 / 조합

```
   각 원소를 "포함할까 말까" 또는 "어느 위치에 놓을까" 결정.

   부분집합:  2^n 가지
   순열:      n! 가지
   조합 C(n,k): n! / (k!(n-k)!)

   결정 트리를 DFS로 탐색.
```

용도: 모든 경우 나열, 카운트, 첫 번째 만족하는 답 찾기

### 패턴 B — 격자/배치 + 유효성 검사

```
   "N-Queens" — N×N 체스판에 N개 퀸을 서로 공격 없게

   행마다 하나씩 배치, 각 열에 시도:
       col 충돌    → 같은 열에 이미 있으면 X
       대각선 충돌 → row - col, row + col 가 이미 있으면 X

       1) cols, diag1, diag2 를 Set 으로 추적
       2) 진입 시 add, 리턴 직전 delete

   8×8 → 92 가지. 가지치기 없으면 8! = 40320 가지 모두 시도.
```

```js
function nQueens(n) {
  let count = 0;
  const cols = new Set(), d1 = new Set(), d2 = new Set();
  const dfs = (row) => {
    if (row === n) { count++; return; }
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || d1.has(row - col) || d2.has(row + col)) continue;
      cols.add(col); d1.add(row - col); d2.add(row + col);
      dfs(row + 1);
      cols.delete(col); d1.delete(row - col); d2.delete(row + col);
    }
  };
  dfs(0);
  return count;
}
```

용도: N-Queens, 스도쿠, 미로 경로

### 패턴 C — 문자열/경로 변환 (BFS or DFS+백트래킹)

```
   "단어 변환" — begin 에서 target 까지 한 글자씩 바꾸며 최단 단계

   각 단어 = 노드, 한 글자 차이 = 간선.

   BFS 추천 (최단 거리 보장).
   DFS + 백트래킹: 모든 경로 탐색 → 최소값 (단어 수 적을 때).
```

용도: 단어 변환, 미로 경로, 문장 분할

### 패턴 D — 가지치기 (Pruning) 강화

```
   "부분집합 합 = target"

   현재 합이 target 초과 시 즉시 백트래킹.
       if (current > target && allPositive) return;

   "남은 원소 합 < 부족분" 일 때도 백트래킹.
       if (current + remainingSum < target) return;

   정렬 후 작은 원소부터 시도하면 더 빨리 가지치기.
```

용도: TLE 해소, 모든 종류 백트래킹

## 5. 자주 하는 실수

- **상태 복원 누락** — `push` 만 하고 `pop` 안 함 → 다음 분기로 상태 누출.
- **방문 배열 공유 vs 복사** — 한 배열을 모든 분기가 공유하면 push/pop 으로 관리. 결과 저장 시는 `[...arr]` 복사.
- **가지치기 조건이 약함** → TLE. 무엇이 명백히 안 되는지 더 일찍 잘라야.
- **결과 배열에 참조 그대로 push** → 다음 분기에서 변경됨. 항상 `[...path]` 복사.
- **순열에서 `used` 배열 누락** → 같은 원소 중복 사용.
- **재귀 깊이 = 상태 깊이** → 깊으면 스택 오버플로 위험.

## 6. 정리된 문제

| # | 문제 | 패턴 | 비고 |
|---|------|------|------|
| 001 | [N-Queens](./question/001_N_Queens.md) | B. 배치 + 유효성 | 좌/우 대각선 Set |
| 002 | [부분집합 합](./question/002_부분집합합.md) | A. 부분집합 | 포함/미포함 |
| 003 | [단어 변환](./question/003_단어변환.md) | C. 경로 탐색 | BFS 추천 |

## 7. 한 줄 요약

> **"DFS + 상태 복원 + 가지치기 — 이 세 박자."**
>
> 모든 경우를 다 보긴 하지만, 명백히 안 되는 가지는 일찍 자른다.
> 결정 트리를 머릿속에 그릴 수 있으면 코드는 자연스럽게 따라온다.
