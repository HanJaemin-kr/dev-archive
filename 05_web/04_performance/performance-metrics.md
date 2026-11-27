---
title: 성능 지표
domain: web
category: performance
tags: [web, performance]
level: intermediate
status: published
created: 2026-07-16
updated: 2026-07-16
velog: true
related: []
---

# 성능 지표

### TPS (Transactions Per Second)
- 초당 처리 트랜잭션 수
- 단순 지표가 아니라 **시스템 전체 병목의 결과값**
- TPS 낮음 = 어딘가 병목 존재

---

## 핵심 지표

### 동시접속자 (Concurrent Users)
- 동시에 활성 연결을 유지하는 사용자 수
- WebSocket 기반 실시간 시스템에서 특히 중요
- 서버 fd(파일 디스크립터) 한계, 메모리 소비와 직결

### Latency
- 요청 → 응답까지 걸리는 시간
- **P50 / P95 / P99** 기준으로 봐야 함 (평균은 이상치에 속음)
- P99 = 상위 1% 느린 요청의 응답시간 → 실제 사용자 경험에 가까움

#### 백분위(Percentile)가 평균보다 중요한 이유

응답시간 분포는 대개 오른쪽으로 긴 꼬리(long tail)를 갖는다. 대부분 빠르지만 일부가 크게 느리다.
평균은 이 꼬리에 끌려가 왜곡되고, 반대로 "느린 소수"를 감춰버리기도 한다. 그래서 **분포의 특정 지점(백분위)** 으로 봐야 한다.

- **P50(중앙값)**: 요청의 절반이 이 시간보다 빠름 → "보통 경험"
- **P95**: 100명 중 95명이 이 안에 들어옴 → 체감 상한선
- **P99**: 상위 1% 느린 요청 → 꼬리(tail latency), 실제 불만이 나오는 구간

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 300" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <text x="320" y="24" text-anchor="middle" font-weight="bold" font-size="16">Latency 분포와 P50 / P95 / P99</text>
  <!-- axes -->
  <line x1="60" y1="240" x2="600" y2="240" stroke="#333" stroke-width="1.5"/>
  <line x1="60" y1="60" x2="60" y2="240" stroke="#333" stroke-width="1.5"/>
  <text x="330" y="270" text-anchor="middle" font-size="12">응답시간 (ms) →</text>
  <text x="24" y="150" text-anchor="middle" font-size="12" transform="rotate(-90 24 150)">요청 수</text>

  <!-- right-skewed distribution curve -->
  <path d="M60,240 C120,240 150,80 200,80 C250,80 300,190 380,215 C460,235 520,238 600,239"
        fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>

  <!-- P50 -->
  <line x1="200" y1="80" x2="200" y2="240" stroke="#2a7" stroke-width="2" stroke-dasharray="5 3"/>
  <text x="200" y="74" text-anchor="middle" font-size="12" font-weight="bold" fill="#2a7">P50</text>
  <text x="200" y="256" text-anchor="middle" font-size="10" fill="#2a7">중앙값</text>

  <!-- P95 -->
  <line x1="400" y1="210" x2="400" y2="240" stroke="#c80" stroke-width="2" stroke-dasharray="5 3"/>
  <text x="400" y="200" text-anchor="middle" font-size="12" font-weight="bold" fill="#c80">P95</text>

  <!-- P99 -->
  <line x1="500" y1="230" x2="500" y2="240" stroke="#c33" stroke-width="2" stroke-dasharray="5 3"/>
  <text x="510" y="222" text-anchor="middle" font-size="12" font-weight="bold" fill="#c33">P99</text>

  <!-- tail highlight -->
  <text x="540" y="200" text-anchor="middle" font-size="11" fill="#c33">← 꼬리(tail)</text>

  <!-- 평균 표시 -->
  <line x1="260" y1="60" x2="260" y2="240" stroke="#888" stroke-width="1.5" stroke-dasharray="2 2"/>
  <text x="285" y="66" text-anchor="middle" font-size="11" fill="#888">평균(꼬리에 끌림)</text>
</svg>

평균(회색)은 소수의 느린 요청에 끌려 실제 "보통 경험"인 P50(초록)보다 오른쪽에 찍힌다. SLA/알람 기준은 보통 P95~P99로 잡는다.

### Throughput
- 단위 시간당 처리량 (req/s, msg/s, MB/s)
- TPS와 유사하지만 더 넓은 개념
- Latency ↑ → Throughput ↓ 관계

### Queue Backlog
- 메시지 큐에 쌓여 처리되지 않은 메시지 수
- Backlog 증가 = consumer 처리 속도 < producer 생성 속도
- 모니터링 지표: Kafka `lag`, RabbitMQ `messages_ready`

### DB Write Bottleneck
- 쓰기가 집중될 때 DB가 병목이 되는 현상
- **원인**: row lock 경합, index overhead, fsync 지연
- **대응**:
  - Write-behind (비동기 쓰기)
  - 배치 insert
  - 쓰기 전용 replica (샤딩)
  - 메시지 큐로 버퍼링 후 bulk insert

