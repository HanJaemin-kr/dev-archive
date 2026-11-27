---
title: DNS (Domain Name System)
domain: cs
category: network
tags: [cs, network, dns]
level: intermediate
status: published
created: 2026-07-16
updated: 2026-07-16
velog: false
related: []
---

# DNS (Domain Name System)

---

## 1. DNS란?

도메인 이름(www.google.com)을 **IP 주소(142.250.196.68)로 변환**하는 분산 계층형 데이터베이스 시스템.

- UDP 포트 53 사용 (응답이 512 byte 초과 시 TCP 사용)
- 계층적 구조: Root → TLD → Authoritative → 로컬 DNS

---

## 2. DNS 계층 구조

```
.                          ← Root DNS (전 세계 13개 클러스터)
├── com.
│   ├── google.com.        ← TLD DNS (Top-Level Domain)
│   │   └── www.google.com ← Authoritative DNS
│   └── naver.com.
├── kr.
└── net.
```

---

## 3. DNS 동작 원리

### 재귀적 쿼리 (Recursive Query)

```
브라우저 → 로컬 DNS 서버 (ISP 제공)
              ↓ (캐시 없으면)
           Root DNS → "com. 담당은 이쪽"
              ↓
           TLD DNS (com.) → "google.com. 담당은 이쪽"
              ↓
           Authoritative DNS → "www.google.com = 142.250.196.68"
              ↓
         로컬 DNS 서버 → 브라우저에 IP 반환 + 캐시 저장
```

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 420" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="dns-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="330" y="24" text-anchor="middle" font-weight="bold" font-size="16">DNS 재귀 질의 흐름 (www.google.com)</text>

  <!-- stub resolver / browser -->
  <rect x="30" y="180" width="130" height="60" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="95" y="205" text-anchor="middle" font-size="12" font-weight="bold">Stub Resolver</text>
  <text x="95" y="223" text-anchor="middle" font-size="11">(브라우저 / OS)</text>

  <!-- recursive resolver -->
  <rect x="230" y="180" width="140" height="60" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="300" y="205" text-anchor="middle" font-size="12" font-weight="bold">Recursive DNS</text>
  <text x="300" y="223" text-anchor="middle" font-size="11">(로컬/ISP, 캐시)</text>

  <!-- authoritative chain -->
  <rect x="470" y="60" width="160" height="44" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="550" y="86" text-anchor="middle" font-size="12" font-weight="bold">Root DNS (.)</text>

  <rect x="470" y="150" width="160" height="44" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="550" y="176" text-anchor="middle" font-size="12" font-weight="bold">TLD DNS (.com)</text>

  <rect x="470" y="240" width="160" height="52" fill="#f8d7da" stroke="#333" stroke-width="1.5"/>
  <text x="550" y="262" text-anchor="middle" font-size="12" font-weight="bold">Authoritative</text>
  <text x="550" y="279" text-anchor="middle" font-size="11">(google.com)</text>

  <!-- ① query -->
  <line x1="160" y1="200" x2="228" y2="200" stroke="#333" stroke-width="1.5" marker-end="url(#dns-arrow)"/>
  <text x="194" y="192" text-anchor="middle" font-size="11">①질의</text>

  <!-- ② root -->
  <line x1="370" y1="196" x2="468" y2="96" stroke="#333" stroke-width="1.5" marker-end="url(#dns-arrow)"/>
  <text x="398" y="140" font-size="10">② .com은 TLD로</text>
  <line x1="468" y1="104" x2="372" y2="192" stroke="#888" stroke-width="1.2" stroke-dasharray="4 3" marker-end="url(#dns-arrow)"/>

  <!-- ③ TLD -->
  <line x1="372" y1="200" x2="468" y2="176" stroke="#333" stroke-width="1.5" marker-end="url(#dns-arrow)"/>
  <text x="400" y="212" font-size="10">③ google.com은 Auth로</text>
  <line x1="468" y1="184" x2="372" y2="206" stroke="#888" stroke-width="1.2" stroke-dasharray="4 3" marker-end="url(#dns-arrow)"/>

  <!-- ④ authoritative -->
  <line x1="372" y1="216" x2="468" y2="262" stroke="#333" stroke-width="1.5" marker-end="url(#dns-arrow)"/>
  <text x="398" y="252" font-size="10">④ A 레코드 IP 응답</text>
  <line x1="468" y1="270" x2="372" y2="224" stroke="#888" stroke-width="1.2" stroke-dasharray="4 3" marker-end="url(#dns-arrow)"/>

  <!-- ⑤ answer + cache -->
  <line x1="228" y1="224" x2="162" y2="224" stroke="#333" stroke-width="1.5" marker-end="url(#dns-arrow)"/>
  <text x="194" y="244" text-anchor="middle" font-size="11">⑤ IP 반환</text>

  <!-- legend -->
  <rect x="30" y="300" width="600" height="100" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="330" y="322" text-anchor="middle" font-size="12" font-weight="bold">동작 요약</text>
  <text x="50" y="344" font-size="11">• 실선(→): 질의 / 점선(⇠): 응답(위임 정보 또는 최종 IP)</text>
  <text x="50" y="364" font-size="11">• Stub ↔ Recursive 구간만 "재귀": 로컬 DNS가 나머지 질의를 대신 처리</text>
  <text x="50" y="384" font-size="11">• Recursive ↔ Root/TLD/Auth 구간은 "반복(Iterative)" 질의로 단계별 위임을 따라감</text>
