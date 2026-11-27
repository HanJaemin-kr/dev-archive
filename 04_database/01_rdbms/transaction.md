---
title: 트랜잭션 (Transaction)
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

# 트랜잭션 (Transaction)

## 개념

하나의 논리적 작업 단위로 묶인 SQL 집합. 전부 성공하거나 전부 실패해야 한다.

```sql
START TRANSACTION;

UPDATE accounts SET balance = balance - 10000 WHERE id = 1;
UPDATE accounts SET balance = balance + 10000 WHERE id = 2;

COMMIT;    -- 전부 반영
-- ROLLBACK;  -- 전부 취소
```

## ACID

| 속성 | 설명 | 보장 메커니즘 |
|------|------|--------------|
| **Atomicity** (원자성) | 전부 실행 or 전혀 실행 안 됨 | ROLLBACK, Undo Log |
| **Consistency** (일관성) | 트랜잭션 전후 DB 제약 조건 유지 | 제약 조건, 트리거 |
| **Isolation** (격리성) | 동시 트랜잭션이 서로 간섭하지 않음 | 락, MVCC |
| **Durability** (지속성) | COMMIT 후 장애가 나도 데이터 유지 | Redo Log |

## 격리 수준 (Isolation Level)

### 발생 가능한 문제

| 문제 | 설명 |
|------|------|
| **Dirty Read** | 커밋되지 않은 데이터를 다른 트랜잭션이 읽음 |
| **Non-Repeatable Read** | 같은 행을 두 번 읽었을 때 값이 다름 (UPDATE) |
| **Phantom Read** | 같은 범위를 두 번 읽었을 때 행 수가 다름 (INSERT/DELETE) |

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 250" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="tx-anom-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="280" y="24" text-anchor="middle" font-weight="bold" font-size="16">Non-Repeatable Read 발생 시나리오</text>

  <!-- timelines -->
  <text x="130" y="52" text-anchor="middle" font-size="13" font-weight="bold">T1 (읽기)</text>
  <text x="430" y="52" text-anchor="middle" font-size="13" font-weight="bold">T2 (수정)</text>
  <line x1="130" y1="60" x2="130" y2="230" stroke="#333" stroke-width="1.5" marker-end="url(#tx-anom-arrow)"/>
  <line x1="430" y1="60" x2="430" y2="230" stroke="#333" stroke-width="1.5" marker-end="url(#tx-anom-arrow)"/>

  <!-- steps -->
  <rect x="40" y="70" width="180" height="30" rx="5" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="130" y="90" text-anchor="middle" font-size="11">① SELECT balance → 1000</text>

  <rect x="340" y="112" width="180" height="30" rx="5" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="430" y="132" text-anchor="middle" font-size="11">② UPDATE balance = 500</text>
  <rect x="340" y="148" width="180" height="24" rx="5" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="430" y="164" text-anchor="middle" font-size="11">③ COMMIT</text>

  <rect x="40" y="185" width="180" height="30" rx="5" fill="#f8d7da" stroke="#333" stroke-width="1.5"/>
  <text x="130" y="205" text-anchor="middle" font-size="11">④ SELECT balance → 500</text>

  <text x="280" y="240" text-anchor="middle" font-size="11" fill="#c0392b">같은 T1 안에서 같은 행을 읽었는데 값이 달라짐 (1000 → 500)</text>
</svg>

Phantom Read는 위와 비슷하지만 T2가 UPDATE 대신 조건 범위에 **새 행을 INSERT/DELETE** 해서, T1이 같은 범위를 다시 읽을 때 **행 개수**가 달라지는 경우다.

### 격리 수준별 허용 문제

