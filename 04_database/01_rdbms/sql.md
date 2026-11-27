---
title: SQL
domain: database
category: rdbms
tags: [database, rdbms]
level: intermediate
status: published
created: 2026-06-26
updated: 2026-06-26
velog: true
related: []
---

# SQL

## DDL (Data Definition Language)

```sql
CREATE TABLE users (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ADD COLUMN age INT;
DROP TABLE users;
TRUNCATE TABLE users;  -- 데이터 전체 삭제, 구조 유지
```

## DML (Data Manipulation Language)

```sql
INSERT INTO users (name, email) VALUES ('홍길동', 'hong@example.com');

SELECT id, name FROM users WHERE age > 20 ORDER BY name ASC LIMIT 10;

UPDATE users SET age = 30 WHERE id = 1;

DELETE FROM users WHERE id = 1;
```

## JOIN

> 두 테이블을 특정 컬럼 기준으로 연결해서 하나처럼 조회하는 것
>
> 기준: `ON A.id = B.id` — 이 조건으로 행을 연결한다

---

### 예제 테이블 (전 섹션 공통)

```
USERS                        ORDERS
user_id | name               order_id | user_id | price
--------|------              ---------|---------|------
1       | 김철수              1        | 1       | 10000
2       | 이영희              2        | 1       | 20000
3       | 박민수              3        | 2       | 15000
```

---

### INNER JOIN — 둘 다 있는 것만

```
  USERS                          ORDERS
┌─────────────────────┐        ┌─────────────────────────┐
│ user_id │ name      │        │ order_id │ user_id │ price│
├─────────┼───────────┤        ├──────────┼─────────┼──────┤
│    1    │ 김철수    │──────► │    1     │    1    │10000 │
│    1    │ 김철수    │──────► │    2     │    1    │20000 │
│    2    │ 이영희    │──────► │    3     │    2    │15000 │
│    3    │ 박민수    │──✗     └─────────────────────────┘
└─────────────────────┘  │
                         └── 매칭되는 ORDERS 행 없음 → 결과에서 제외

          ▼ 결과: 양쪽 모두 존재하는 행만 포함
```

```sql
SELECT u.name, o.price
FROM users u
INNER JOIN orders o ON u.user_id = o.user_id;
```

```
결과
name   | price
-------|------
김철수 | 10000
김철수 | 20000
이영희 | 15000
```

---

### LEFT JOIN — 왼쪽은 무조건 포함

```
  USERS                          ORDERS
┌─────────────────────┐        ┌─────────────────────────┐
│ user_id │ name      │        │ order_id │ user_id │ price│
├─────────┼───────────┤        ├──────────┼─────────┼──────┤
│    1    │ 김철수    │──────► │    1     │    1    │10000 │
│    1    │ 김철수    │──────► │    2     │    1    │20000 │
│    2    │ 이영희    │──────► │    3     │    2    │15000 │
│    3    │ 박민수    │──────► │  (없음)  │  (없음) │ NULL │ ← ★ 살아남음
└─────────────────────┘        └─────────────────────────┘

          ▼ 결과: 왼쪽(USERS) 전체 보존, 오른쪽 없으면 NULL 채움
```

```sql
SELECT u.name, o.price
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id;
```

```
결과
name   | price
-------|------
김철수 | 10000
김철수 | 20000
이영희 | 15000
박민수 | NULL
```

---

### RIGHT JOIN — 오른쪽은 무조건 포함

- LEFT JOIN에서 테이블 순서만 바꾼 것과 동일
- 실무/코테에서 거의 안 씀 → LEFT JOIN으로 대체 가능

---

### JOIN 종류 한눈에 비교

```
  INNER JOIN                LEFT JOIN               RIGHT JOIN
  (A ∩ B 만)               (A 전체 + B 교집합)     (B 전체 + A 교집합)

  ┌────┐  ┌────┐           ┌────┐  ┌────┐          ┌────┐  ┌────┐
  │    │██│    │           │████│██│    │           │    │██│████│
  │  A │██│ B  │           │  A │██│ B  │           │  A │██│ B  │
  │    │██│    │           │████│██│    │           │    │██│████│
  └────┘  └────┘           └────┘  └────┘          └────┘  └────┘
      ▲▲▲                   ▲▲▲▲▲▲▲▲               ▲▲▲▲▲▲▲▲▲
  교집합 영역만            왼쪽 전체 보존           오른쪽 전체 보존

  결과 행:                 결과 행:                결과 행:
  ┌───────────┐            ┌───────────┐           ┌───────────┐
  │ 김철수    │            │ 김철수    │           │ 김철수    │
  │ 이영희    │            │ 이영희    │           │ 이영희    │
  └───────────┘            │ 박민수    │ ← NULL    └───────────┘
  (박민수 제외)            └───────────┘           (박민수 제외)
```

| JOIN 종류  | 설명                          | 코테 빈도 |
|-----------|-------------------------------|---------|
| INNER     | 양쪽 모두 매칭되는 행만          | ★★★★★  |
| LEFT      | 왼쪽 전체 + 오른쪽 없으면 NULL  | ★★★★★  |
| RIGHT     | 오른쪽 전체 + 왼쪽 없으면 NULL  | ★       |
| FULL OUTER| 합집합 (MySQL: UNION으로 구현)  | ★★      |
| CROSS     | 카테시안 곱 (모든 조합)          | ★       |

