---
title: 인덱스 (Index)
domain: database
category: rdbms
tags: [database, rdbms]
level: intermediate
status: published
created: 2026-07-16
updated: 2026-07-16
velog: true
related: []
---

# 인덱스 (Index)

## 개념

특정 컬럼 값으로 행을 빠르게 찾기 위한 자료구조.  
조회 성능을 높이지만 INSERT/UPDATE/DELETE 시 인덱스도 갱신되므로 쓰기 비용이 증가한다.

## B-Tree 인덱스 (기본)

```
          [50]
         /    \
      [20]    [80]
      /  \    /  \
   [10] [30] [60] [90]
```

- 대부분 RDBMS의 기본 인덱스 구조
- 범위 검색(`BETWEEN`, `>`, `<`, `LIKE 'abc%'`)에 효율적
- `=`, `ORDER BY`, `GROUP BY`에도 활용

> 실제 InnoDB/PostgreSQL의 기본 구조는 **B+Tree**다. 일반 B-Tree와 달리
> 실제 데이터(또는 PK)는 **리프 노드에만** 저장되고, 내부 노드는 탐색용 키만 갖는다.
> 또 모든 리프가 **연결 리스트로 이어져** 있어 범위 스캔에 매우 유리하다.

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 300" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <text x="320" y="24" text-anchor="middle" font-weight="bold" font-size="16">B+Tree 인덱스 구조</text>

  <!-- root -->
  <rect x="270" y="45" width="100" height="34" rx="5" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="320" y="67" text-anchor="middle" font-size="13">[ 50 ]</text>
  <text x="425" y="63" font-size="11" fill="#555">루트 노드</text>

  <!-- internal -->
  <rect x="120" y="120" width="110" height="34" rx="5" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="175" y="142" text-anchor="middle" font-size="13">[ 20 | 40 ]</text>
  <rect x="410" y="120" width="110" height="34" rx="5" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="465" y="142" text-anchor="middle" font-size="13">[ 70 | 90 ]</text>
  <text x="548" y="140" font-size="11" fill="#555">내부 노드</text>

  <!-- root -> internal -->
  <line x1="300" y1="79" x2="200" y2="119" stroke="#333" stroke-width="1.5"/>
  <line x1="340" y1="79" x2="440" y2="119" stroke="#333" stroke-width="1.5"/>

  <!-- leaves -->
  <rect x="20" y="200" width="120" height="40" rx="5" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="80" y="225" text-anchor="middle" font-size="12">10 · 20 · 30</text>
  <rect x="180" y="200" width="120" height="40" rx="5" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="240" y="225" text-anchor="middle" font-size="12">40 · 45 · 48</text>
  <rect x="340" y="200" width="120" height="40" rx="5" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="400" y="225" text-anchor="middle" font-size="12">50 · 60 · 65</text>
  <rect x="500" y="200" width="120" height="40" rx="5" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="560" y="225" text-anchor="middle" font-size="12">70 · 90 · 99</text>
  <text x="320" y="262" text-anchor="middle" font-size="11" fill="#555">리프 노드 (실제 데이터 · PK 저장)</text>

  <!-- internal -> leaves -->
  <line x1="150" y1="154" x2="80" y2="199" stroke="#333" stroke-width="1.5"/>
  <line x1="200" y1="154" x2="240" y2="199" stroke="#333" stroke-width="1.5"/>
  <line x1="440" y1="154" x2="400" y2="199" stroke="#333" stroke-width="1.5"/>
  <line x1="490" y1="154" x2="560" y2="199" stroke="#333" stroke-width="1.5"/>

  <!-- leaf linked list -->
  <line x1="140" y1="220" x2="180" y2="220" stroke="#c0392b" stroke-width="1.5" stroke-dasharray="4 2"/>
  <line x1="300" y1="220" x2="340" y2="220" stroke="#c0392b" stroke-width="1.5" stroke-dasharray="4 2"/>
  <line x1="460" y1="220" x2="500" y2="220" stroke="#c0392b" stroke-width="1.5" stroke-dasharray="4 2"/>
  <text x="320" y="288" text-anchor="middle" font-size="11" fill="#c0392b">리프끼리 연결 리스트로 이어짐 → 범위 스캔 O(리프 순회)</text>
</svg>

리프 노드에만 데이터가 있고 리프끼리 정렬 순서로 연결돼 있어, 범위 검색 시 한 리프를 찾은 뒤 옆 리프로 순차 이동하면 된다.

## 인덱스 종류

| 종류 | 설명 |
|------|------|
| Primary Key | 클러스터형, 데이터 자체가 정렬됨 (InnoDB) |
| Unique Index | 중복 불허 |
| Composite Index | 복합 컬럼 인덱스 |
| Full-Text Index | 텍스트 전문 검색 |
| Hash Index | `=` 검색만 지원, 범위 검색 불가 (Memory 엔진) |
| Covering Index | 쿼리에 필요한 모든 컬럼이 인덱스에 포함 |

