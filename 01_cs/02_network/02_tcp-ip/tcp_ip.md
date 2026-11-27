---
title: TCP / UDP
domain: cs
category: network
tags: [cs, network, tcp-ip]
level: intermediate
status: published
created: 2026-07-16
updated: 2026-07-16
velog: false
related: []
---

# TCP / UDP

---

## 1. TCP vs UDP 비교

| 항목 | TCP | UDP |
|------|:---:|:---:|
| 연결 방식 | 연결 지향 (Connection-oriented) | 비연결 (Connectionless) |
| 신뢰성 | 보장 (순서, 손실 재전송) | 미보장 |
| 속도 | 느림 | 빠름 |
| 흐름/혼잡 제어 | 있음 | 없음 |
| 헤더 크기 | 20~60 byte | 8 byte |
| 데이터 경계 | 스트림 (경계 없음) | 데이터그램 (경계 있음) |
| 사용처 | 웹(HTTP), 파일 전송, 이메일 | 게임, 스트리밍, DNS, VoIP |

---

## 2. TCP 3-Way Handshake (연결 수립)

```
Client                    Server
  │                          │
  │──── SYN (seq=x) ────────►│  1. 연결 요청
  │                          │
  │◄─── SYN+ACK (seq=y, ────│  2. 요청 수락
  │          ack=x+1)        │
  │                          │
  │──── ACK (ack=y+1) ──────►│  3. 확인 응답
  │                          │
  │         ESTABLISHED      │
```

| 단계 | 보내는 쪽 | 패킷 | 의미 |
|------|---------|------|------|
| 1 | Client → Server | SYN | "연결할게요" |
| 2 | Server → Client | SYN + ACK | "알겠어요, 저도 연결할게요" |
| 3 | Client → Server | ACK | "확인했어요" |

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 320" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="tcp3-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="240" y="24" text-anchor="middle" font-weight="bold" font-size="16">TCP 3-Way Handshake (연결 수립)</text>

  <!-- lifelines -->
  <rect x="70" y="44" width="100" height="30" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="120" y="64" text-anchor="middle" font-size="13" font-weight="bold">Client</text>
  <rect x="310" y="44" width="100" height="30" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="360" y="64" text-anchor="middle" font-size="13" font-weight="bold">Server</text>
  <line x1="120" y1="74" x2="120" y2="290" stroke="#333" stroke-width="1.5"/>
  <line x1="360" y1="74" x2="360" y2="290" stroke="#333" stroke-width="1.5"/>

  <!-- state before -->
  <text x="120" y="98" text-anchor="middle" font-size="10" fill="#888">CLOSED</text>
  <text x="360" y="98" text-anchor="middle" font-size="10" fill="#888">LISTEN</text>

  <!-- ① SYN -->
  <line x1="120" y1="120" x2="360" y2="120" stroke="#333" stroke-width="1.5" marker-end="url(#tcp3-arrow)"/>
  <text x="240" y="114" text-anchor="middle" font-size="12">① SYN (seq=x)</text>
  <text x="120" y="140" text-anchor="middle" font-size="10" fill="#888">SYN_SENT</text>

  <!-- ② SYN+ACK -->
  <line x1="360" y1="168" x2="120" y2="168" stroke="#333" stroke-width="1.5" marker-end="url(#tcp3-arrow)"/>
  <text x="240" y="162" text-anchor="middle" font-size="12">② SYN+ACK (seq=y, ack=x+1)</text>
  <text x="360" y="152" text-anchor="middle" font-size="10" fill="#888">SYN_RCVD</text>

  <!-- ③ ACK -->
  <line x1="120" y1="216" x2="360" y2="216" stroke="#333" stroke-width="1.5" marker-end="url(#tcp3-arrow)"/>
  <text x="240" y="210" text-anchor="middle" font-size="12">③ ACK (ack=y+1)</text>

  <!-- established -->
  <text x="120" y="240" text-anchor="middle" font-size="11" font-weight="bold" fill="#28794d">ESTABLISHED</text>
  <text x="360" y="240" text-anchor="middle" font-size="11" font-weight="bold" fill="#28794d">ESTABLISHED</text>
  <rect x="90" y="256" width="300" height="30" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="240" y="276" text-anchor="middle" font-size="12">양방향 통신 시작 (데이터 송수신)</text>
