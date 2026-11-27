# 08. Tree (트리)

## 1. 트리란?

**사이클이 없는 연결 그래프.** 한 노드(루트)에서 시작해 자식들로 뻗어나가는 계층 구조.
파일 시스템, HTML DOM, 조직도가 모두 트리.

### 도식 — 용어

```
                  [1]   ← 루트 (root)
                 /   \
              [2]    [3]   ← 1의 자식 (children)
             /   \     \
          [4]   [5]    [6]   ← 리프(leaf): 자식 없는 노드

   - 깊이(depth) of 5  = 2  (루트에서의 거리)
   - 높이(height) of 1 = 2  (가장 먼 리프까지의 거리)
   - 차수(degree) of 1 = 2  (자식 수)
   - 부모(parent) of 5 = 2
   - 형제(sibling) of 4 = 5
   - 서브트리(subtree of 2) = {2, 4, 5}
```

## 2. 종류

### 이진 트리 (Binary Tree)

각 노드의 자식이 **최대 2개** (왼쪽/오른쪽).

```
        [A]
       /   \
     [B]   [C]
     / \
   [D] [E]
```

### 이진 탐색 트리 (BST, Binary Search Tree)

**왼쪽 서브트리 < 노드 < 오른쪽 서브트리** 규칙.

```
        [5]
       /   \
     [3]   [8]
     / \     \
   [1] [4]  [9]

   3 < 5 < 8  ✅
   1 < 3 < 4  ✅
   탐색/삽입/삭제 O(log n) — 단, 균형 잡혔을 때.
   편향되면 O(n) (사실상 연결 리스트).
```

### 균형 이진 트리

AVL, Red-Black 등. 자동으로 균형을 맞춰 O(log n) 보장.
실무에서 직접 구현은 드물고, 개념만 알면 충분.

### 완전 이진 트리 (Complete Binary Tree)

마지막 레벨을 제외하고 꽉 차 있고, 마지막 레벨은 **왼쪽부터** 채워진 트리.
**힙**의 구조가 이것.

### N-ary 트리

자식이 2개를 넘는 일반 트리. DOM, 디렉터리.

## 3. JS 구현 템플릿

```js
class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// 배열에서 트리 만들기 (LeetCode 스타일, BFS)
function fromArray(arr) {
  if (!arr.length) return null;
  const root = new TreeNode(arr[0]);
  const q = [root];
  let i = 1;
  while (q.length && i < arr.length) {
    const node = q.shift();
    if (arr[i] != null) { node.left  = new TreeNode(arr[i]); q.push(node.left);  } i++;
    if (i < arr.length && arr[i] != null) { node.right = new TreeNode(arr[i]); q.push(node.right); } i++;
  }
  return root;
}
```

## 4. 순회 (Traversal) — 가장 중요한 기본기

### 깊이 우선 (DFS) 3가지

```
         [1]
        /   \
      [2]   [3]
      / \
    [4] [5]
```

| 순회 | 순서 | 결과 |
|------|------|------|
| **전위(Pre-order)** | 노드 → 왼 → 오 | 1, 2, 4, 5, 3 |
| **중위(In-order)** | 왼 → 노드 → 오 | 4, 2, 5, 1, 3 |
| **후위(Post-order)** | 왼 → 오 → 노드 | 4, 5, 2, 3, 1 |

```js
function preorder(node, out = []) {
  if (!node) return out;
  out.push(node.val);
  preorder(node.left, out);
  preorder(node.right, out);
  return out;
}

function inorder(node, out = []) {
  if (!node) return out;
  inorder(node.left, out);
  out.push(node.val);
  inorder(node.right, out);
  return out;
}

function postorder(node, out = []) {
  if (!node) return out;
  postorder(node.left, out);
  postorder(node.right, out);
  out.push(node.val);
  return out;
}
```

> 💡 **BST에서 중위 순회 = 오름차순 정렬**. 핵심 무기.