</svg>

*클라이언트(stub)는 로컬 DNS(recursive)에 한 번만 물으면 되고, 로컬 DNS가 Root → TLD → Authoritative를 차례로 반복 질의해 IP를 알아낸 뒤 응답하며 각 단계 결과를 캐시한다.*

**반복적 쿼리 (Iterative)**: 로컬 DNS가 직접 각 DNS 서버에 순서대로 질의  
**재귀적 쿼리**: 로컬 DNS가 대신 모든 질의를 처리해줌 (클라이언트 부하 감소)

---

## 4. DNS 캐싱 & TTL

- **TTL (Time To Live)**: DNS 레코드를 캐시에 보관하는 시간 (초 단위)
- 캐싱 순서: 브라우저 캐시 → OS 캐시(hosts 파일) → 로컬 DNS 캐시 → 재질의

```
# hosts 파일 예시 (OS 캐시보다 우선)
127.0.0.1    localhost
192.168.0.1  myserver.local
```

> TTL이 짧으면 DNS 변경이 빠르게 전파되지만 DNS 서버 부하 증가  
> TTL이 길면 변경이 느리게 반영되지만 성능 향상

---

## 5. DNS 레코드 타입

| 레코드 | 설명 | 예시 |
|--------|------|------|
| **A** | 도메인 → IPv4 주소 | www.google.com → 142.250.196.68 |
| **AAAA** | 도메인 → IPv6 주소 | www.google.com → 2607:f8b0::... |
| **CNAME** | 도메인 → 다른 도메인 (별칭) | blog.example.com → example.github.io |
| **MX** | 메일 서버 주소 | example.com → mail.example.com |
| **NS** | 도메인의 네임서버 | example.com → ns1.example.com |
| **TXT** | 임의 텍스트 (SPF, DKIM 등 인증) | "v=spf1 include:..." |
| **PTR** | IP → 도메인 (역방향 조회) | 142.250.196.68 → www.google.com |
| **SOA** | DNS 존 권한 정보 | 도메인 관리 서버, 갱신 주기 등 |

---

## 6. DNS 보안

### DNS Spoofing / Cache Poisoning

- 공격자가 가짜 DNS 응답을 캐시에 주입 → 피해자를 악성 IP로 유도
- 대응: **DNSSEC** (DNS 응답에 디지털 서명 추가)

### DNS over HTTPS (DoH) / DNS over TLS (DoT)

- 기존 DNS: 평문 UDP → 중간자 감청 가능
- DoH/DoT: DNS 쿼리를 암호화해 프라이버시 보호

---

## 7. www에 접속할 때 DNS 전체 흐름

```
1. 브라우저 캐시 확인
2. OS hosts 파일 확인 (/etc/hosts, C:\Windows\System32\drivers\etc\hosts)
3. 로컬 DNS 캐시 확인
4. 로컬 DNS 서버(ISP)에 질의
5. Root DNS → TLD DNS → Authoritative DNS 순서로 탐색
6. IP 주소 반환 + 각 단계 캐시 저장
7. 해당 IP로 TCP 연결 시작
```

---

## 면접 자주 출제 Q&A

**Q. DNS가 UDP를 쓰는 이유?**  
→ DNS 쿼리/응답은 대부분 512 byte 미만의 작은 데이터. TCP의 3-way handshake 없이 빠르게 응답 가능. 패킷 손실 시 애플리케이션 레벨에서 재시도.

**Q. CNAME과 A 레코드의 차이?**  
→ A 레코드는 도메인을 직접 IP에 매핑. CNAME은 도메인을 다른 도메인에 매핑(별칭). CDN, GitHub Pages 같은 서비스의 도메인을 가리킬 때 CNAME 사용. 루트 도메인(example.com)에는 CNAME 사용 불가(A 레코드만 가능 — ALIAS 레코드로 우회).

**Q. DNS 캐시 포이즈닝이란?**  
→ 공격자가 로컬 DNS 서버에 가짜 레코드를 주입해 사용자를 악성 IP로 유도하는 공격. DNSSEC으로 서명 검증해 방어.

**Q. 도메인을 새 IP로 변경하면 왜 바로 반영이 안 되나?**  
→ TTL 동안 이전 IP가 각 DNS 서버에 캐시되어 있기 때문. TTL 값이 크면 전파 시간이 길어짐(보통 24~48시간). 변경 전 미리 TTL을 줄여놓으면 빠른 전파 가능.