| 격리 수준 | Dirty Read | Non-Repeatable Read | Phantom Read |
|-----------|-----------|---------------------|--------------|
| READ UNCOMMITTED | 발생 | 발생 | 발생 |
| READ COMMITTED | 방지 | 발생 | 발생 |
| REPEATABLE READ | 방지 | 방지 | 발생 (InnoDB는 방지) |
| SERIALIZABLE | 방지 | 방지 | 방지 |

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 240" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <text x="300" y="24" text-anchor="middle" font-weight="bold" font-size="16">격리 수준별 허용 문제 매트릭스</text>

  <!-- header row -->
  <rect x="20"  y="45" width="200" height="34" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="120" y="67" text-anchor="middle" font-size="12" font-weight="bold">격리 수준</text>
  <rect x="220" y="45" width="120" height="34" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="280" y="67" text-anchor="middle" font-size="11" font-weight="bold">Dirty Read</text>
  <rect x="340" y="45" width="130" height="34" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="405" y="63" text-anchor="middle" font-size="10" font-weight="bold">Non-Repeatable</text>
  <rect x="470" y="45" width="110" height="34" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="525" y="67" text-anchor="middle" font-size="11" font-weight="bold">Phantom</text>

  <!-- row: READ UNCOMMITTED -->
  <rect x="20"  y="79" width="200" height="34" fill="#f8d7da" stroke="#333" stroke-width="1.5"/>
  <text x="120" y="101" text-anchor="middle" font-size="11">READ UNCOMMITTED</text>
  <rect x="220" y="79" width="120" height="34" fill="#f8d7da" stroke="#333" stroke-width="1.5"/>
  <text x="280" y="101" text-anchor="middle" font-size="11">발생</text>
  <rect x="340" y="79" width="130" height="34" fill="#f8d7da" stroke="#333" stroke-width="1.5"/>
  <text x="405" y="101" text-anchor="middle" font-size="11">발생</text>
  <rect x="470" y="79" width="110" height="34" fill="#f8d7da" stroke="#333" stroke-width="1.5"/>
  <text x="525" y="101" text-anchor="middle" font-size="11">발생</text>

  <!-- row: READ COMMITTED -->
  <rect x="20"  y="113" width="200" height="34" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="120" y="135" text-anchor="middle" font-size="11">READ COMMITTED</text>
  <rect x="220" y="113" width="120" height="34" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="280" y="135" text-anchor="middle" font-size="11">방지</text>
  <rect x="340" y="113" width="130" height="34" fill="#f8d7da" stroke="#333" stroke-width="1.5"/>
  <text x="405" y="135" text-anchor="middle" font-size="11">발생</text>
  <rect x="470" y="113" width="110" height="34" fill="#f8d7da" stroke="#333" stroke-width="1.5"/>
  <text x="525" y="135" text-anchor="middle" font-size="11">발생</text>

  <!-- row: REPEATABLE READ -->
  <rect x="20"  y="147" width="200" height="34" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="120" y="169" text-anchor="middle" font-size="11">REPEATABLE READ</text>
  <rect x="220" y="147" width="120" height="34" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="280" y="169" text-anchor="middle" font-size="11">방지</text>
  <rect x="340" y="147" width="130" height="34" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="405" y="169" text-anchor="middle" font-size="11">방지</text>
  <rect x="470" y="147" width="110" height="34" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="525" y="164" text-anchor="middle" font-size="10">발생*</text>
  <text x="525" y="176" text-anchor="middle" font-size="8" fill="#555">InnoDB 방지</text>

  <!-- row: SERIALIZABLE -->
  <rect x="20"  y="181" width="200" height="34" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="120" y="203" text-anchor="middle" font-size="11">SERIALIZABLE</text>
  <rect x="220" y="181" width="120" height="34" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="280" y="203" text-anchor="middle" font-size="11">방지</text>
  <rect x="340" y="181" width="130" height="34" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="405" y="203" text-anchor="middle" font-size="11">방지</text>
  <rect x="470" y="181" width="110" height="34" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="525" y="203" text-anchor="middle" font-size="11">방지</text>

  <text x="300" y="232" text-anchor="middle" font-size="11" fill="#555">아래로 갈수록 격리 강함(초록=방지) ↔ 동시성·성능은 낮아짐</text>
</svg>

> MySQL InnoDB 기본값: **REPEATABLE READ** / PostgreSQL 기본값: **READ COMMITTED**

```sql
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;
```

## MVCC (Multi-Version Concurrency Control)

데이터의 여러 버전을 유지해 읽기와 쓰기가 서로 블로킹하지 않도록 함.

