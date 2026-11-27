---
title: Shopify 재고 예약 시스템 (Redis → MySQL 전환)
domain: good
tags: [good]
level: intermediate
status: published
created: 2026-06-01
updated: 2026-06-01
velog: false
related: []
---

글 : [Shopify, 재고 예약 시스템을 Redis에서 MySQL로 교체 | GeekNews](https://news.hada.io/topic?id=30006)


# Shopify 재고 예약 시스템 (Redis → MySQL 전환)

## 기존 구조

### Redis

- 예약(Reserve) 관리
    
- DECR / INCR 로 수량 감소·증가
    

### MySQL

- 실제 재고 원장 관리
    

문제:

- 예약 데이터와 실제 재고 데이터가 서로 다른 시스템에 존재
    
- 하나의 트랜잭션으로 묶을 수 없음
    
- 장애 발생 시 Redis와 MySQL 데이터 불일치 가능
    
- 오버셀(Oversell) 또는 언더셀(Undersell) 발생 위험
    

---

## 개선 구조

예약과 재고를 모두 MySQL에서 처리

### 기존 방식

inventory

|item_id|quantity|
|---|---|
|1001|10|

수량 컬럼 하나를 여러 사용자가 동시에 수정

---

### Shopify 방식

reservation_units

|item_id|unit_id|
|---|---|
|1001|1|
|1001|2|
|1001|3|
|...|...|

재고 10개 = 행 10개

예약 시:

SELECT ... FOR UPDATE SKIP LOCKED

사용

---

## SKIP LOCKED

기존:

- 다른 트랜잭션이 락을 잡고 있으면 대기
    

SKIP LOCKED:

- 락이 걸린 행은 건너뜀
    
- 사용 가능한 행만 즉시 획득
    

예시

A 고객:

- unit 1,2,3 예약
    

B 고객:

- unit 4,5,6 예약
    

동시에 처리 가능

---

## 왜 이렇게 했는가?

기존:

UPDATE inventory  
SET quantity = quantity - 1

모든 요청이 동일한 row를 수정

↓

락 경쟁 증가

---

개선:

각 요청이 서로 다른 row를 가져감

↓

락 경쟁 감소

↓

동시 처리량 증가

---

## 행 수 폭증 문제

실제 재고:

50,000개

Unit 방식:

50,000 row 필요

문제:

- 테이블 크기 증가
    
- 인덱스 증가
    
- 관리 비용 증가
    

---

## Shopify 해결 방법

Pool 방식 사용

실제 재고:

50,000개

예약용 Unit:

최대 1,000개

유지

예)

inventory_quantity = 50,000

reservation_units = 1,000 rows

예약용 Unit이 부족해지면  
백그라운드에서 추가 생성

---

## 추가 최적화

### 1. 복합 기본키 사용

(shop_id, inventory_item_id, inventory_group_id, id)

효과:

- 락 수 감소
    
- 인덱스 탐색 감소
    

---

### 2. READ COMMITTED 사용

기본:

- REPEATABLE READ
    

변경:

- READ COMMITTED
    

효과:

- Gap Lock 감소
    
- INSERT 충돌 감소
    

---

### 3. 락 순서 통일

항상 동일한 순서로 테이블 접근

효과:

- Deadlock 제거
    

---

### 4. UNION ALL 배치 처리

여러 상품 예약을 한 번에 처리

효과:

- DB Round Trip 감소
    

---

## 실제 병목

예상:

- 예약 쿼리가 느림
    

실제:

- 애플리케이션이 DB 커넥션을 오래 점유
    

해결:

- SQL 주석 태그 추가
    

/* conn_tag:checkout_completion */

커넥션 사용 시간 추적

결과:

- DB 읽기 50% 감소
    
- 트랜잭션 33% 감소
    

---

## 핵심 교훈

1. Redis가 항상 MySQL보다 좋은 것은 아니다.
    
2. 데이터 정합성이 더 중요하다.
    
3. 락 경쟁을 줄이는 구조 설계가 중요하다.
    
4. 성능 문제는 쿼리보다 커넥션 점유에서 발생할 수 있다.
    
5. 오래된 아키텍처 결정도 주기적으로 재검토해야 한다.