</svg>

*SYN → SYN+ACK → ACK 3단계로 양방향 통신 가능 여부를 확인한다. 마지막 ACK가 도착해야 양쪽 모두 ESTABLISHED 상태로 전환된다.*

> **SYN Flooding 공격**: 3단계 ACK 없이 SYN만 계속 보내 서버 자원 고갈 (DDoS)  
> 대응: SYN Cookie, 방화벽 Rate Limiting

---

## 3. TCP 4-Way Handshake (연결 종료)

```
Client                    Server
  │                          │
  │──── FIN ────────────────►│  1. "더 보낼 데이터 없어요"
  │                          │
  │◄─── ACK ─────────────── │  2. "알겠어요" (아직 데이터 있을 수 있음)
  │                          │
  │◄─── FIN ─────────────── │  3. "저도 다 보냈어요"
  │                          │
  │──── ACK ────────────────►│  4. "확인"
  │                          │
  │    TIME_WAIT (2MSL)      │
```

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 380" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="tcp4-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="240" y="24" text-anchor="middle" font-weight="bold" font-size="16">TCP 4-Way Handshake (연결 종료)</text>

  <!-- lifelines -->
  <rect x="70" y="44" width="100" height="30" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="120" y="64" text-anchor="middle" font-size="13" font-weight="bold">Client</text>
  <rect x="310" y="44" width="100" height="30" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="360" y="64" text-anchor="middle" font-size="13" font-weight="bold">Server</text>
  <line x1="120" y1="74" x2="120" y2="350" stroke="#333" stroke-width="1.5"/>
  <line x1="360" y1="74" x2="360" y2="350" stroke="#333" stroke-width="1.5"/>

  <text x="120" y="94" text-anchor="middle" font-size="10" fill="#888">ESTABLISHED</text>
  <text x="360" y="94" text-anchor="middle" font-size="10" fill="#888">ESTABLISHED</text>

  <!-- ① FIN -->
  <line x1="120" y1="116" x2="360" y2="116" stroke="#333" stroke-width="1.5" marker-end="url(#tcp4-arrow)"/>
  <text x="240" y="110" text-anchor="middle" font-size="12">① FIN — "더 보낼 데이터 없음"</text>
  <text x="120" y="134" text-anchor="middle" font-size="10" fill="#888">FIN_WAIT_1</text>

  <!-- ② ACK -->
  <line x1="360" y1="160" x2="120" y2="160" stroke="#333" stroke-width="1.5" marker-end="url(#tcp4-arrow)"/>
  <text x="240" y="154" text-anchor="middle" font-size="12">② ACK — "알겠음"</text>
  <text x="360" y="144" text-anchor="middle" font-size="10" fill="#888">CLOSE_WAIT</text>
  <text x="120" y="180" text-anchor="middle" font-size="10" fill="#888">FIN_WAIT_2</text>

  <!-- server may still send data -->
  <rect x="255" y="188" width="210" height="24" fill="#e2e3e5" stroke="#333" stroke-width="1"/>
  <text x="360" y="204" text-anchor="middle" font-size="10">서버는 남은 데이터 전송 가능</text>

  <!-- ③ FIN -->
  <line x1="360" y1="236" x2="120" y2="236" stroke="#333" stroke-width="1.5" marker-end="url(#tcp4-arrow)"/>
  <text x="240" y="230" text-anchor="middle" font-size="12">③ FIN — "저도 다 보냈음"</text>
  <text x="360" y="252" text-anchor="middle" font-size="10" fill="#888">LAST_ACK</text>

  <!-- ④ ACK -->
  <line x1="120" y1="280" x2="360" y2="280" stroke="#333" stroke-width="1.5" marker-end="url(#tcp4-arrow)"/>
  <text x="240" y="274" text-anchor="middle" font-size="12">④ ACK — "확인"</text>
  <text x="360" y="300" text-anchor="middle" font-size="10" font-weight="bold" fill="#28794d">CLOSED</text>

  <!-- TIME_WAIT -->
  <rect x="60" y="290" width="120" height="44" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="120" y="308" text-anchor="middle" font-size="11" font-weight="bold">TIME_WAIT</text>
  <text x="120" y="326" text-anchor="middle" font-size="10">2·MSL 대기 후 CLOSED</text>
