# 03. Linked List (연결 리스트)

## 1. 연결 리스트란?

**노드(Node)들이 포인터로 연결된 자료구조.**
배열과 달리 메모리에 연속되어 있지 않고, 각 노드가 "다음 노드의 주소"를 들고 있다.

### 도식 — 단일 연결 리스트

```
   head
    │
    ▼
  ┌────┬───┐    ┌────┬───┐    ┌────┬───┐    ┌────┬─────┐
  │ 10 │ ●─┼──→ │ 20 │ ●─┼──→ │ 30 │ ●─┼──→ │ 40 │null │
  └────┴───┘    └────┴───┘    └────┴───┘    └────┴─────┘
   node1         node2         node3         node4 (tail)

   각 노드 = { value, next }
   마지막 노드의 next = null
```

## 2. 배열 vs 연결 리스트

| 항목 | 배열 | 연결 리스트 |
|------|------|------------|
| 메모리 | 연속 | 흩어짐 (포인터로 연결) |
| 인덱스 접근 | O(1) | **O(n)** — head부터 순회 |
| 앞에 삽입 | O(n) | **O(1)** — head 교체만 |
| 중간 삽입/삭제 | O(n) | **O(1)** (단, 노드 참조가 있을 때) |
| 끝에 삽입 | O(1) 분할상환 | O(n) — tail 찾기 (tail 포인터 있으면 O(1)) |
| 캐시 친화도 | 높음 | 낮음 |

> **요약**: "양 끝/중간에서 자주 삽입/삭제하면 LL, 무작위 접근이면 배열."

## 3. 종류

### 단일 연결 리스트 (Singly Linked List)

```
  head ─→ [A|●] ─→ [B|●] ─→ [C|null]

  앞으로만 진행 가능.
```

### 이중 연결 리스트 (Doubly Linked List)

```
  head ─→ [null|A|●] ⇄ [●|B|●] ⇄ [●|C|null] ←─ tail

  앞뒤 양방향 진행 가능. prev 포인터가 하나 더 든다.
  메모리 ↑, 삭제 O(1) (이전 노드 찾을 필요 없음)
```

### 원형 연결 리스트 (Circular Linked List)

```
  head ─→ [A|●] ─→ [B|●] ─→ [C|●]
           ▲                    │
           └────────────────────┘

  마지막의 next가 head를 가리킴. 큐/버퍼 구현에 유용.
```

## 4. JS 구현 템플릿

```js
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

// 배열 → 연결 리스트
function fromArray(arr) {
  const dummy = new ListNode();
  let cur = dummy;
  for (const v of arr) {
    cur.next = new ListNode(v);
    cur = cur.next;
  }
  return dummy.next;
}

// 연결 리스트 → 배열 (디버깅용)
function toArray(head) {
  const out = [];
  for (let cur = head; cur; cur = cur.next) out.push(cur.val);
  return out;
}
```

### Dummy(가짜) 노드 패턴

```
   실제 head 앞에 dummy 노드 하나 더 두면 "head가 바뀌는 케이스"를 분기 없이 처리 가능.

   dummy ─→ [head] ─→ [..] ─→ null
     ↑
   이걸 반환 시점에 dummy.next로 진짜 head 반환

   ※ 첫 노드 삭제, 합치기, 정렬 등에서 코드가 깔끔해진다.
```

## 5. 대표 패턴

### 패턴 A — 뒤집기 (Reverse)

```
   초기:   prev=null    cur=A → B → C → null

   반복 1:  null ← A    cur=B,   B → C → null
                  ↑
                prev

   반복 2:  null ← A ← B    cur=C,   C → null
                       ↑
                     prev

   반복 3:  null ← A ← B ← C    cur=null
                           ↑
                         prev (= 새 head)

   while (cur) {
     const next = cur.next;
     cur.next = prev;
     prev = cur;
     cur = next;
   }
   return prev;
```

### 패턴 B — 투 포인터 (느림/빠름, Floyd's)

**사이클 감지**

```
   slow는 1칸씩, fast는 2칸씩 이동.
   사이클이 있으면 둘은 반드시 만난다.

      ┌───────────────────┐
      ▼                   │
   A → B → C → D → E → F ─┘
            ↑       ↑
          slow     fast

   사이클 없으면 fast가 먼저 null 도달 → 사이클 없음
```

**중간 노드 찾기**

```
   slow 1칸, fast 2칸 → fast가 끝 도달 시 slow는 정확히 중간.

   A → B → C → D → E
                 ↑
              slow (fast가 E에 도달했을 때)
```

### 패턴 C — 병합 (Merge)

```
   두 정렬 리스트 병합:

   L1:  1 → 4 → 7
   L2:  2 → 3 → 8

   dummy → ?

   비교하며 작은 쪽 노드를 dummy 뒤에 이어붙임:
       1(L1) → 2(L2) → 3(L2) → 4(L1) → 7(L1) → 8(L2)

   포인터만 옮기면 되므로 추가 메모리 O(1).
```

### 패턴 D — N번째 뒤에서 (Two-Pass with Gap)

```
   "뒤에서 N번째 노드 삭제"

   fast를 먼저 N칸 진행시킨 뒤, slow와 fast를 함께 이동.
   fast가 끝에 닿으면 slow는 정확히 "뒤에서 N+1번째".

   N=2 일 때:
       A → B → C → D → E → null
       ↑           ↑
      slow        fast (2칸 앞)

   둘 다 진행 →
       A → B → C → D → E → null
                  ↑          ↑
                 slow       fast=null

   slow.next = slow.next.next  → D 삭제
```

## 6. 자주 하는 실수

- **`cur.next`를 먼저 저장하지 않고 끊기** → 다음 노드를 잃어버림.
  → 항상 `const next = cur.next;` 먼저 저장.
- **head가 바뀌는데 분기 처리 안 함** → Dummy 노드 패턴으로 해결.
- **사이클이 있는데 일반 순회로 무한 루프** → Floyd's 알고리즘으로 먼저 확인.
- **이중 연결 리스트에서 `prev` 갱신 누락** → 삭제 후 양쪽 모두 갱신.
- **`tail` 포인터 없이 `push`** → 매번 O(n). 끝 삽입이 잦으면 tail 유지.

## 7. 정리된 문제

| # | 문제 | 패턴 | 비고 |
|---|------|------|------|
| 001 | [리스트 뒤집기](./question/001_리스트뒤집기.md) | A. Reverse | prev/cur/next 3포인터 |
| 002 | [사이클 감지](./question/002_사이클감지.md) | B. 투 포인터 | Floyd's |
| 003 | [두 리스트 병합](./question/003_두리스트병합.md) | C. Merge | Dummy 노드 활용 |

## 8. 한 줄 요약

> **"노드 + 포인터 = 유연한 삽입/삭제, 무작위 접근 불가."**
>
> 대부분 문제는 **Dummy 노드 + 투 포인터(slow/fast 또는 prev/cur)** 조합으로 풀린다.
