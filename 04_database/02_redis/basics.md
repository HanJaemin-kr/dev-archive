---
title: Redis 기초
domain: database
category: redis
tags: [database, redis]
level: intermediate
status: published
created: 2026-07-16
updated: 2026-07-16
velog: true
related: []
---

# Redis 기초

## 개념

- In-Memory Key-Value Store
- 단일 스레드 (이벤트 루프 기반) → 원자성 보장
- 영속성: RDB(스냅샷) / AOF(명령 로그) 선택 가능
- 기본 포트: `6379`

## 자료구조

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 320" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <text x="340" y="24" text-anchor="middle" font-weight="bold" font-size="16">Redis 주요 자료구조 (Key → Value)</text>

  <!-- String -->
  <rect x="20" y="45" width="200" height="70" rx="8" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="120" y="66" text-anchor="middle" font-size="13" font-weight="bold">String</text>
  <rect x="35" y="78" width="170" height="26" rx="4" fill="#fff" stroke="#333" stroke-width="1"/>
  <text x="120" y="96" text-anchor="middle" font-size="11">"홍길동" · 42 · 바이너리</text>

  <!-- Hash -->
  <rect x="240" y="45" width="200" height="70" rx="8" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="340" y="66" text-anchor="middle" font-size="13" font-weight="bold">Hash (필드-값)</text>
  <rect x="255" y="76" width="170" height="15" fill="#fff" stroke="#333" stroke-width="0.8"/>
  <text x="340" y="88" text-anchor="middle" font-size="10">name → 홍길동</text>
  <rect x="255" y="93" width="170" height="15" fill="#fff" stroke="#333" stroke-width="0.8"/>
  <text x="340" y="105" text-anchor="middle" font-size="10">age → 30</text>

  <!-- List -->
  <rect x="460" y="45" width="200" height="70" rx="8" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="560" y="66" text-anchor="middle" font-size="13" font-weight="bold">List (순서 O, 중복 O)</text>
  <rect x="475" y="80" width="42" height="24" fill="#fff" stroke="#333" stroke-width="1"/>
  <text x="496" y="96" text-anchor="middle" font-size="10">t1</text>
  <rect x="517" y="80" width="42" height="24" fill="#fff" stroke="#333" stroke-width="1"/>
  <text x="538" y="96" text-anchor="middle" font-size="10">t2</text>
  <rect x="559" y="80" width="42" height="24" fill="#fff" stroke="#333" stroke-width="1"/>
  <text x="580" y="96" text-anchor="middle" font-size="10">t3</text>
  <text x="640" y="97" text-anchor="middle" font-size="10" fill="#555">…</text>

  <!-- Set -->
  <rect x="130" y="150" width="220" height="80" rx="8" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="240" y="171" text-anchor="middle" font-size="13" font-weight="bold">Set (순서 X, 중복 X)</text>
  <circle cx="185" cy="200" r="22" fill="#fff" stroke="#333" stroke-width="1"/>
  <text x="185" y="204" text-anchor="middle" font-size="10">redis</text>
  <circle cx="240" cy="200" r="22" fill="#fff" stroke="#333" stroke-width="1"/>
  <text x="240" y="204" text-anchor="middle" font-size="10">cache</text>
  <circle cx="295" cy="200" r="22" fill="#fff" stroke="#333" stroke-width="1"/>
  <text x="295" y="204" text-anchor="middle" font-size="10">db</text>

  <!-- Sorted Set -->
  <rect x="380" y="150" width="280" height="80" rx="8" fill="#f8d7da" stroke="#333" stroke-width="1.5"/>
  <text x="520" y="171" text-anchor="middle" font-size="13" font-weight="bold">Sorted Set / ZSet (score 정렬)</text>
  <rect x="395" y="182" width="250" height="18" fill="#fff" stroke="#333" stroke-width="0.8"/>
  <text x="520" y="195" text-anchor="middle" font-size="10">player2 : 2300  (1위)</text>
  <rect x="395" y="202" width="250" height="18" fill="#fff" stroke="#333" stroke-width="0.8"/>
  <text x="520" y="215" text-anchor="middle" font-size="10">player1 : 1500  (2위)</text>

  <text x="340" y="262" text-anchor="middle" font-size="12" font-weight="bold">특수 자료구조</text>
  <rect x="120" y="272" width="200" height="34" rx="6" fill="#e8f0fe" stroke="#333" stroke-width="1.2"/>
  <text x="220" y="293" text-anchor="middle" font-size="11">Bitmap · 비트 플래그</text>
  <rect x="360" y="272" width="200" height="34" rx="6" fill="#fff3cd" stroke="#333" stroke-width="1.2"/>
  <text x="460" y="293" text-anchor="middle" font-size="11">HyperLogLog · 근사 카운트</text>
