---
title: MySQL 메타데이터 락 (MDL)
domain: database
category: rdbms
tags: [database, rdbms, mysql, lock, ddl, metadata-lock, troubleshooting]
level: intermediate
status: published
created: 2026-11-27
updated: 2026-11-27
velog: false
related: ["[[transaction]]", "[[sql]]"]
---

# MySQL 메타데이터 락 (MDL)

> 실무 사례에서 일반화한 정리. "컬럼 하나 추가하는 ALTER가 왜 서비스 전체를 멈추게 하나?"에 대한 답.

## 핵심 개념

### MDL이란
- MySQL 5.5+는 트랜잭션이 테이블에 접근하면 그 테이블의 **메타데이터 락(MDL)** 을 잡고 **트랜잭션이 끝날 때까지** 유지한다.
  (문장 단위가 아니라 트랜잭션 단위. `SELECT`만 하고 커밋 안 한 트랜잭션도 MDL을 계속 쥔다.)
- 목적: 트랜잭션이 보고 있는 테이블의 **구조**가 도중에 바뀌지 않게 보호.
- InnoDB 행/테이블 락과 **별개 계층**이다. 그래서 `information_schema.INNODB_TRX`의 `trx_rows_locked`, `trx_tables_locked`가 0이어도 MDL은 잡혀 있을 수 있다.

| 요청 | MDL 종류 | 호환 |
|---|---|---|
| `SELECT` | SHARED_READ | 공유끼리 양립 |
| `INSERT/UPDATE/DELETE` | SHARED_WRITE | 공유끼리 양립 |
| `ALTER/DROP/RENAME` | EXCLUSIVE | **어떤 공유와도 불가** |

### 대기열 공정성 → convoy
MDL 대기열은 writer starvation을 막기 위해 **공정성**을 지킨다. 배타(EXCLUSIVE) 요청이 대기 중이면,
**그 뒤에 들어온 공유 요청(평범한 SELECT)도 배타 요청 뒤에 줄을 선다.**

```
[오래 열린 idle 트랜잭션: SHARED_READ 보유]
        ↑ 충돌
[ALTER TABLE: EXCLUSIVE 대기]   ← lock_wait_timeout 기본값 31536000초(1년)!
        ↑ 공정성 때문에 뒤에 줄섬
[이후 모든 SELECT: 대기]          → 서비스 응답 불가
```

- 문제는 ALTER가 "느린" 게 아니라 **대기열에 박혀 뒤를 막는 것**. 테이블 크기와 무관(6행짜리 테이블에서도 발생).
- 판별 신호: 단순 `SELECT COUNT(*)`도 멈춤, PROCESSLIST `STATE = 'Waiting for table metadata lock'`.

### 흔한 악화 요인
- `lock_wait_timeout` 기본값이 1년이라 실패하지 않고 계속 대기.
- **클라이언트 타임아웃(SSH 툴 등)으로 끊겨도 서버 쪽 ALTER는 살아 있다.** 이 상태에서 재시도하면 대기 ALTER가 중첩.
- idle 트랜잭션의 출처: ORM 커넥션 누수(트랜잭션 미종료), DB GUI 툴의 auto-commit 해제 세션.

## 예제 코드

### 진단 (해당 DB에 붙으면 같이 멈출 수 있으니 information_schema로)
```sql
-- 1) 대기 중인 스레드
SELECT ID, USER, DB, COMMAND, TIME, STATE, LEFT(INFO, 80) AS info
FROM information_schema.PROCESSLIST
WHERE STATE LIKE '%metadata%' OR INFO LIKE '%ALTER%'
ORDER BY TIME DESC;

-- 2) 열린 트랜잭션을 "나이" 순으로 (locked 수치보다 나이가 중요)
SELECT trx_mysql_thread_id AS thread, trx_state,
       TIMESTAMPDIFF(SECOND, trx_started, NOW()) AS age_s,
       trx_rows_modified, LEFT(trx_query, 60) AS q
FROM information_schema.INNODB_TRX
ORDER BY trx_started;

-- (performance_schema 활성 시) 누가 어떤 MDL을 쥐고 있나
SELECT OBJECT_SCHEMA, OBJECT_NAME, LOCK_TYPE, LOCK_STATUS, OWNER_THREAD_ID
FROM performance_schema.metadata_locks
WHERE OBJECT_TYPE = 'TABLE';
```

### 대응 순서
```sql
-- 1) 먼저 "내" 대기 DDL을 KILL → 배타 요청이 빠지면 공유끼리는 양립하므로 서비스 즉시 복구
KILL <my_alter_thread_id>;

-- 2) 장기 idle 트랜잭션 확인: 출처·마지막 SQL·trx_rows_modified=0(미커밋 변경 없음) 확인 후 정리
KILL <idle_trx_thread_id>;

-- 3) 짧은 대기 시간으로 재실행 (같은 세션에서)
SET SESSION lock_wait_timeout = 5;
ALTER TABLE companies ADD COLUMN type VARCHAR(255) NULL AFTER name;
```

### 운영 DDL 체크리스트
1. `SET SESSION lock_wait_timeout = 5;` 후 DDL — 못 잡으면 빨리 실패하게.
2. DDL 직전 `INNODB_TRX` 나이순 확인 → 오래된 트랜잭션 먼저 정리.
3. 타임아웃 난 DDL을 무작정 재시도하지 않는다 → PROCESSLIST부터.
4. 서버 `wait_timeout`/`interactive_timeout`으로 유휴 연결 회수, ORM 트랜잭션 누수 점검.
5. 큰 테이블은 online DDL(`ALGORITHM=INPLACE, LOCK=NONE`)·`pt-online-schema-change`·`gh-ost` 고려. 단, 이들도 **시작/종료 시점에 짧게 MDL이 필요**하다.

### ORM 자동 동기화(TypeORM `synchronize` 등)를 운영에 쓰지 않는 이유
- 같은 MDL에 걸리면 **앱 부팅 자체가 hang**.
- 엔티티와 DB의 모든 차이를 "교정"하려 해 **컬럼 DROP·타입 변경·FK 재생성**이 일어날 수 있다(수기 관리 DB는 drift가 거의 확실).
- 여러 DB 연결에 일괄 적용되면 피해 범위가 커지고, 컬럼 위치(`AFTER`)도 보장되지 않는다.
→ 운영은 마이그레이션 스크립트 또는 DB별 수동 DDL.

## 면접 예상 질문

- **Q. 수 행짜리 작은 테이블에 컬럼 추가했는데 서비스가 멈췄다. 왜?**
  A. 크기 문제가 아니라 MDL 대기열 문제. 장기 트랜잭션이 공유 MDL을 쥔 상태에서 ALTER가 배타 MDL을 기다리고, 공정성 때문에 이후 SELECT가 모두 ALTER 뒤에 줄을 섰기 때문.
- **Q. INNODB_TRX에서 락 개수가 0인데 왜 락이 걸려 있나?**
  A. MDL은 InnoDB 락과 다른 계층(SQL 레이어)이라 거기 집계되지 않는다. `performance_schema.metadata_locks`나 트랜잭션 나이로 본다.
- **Q. 장애 시 무엇부터 KILL하나?**
  A. 소유가 확실한 대기 DDL부터. 그것만 빠져도 공유 요청끼리는 양립해 서비스가 즉시 풀린다. 원인 트랜잭션은 출처·미커밋 변경 여부를 확인한 뒤 정리.
- **Q. 재발 방지책은?**
  A. `lock_wait_timeout`을 짧게, DDL 전 장기 트랜잭션 점검, 커넥션 누수 방지, 큰 테이블은 online schema change 도구.
