---
title: WebSocket
domain: cs
category: network
tags: [cs, network, websocket]
level: intermediate
status: published
created: 2026-07-16
updated: 2026-07-16
velog: true
related: []
---

# WebSocket

## 개요
- HTTP 핸드셰이크 후 TCP 연결을 **업그레이드**해 양방향 통신 채널 유지
- 연결 1개로 서버 ↔ 클라이언트 모두 자유롭게 메시지 전송 가능

## HTTP vs WebSocket

| 항목 | HTTP | WebSocket |
|------|------|-----------|
| 연결 방식 | 요청마다 새 연결 (HTTP/1.1 keep-alive 제외) | 연결 유지 |
| 방향 | 클라이언트 → 서버 단방향 | 양방향 |
| 오버헤드 | 헤더 매 요청마다 | 최초 핸드셰이크 1회 |
| 적합한 경우 | CRUD, 단순 조회 | 실시간 데이터, 채팅, 모니터링 |

## 연결 흐름

```
Client → HTTP Upgrade Request → Server
Client ← 101 Switching Protocols ← Server
=== WebSocket 연결 수립 ===
Client ↔ Server (양방향 자유 통신)
```

### 업그레이드 핸드셰이크 (HTTP → 101)

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 340" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="ws-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="260" y="24" text-anchor="middle" font-weight="bold" font-size="16">WebSocket 업그레이드 핸드셰이크</text>

  <rect x="70" y="44" width="100" height="30" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="120" y="64" text-anchor="middle" font-size="13" font-weight="bold">Client</text>
  <rect x="350" y="44" width="100" height="30" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="400" y="64" text-anchor="middle" font-size="13" font-weight="bold">Server</text>
  <line x1="120" y1="74" x2="120" y2="312" stroke="#333" stroke-width="1.5"/>
  <line x1="400" y1="74" x2="400" y2="312" stroke="#333" stroke-width="1.5"/>

  <!-- ① Upgrade request -->
  <line x1="120" y1="108" x2="400" y2="108" stroke="#333" stroke-width="1.5" marker-end="url(#ws-arrow)"/>
  <text x="260" y="98" text-anchor="middle" font-size="12">① HTTP GET + Upgrade 요청</text>
  <rect x="130" y="114" width="260" height="52" fill="#fff3cd" stroke="#333" stroke-width="1"/>
  <text x="140" y="132" font-size="10">Upgrade: websocket</text>
  <text x="140" y="147" font-size="10">Connection: Upgrade</text>
  <text x="140" y="162" font-size="10">Sec-WebSocket-Key: dGhlIH...==</text>

  <!-- ② 101 response -->
  <line x1="400" y1="204" x2="120" y2="204" stroke="#333" stroke-width="1.5" marker-end="url(#ws-arrow)"/>
  <text x="260" y="194" text-anchor="middle" font-size="12">② 101 Switching Protocols</text>
  <rect x="130" y="210" width="260" height="36" fill="#fff3cd" stroke="#333" stroke-width="1"/>
  <text x="140" y="228" font-size="10">Sec-WebSocket-Accept: (Key 해시)</text>
  <text x="140" y="242" font-size="10">→ 프로토콜 전환 확정</text>

  <!-- established full-duplex -->
  <rect x="90" y="266" width="340" height="40" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="260" y="284" text-anchor="middle" font-size="12" font-weight="bold">동일 TCP 연결 유지 · 양방향(full-duplex) 통신</text>
  <text x="260" y="300" text-anchor="middle" font-size="10" fill="#555">이후 프레임 단위로 Client ↔ Server 자유 송수신</text>
</svg>

*최초 1회 HTTP GET에 Upgrade 헤더를 실어 보내고 서버가 101로 응답하면, 같은 TCP 연결을 재활용해 양방향 채널로 전환된다. 이후에는 HTTP 헤더 없이 프레임만 주고받는다.*

