# 05. Queue (큐)

## 1. 큐란?

**FIFO (First-In, First-Out) — 먼저 들어온 것이 먼저 나간다.**
줄 서기, 프린터 대기열, BFS 탐색이 모두 큐 구조.

### 도식 — enqueue / dequeue

```
   enqueue(1) enqueue(2) enqueue(3)

   front                          rear
     │                              │
     ▼                              ▼
   ┌───┬───┬───┐
   │ 1 │ 2 │ 3 │  ← enqueue는 뒤(rear)에서
   └───┴───┴───┘  ← dequeue는 앞(front)에서

   dequeue() → 1 반환

   ┌───┬───┐
   │ 2 │ 3 │
   └───┴───┘
```

## 2. 핵심 연산

| 연산 | 동작 | 복잡도 (이상적) |
|------|------|----------------|
| `enqueue(v)` | 뒤에 추가 | O(1) |
| `dequeue()` | 앞에서 제거 + 반환 | O(1) |
| `front()` / `peek()` | 앞 조회 | O(1) |
| `isEmpty()` | 비었는지 | O(1) |
| `size()` | 크기 | O(1) |

## 3. JS 구현

### 함정: `arr.shift()`는 O(n)

```js
const q = [];
q.push(1); q.push(2); q.push(3);
q.shift();   // ❌ O(n) — 모든 원소를 한 칸씩 이동
```

대규모 입력에서는 TLE의 원인. 대안:

### 방법 1 — 인덱스 포인터 큐

```js
class Queue {
  constructor() { this.q = []; this.head = 0; }
  enqueue(v) { this.q.push(v); }
  dequeue() {
    if (this.head >= this.q.length) return undefined;
    return this.q[this.head++];
  }
  front() { return this.q[this.head]; }
  size() { return this.q.length - this.head; }
  isEmpty() { return this.size() === 0; }
}
```

→ `shift()` 없이 인덱스만 전진. O(1) dequeue.

### 방법 2 — 연결 리스트 기반 큐

```js
class Queue {
  constructor() { this.head = null; this.tail = null; this.n = 0; }
  enqueue(v) {
    const node = { val: v, next: null };
    if (this.tail) this.tail.next = node;
    else this.head = node;
    this.tail = node;
    this.n++;
  }
  dequeue() {
    if (!this.head) return undefined;
    const v = this.head.val;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this.n--;
    return v;
  }
  size() { return this.n; }
}
```

→ 메모리 더 들지만 영구적으로 O(1).

## 4. 변형 큐

### 덱 (Deque, Double-Ended Queue)

```
   양쪽 끝 모두 push/pop 가능.

   pushFront ──→ │ A │ B │ C │ ←── pushBack
   popFront  ←── │ A │ B │ C │ ──→ popBack
```

용도: 슬라이딩 윈도우 최대값, 양방향 BFS

### 우선순위 큐 (Priority Queue)

**힙으로 구현.** FIFO 대신 "우선순위가 높은 것 먼저".
자세히는 `07_heap/README.md` 참고.

### 원형 큐 (Circular Queue)

고정 크기 배열을 링처럼 사용. front/rear가 끝에 닿으면 0으로 돌아감.

```
   capacity = 5,  front=2, rear=0

       ┌───┬───┬───┬───┬───┐
       │ E │   │ B │ C │ D │
       └───┴───┴───┴───┴───┘
         0   1   2   3   4
             ↑       ↑
           rear    front

   front → 3 → 4 → 0 → 1 → ... (모듈러 연산)
```

용도: 버퍼, 라운드 로빈 스케줄링

## 5. 대표 패턴

### 패턴 A — BFS (너비 우선 탐색)

```
   그래프/트리를 "가까운 곳부터" 탐색.

   시작:  Q=[start],  visited={start}

   while (Q) {
     const node = Q.dequeue();
     for (next of node.neighbors) {
       if (!visited.has(next)) {
         visited.add(next);
         Q.enqueue(next);
       }
     }
   }
```

