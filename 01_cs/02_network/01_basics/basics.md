---
title: 네트워크 기초 (Network Basics)
domain: cs
category: network
tags: [cs, network, basics]
level: intermediate
status: published
created: 2026-07-16
updated: 2026-07-16
velog: false
related: []
---

# 네트워크 기초 (Network Basics)

---

## 1. OSI 7계층

네트워크 통신을 7개 계층으로 추상화한 참조 모델.

```
┌─────────────────────────────────────────┐
│  7. 응용 계층 (Application)              │ HTTP, FTP, DNS, SMTP
├─────────────────────────────────────────┤
│  6. 표현 계층 (Presentation)             │ SSL/TLS, JPEG, MPEG (인코딩/암호화)
├─────────────────────────────────────────┤
│  5. 세션 계층 (Session)                  │ 세션 수립/유지/종료
├─────────────────────────────────────────┤
│  4. 전송 계층 (Transport)                │ TCP, UDP (Port 번호)
├─────────────────────────────────────────┤
│  3. 네트워크 계층 (Network)              │ IP, ICMP, ARP (IP 주소, 라우터)
├─────────────────────────────────────────┤
│  2. 데이터링크 계층 (Data Link)          │ Ethernet, Wi-Fi (MAC 주소, 스위치)
├─────────────────────────────────────────┤
│  1. 물리 계층 (Physical)                 │ 비트 전송 (케이블, 허브)
└─────────────────────────────────────────┘
```

**기억법**: "아파서 티내는 데이터 피야 → 응표세전네데물"

### OSI 7계층 ↔ TCP/IP 4계층 대응 다이어그램

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 470" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="basics-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="320" y="24" text-anchor="middle" font-weight="bold" font-size="16">OSI 7계층 ↔ TCP/IP 4계층 대응</text>
  <text x="150" y="48" text-anchor="middle" font-weight="bold" font-size="13">OSI 7계층</text>
  <text x="490" y="48" text-anchor="middle" font-weight="bold" font-size="13">TCP/IP 4계층</text>

  <!-- OSI 7 -->
  <rect x="30" y="60" width="240" height="34" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="42" y="82" font-size="12">⑦ 응용 (Application)</text>
  <rect x="30" y="94" width="240" height="34" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="42" y="116" font-size="12">⑥ 표현 (Presentation)</text>
  <rect x="30" y="128" width="240" height="34" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="42" y="150" font-size="12">⑤ 세션 (Session)</text>
  <rect x="30" y="162" width="240" height="34" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="42" y="184" font-size="12">④ 전송 (Transport)</text>
  <rect x="30" y="196" width="240" height="34" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="42" y="218" font-size="12">③ 네트워크 (Network)</text>
  <rect x="30" y="230" width="240" height="34" fill="#f8d7da" stroke="#333" stroke-width="1.5"/>
  <text x="42" y="252" font-size="12">② 데이터링크 (Data Link)</text>
  <rect x="30" y="264" width="240" height="34" fill="#f8d7da" stroke="#333" stroke-width="1.5"/>
  <text x="42" y="286" font-size="12">① 물리 (Physical)</text>

  <!-- TCP/IP 4 -->
  <rect x="380" y="60" width="230" height="102" fill="#e8f0fe" stroke="#333" stroke-width="2"/>
  <text x="495" y="105" text-anchor="middle" font-size="12" font-weight="bold">응용 (Application)</text>
  <text x="495" y="124" text-anchor="middle" font-size="11">HTTP·DNS·FTP·SMTP</text>
  <text x="495" y="140" text-anchor="middle" font-size="10" fill="#555">PDU: 메시지(Message)</text>

  <rect x="380" y="162" width="230" height="34" fill="#d4edda" stroke="#333" stroke-width="2"/>
  <text x="495" y="180" text-anchor="middle" font-size="12" font-weight="bold">전송 (Transport)</text>
  <text x="495" y="192" text-anchor="middle" font-size="10" fill="#555">TCP·UDP / PDU: 세그먼트</text>

  <rect x="380" y="196" width="230" height="34" fill="#fff3cd" stroke="#333" stroke-width="2"/>
  <text x="495" y="214" text-anchor="middle" font-size="12" font-weight="bold">인터넷 (Internet)</text>
  <text x="495" y="226" text-anchor="middle" font-size="10" fill="#555">IP·ICMP·ARP / PDU: 패킷</text>

  <rect x="380" y="230" width="230" height="68" fill="#f8d7da" stroke="#333" stroke-width="2"/>
  <text x="495" y="258" text-anchor="middle" font-size="12" font-weight="bold">네트워크 접근 (Network Access)</text>
  <text x="495" y="276" text-anchor="middle" font-size="11">Ethernet·Wi-Fi</text>
  <text x="495" y="290" text-anchor="middle" font-size="10" fill="#555">PDU: 프레임 → 비트</text>

  <!-- mapping arrows -->
  <line x1="270" y1="111" x2="378" y2="111" stroke="#333" stroke-width="1.5" marker-end="url(#basics-arrow)"/>
  <line x1="270" y1="179" x2="378" y2="179" stroke="#333" stroke-width="1.5" marker-end="url(#basics-arrow)"/>
  <line x1="270" y1="213" x2="378" y2="213" stroke="#333" stroke-width="1.5" marker-end="url(#basics-arrow)"/>
  <line x1="270" y1="281" x2="378" y2="264" stroke="#333" stroke-width="1.5" marker-end="url(#basics-arrow)"/>

  <!-- encapsulation note -->
  <text x="320" y="330" text-anchor="middle" font-size="11" fill="#555">송신: 위 → 아래로 헤더를 덧붙이며 캡슐화 (메시지→세그먼트→패킷→프레임→비트)</text>
  <text x="320" y="348" text-anchor="middle" font-size="11" fill="#555">수신: 아래 → 위로 헤더를 벗기며 역캡슐화</text>

  <!-- device layer legend -->
  <rect x="30" y="372" width="580" height="82" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="320" y="392" text-anchor="middle" font-size="12" font-weight="bold">계층별 대표 장비</text>
  <text x="60" y="414" font-size="11">3계층 라우터 — IP 기반 경로 선택</text>
  <text x="360" y="414" font-size="11">2계층 스위치 — MAC 기반 포트 전송</text>
  <text x="60" y="436" font-size="11">1계층 허브/리피터 — 신호 브로드캐스트</text>
  <text x="360" y="436" font-size="11">4~7계층 게이트웨이 — 프로토콜 변환</text>
