---
title: REST API 설계 철학
domain: web
category: rest-api
tags: [web, rest-api]
level: intermediate
status: published
created: 2026-07-16
updated: 2026-07-16
velog: true
related: []
---

# REST API 설계 철학

## 핵심 원칙

- **무상태(Stateless)**: 서버는 클라이언트 상태를 저장하지 않음. 요청마다 필요한 정보를 모두 포함
- **리소스 중심**: 행위가 아닌 명사로 URL 설계 (`/users` O, `/getUsers` X)
- **HTTP 메서드 의미론**: GET(조회), POST(생성), PUT(전체 수정), PATCH(부분 수정), DELETE(삭제)
- **Stateless + Cacheable**: GET 응답은 캐시 가능하게 설계

## HTTP 메서드 의미론 (안전성 · 멱등성)

메서드 선택은 취향이 아니라 **안전성(safe)** 과 **멱등성(idempotent)** 이라는 계약으로 정해진다.
- **안전(Safe)**: 서버 상태를 바꾸지 않음(읽기 전용) → 캐시·프리페치 가능
- **멱등(Idempotent)**: 같은 요청을 여러 번 보내도 결과 상태가 동일 → 안전한 재시도 가능

| 메서드 | 용도 | 안전 | 멱등 | 요청 바디 | 캐시 |
|--------|------|:----:|:----:|:---------:|:----:|
| GET | 조회 | O | O | X | O |
| POST | 생성 / 비멱등 작업 | X | **X** | O | 원칙상 X |
| PUT | 전체 교체 | X | O | O | X |
| PATCH | 부분 수정 | X | △(설계에 따름) | O | X |
| DELETE | 삭제 | X | O | △ | X |

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 250" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <text x="310" y="24" text-anchor="middle" font-weight="bold" font-size="16">HTTP 메서드: 안전성 · 멱등성 사분면</text>
  <!-- axes -->
  <line x1="60" y1="200" x2="590" y2="200" stroke="#333" stroke-width="1.5"/>
  <line x1="325" y1="50" x2="325" y2="210" stroke="#333" stroke-width="1.5"/>
  <text x="590" y="220" text-anchor="end" font-size="11">멱등 O →</text>
  <text x="60" y="220" text-anchor="start" font-size="11">← 멱등 X</text>
  <text x="335" y="60" font-size="11">↑ 안전(읽기)</text>
  <text x="335" y="200" font-size="11">↓ 상태 변경</text>

  <!-- 안전 + 멱등: GET -->
  <rect x="420" y="70" width="140" height="40" rx="4" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="490" y="95" text-anchor="middle" font-size="12" font-weight="bold">GET (안전·멱등)</text>

  <!-- 변경 + 멱등: PUT, DELETE -->
  <rect x="420" y="130" width="140" height="55" rx="4" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="490" y="153" text-anchor="middle" font-size="12" font-weight="bold">PUT / DELETE</text>
  <text x="490" y="172" text-anchor="middle" font-size="11">변경·멱등</text>

  <!-- 변경 + 비멱등: POST -->
  <rect x="80" y="130" width="150" height="55" rx="4" fill="#f8d7da" stroke="#333" stroke-width="1.5"/>
  <text x="155" y="153" text-anchor="middle" font-size="12" font-weight="bold">POST</text>
  <text x="155" y="172" text-anchor="middle" font-size="11">변경·비멱등(재시도 주의)</text>

  <!-- PATCH 애매 -->
  <rect x="240" y="130" width="140" height="55" rx="4" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="310" y="153" text-anchor="middle" font-size="12" font-weight="bold">PATCH</text>
  <text x="310" y="172" text-anchor="middle" font-size="11">설계에 따라 멱등△</text>
</svg>

오른쪽(멱등)에 있는 메서드는 네트워크 실패 시 안전하게 재시도할 수 있고, 왼쪽 아래의 POST는 중복 생성 위험 때문에 멱등성 키가 필요하다.

## 실시간 vs 비실시간

| 구분 | 방식 | 적합한 경우 |
|------|------|-------------|
| 비실시간 | REST (요청-응답) | 단순 CRUD, 낮은 빈도 데이터 |
| 단방향 실시간 | SSE (Server-Sent Events) | 알림, 피드, 단방향 스트림 |
| 양방향 실시간 | WebSocket | 채팅, 게임, 실시간 모니터링 |
| 준실시간 | Long Polling | WebSocket 불가 환경 |

### 통신 방식 비교 (Polling · SSE · WebSocket)