## 클러스터형 vs 비클러스터형

**클러스터형 (Clustered)**
- 데이터 행 자체가 인덱스 순서대로 저장
- 테이블당 1개만 존재 (PK)
- 범위 조회 매우 빠름

**비클러스터형 (Non-Clustered / Secondary)**
- 인덱스 → PK → 실제 데이터 (2단계 조회)
- 테이블당 여러 개 생성 가능

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 260" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="idx-clu-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="330" y="24" text-anchor="middle" font-weight="bold" font-size="16">클러스터형 vs 비클러스터형 조회 경로</text>

  <!-- Clustered -->
  <text x="165" y="52" text-anchor="middle" font-size="13" font-weight="bold">클러스터형 (PK)</text>
  <rect x="60" y="65" width="210" height="34" rx="5" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="165" y="87" text-anchor="middle" font-size="12">PK 인덱스 (id=42 탐색)</text>
  <rect x="60" y="130" width="210" height="40" rx="5" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="165" y="148" text-anchor="middle" font-size="12">리프 = 실제 데이터 행</text>
  <text x="165" y="164" text-anchor="middle" font-size="11" fill="#555">(id, name, email ...)</text>
  <line x1="165" y1="99" x2="165" y2="129" stroke="#333" stroke-width="2" marker-end="url(#idx-clu-arrow)"/>
  <text x="165" y="200" text-anchor="middle" font-size="11" fill="#c0392b">1단계 조회</text>

  <!-- Non-clustered -->
  <text x="495" y="52" text-anchor="middle" font-size="13" font-weight="bold">비클러스터형 (Secondary)</text>
  <rect x="390" y="65" width="210" height="34" rx="5" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="495" y="87" text-anchor="middle" font-size="12">보조 인덱스 (email 탐색)</text>
  <rect x="390" y="118" width="210" height="30" rx="5" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="495" y="138" text-anchor="middle" font-size="12">리프 = PK 값 (id=42)</text>
  <rect x="390" y="168" width="210" height="34" rx="5" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="495" y="190" text-anchor="middle" font-size="12">PK 인덱스로 실제 행 조회</text>
  <line x1="495" y1="99" x2="495" y2="117" stroke="#333" stroke-width="2" marker-end="url(#idx-clu-arrow)"/>
  <line x1="495" y1="148" x2="495" y2="167" stroke="#333" stroke-width="2" marker-end="url(#idx-clu-arrow)"/>
  <text x="495" y="228" text-anchor="middle" font-size="11" fill="#c0392b">2단계 조회 (Key Lookup)</text>
</svg>

비클러스터형은 리프에 PK만 있어, 실제 행을 얻으려면 PK(클러스터) 인덱스를 한 번 더 타는 "책갈피 조회(Key Lookup)"가 발생한다. 이 2차 조회를 없앤 것이 아래의 커버링 인덱스다.

## 복합 인덱스 (Composite Index)

```sql
CREATE INDEX idx_name ON users (last_name, first_name, age);
```

**왼쪽 접두사 규칙 (Leftmost Prefix Rule)**

| 쿼리 조건 | 인덱스 사용 |
|-----------|-----------|
| `last_name = 'Kim'` | ✅ |
| `last_name = 'Kim' AND first_name = 'Min'` | ✅ |
| `first_name = 'Min'` | ❌ 첫 번째 컬럼 빠짐 |
| `last_name = 'Kim' AND age = 25` | ⚠️ last_name만 사용 |

## 커버링 인덱스 (Covering Index)

SELECT하는 모든 컬럼이 인덱스에 포함 → 실제 데이터 페이지 접근 없이 처리.

```sql
CREATE INDEX idx_cover ON orders (user_id, amount, status);

-- Extra: Using index (데이터 페이지 미접근)
SELECT user_id, amount FROM orders WHERE user_id = 1 AND status = 'paid';
```

## 인덱스를 못 쓰는 패턴

```sql
WHERE YEAR(created_at) = 2024        -- ❌ 컬럼 가공
WHERE created_at >= '2024-01-01'     -- ✅

WHERE name LIKE '%Kim'               -- ❌ 앞 와일드카드
WHERE name LIKE 'Kim%'               -- ✅

WHERE status != 'active'             -- ❌ NOT, !=
WHERE id = '123'                     -- ❌ 암묵적 형변환 (id가 INT면)
```

## 인덱스 설계 원칙

1. 카디널리티 높은 컬럼 우선 (성별보다 이메일)
2. 자주 쓰는 WHERE 조건 컬럼
3. JOIN 연결 컬럼 (ON 절)
4. 너무 많은 인덱스 지양 — 쓰기 성능 저하, 옵티마이저 혼란

## 관리 명령어

```sql
CREATE INDEX idx_email ON users (email);
SHOW INDEX FROM users;
DROP INDEX idx_email ON users;
EXPLAIN SELECT * FROM users WHERE email = 'test@test.com';
```