### 너비 우선 (BFS, Level-order)

큐로 구현. 레벨 단위로 순회.

```
   레벨 0:  1
   레벨 1:  2 3
   레벨 2:  4 5
```

```js
function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const q = [root];
  while (q.length) {
    const level = [];
    const size = q.length;
    for (let i = 0; i < size; i++) {
      const node = q.shift();
      level.push(node.val);
      if (node.left) q.push(node.left);
      if (node.right) q.push(node.right);
    }
    result.push(level);
  }
  return result;
}
```

## 5. 대표 패턴

### 패턴 A — 재귀 (대부분의 트리 문제)

```
   "트리의 최대 깊이"

   maxDepth(node):
     if node == null: return 0
     return 1 + max(maxDepth(left), maxDepth(right))

         [1]            depth = 1 + max(2, 1) = 3
        /   \
      [2]   [3]        depth = 1+max(1,1)=2,  1+max(0,0)=1
      / \
    [4] [5]            depth = 1, 1

   → 트리 문제의 90%는 "이 노드에서 무엇을 반환할지" 만 정의하면 풀린다.
```

### 패턴 B — BST 성질 활용

```
   "BST 유효성 검증"

   각 노드는 (min, max) 범위 안에 있어야 함:

         [5]                       (-∞, +∞)
        /   \
      [3]   [8]            (-∞, 5)         (5, +∞)
      / \     \
    [1] [4]  [9]      (-∞, 3) (3, 5)      (8, +∞)

   재귀로 범위를 좁혀가며 확인.
```

### 패턴 C — 경로 / 합 (DFS + 누적)

```
   "루트→리프 경로의 합이 target인가?"

   hasPath(node, remaining):
     if !node: return false
     if isLeaf(node): return node.val == remaining
     return hasPath(node.left,  remaining - node.val)
         || hasPath(node.right, remaining - node.val)
```

### 패턴 D — 레벨 순회 변형

```
   "지그재그 순회"           "우측 뷰"

         [1]                    레벨마다 마지막 노드만 출력
        /   \                       [1] [3] [5]
      [2]   [3]                          ↑
      / \     \
    [4] [5]   [6]              레벨 0 →
                              레벨 1 ←  (역순)
                              레벨 2 →
```

### 패턴 E — 최저 공통 조상 (LCA)

```
   "두 노드의 최저 공통 조상"

   lca(node, p, q):
     if !node or node==p or node==q: return node
     L = lca(node.left,  p, q)
     R = lca(node.right, p, q)
     if L && R: return node       ← 양쪽에서 발견 → 현재가 LCA
     return L || R
```

## 6. 자주 하는 실수

- **재귀 종료 조건 누락 (null 체크)** → 스택 오버플로.
- **중위 순회 외 다른 순회로 BST를 정렬된 결과로 기대** → 중위만 정렬.
- **BFS에서 `Q.size()`를 루프 내부에서 다시 호출** → 자식 추가로 변함. 루프 전에 저장.
- **포인터 갱신 후 원본 잃어버림** → 변경 전 참조 저장.
- **재귀 깊이 = 트리 높이** → 편향 트리에서 스택 오버플로. 반복 + 명시적 스택 변환 고려.

## 7. 정리된 문제

| # | 문제 | 패턴 | 비고 |
|---|------|------|------|
| 001 | [이진 트리 순회](./question/001_이진트리순회.md) | DFS 3가지 | 재귀/반복 |
| 002 | [BST 검증](./question/002_BST검증.md) | B. BST 성질 | (min, max) 범위 |
| 003 | [트리 최대 깊이](./question/003_트리최대깊이.md) | A. 재귀 | 1 + max(L, R) |

## 8. 한 줄 요약

> **"트리는 재귀의 놀이터."**
>
> 각 노드에서 **무엇을 반환할지**만 정의하면 대부분 끝.
> BST는 **중위 = 정렬**, 일반 트리는 **순회 4종 + 재귀**가 기본기.