</svg>

*연결 수립은 3단계지만 종료는 4단계다. 서버가 ACK를 먼저 보낸 뒤 남은 데이터를 마저 전송하고, 준비되면 별도로 FIN을 보내기 때문에 SYN+ACK처럼 한 번에 합칠 수 없다.*

- **TIME_WAIT**: 마지막 ACK 유실에 대비해 일정 시간(2*MSL) 대기 후 종료
- 3-way와 달리 4-way인 이유: 서버가 아직 보낼 데이터가 남아 FIN을 즉시 못 보낼 수 있음

---

## 4. TCP 흐름 제어 (Flow Control)

**수신자**의 처리 속도에 맞게 송신 속도 조절.

### 슬라이딩 윈도우 (Sliding Window)

```
수신자: "윈도우 크기 = 5" (한 번에 5개까지 받을 수 있음)
송신자: ACK 없이 5개까지 전송 가능

[1][2][3][4][5] → 전송
         ACK(3) 수신 → [4][5][6][7][8] 전송 가능
```

- 수신자가 `rwnd`(Receive Window) 크기를 광고
- 버퍼 오버플로우 방지

---

## 5. TCP 혼잡 제어 (Congestion Control)

**네트워크** 혼잡 상황에서 송신 속도 조절.

### 알고리즘

| 단계 | 알고리즘 | 동작 |
|------|---------|------|
| **Slow Start** | 지수 증가 | cwnd=1에서 시작, ACK마다 2배 |
| **AIMD** | 선형 증가 / 배 감소 | 임계점 이후 1씩 증가, 손실 시 절반 |
| **Fast Retransmit** | 중복 ACK 3번 | 타임아웃 전에 재전송 |
| **Fast Recovery** | 손실 후 절반에서 재시작 | Slow Start 건너뜀 |

```
cwnd
 ↑      /        /
 │     /   혼잡! /
 │    /    ↓    /
 │   /     \   /
 │  /       \ /
 └────────────────→ 시간
   SS  AI  MD SS AI
```

---

## 6. UDP 특징 및 활용

순서 보장, 재전송 없음, 체크섬으로 오류 감지만 함.

| 프로토콜 | UDP 사용 이유 |
|---------|-------------|
| **DNS** | 단순 질의응답, 빠른 응답 중요 |
| **게임** | 낮은 지연시간 > 신뢰성 |
| **비디오 스트리밍** | 일부 손실보다 끊김 없는 재생 우선 |
| **QUIC (HTTP/3)** | UDP 위에서 신뢰성을 직접 구현 |

---

## 7. 주요 포트 번호

| 포트 | 프로토콜 |
|:----:|---------|
| 20, 21 | FTP |
| 22 | SSH |
| 23 | Telnet |
| 25 | SMTP |
| 53 | DNS |
| 80 | HTTP |
| 110 | POP3 |
| 443 | HTTPS |
| 3306 | MySQL |
| 5432 | PostgreSQL |
| 6379 | Redis |
| 27017 | MongoDB |

---

## 면접 자주 출제 Q&A

**Q. TCP 3-way handshake가 왜 필요한가?**  
→ 양방향 통신 가능 여부 확인. 2-way면 서버의 응답이 클라이언트에 도달하는지 보장 못 함. 3번째 ACK로 클라이언트→서버, 서버→클라이언트 양방향 모두 확인.

**Q. TCP와 UDP 중 어떤 걸 선택해야 하나?**  
→ 신뢰성·순서가 중요하면 TCP(파일 전송, 이메일, HTTP). 속도·실시간성이 중요하면 UDP(게임, 스트리밍, DNS). 필요시 UDP 위에 자체 신뢰성 로직 구현(QUIC).

**Q. 흐름 제어와 혼잡 제어의 차이?**  
→ 흐름 제어는 수신자 처리 속도에 맞추는 것(수신자 보호), 혼잡 제어는 네트워크 상태에 맞추는 것(네트워크 보호).

**Q. TIME_WAIT이 너무 많이 쌓이면?**  
→ 소켓 고갈로 새 연결 불가. 해결: `SO_REUSEADDR` 옵션, `tcp_tw_reuse` 커널 파라미터, 서버 측 close 먼저 하지 않도록 설계.