</svg>

*OSI의 5~7계층은 TCP/IP에서 응용 계층 하나로, 1~2계층은 네트워크 접근 계층 하나로 통합된다. 각 계층은 고유 PDU(데이터 단위)를 가지며, 송신 시 위에서 아래로 헤더를 덧붙이는 캡슐화가 일어난다.*

### 계층별 데이터 단위

| 계층 | 데이터 단위 | 주요 장비 |
|------|-----------|---------|
| 7~5 | 메시지(Message) | 게이트웨이 |
| 4 | 세그먼트(Segment) | - |
| 3 | 패킷(Packet) | 라우터 |
| 2 | 프레임(Frame) | 스위치, 브리지 |
| 1 | 비트(Bit) | 허브, 리피터 |

---

## 2. TCP/IP 4계층

실제 인터넷에서 사용하는 모델 (OSI의 실용적 단순화).

```
┌──────────────────────┐
│  응용 계층            │ HTTP, DNS, FTP, SMTP
│  (Application)       │ ← OSI 5,6,7 계층 통합
├──────────────────────┤
│  전송 계층            │ TCP, UDP
│  (Transport)         │
├──────────────────────┤
│  인터넷 계층          │ IP, ICMP, ARP
│  (Internet)          │ ← OSI 3계층
├──────────────────────┤
│  네트워크 접근 계층   │ Ethernet, Wi-Fi
│  (Network Access)    │ ← OSI 1,2 계층 통합
└──────────────────────┘
```

---

## 3. 주요 네트워크 장비

| 장비 | 계층 | 역할 |
|------|------|------|
| **허브 (Hub)** | 1계층 | 수신 신호를 모든 포트로 브로드캐스트 |
| **스위치 (Switch)** | 2계층 | MAC 주소 기반 포트 선택 전송 |
| **라우터 (Router)** | 3계층 | IP 주소 기반 최적 경로 선택 |
| **게이트웨이** | 4~7계층 | 서로 다른 프로토콜 네트워크 연결 |

---

## 4. IP 주소

### IPv4 vs IPv6

| | IPv4 | IPv6 |
|--|:----:|:----:|
| 주소 길이 | 32bit (4 bytes) | 128bit (16 bytes) |
| 표기 | 192.168.0.1 | 2001:db8::1 |
| 주소 개수 | 약 43억 | 사실상 무한 |
| 헤더 크기 | 20~60 byte | 40 byte (고정) |

### 공인 IP vs 사설 IP

- **공인 IP**: 인터넷에서 유일한 주소 (ISP에서 할당)
- **사설 IP**: 내부 네트워크 전용 (10.x.x.x, 172.16.x.x, 192.168.x.x)
- **NAT (Network Address Translation)**: 사설 IP ↔ 공인 IP 변환

---

## 5. MAC 주소 vs IP 주소

| | MAC 주소 | IP 주소 |
|--|:--------:|:------:|
| 계층 | 2계층 (데이터링크) | 3계층 (네트워크) |
| 용도 | 동일 네트워크 내 통신 | 다른 네트워크 간 통신 |
| 변경 | 고정 (하드웨어) | 동적 변경 가능 |
| 예시 | AA:BB:CC:DD:EE:FF | 192.168.0.1 |

### ARP (Address Resolution Protocol)

IP 주소 → MAC 주소 변환. 브로드캐스트로 질문, 해당 IP 보유자가 MAC으로 응답.

---

## 6. 대역폭 vs 지연시간 (Latency)

| 개념 | 설명 |
|------|------|
| **대역폭 (Bandwidth)** | 단위 시간에 전송 가능한 데이터 양 (Mbps) |
| **지연시간 (Latency)** | 패킷이 출발지→목적지 도달하는 시간 (ms) |
| **처리량 (Throughput)** | 실제로 전달된 데이터 양 (대역폭 ≤ 처리량) |

---

## 면접 자주 출제 Q&A

**Q. OSI 7계층을 왜 나누나?**  
→ 각 계층이 독립적으로 역할을 담당해 문제 발생 시 해당 계층만 수정 가능. 표준화로 다른 벤더 장비 간 호환성 보장.

**Q. 스위치와 라우터의 차이?**  
→ 스위치는 MAC 주소로 같은 네트워크 내 통신(2계층), 라우터는 IP 주소로 서로 다른 네트워크 간 경로 선택(3계층).

**Q. www.google.com에 접속할 때 일어나는 일을 설명하라.**  
→ ① DNS 조회(도메인→IP) → ② TCP 3-way handshake → ③ HTTPS면 TLS handshake → ④ HTTP GET 요청 → ⑤ 서버 응답 → ⑥ 브라우저 렌더링