---

## TPS · Latency · 병목의 관계

TPS는 원인이 아니라 **결과**다. 요청은 여러 단계를 직렬로 통과하며, 그중 **가장 느린 한 단계(병목)** 가 전체 처리량의 상한을 정한다.
파이프라인의 어느 박스든 처리 속도가 떨어지면 그 앞에 대기가 쌓이고(Queue Backlog↑), latency가 오르며, TPS는 정체된다.

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 300" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="perf-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="350" y="24" text-anchor="middle" font-weight="bold" font-size="16">요청 처리 경로와 병목 지점</text>

  <!-- 요청 -->
  <rect x="20" y="90" width="90" height="50" rx="4" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="65" y="120" text-anchor="middle" font-size="12" font-weight="bold">요청</text>

  <!-- 네트워크 -->
  <rect x="150" y="90" width="110" height="50" rx="4" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="205" y="112" text-anchor="middle" font-size="12" font-weight="bold">네트워크</text>
  <text x="205" y="130" text-anchor="middle" font-size="10">latency</text>

  <!-- 앱 서버 -->
  <rect x="300" y="90" width="110" height="50" rx="4" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="355" y="112" text-anchor="middle" font-size="12" font-weight="bold">앱 서버</text>
  <text x="355" y="130" text-anchor="middle" font-size="10">CPU / GC / 메모리</text>

  <!-- DB/캐시/큐 (병목 강조) -->
  <rect x="450" y="85" width="130" height="60" rx="4" fill="#f8d7da" stroke="#c33" stroke-width="2.5"/>
  <text x="515" y="108" text-anchor="middle" font-size="12" font-weight="bold">DB / 캐시 / 큐</text>
  <text x="515" y="126" text-anchor="middle" font-size="10">lock · I/O · fsync</text>
  <text x="515" y="140" text-anchor="middle" font-size="10" fill="#c33">▲ 병목(가장 느림)</text>

  <!-- 응답 -->
  <rect x="620" y="90" width="60" height="50" rx="4" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="650" y="120" text-anchor="middle" font-size="12" font-weight="bold">응답</text>

  <!-- arrows -->
  <line x1="110" y1="115" x2="146" y2="115" stroke="#333" stroke-width="1.5" marker-end="url(#perf-arrow)"/>
  <line x1="260" y1="115" x2="296" y2="115" stroke="#333" stroke-width="1.5" marker-end="url(#perf-arrow)"/>
  <line x1="410" y1="115" x2="446" y2="115" stroke="#333" stroke-width="1.5" marker-end="url(#perf-arrow)"/>
  <line x1="580" y1="115" x2="616" y2="115" stroke="#333" stroke-width="1.5" marker-end="url(#perf-arrow)"/>

  <!-- backlog piling before bottleneck -->
  <rect x="424" y="92" width="6" height="46" fill="#c33" opacity="0.5"/>
  <rect x="432" y="98" width="6" height="40" fill="#c33" opacity="0.5"/>
  <rect x="440" y="104" width="6" height="34" fill="#c33" opacity="0.5"/>
  <text x="432" y="165" text-anchor="middle" font-size="10" fill="#c33">대기 큐 ↑</text>

  <!-- relation formula -->
  <rect x="90" y="205" width="520" height="70" rx="6" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="350" y="232" text-anchor="middle" font-size="13" font-weight="bold">TPS ≈ 동시처리수(병렬성) ÷ 평균 Latency</text>
  <text x="350" y="256" text-anchor="middle" font-size="11">병목 단계의 latency가 오르면 → 앞에 backlog 쌓임 → 전체 TPS 정체</text>
</svg>

병목(빨간 테두리) 앞에는 처리되지 못한 요청이 대기 큐로 쌓인다. 이때 앱 서버 CPU에 여유가 있어도 TPS는 오르지 않는다 — 이것이 "TPS 낮은데 CPU는 한가한" 전형적 DB/락 병목 신호다.

## 병목 위치 찾기

```
요청 → [네트워크] → [앱 서버] → [DB / 캐시 / 큐]
         ↑              ↑              ↑
      latency        CPU/메모리     lock/IO
```

| 증상 | 병목 위치 |
|------|-----------|
| TPS 낮은데 CPU 여유 있음 | DB I/O or lock |
| CPU 100% | 앱 로직 or GC |
| Queue backlog 증가 | Consumer 처리 속도 부족 |
| P99만 높음 | GC pause or 특정 쿼리 슬로우 |

---

## 대응 포인트

- TPS 목표치가 있으면 → 역산: TPS = 동시접속자 × (1 / latency)
- "고성능 시스템" 언급 시 → write 경로 설계, 큐 버퍼링, 캐시 레이어 언급
- 실시간 모니터링 → WebSocket 연결 수, queue lag, P99 latency 조합으로 판단