같은 "실시간 비슷한 동작"이라도 연결 모델이 완전히 다르다. 아래는 데이터 흐름 방향과 연결 유지 방식을 나란히 비교한 그림이다.

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 380" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="comm-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="350" y="24" text-anchor="middle" font-weight="bold" font-size="16">Polling vs SSE vs WebSocket</text>
  <text x="120" y="52" text-anchor="middle" font-size="12" font-weight="bold">Client</text>
  <text x="580" y="52" text-anchor="middle" font-size="12" font-weight="bold">Server</text>

  <!-- ① Short Polling -->
  <rect x="20" y="66" width="660" height="88" rx="4" fill="#f8d7da" stroke="#333" stroke-width="1.2"/>
  <text x="30" y="84" font-size="12" font-weight="bold">① Short Polling — 주기적 요청/응답 (단방향, 매번 새 연결)</text>
  <line x1="120" y1="94" x2="120" y2="150" stroke="#999" stroke-dasharray="3 2"/>
  <line x1="580" y1="94" x2="580" y2="150" stroke="#999" stroke-dasharray="3 2"/>
  <line x1="120" y1="104" x2="576" y2="104" stroke="#333" stroke-width="1.2" marker-end="url(#comm-arrow)"/>
  <text x="350" y="100" text-anchor="middle" font-size="10">요청 (데이터 있어? — 대개 빈 응답)</text>
  <line x1="580" y1="118" x2="124" y2="118" stroke="#333" stroke-width="1.2" marker-end="url(#comm-arrow)"/>
  <text x="350" y="114" text-anchor="middle" font-size="10">응답</text>
  <line x1="120" y1="138" x2="576" y2="138" stroke="#333" stroke-width="1.2" marker-end="url(#comm-arrow)"/>
  <text x="350" y="134" text-anchor="middle" font-size="10">n초 뒤 또 요청... (낭비 발생)</text>

  <!-- ② SSE -->
  <rect x="20" y="164" width="660" height="88" rx="4" fill="#fff3cd" stroke="#333" stroke-width="1.2"/>
  <text x="30" y="182" font-size="12" font-weight="bold">② SSE — 한 번 연결, 서버→클라 단방향 스트림</text>
  <line x1="120" y1="192" x2="120" y2="248" stroke="#999" stroke-dasharray="3 2"/>
  <line x1="580" y1="192" x2="580" y2="248" stroke="#999" stroke-dasharray="3 2"/>
  <line x1="120" y1="202" x2="576" y2="202" stroke="#333" stroke-width="1.2" marker-end="url(#comm-arrow)"/>
  <text x="350" y="198" text-anchor="middle" font-size="10">최초 연결 (text/event-stream)</text>
  <line x1="580" y1="220" x2="124" y2="220" stroke="#333" stroke-width="1.2" marker-end="url(#comm-arrow)"/>
  <text x="350" y="216" text-anchor="middle" font-size="10">event push →</text>
  <line x1="580" y1="238" x2="124" y2="238" stroke="#333" stroke-width="1.2" marker-end="url(#comm-arrow)"/>
  <text x="350" y="234" text-anchor="middle" font-size="10">event push → (연결 유지, 자동 재연결)</text>

  <!-- ③ WebSocket -->
  <rect x="20" y="262" width="660" height="98" rx="4" fill="#d4edda" stroke="#333" stroke-width="1.2"/>
  <text x="30" y="280" font-size="12" font-weight="bold">③ WebSocket — 핸드셰이크 후 양방향 지속 연결</text>
  <line x1="120" y1="290" x2="120" y2="354" stroke="#999" stroke-dasharray="3 2"/>
  <line x1="580" y1="290" x2="580" y2="354" stroke="#999" stroke-dasharray="3 2"/>
  <line x1="120" y1="300" x2="576" y2="300" stroke="#333" stroke-width="1.2" marker-end="url(#comm-arrow)"/>
  <text x="350" y="296" text-anchor="middle" font-size="10">Upgrade 핸드셰이크 (ws://)</text>
  <line x1="580" y1="320" x2="124" y2="320" stroke="#333" stroke-width="1.2" marker-end="url(#comm-arrow)"/>
  <text x="350" y="316" text-anchor="middle" font-size="10">← 서버 메시지</text>
  <line x1="120" y1="340" x2="576" y2="340" stroke="#333" stroke-width="1.2" marker-end="url(#comm-arrow)"/>
  <text x="350" y="336" text-anchor="middle" font-size="10">클라 메시지 → (양방향 동시)</text>
</svg>

- **Short Polling(빨강)**: 구현 단순하지만 빈 응답이 많아 요청 낭비·지연 큼.
- **SSE(노랑)**: HTTP 위에서 동작, 서버→클라 단방향, 브라우저가 자동 재연결. 알림·피드에 적합.
- **WebSocket(초록)**: 핸드셰이크 후 하나의 TCP 연결로 양방향 실시간. 채팅·게임·실시간 모니터링에 적합하지만 연결 상태 관리 비용이 있다.

## Polling 문제

### Short Polling
- 클라이언트가 일정 간격으로 반복 요청
- **문제**: 불필요한 요청 폭증, 서버 부하, 응답 지연

### Long Polling
- 서버가 데이터 생길 때까지 연결 유지 후 응답
- **문제**: 연결 수 증가, timeout 관리 복잡

### 대안
- 실시간 필요 → WebSocket / SSE
- 배치성 데이터 → 메시지 큐 (Kafka, RabbitMQ)

## Retry 전략

### 기본 원칙
- 멱등성(Idempotency) 있는 요청만 재시도 (GET, PUT, DELETE)
- POST는 중복 생성 위험 → 멱등성 키 사용

### 패턴

**Exponential Backoff**
```
1차: 1초 후 재시도
2차: 2초 후 재시도
3차: 4초 후 재시도
...
최대 대기시간 cap 설정 (ex. 32초)
```

**Jitter 추가** (동시 재시도 충돌 방지)
```
대기시간 = random(0, exponential_backoff)
```

### 재시도 대상
- 5xx (서버 오류) → 재시도 O
- 429 (Rate Limit) → Retry-After 헤더 준수
- 4xx (클라이언트 오류) → 재시도 X (코드 버그)
- 네트워크 타임아웃 → 재시도 O (멱등 요청만)

### Circuit Breaker
- 연속 실패 n회 초과 시 요청 차단 (빠른 실패)
- 일정 시간 후 half-open 상태로 복구 시도