### HTTP 폴링 vs WebSocket

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="ws2-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="300" y="24" text-anchor="middle" font-weight="bold" font-size="16">HTTP 폴링 vs WebSocket</text>

  <!-- Polling (left) -->
  <text x="150" y="48" text-anchor="middle" font-size="13" font-weight="bold">HTTP 폴링</text>
  <line x1="90" y1="60" x2="90" y2="300" stroke="#333" stroke-width="1.5"/>
  <line x1="230" y1="60" x2="230" y2="300" stroke="#333" stroke-width="1.5"/>
  <text x="90" y="74" text-anchor="middle" font-size="10">Client</text>
  <text x="230" y="74" text-anchor="middle" font-size="10">Server</text>
  <!-- repeated request/response pairs -->
  <line x1="90" y1="92" x2="230" y2="92" stroke="#333" stroke-width="1.3" marker-end="url(#ws2-arrow)"/>
  <text x="160" y="87" text-anchor="middle" font-size="9">요청(새 연결)</text>
  <line x1="230" y1="112" x2="90" y2="112" stroke="#333" stroke-width="1.3" marker-end="url(#ws2-arrow)"/>
  <text x="160" y="107" text-anchor="middle" font-size="9">응답(데이터 없음)</text>
  <line x1="90" y1="150" x2="230" y2="150" stroke="#333" stroke-width="1.3" marker-end="url(#ws2-arrow)"/>
  <text x="160" y="145" text-anchor="middle" font-size="9">요청(새 연결)</text>
  <line x1="230" y1="170" x2="90" y2="170" stroke="#333" stroke-width="1.3" marker-end="url(#ws2-arrow)"/>
  <text x="160" y="165" text-anchor="middle" font-size="9">응답(데이터 없음)</text>
  <line x1="90" y1="208" x2="230" y2="208" stroke="#333" stroke-width="1.3" marker-end="url(#ws2-arrow)"/>
  <text x="160" y="203" text-anchor="middle" font-size="9">요청(새 연결)</text>
  <line x1="230" y1="228" x2="90" y2="228" stroke="#333" stroke-width="1.3" marker-end="url(#ws2-arrow)"/>
  <text x="160" y="223" text-anchor="middle" font-size="9" fill="#c0392b">응답(데이터 O)</text>
  <rect x="55" y="252" width="210" height="40" fill="#f8d7da" stroke="#333" stroke-width="1.2"/>
  <text x="160" y="270" text-anchor="middle" font-size="10">매번 새 연결 + 헤더 반복</text>
  <text x="160" y="285" text-anchor="middle" font-size="10">불필요한 빈 응답 = 오버헤드</text>

  <!-- WebSocket (right) -->
  <text x="450" y="48" text-anchor="middle" font-size="13" font-weight="bold">WebSocket</text>
  <line x1="380" y1="60" x2="380" y2="300" stroke="#333" stroke-width="1.5"/>
  <line x1="520" y1="60" x2="520" y2="300" stroke="#333" stroke-width="1.5"/>
  <text x="380" y="74" text-anchor="middle" font-size="10">Client</text>
  <text x="520" y="74" text-anchor="middle" font-size="10">Server</text>
  <!-- one handshake -->
  <line x1="380" y1="96" x2="520" y2="96" stroke="#333" stroke-width="1.3" marker-end="url(#ws2-arrow)"/>
  <text x="450" y="91" text-anchor="middle" font-size="9">핸드셰이크 1회</text>
  <line x1="520" y1="116" x2="380" y2="116" stroke="#333" stroke-width="1.3" marker-end="url(#ws2-arrow)"/>
  <text x="450" y="111" text-anchor="middle" font-size="9">101 수립</text>
  <!-- server push whenever -->
  <line x1="520" y1="150" x2="380" y2="150" stroke="#c0392b" stroke-width="1.3" marker-end="url(#ws2-arrow)"/>
  <text x="450" y="145" text-anchor="middle" font-size="9" fill="#c0392b">서버 push</text>
  <line x1="380" y1="180" x2="520" y2="180" stroke="#333" stroke-width="1.3" marker-end="url(#ws2-arrow)"/>
  <text x="450" y="175" text-anchor="middle" font-size="9">클라이언트 전송</text>
  <line x1="520" y1="210" x2="380" y2="210" stroke="#c0392b" stroke-width="1.3" marker-end="url(#ws2-arrow)"/>
  <text x="450" y="205" text-anchor="middle" font-size="9" fill="#c0392b">서버 push</text>
  <rect x="345" y="252" width="210" height="40" fill="#d4edda" stroke="#333" stroke-width="1.2"/>
  <text x="450" y="270" text-anchor="middle" font-size="10">연결 1개 유지 · 헤더 없음</text>
  <text x="450" y="285" text-anchor="middle" font-size="10">데이터 생길 때 즉시 push</text>
</svg>

*폴링은 새 데이터 여부를 알기 위해 주기적으로 요청을 반복해 빈 응답과 헤더 오버헤드가 크다. WebSocket은 연결을 한 번만 맺고 유지하므로, 서버가 데이터가 생기는 즉시 push할 수 있어 실시간 모니터링에 적합하다.*

## 주요 고려사항

### 연결 수 관리
- 연결 1개 = 파일 디스크립터 1개 소비
- 서버 OS 기본 fd 한계: 1024 → `ulimit -n`으로 조정 필요
- 대규모: nginx upstream으로 WebSocket 서버 수평 확장

### 연결 유지
- 유휴 연결 끊김 방지: **heartbeat (ping/pong)** 주기적 전송
- 클라이언트 재연결 로직 필수 (exponential backoff)

### 로드밸런싱
- 일반 L4/L7 LB는 WebSocket 연결을 끊을 수 있음
- Sticky Session 또는 WebSocket aware LB 필요
- 수평 확장 시 서버 간 메시지 동기화 → Redis Pub/Sub 또는 메시지 큐 사용

## 실시간 모니터링에서의 활용

- 센서/설비 데이터 → 백엔드 수신 → WebSocket으로 클라이언트 push
- 연결 수 × 메시지 빈도 = 서버 부하 기준으로 스케일링 판단
- 비정상 연결 감지: ping timeout → 연결 제거 및 알림
