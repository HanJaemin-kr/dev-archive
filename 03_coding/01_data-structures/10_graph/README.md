# 10. Graph (그래프)

## 1. 그래프란?

**정점(Vertex/Node)들이 간선(Edge)으로 연결된 자료구조.**
사이클이 있을 수 있고, 트리는 "사이클 없는 그래프"의 특수한 경우.

### 도식 — 기본 용어

```
        (A)─────(B)
         │       │
         │       │
        (C)─────(D)─────(E)

   - 정점 V = {A, B, C, D, E}
   - 간선 E = {A-B, A-C, B-D, C-D, D-E}
   - 차수(degree) of D = 3
   - 경로(path) A→B→D→E
   - 사이클(cycle) A→B→D→C→A
```

### 종류

| 종류 | 설명 |
|------|------|
| **무방향(Undirected)** | A─B 는 양방향 |
| **방향(Directed, Digraph)** | A→B 만 가능 |
| **가중(Weighted)** | 간선에 비용 |
| **DAG** | 방향 + 사이클 없음 (위상 정렬 가능) |
| **연결 그래프** | 모든 정점 사이 경로 존재 |
| **이분 그래프(Bipartite)** | 정점을 두 집합으로 나눠 같은 집합 간 간선 없음 |

## 2. 표현 방법

### 인접 리스트 (Adjacency List) — **거의 항상 이것**

```
   A─B─C─D 가 있고 A-B, A-C, B-D 라면:

       A: [B, C]
       B: [A, D]
       C: [A]
       D: [B]

   공간: O(V + E)
   "A의 이웃을 순회"가 빠름.
```

```js
const graph = new Map();
function addEdge(u, v) {
  if (!graph.has(u)) graph.set(u, []);
  if (!graph.has(v)) graph.set(v, []);
  graph.get(u).push(v);
  graph.get(v).push(u);   // 무방향 그래프
}
```

### 인접 행렬 (Adjacency Matrix)

```
   V = 4 (A, B, C, D)

         A  B  C  D
       ┌──────────┐
     A │ 0  1  1  0 │
     B │ 1  0  0  1 │
     C │ 1  0  0  0 │
     D │ 0  1  0  0 │
       └──────────┘

   공간: O(V²)  ← V가 크면 비효율
   "u-v 간선 존재?" 가 O(1).
   조밀(dense) 그래프나 V가 작을 때 유리.
```

### 간선 리스트 (Edge List)

```
   [[A,B], [A,C], [B,D]]

   크루스칼 등 간선 정렬이 필요한 알고리즘에서 사용.
```

## 3. 탐색 — DFS / BFS

### DFS (깊이 우선) — 스택 / 재귀

```
        A
       / \
      B   C
     / \   \
    D   E   F

   DFS(A) → A B D E C F  (한 방향 끝까지 갔다가 백트래킹)

       ┌─────────┐
       │ 1. A 방문 │
       │ 2. B로  │
       │ 3. D로  │
       │ 4. 막힘. 백트래킹 → B │
       │ 5. E로  │
       │ ...    │
       └─────────┘
```

```js
function dfs(start, graph) {
  const visited = new Set();
  const stack = [start];
  while (stack.length) {
    const node = stack.pop();
    if (visited.has(node)) continue;
    visited.add(node);
    // 처리...
    for (const next of graph.get(node) ?? []) {
      if (!visited.has(next)) stack.push(next);
    }
  }
}
```

### BFS (너비 우선) — 큐

```
   같은 트리에서 BFS(A) → A B C D E F  (레벨 단위)

       Q=[A]  → 방문 A, push B,C
       Q=[B,C] → 방문 B, push D,E
       Q=[C,D,E] → 방문 C, push F
       Q=[D,E,F] → ...
```

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

### DFS vs BFS 선택

| 상황 | 선택 |
|------|------|
| 모든 경로 탐색, 백트래킹 | **DFS** |
| 가중치 없는 **최단 경로** | **BFS** |
| 연결 요소(Connected Component) 개수 | 둘 다 가능 |
| 사이클 감지 | DFS (방향 그래프는 색칠법) |
| 메모리 (트리 깊이 ≫ 너비) | BFS는 큐 폭발 위험, DFS 유리 |
| 메모리 (너비 ≫ 깊이) | DFS는 스택 폭발 위험, BFS 유리 |

> **암기**: "**최단 거리 = BFS**, **경로 다 보기 = DFS**."

## 4. 대표 패턴

### 패턴 A — 연결 요소 (Connected Component)

```
   격자나 그래프에서 "섬의 개수"

   각 미방문 정점에 대해 DFS/BFS 한 번씩 → 그때마다 카운트 +1.

   for v in V:
     if !visited[v]:
       count++
       dfs(v)    ← 이 호출이 끝나면 같은 컴포넌트 모두 방문 완료
```

### 패턴 B — 가중치 없는 최단 경로 (BFS)

