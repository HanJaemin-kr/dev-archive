# 08. BFS / DFS (너비/깊이 우선 탐색)

## 1. BFS / DFS 란?

**그래프(또는 트리)를 체계적으로 모두 방문하는 두 가지 기본 알고리즘.**
- **BFS**: 가까운 노드부터 — 큐 사용.
- **DFS**: 한 방향으로 끝까지 가본 뒤 백트래킹 — 스택(또는 재귀) 사용.

### 도식 — 같은 트리에서의 방문 순서

```
            (A)
           /   \
         (B)   (C)
         / \     \
       (D) (E)   (F)

   BFS(A) → A B C D E F   (레벨 단위)
       Q=[A]      → 방문 A,    push B, C
       Q=[B,C]    → 방문 B,    push D, E
       Q=[C,D,E]  → 방문 C,    push F
       Q=[D,E,F]  → ...

   DFS(A) → A B D E C F   (한 방향 끝까지)
       stack=[A]    → 방문 A, push B, C → stack=[C, B]
       stack=[C,B]  → 방문 B, push D, E → stack=[C, E, D]
       stack=[C,E,D]→ 방문 D, 자식 없음
       ...
```

## 2. 시간/공간

| 항목 | 복잡도 |
|------|--------|
| 시간 | O(V + E) |
| 공간 (BFS) | O(V) — 큐 |
| 공간 (DFS) | O(V) — 스택 또는 재귀 깊이 |

## 3. JS 구현 템플릿

### DFS 재귀

```js
function dfs(node, graph, visited = new Set()) {
  if (visited.has(node)) return;
  visited.add(node);
  // 처리...
  for (const next of graph.get(node) ?? []) {
    dfs(next, graph, visited);
  }
}
```

### DFS 명시적 스택

```js
function dfsIter(start, graph) {
  const visited = new Set([start]);
  const stack = [start];
  while (stack.length) {
    const node = stack.pop();
    // 처리...
    for (const next of graph.get(node) ?? []) {
      if (!visited.has(next)) {
        visited.add(next);
        stack.push(next);
      }
    }
  }
}
```

### BFS (인덱스 포인터 큐 — `shift()` 회피)

```js
function bfs(start, graph) {
  const visited = new Set([start]);
  const q = [start];
  let head = 0;
  while (head < q.length) {
    const node = q[head++];
    // 처리...
    for (const next of graph.get(node) ?? []) {
      if (!visited.has(next)) {
        visited.add(next);
        q.push(next);
      }
    }
  }
}
```

> ⚠️ JS 배열 `shift()` 는 O(n). 큐는 반드시 **인덱스 포인터** 또는 연결 리스트.

## 4. 대표 패턴

### 패턴 A — 연결 요소 개수

```
   "섬의 개수" / "네트워크 개수"

   for v in V:
     if !visited[v]:
       count++
       dfs(v)    ← 같은 컴포넌트 모두 방문

   각 미방문 노드에서 한 번씩 DFS/BFS → 그 횟수가 컴포넌트 수.
```

용도: 섬 개수, 친구 그룹 수, 군집 분리

### 패턴 B — 가중치 없는 최단 경로 (BFS)

```
   격자 (S=출발, E=도착, #=벽):

      S . . .           거리:
      . # . .             0 1 2 3
      . . . E             1 # 3 4
                          2 3 4 5  ← E 도달, 답 = 5

   BFS는 "거리가 같은 칸들" 을 동시에 확장.
   → 처음 도착했을 때가 곧 최단 거리.
```

```js
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function shortestPath(grid, sr, sc, er, ec) {
  const R = grid.length, C = grid[0].length;
  const dist = Array.from({ length: R }, () => new Array(C).fill(-1));
  dist[sr][sc] = 0;
  const q = [[sr, sc]];
  let head = 0;
  while (head < q.length) {
    const [r, c] = q[head++];
    if (r === er && c === ec) return dist[r][c];
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;
      if (grid[nr][nc] === '#' || dist[nr][nc] !== -1) continue;
      dist[nr][nc] = dist[r][c] + 1;
      q.push([nr, nc]);
    }
  }
  return -1;
}
```

용도: 격자 최단 거리, 미로, 회전 퍼즐

### 패턴 C — 모든 경우 탐색 (DFS)

```
   "타겟 넘버" — 각 원소에 +/- 붙여 target 만들기

   dfs(idx, current):
     if idx === n:
       if current === target: count++
       return
     dfs(idx + 1, current + numbers[idx])
     dfs(idx + 1, current - numbers[idx])

   n=20 → 2^20 ≈ 10^6 → DFS 충분.
   백트래킹과 본질적으로 동일.
```

용도: 모든 분기 탐색, 카운트 문제

### 패턴 D — 위상 정렬 (Topological Sort)

```
   "선후 관계가 있는 작업 순서 결정"

   Kahn's (BFS):
     1) in-degree 0 인 정점 모두 큐에 push
     2) pop → 결과 추가 → 인접 정점 in-degree -1
     3) in-degree 0 되면 큐 push
     4) 반복

   결과 길이 < V 이면 사이클 존재 → 위상 정렬 불가.

   DFS 방식:
     모든 정점에서 DFS,
     리턴 시점에 스택에 push,
     끝나면 스택을 뒤집어 출력.
```

용도: 과목 선수 관계, 작업 의존성, 빌드 순서

### 패턴 E — 사이클 감지

```
   무방향 그래프: DFS 중 visited 인 정점 + 부모 아님 → 사이클
   방향 그래프:   3색 칠하기 (white/gray/black) — gray 만나면 사이클
```

용도: 데드락 감지, DAG 검증, MST 사이클 방지

## 5. 자주 하는 실수

- **`visited` 갱신 시점** — `enqueue/push` **하는 순간** 표시. `dequeue/pop` 시점에 표시하면 같은 노드가 큐/스택에 중복.
- **가중치 있는데 BFS 사용** → 틀림. 다익스트라/벨만-포드 사용.
- **`Q.size()` 를 루프 안에서 재호출** — 자식이 추가돼서 변함. 레벨 순회 시 미리 저장.
- **재귀 DFS 깊이 한계** — V ≥ 10⁵ 이면 명시적 스택으로 변환.
- **4방향 vs 8방향** — 문제 요구사항 정확히 확인. `DIRS = [[−1,0],[1,0],[0,−1],[0,1]]` vs +대각선 4개.
- **격자에서 무방향인데 한 방향만 추가** → 양쪽 모두 `addEdge`.
- **BFS 큐 `shift()` 사용** → O(n). 인덱스 포인터로.

## 6. 정리된 문제

| # | 문제 | 패턴 | 비고 |
|---|------|------|------|
| 001 | [네트워크](./question/001_네트워크.md) | A. 연결 요소 | DFS or Union-Find |
| 002 | [타겟 넘버](./question/002_타겟넘버.md) | C. 모든 경우 | DFS +/- 분기 |
| 003 | [게임 맵 최단거리](./question/003_게임맵최단거리.md) | B. 최단 경로 | BFS 4방향 |

## 7. 한 줄 요약

> **"최단거리 = BFS, 모든 경로 = DFS — 그래프의 양 손."**
>
> 격자도, 트리도, 작업 의존성도 모두 그래프.
> 가중치 없으면 BFS, 가중치 있으면 다익스트라, 순서 정하기는 위상 정렬.
