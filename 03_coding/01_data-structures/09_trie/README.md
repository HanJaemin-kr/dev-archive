# 09. Trie (트라이, 접두사 트리)

## 1. 트라이란?

**문자열 집합을 저장하는 트리.** 각 노드는 한 문자를 의미하고, 루트→현재 경로가 곧 문자열의 접두사가 된다.

**언제 쓰나?** "여러 문자열을 저장하고, 어떤 문자열이 다른 문자열의 접두사인지 빠르게 알고 싶을 때."

### 도식 — `["car", "card", "cat", "dog"]` 저장

```
                  (root)
                 /      \
              'c'        'd'
               │          │
              'a'        'o'
              / \         │
            'r'  't'      'g'★
            /    ★
          'd'★

   ★ = 단어의 끝 (isEnd = true)

   "car"  → c → a → r ★
   "card" → c → a → r → d ★
   "cat"  → c → a → t ★
   "dog"  → d → o → g ★
```

> 공통 접두사 `ca`가 한 번만 저장됨 → 메모리 효율 + 빠른 접두사 검색.

## 2. 시간복잡도

| 연산 | 복잡도 | 설명 |
|------|--------|------|
| `insert(word)` | O(L) | L = 단어 길이 |
| `search(word)` | O(L) | 전체 일치 검색 |
| `startsWith(prefix)` | O(L) | 접두사 검색 |
| 공간 | O(전체 문자 수 × 알파벳 크기) | 노드마다 자식 맵 |

> 핵심: **단어 개수와 무관하게 길이에만 의존**. 해시맵보다 접두사 연산에서 압도적.

## 3. JS 구현 템플릿

```js
class TrieNode {
  constructor() {
    this.children = {};   // { ch: TrieNode }
    this.isEnd = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    node.isEnd = true;
  }

  search(word) {
    const node = this._find(word);
    return node !== null && node.isEnd;
  }

  startsWith(prefix) {
    return this._find(prefix) !== null;
  }

  _find(s) {
    let node = this.root;
    for (const ch of s) {
      if (!node.children[ch]) return null;
      node = node.children[ch];
    }
    return node;
  }
}
```

### 동작 추적

```
   insert("cat"):
     root → 'c' 없음 → 생성 → 이동
            'a' 없음 → 생성 → 이동
            't' 없음 → 생성 → 이동
            isEnd = true

   search("ca"):
     root → 'c' OK → 'a' OK → 종료
     node.isEnd?  false  → return false  (등록된 단어 아님)

   startsWith("ca"):
     같은 경로, 끝까지 도달했으므로 true
```

## 4. 대표 패턴

### 패턴 A — 단어 사전 (insert / search / startsWith)

가장 기본. 위 구현 그대로.

용도: 사전 확인, 스펠 체크 사전, 단어 게임

### 패턴 B — 접두사 매칭 / 자동완성

```
   사전: ["car", "card", "care", "cargo"]
   입력: "car"  →  자동완성 후보?

   1) "car" 경로 따라 내려감
   2) 도달한 노드에서 DFS로 모든 단어 수집
        → ["car", "card", "care", "cargo"]
```

```js
autocomplete(prefix) {
  const start = this._find(prefix);
  if (!start) return [];
  const out = [];
  const dfs = (node, path) => {
    if (node.isEnd) out.push(path);
    for (const ch in node.children) dfs(node.children[ch], path + ch);
  };
  dfs(start, prefix);
  return out;
}
```

### 패턴 C — 전화번호 목록 / 접두사 충돌 검사

```
   목록에 어떤 번호가 다른 번호의 접두사인가?

   ["119", "97674223", "1195524421"]
       ↑                ↑
     "119"가 "1195524421"의 접두사  →  ❌

   방법 1: 모든 번호 정렬 후 인접 쌍이 startsWith인지 검사 — O(n log n)

   방법 2: 모두 trie에 insert.
           insert 도중 isEnd=true 노드를 만나면 충돌.
           insert 후 자식이 더 있으면 (현재 단어가 접두사) 충돌.
```

### 패턴 D — Word Break / 검색 트리

```
   문장을 사전 단어들로 쪼갤 수 있는가?

   "applepie", 사전 = ["apple", "pie", "ap"]

   trie를 타고 가며 isEnd를 만날 때마다 분기:
       "apple" 끝 → 남은 "pie"를 다시 trie로
       "ap"    끝 → 남은 "plepie" 시도...

   DP + Trie 조합으로 O(n²) 가능.
```

## 5. Trie vs Hash Set

| 비교 | Hash Set | Trie |
|------|---------|------|
| 단어 존재 확인 | O(L) 평균 (해시 계산) | O(L) |
| 접두사 확인 | **불가능** (모든 단어 순회 O(N·L)) | **O(L)** |
| 메모리 | 입력 문자열 합계 | 공통 접두사는 한 번만 |
| 정렬 출력 | 별도 정렬 필요 | DFS로 사전순 자동 |
| 자동완성 | 불가능 | 자연스러움 |

**핵심**: **접두사 연산이 필요 없으면 Set으로 충분.** 접두사가 들어오는 순간 Trie의 영역.

## 6. 자주 하는 실수

- **`isEnd` 누락** → "ca"가 등록 안 됐는데 "cat"이 등록된 경우 구분 불가.
- **`children`을 배열(26칸)로만 쓰기** → 대소문자/숫자/특수문자 입력에서 깨짐. 객체나 `Map` 권장.
- **메모리 폭발** → 단어가 매우 길고 공통 접두사가 없으면 비효율. 케이스 따라 다른 자료구조 검토.
- **루트 노드를 단어로 카운트** → 빈 문자열("")은 루트의 `isEnd`로 표현 가능. 의도 확인.

## 7. 정리된 문제

| # | 문제 | 패턴 | 비고 |
|---|------|------|------|
| 001 | [트라이 구현](./question/001_트라이구현.md) | A. 기본 | insert/search/startsWith |
| 002 | [전화번호 목록](./question/002_전화번호목록.md) | C. 접두사 충돌 | insert 중 isEnd 만남 |
| 003 | [자동완성](./question/003_자동완성.md) | B. 접두사 매칭 | prefix 노드 이후 DFS |

## 8. 한 줄 요약

> **"공통 접두사를 한 번만 저장하는 트리."**
>
> 접두사 검색이 필요한 순간 Trie를 떠올릴 것.
> 단어 길이 L에 대해 모든 연산이 O(L) — 사전 크기와 무관.