```
T1 시작 (스냅샷 생성)
    ↓
T2가 row 수정 → 새 버전 생성 (T1에는 안 보임)
    ↓
T1이 해당 row 읽음 → 자신의 스냅샷 버전 반환
    ↓
T1 커밋
```

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 270" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="tx-mvcc-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="310" y="24" text-anchor="middle" font-weight="bold" font-size="16">MVCC 스냅샷과 버전 체인 (InnoDB Undo Log)</text>

  <!-- version chain -->
  <text x="310" y="52" text-anchor="middle" font-size="12" font-weight="bold">row (id=1) 버전 체인</text>
  <rect x="380" y="65" width="200" height="40" rx="5" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="480" y="82" text-anchor="middle" font-size="12">최신: balance=500</text>
  <text x="480" y="97" text-anchor="middle" font-size="10" fill="#555">T2가 만든 새 버전 (커밋됨)</text>

  <rect x="380" y="130" width="200" height="40" rx="5" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="480" y="147" text-anchor="middle" font-size="12">이전: balance=1000</text>
  <text x="480" y="162" text-anchor="middle" font-size="10" fill="#555">Undo Log에 보존</text>

  <!-- rollback pointer -->
  <line x1="480" y1="105" x2="480" y2="129" stroke="#333" stroke-width="2" marker-end="url(#tx-mvcc-arrow)"/>
  <text x="500" y="122" font-size="10" fill="#555">roll_ptr</text>

  <!-- T1 snapshot -->
  <rect x="30" y="95" width="200" height="70" rx="8" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="130" y="120" text-anchor="middle" font-size="13" font-weight="bold">T1 스냅샷</text>
  <text x="130" y="140" text-anchor="middle" font-size="11">T2 커밋 전 시점 기준</text>
  <text x="130" y="156" text-anchor="middle" font-size="11">→ 이전 버전(1000)만 봄</text>

  <!-- arrow T1 reads old version -->
  <line x1="230" y1="145" x2="378" y2="150" stroke="#c0392b" stroke-width="2" marker-end="url(#tx-mvcc-arrow)"/>
  <text x="300" y="185" text-anchor="middle" font-size="11" fill="#c0392b">T1은 자신의 스냅샷에 맞는 버전을 읽음 → 읽기/쓰기 상호 블로킹 없음</text>

  <text x="310" y="235" text-anchor="middle" font-size="11" fill="#555">각 트랜잭션은 시작 시점 스냅샷을 보고, 최신 버전이 안 보이면 roll_ptr을 따라</text>
  <text x="310" y="251" text-anchor="middle" font-size="11" fill="#555">Undo Log의 옛 버전으로 거슬러 올라간다.</text>
</svg>

InnoDB: Undo Log로 이전 버전 관리. 각 행은 트랜잭션 ID와 이전 버전을 가리키는 roll_ptr을 숨은 컬럼으로 갖는다.

## 락 (Lock)

| 락 | 설명 |
|----|------|
| Shared Lock (S) | 읽기 락. 여러 트랜잭션 동시 획득 가능 |
| Exclusive Lock (X) | 쓰기 락. 단독 획득, 다른 락과 공존 불가 |
| Record Lock | 인덱스 레코드에 거는 락 |
| Gap Lock | 인덱스 레코드 사이 간격에 거는 락 (Phantom 방지) |
| Next-Key Lock | Record Lock + Gap Lock |

```sql
SELECT * FROM users WHERE id = 1 FOR UPDATE;         -- X Lock
SELECT * FROM users WHERE id = 1 LOCK IN SHARE MODE; -- S Lock
```

### 데드락 (Deadlock)

두 트랜잭션이 서로 상대방의 락을 기다리는 상황.

```
T1: A 락 획득 → B 락 대기
T2: B 락 획득 → A 락 대기  →  데드락
```

- **해결**: DB가 자동 감지 후 한 트랜잭션 롤백
- **예방**: 락 획득 순서 일관성 유지, 트랜잭션을 짧게 유지

## Savepoint

```sql
START TRANSACTION;

INSERT INTO logs VALUES ('step1');
SAVEPOINT sp1;

INSERT INTO logs VALUES ('step2');
SAVEPOINT sp2;

INSERT INTO logs VALUES ('step3');

ROLLBACK TO SAVEPOINT sp2;  -- step3만 취소
COMMIT;                      -- step1, step2 반영
```

## 실무 팁

- 트랜잭션은 최대한 짧게 유지 (락 보유 시간 최소화)
- 불필요한 `SELECT`는 트랜잭션 밖으로
- 대용량 배치는 청크 단위로 나눠 커밋
- 데드락 발생 시 재시도 로직 구현