```
   격자에서 최단 거리:

      S . . .            방문 순서:
      . # . .              S(0)
      . . . E              1 1 . .
                            2 # 2 .
                            . 3 3 4 ← E 도달, 거리 = 4

   "거리가 같은 모든 칸"이 한 번에 처리됨 → 최단 경로 보장.
```

용도: 최단 경로(가중치 없음), 레벨 순회, 격자 탐색

### 패턴 B — 레벨 단위 처리

```
   이진 트리 레벨 순회:

           1
          / \
         2   3       ← 레벨 1
        / \   \
       4   5   6     ← 레벨 2

   for each level:
     levelSize = Q.size()       ← 이 시점에 한 레벨 전체
     for i in 0..levelSize:
       node = Q.dequeue()
       ...
       enqueue children
```

용도: 트리 레벨 순회, 지그재그 순회, 우측 뷰

### 패턴 C — 슬라이딩 윈도우 (덱)

```
   "윈도우 크기 k 의 최댓값" — 덱으로 후보 인덱스 관리.

   nums = [1, 3, -1, -3, 5, 3],  k = 3

   덱 안에 들어가는 인덱스의 값은 단조 감소 유지.
   왼쪽 = 윈도우의 최댓값 인덱스.

   i=0:  d=[0]                  (값 1)
   i=1:  3 > 1 → 0 제거          d=[1]    (값 3)
   i=2:  d=[1,2]                (값 3,-1)
   i=3:  d=[1,2,3]              (값 3,-1,-3)  → 윈도우 가득. 답: nums[1]=3
   i=4:  5 > -3 → 3 제거
         5 > -1 → 2 제거
         5 > 3  → 1 제거         d=[4]    답: 5
   ...
```

용도: 슬라이딩 윈도우 최대/최소, 큐 + 단조성

### 패턴 D — 우선순위 큐 (힙)

```
   "프린터 우선순위": 우선순위가 높은 작업을 먼저 처리.

   문서 = [{id:1, p:2}, {id:2, p:1}, {id:3, p:3}]

   maxHeap (priority 기준)으로 처리:
     pop {id:3, p:3} → 출력 1순위
     pop {id:1, p:2} → 출력 2순위
     pop {id:2, p:1} → 출력 3순위
```

자세히는 `07_heap/README.md`.

## 6. 자주 하는 실수

- **`shift()`로 dequeue → TLE** → 인덱스 포인터 큐 / 연결 리스트 큐로 교체.
- **BFS에서 `visited` 갱신 시점 늦음** → enqueue **하는 순간** visited 표시. dequeue 시점에 표시하면 같은 노드가 큐에 중복 들어감.
- **레벨 순회에서 `Q.size()`를 루프 안에서 다시 호출** → 자식이 추가되며 변함. 루프 시작 전 한 번 저장.
- **원형 큐에서 가득 참 vs 비어 있음 구분 못 함** → size 변수 따로 두거나 한 칸 비워두는 트릭.

## 7. 정리된 문제

| # | 문제 | 패턴 | 비고 |
|---|------|------|------|
| 001 | [프린터 우선순위](./question/001_프린터우선순위.md) | D. 우선순위 큐 | 힙 변형 |
| 002 | [BFS 최단거리](./question/002_BFS최단거리.md) | A. BFS | 격자 탐색 |
| 003 | [카드 뽑기](./question/003_카드뽑기.md) | — | 큐 기본 |
| 004 | [다리를 지나는 트럭](./question/004_다리를지나는트럭.md) | — | 큐 시뮬레이션 |

## 8. 한 줄 요약

> **"먼저 들어온 것을 먼저 처리"**
>
> JS에서는 `shift()` 함정 주의 → 인덱스 포인터 큐.
> 응용은 BFS, 레벨 순회, 슬라이딩 윈도우(덱), 우선순위 큐(힙).