---

### NULL 처리 — COALESCE / IFNULL

LEFT JOIN 후 집계하면 매칭 없는 쪽은 반드시 NULL이 됨

```sql
-- NULL 그대로면 집계 결과도 NULL
SUM(o.price)  →  박민수: NULL

-- 0으로 바꾸기
COALESCE(SUM(o.price), 0)  →  박민수: 0   -- 표준 SQL
IFNULL(SUM(o.price), 0)    →  박민수: 0   -- MySQL 전용
```

---

### 코테 핵심 패턴

#### 문제 표현 → JOIN 선택

| 문제에 이 말이 있으면 | 쓸 JOIN |
|---------------------|---------|
| "주문한 사용자만", "~한 경우만" | INNER JOIN |
| "모든 사용자", "없는 경우도 포함", "0으로 표시" | LEFT JOIN |

#### 공식 (외워두기)

```sql
-- 패턴 1: INNER JOIN + 집계
SELECT
    u.name,
    SUM(o.price) AS total_price
FROM users u
INNER JOIN orders o ON u.user_id = o.user_id
GROUP BY u.name
ORDER BY total_price DESC;

-- 패턴 2: LEFT JOIN + NULL → 0 처리 + 집계
SELECT
    u.name,
    COALESCE(SUM(o.price), 0) AS total_price
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
GROUP BY u.name
ORDER BY total_price DESC;
```

#### 자주 하는 실수

```sql
-- ❌ ON 컬럼 틀리게 연결
ON u.id = o.id        -- user_id ≠ id
-- ⭕
ON u.user_id = o.user_id

-- ❌ 테이블 별칭 잘못 참조
SUM(p.price)          -- p라는 별칭 없음
-- ⭕
SUM(o.price)

-- ❌ GROUP BY에 집계함수
GROUP BY SUM(name)
-- ⭕ 그룹 기준 컬럼만
GROUP BY u.name
```

## 집계 함수 & GROUP BY

```sql
SELECT department, COUNT(*) AS cnt, AVG(salary) AS avg_salary
FROM employees
GROUP BY department
HAVING AVG(salary) > 3000
ORDER BY avg_salary DESC;
```

- `WHERE`: GROUP BY 이전 필터
- `HAVING`: GROUP BY 이후 집계 결과 필터

### SELECT 쿼리 실행 순서

```
┌─────────────────────────────────────────────────────────────────┐
│                    SQL 논리적 실행 순서                          │
└─────────────────────────────────────────────────────────────────┘

  ┌──────────────┐
  │   1. FROM    │  ← 테이블을 가져온다
  │  (+ JOIN)    │
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │   2. WHERE   │  ← 행(row) 단위 필터링 (집계 전)
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │ 3. GROUP BY  │  ← 지정 컬럼 기준으로 그룹화
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │  4. HAVING   │  ← 그룹 단위 필터링 (집계 후)
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │  5. SELECT   │  ← 출력할 컬럼 선택 & 집계함수 계산
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │ 6. ORDER BY  │  ← 결과 정렬
  └──────────────┘

  ★ 핵심: WHERE는 GROUP BY 이전 → 집계함수 사용 불가
           HAVING은 GROUP BY 이후 → 집계함수 사용 가능
```

### GROUP BY 자주 하는 실수

```sql
-- ❌ 집계함수는 GROUP BY에 못 들어감
GROUP BY SUM(price)
GROUP BY COUNT(*)

-- ⭕ 그룹 기준 컬럼만
GROUP BY name
GROUP BY department
```

공식:

```sql
SELECT
    그룹컬럼,
    집계함수(대상컬럼)
FROM 테이블
GROUP BY 그룹컬럼
```

## 서브쿼리

```sql
-- 스칼라 서브쿼리
SELECT name, (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS order_count
FROM users u;

-- IN
SELECT name FROM users
WHERE id IN (SELECT user_id FROM orders WHERE amount > 10000);

-- EXISTS (IN보다 성능상 유리한 경우 많음)
SELECT name FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
```

## 윈도우 함수 (Window Function)

```sql
-- ROW_NUMBER: 파티션 내 순번
SELECT name, department,
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn
FROM employees;

-- RANK: 동점 시 번호 건너뜀 (1,1,3)
-- DENSE_RANK: 동점 시 번호 안 건너뜀 (1,1,2)

-- LAG / LEAD: 이전/다음 행 참조
SELECT date, revenue,
  LAG(revenue, 1) OVER (ORDER BY date) AS prev_revenue
FROM sales;
```

## 실행 계획 (EXPLAIN)

```sql
EXPLAIN SELECT * FROM users WHERE email = 'hong@example.com';
```

| 컬럼 | 의미 |
|------|------|
| `type` | ALL(풀스캔) < index < range < ref < eq_ref < const |
| `key` | 실제 사용된 인덱스 |
| `rows` | 예상 스캔 행 수 |
| `Extra` | Using where / Using index / Using filesort |
