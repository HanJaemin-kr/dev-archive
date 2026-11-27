---
title: Redis 활용 패턴
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

# Redis 활용 패턴

## 캐싱 (Caching)

DB 부하를 줄이기 위해 자주 조회되는 데이터를 Redis에 저장.

### Cache-Aside (Lazy Loading)

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 300" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="redis-ca-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="320" y="24" text-anchor="middle" font-weight="bold" font-size="16">Cache-Aside (Lazy Loading) 흐름</text>

  <!-- nodes -->
  <rect x="30" y="120" width="120" height="50" rx="8" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="90" y="150" text-anchor="middle" font-size="13">애플리케이션</text>

  <rect x="260" y="120" width="120" height="50" rx="8" fill="#f8d7da" stroke="#333" stroke-width="1.5"/>
  <text x="320" y="150" text-anchor="middle" font-size="13">Redis 캐시</text>

  <rect x="490" y="120" width="120" height="50" rx="8" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="550" y="150" text-anchor="middle" font-size="13">DB</text>

  <!-- 1: read cache -->
  <line x1="150" y1="138" x2="256" y2="138" stroke="#333" stroke-width="2" marker-end="url(#redis-ca-arrow)"/>
  <text x="203" y="130" text-anchor="middle" font-size="11">① GET user:1</text>

  <!-- hit path -->
  <line x1="256" y1="158" x2="152" y2="158" stroke="#2e7d32" stroke-width="2" marker-end="url(#redis-ca-arrow)"/>
  <text x="203" y="176" text-anchor="middle" font-size="11" fill="#2e7d32">② HIT → 즉시 반환</text>

  <!-- miss -> db -->
  <line x1="380" y1="138" x2="486" y2="138" stroke="#c0392b" stroke-width="2" marker-end="url(#redis-ca-arrow)"/>
  <text x="433" y="130" text-anchor="middle" font-size="11" fill="#c0392b">③ MISS 시 DB 조회</text>

  <!-- db -> app return -->
  <line x1="490" y1="200" x2="90" y2="200" stroke="#333" stroke-width="2" marker-end="url(#redis-ca-arrow)"/>
  <text x="290" y="216" text-anchor="middle" font-size="11">④ 조회 결과 반환</text>
  <line x1="540" y1="170" x2="540" y2="198" stroke="#333" stroke-width="2"/>
  <line x1="90" y1="200" x2="90" y2="172" stroke="#333" stroke-width="2" marker-end="url(#redis-ca-arrow)"/>

  <!-- app -> write back cache -->
  <line x1="90" y1="240" x2="320" y2="240" stroke="#333" stroke-width="2"/>
  <line x1="90" y1="170" x2="90" y2="240" stroke="#333" stroke-width="2"/>
  <line x1="320" y1="240" x2="320" y2="172" stroke="#333" stroke-width="2" marker-end="url(#redis-ca-arrow)"/>
  <text x="205" y="256" text-anchor="middle" font-size="11">⑤ SET user:1 ... EX 3600 (캐시 채움)</text>

  <text x="320" y="285" text-anchor="middle" font-size="11" fill="#555">캐시에 없을 때만(지연) 로딩 → 다음 조회부터 HIT</text>
</svg>

```python
def get_user(user_id):
    cached = redis.get(f"user:{user_id}")
    if cached:
        return json.loads(cached)           # 캐시 히트

    user = db.query("SELECT * FROM users WHERE id = ?", user_id)
    redis.set(f"user:{user_id}", json.dumps(user), ex=3600)
    return user
```

### Write-Through

쓸 때 DB와 캐시 동시 업데이트. 일관성 보장, 쓰기 비용 증가.

### Write-Behind (Write-Back)