```
   격자 (S=출발, E=도착, #=벽):

     S . . .              거리:
     . # . .                0 1 2 3
     . . . E                1 # 3 4
                            2 3 4 5  ← E에 도달, 답=5

   BFS는 "거리가 같은 칸"을 동시에 확장.
   → 처음 도착했을 때가 곧 최단 거리.
```

### 패턴 C — 위상 정렬 (Topological Sort, DAG)

**"선후 관계가 있는 작업 순서 정하기"**

```
   과목 선수 관계:
     A → C, B → C, C → D, B → D

         (A)─┐
              ▼
              (C)─→(D)
              ▲     ▲
         (B)─┘─────┘

   가능한 위상 순서: A, B, C, D  또는  B, A, C, D

   알고리즘 (Kahn's, BFS 기반):
     1) 진입차수(in-degree) 계산
     2) in-degree 0 인 정점을 큐에 모두 push
     3) 큐에서 pop → 결과에 추가 → 인접 정점 in-degree -1
     4) in-degree 0 되면 큐에 push
     5) 반복

   결과 길이가 V 미만이면 사이클 존재 → 위상 정렬 불가.
```

### 패턴 D — 가중치 있는 최단 경로 (Dijkstra)

```
   양의 가중치만 있을 때.

   우선순위 큐(최소 힙)에서 "현재까지 거리가 가장 짧은 정점"을 꺼내며 확장.

   dist[start] = 0
   heap = [(0, start)]
   while (heap):
     d, u = heap.pop_min()
     if d > dist[u]: continue
     for (v, w) in u의 이웃:
       if dist[u] + w < dist[v]:
         dist[v] = dist[u] + w
         heap.push((dist[v], v))

   복잡도: O((V+E) log V)
```

> 음수 가중치 있으면 Bellman-Ford, 모든 쌍이면 Floyd-Warshall.

### 패턴 E — Union-Find (Disjoint Set)

```
   "두 정점이 같은 그룹인가?" / "사이클 감지" / 크루스칼 MST

   parent[i]: 자기 자신을 가리키면 루트

   find(x):  루트까지 따라가기 (경로 압축으로 평탄화)
   union(a, b): 두 그룹의 루트를 연결

   parent = [0, 1, 2, 3, 4]   ← 처음엔 모두 따로

   union(0, 1):  parent[1] = 0
   union(2, 3):  parent[3] = 2
   union(0, 2):  parent[2] = 0

       0
      / \
     1   2
          \
           3
```

```js
class UnionFind {
  constructor(n) { this.p = Array.from({length: n}, (_, i) => i); }
  find(x) {
    if (this.p[x] !== x) this.p[x] = this.find(this.p[x]);  // 경로 압축
    return this.p[x];
  }
  union(a, b) {
    const ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;
    this.p[ra] = rb;
    return true;
  }
}
```

## 5. 격자(Grid)도 그래프다

2D 격자 문제는 사실상 그래프 문제. 각 칸이 정점, 인접 4(또는 8)방향이 간선.

```
   const DIRS = [[-1,0], [1,0], [0,-1], [0,1]];

   for (const [dr, dc] of DIRS) {
     const nr = r + dr, nc = c + dc;
     if (nr<0 || nr>=R || nc<0 || nc>=C) continue;
     if (grid[nr][nc] === '#' || visited[nr][nc]) continue;
     // 방문...
   }
```

## 6. 자주 하는 실수

- **visited 갱신 시점이 dequeue/pop 시점** → 같은 노드가 큐/스택에 여러 번 들어감. **추가 시점에 visited 표시**.
- **무방향인데 한 방향만 추가** → 양쪽 모두 `addEdge`.
- **재귀 DFS 깊이 한계** → V가 수만 이상이면 스택 오버플로. 명시적 스택으로 변환.
- **가중치 있는데 BFS로 최단 경로 시도** → 틀림. Dijkstra 사용.
- **위상 정렬 결과 길이 검증 누락** → 사이클 그래프인데 부분만 출력되는 걸 모름.
- **Union-Find 경로 압축 누락** → 트리 편향, 최악 O(n) 쿼리.

## 7. 정리된 문제

| # | 문제 | 패턴 | 비고 |
|---|------|------|------|
| 001 | [DFS 연결 요소](./question/001_DFS_연결요소.md) | A. 연결 요소 | 섬의 개수 |
| 002 | [BFS 최단 경로](./question/002_BFS_최단경로.md) | B. BFS 최단거리 | 가중치 없음 |
| 003 | [위상 정렬](./question/003_위상정렬.md) | C. 위상 정렬 | Kahn's 알고리즘 |

## 8. 한 줄 요약

> **"연결 관계가 있는 모든 것은 그래프."**
>
> 격자도, 작업 순서도, 친구 관계도 다 그래프.
> 핵심 도구: **DFS / BFS / 위상 정렬 / Dijkstra / Union-Find**.
> "**최단 거리 = BFS(가중X) / Dijkstra(가중O)**, **순서 = 위상 정렬**, **그룹 = Union-Find**."