</svg>

값(Value)의 타입에 따라 자료구조가 달라진다. 순서가 필요하면 List, 중복 제거는 Set, 순위/랭킹은 ZSet을 쓴다.

### String

가장 기본. 문자열, 숫자, 바이너리 모두 저장 가능 (최대 512MB).

```bash
SET name "홍길동"
GET name                  # "홍길동"

SET counter 0
INCR counter              # 1 (원자적 증가)
INCRBY counter 5          # 6

SET token "abc123" EX 3600  # TTL 3600초
TTL token                 # 남은 시간(초)
```

### Hash

필드-값 쌍의 집합. 객체 저장에 적합.

```bash
HSET user:1 name "홍길동" email "hong@test.com" age 30
HGET user:1 name          # "홍길동"
HGETALL user:1            # 모든 필드-값
HDEL user:1 age
HEXISTS user:1 email      # 1 (존재하면 1)
```

### List

연결 리스트. 양쪽 끝 삽입/삭제 O(1).

```bash
LPUSH queue "task1"       # 왼쪽 삽입
RPUSH queue "task2"       # 오른쪽 삽입
LPOP queue                # 왼쪽에서 꺼냄
RPOP queue                # 오른쪽에서 꺼냄
LRANGE queue 0 -1         # 전체 조회
LLEN queue                # 길이
```

### Set

중복 없는 문자열 집합.

```bash
SADD tags "redis" "database" "cache"
SISMEMBER tags "redis"    # 1 (존재하면 1)
SMEMBERS tags             # 모든 멤버
SCARD tags                # 원소 개수
SREM tags "cache"

# 집합 연산
SUNION set1 set2          # 합집합
SINTER set1 set2          # 교집합
SDIFF set1 set2           # 차집합
```

### Sorted Set (ZSet)

점수(score)로 정렬된 Set. 리더보드에 최적.

```bash
ZADD leaderboard 1500 "player1"
ZADD leaderboard 2300 "player2"
ZADD leaderboard 800  "player3"

ZREVRANGE leaderboard 0 9 WITHSCORES  # 상위 10명 (내림차순)
ZRANK leaderboard "player1"           # 순위 (오름차순 기준)
ZSCORE leaderboard "player2"          # 점수 조회
ZINCRBY leaderboard 100 "player1"     # 점수 증가
```

### Bitmap

비트 단위 조작. 대용량 플래그 저장에 유리.

```bash
SETBIT active_users 1001 1   # user_id 1001 활성화
GETBIT active_users 1001     # 1
BITCOUNT active_users        # 활성 사용자 수
```

### HyperLogLog

대용량 집합의 카디널리티를 근사값으로 계산 (메모리 12KB 고정).

```bash
PFADD visitors "user1" "user2" "user3"
PFCOUNT visitors          # 약 3 (오차 0.81%)
```

## 키 관리

```bash
KEYS pattern              # ⚠️ 프로덕션 사용 금지 (블로킹)
SCAN 0 MATCH "user:*" COUNT 100  # 논블로킹 순회

EXISTS key
DEL key1 key2
EXPIRE key 60             # TTL 설정 (초)
PERSIST key               # TTL 제거
TYPE key                  # 자료구조 타입 확인
```

## 영속성 (Persistence)

| 방식 | 설명 | 장점 | 단점 |
|------|------|------|------|
| **RDB** | 주기적 스냅샷 | 빠른 재시작 | 마지막 스냅샷 이후 데이터 유실 가능 |
| **AOF** | 모든 명령 로그 | 데이터 유실 최소 | 파일 크기 큼, 재시작 느림 |
| **혼합** | RDB + AOF | 두 방식의 장점 | 기본 권장 설정 |

```bash
# redis.conf
save 900 1       # 900초 내 1개 이상 변경 시 RDB 저장
appendonly yes   # AOF 활성화
```