캐시에만 먼저 쓰고, 나중에 비동기로 DB에 반영. 쓰기 성능 최대, 데이터 유실 위험.

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 200" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="redis-wr-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="310" y="22" text-anchor="middle" font-weight="bold" font-size="16">쓰기 전략 비교</text>

  <!-- Write-Through -->
  <text x="155" y="50" text-anchor="middle" font-size="13" font-weight="bold">Write-Through (동기)</text>
  <rect x="20" y="65" width="80" height="40" rx="6" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="60" y="90" text-anchor="middle" font-size="11">App</text>
  <rect x="120" y="65" width="80" height="40" rx="6" fill="#f8d7da" stroke="#333" stroke-width="1.5"/>
  <text x="160" y="90" text-anchor="middle" font-size="11">캐시</text>
  <rect x="220" y="65" width="80" height="40" rx="6" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="260" y="90" text-anchor="middle" font-size="11">DB</text>
  <line x1="100" y1="85" x2="118" y2="85" stroke="#333" stroke-width="2" marker-end="url(#redis-wr-arrow)"/>
  <line x1="200" y1="85" x2="218" y2="85" stroke="#333" stroke-width="2" marker-end="url(#redis-wr-arrow)"/>
  <text x="160" y="130" text-anchor="middle" font-size="10" fill="#2e7d32">캐시·DB 동시 반영 → 일관성↑</text>
  <text x="160" y="146" text-anchor="middle" font-size="10" fill="#555">쓰기 지연은 커짐</text>

  <!-- Write-Behind -->
  <text x="465" y="50" text-anchor="middle" font-size="13" font-weight="bold">Write-Behind (비동기)</text>
  <rect x="330" y="65" width="80" height="40" rx="6" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="370" y="90" text-anchor="middle" font-size="11">App</text>
  <rect x="430" y="65" width="80" height="40" rx="6" fill="#f8d7da" stroke="#333" stroke-width="1.5"/>
  <text x="470" y="90" text-anchor="middle" font-size="11">캐시</text>
  <rect x="530" y="65" width="80" height="40" rx="6" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="570" y="90" text-anchor="middle" font-size="11">DB</text>
  <line x1="410" y1="85" x2="428" y2="85" stroke="#333" stroke-width="2" marker-end="url(#redis-wr-arrow)"/>
  <line x1="510" y1="85" x2="528" y2="85" stroke="#c0392b" stroke-width="2" stroke-dasharray="5 3" marker-end="url(#redis-wr-arrow)"/>
  <text x="520" y="60" text-anchor="middle" font-size="9" fill="#c0392b">나중에 일괄</text>
  <text x="470" y="130" text-anchor="middle" font-size="10" fill="#2e7d32">캐시만 즉시 → 쓰기 성능↑</text>
  <text x="470" y="146" text-anchor="middle" font-size="10" fill="#c0392b">DB 반영 전 장애 시 유실 위험</text>
</svg>

### 캐시 무효화 전략

```bash
# TTL 기반 자동 만료
SET user:1 "..." EX 300

# 이벤트 기반 수동 삭제
DEL user:1  # 데이터 변경 시 직접 삭제
```

## 세션 관리 (Session Store)

```python
# 로그인 시
session_id = generate_session_id()
redis.hset(f"session:{session_id}", mapping={
    "user_id": 42,
    "email": "hong@test.com",
    "role": "admin"
})
redis.expire(f"session:{session_id}", 1800)  # 30분

# 요청마다 검증
session = redis.hgetall(f"session:{session_id}")
redis.expire(f"session:{session_id}", 1800)  # 슬라이딩 만료 갱신
```

## 분산 락 (Distributed Lock)

여러 서버에서 동시에 같은 자원에 접근하는 것을 방지.

```python
import uuid

lock_key = "lock:payment:order_123"
lock_value = str(uuid.uuid4())

# 락 획득 (NX: 없을 때만, EX: 만료 시간)
acquired = redis.set(lock_key, lock_value, nx=True, ex=30)

if acquired:
    try:
        process_payment()
    finally:
        # 자신이 건 락인지 확인 후 해제 (원자적으로)
        lua_script = """
        if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
        end
        return 0
        """
        redis.eval(lua_script, 1, lock_key, lock_value)
```

## Pub/Sub (메시지 브로커)

```python
# Publisher
redis.publish("channel:notifications", json.dumps({
    "type": "order_complete",
    "user_id": 42,
    "order_id": 1001
}))

# Subscriber
pubsub = redis.pubsub()
pubsub.subscribe("channel:notifications")

for message in pubsub.listen():
    if message["type"] == "message":
        data = json.loads(message["data"])
        handle_notification(data)
```

> Pub/Sub는 메시지 영속성 없음. 구독자가 없으면 메시지 유실.  
> 영속성이 필요하면 **Redis Streams** 사용.

## Redis Streams (메시지 큐)

Kafka 유사한 영속성 있는 스트림.

```bash
# 메시지 추가
XADD events * action "login" user_id "42"

# 소비자 그룹 생성
XGROUP CREATE events my-group $ MKSTREAM

# 메시지 읽기 (소비자 그룹)
XREADGROUP GROUP my-group consumer1 COUNT 10 STREAMS events >

# 처리 완료 확인
XACK events my-group <message-id>
```

## Rate Limiting (요청 제한)

```python
def is_rate_limited(user_id, limit=100, window=60):
    key = f"rate:{user_id}:{int(time.time() // window)}"
    count = redis.incr(key)
    if count == 1:
        redis.expire(key, window)
    return count > limit
```

## 리더보드 (Sorted Set)

```python
# 점수 업데이트
redis.zincrby("leaderboard:global", score_delta, f"user:{user_id}")

# 상위 10명 조회
top10 = redis.zrevrange("leaderboard:global", 0, 9, withscores=True)

# 내 순위 조회
rank = redis.zrevrank("leaderboard:global", f"user:{user_id}")
```

## 자동완성 (Sorted Set + Prefix)

```python
# 단어 등록 (score=0, 알파벳 정렬 활용)
for i in range(len(word) + 1):
    redis.zadd("autocomplete", {word[:i]: 0})
redis.zadd("autocomplete", {word + "*": 0})

# 접두사로 검색
def autocomplete(prefix, count=10):
    start = redis.zrank("autocomplete", prefix)
    results = []
    for item in redis.zrange("autocomplete", start, start + 200):
        if item.startswith(prefix):
            if item.endswith("*"):
                results.append(item[:-1])
        else:
            break
    return results[:count]
```
