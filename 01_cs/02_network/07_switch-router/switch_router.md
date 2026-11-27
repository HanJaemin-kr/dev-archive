---
title: 스위치와 라우터 (Switch & Router)
domain: cs
category: network
tags: [cs, network, switch, router, l4, l7, load-balancing]
level: intermediate
status: published
created: 2026-08-04
updated: 2026-08-04
velog: false
related:
  - "[[01_cs/02_network/01_basics/basics]]"
---

# 스위치와 라우터 (Switch & Router)

> **한 줄 요약**: 스위치는 MAC 주소로 **같은 네트워크 안**에서 포트를 골라 전달하는 2계층 장비, 라우터는 IP 주소로 **서로 다른 네트워크를 연결**하는 3계층 장비다. 실무에서는 동작 계층에 따라 L1~L7 스위치로 구분한다.

---

## 1. 라우터(Router)란?

**서로 다른 네트워크를 연결(라우팅)하는 장비.** 뒤에서 볼 스위치는 *내부(같은) 네트워크*간 통신만 가능하다는 한계가 있다. 전 세계의 수많은 네트워크를 이어 붙인 **인터넷(Internet)**을 만들려면 스위치만으로는 불가능하고, **내부와 외부 네트워크 신호를 구분할 줄 아는 라우터**가 필요하다.

- **라우팅(Routing)** = 서로 다른 네트워크를 연결하고 최적 경로를 선택하는 기능
- OSI 계층 대응
  - **2계층(데이터링크)** 에서 **MAC 주소**로 스위칭 → **L2 스위치 = 스위치**
  - **3계층(네트워크)** 에서 **IP 주소**로 스위칭 → **L3 스위치 = 라우터**
- **QoS(Quality of Service)** 등 네트워크 관리 기능도 제공

### 그럼 다 라우터 쓰면 되지 않나?

아니다. 두 가지 이유로 스위치가 여전히 쓰인다.

| 항목 | 스위치 | 라우터 |
|------|--------|--------|
| 가격 | 저렴 | **비쌈** |
| 설정 | 대부분 자동 → 관리·사용 쉬움 | **수동**으로 일일이 설정 → 까다로움 |
| 역할 | 내부 네트워크 포트 전달 | 서로 다른 네트워크 연결 |

> 요즘은 외부 네트워크 통신 + QoS까지 되는 **스위치 + 라우터 통합 장비**(L3 스위치)도 나온다.

---

## 2. 스위치(Switch)란?

**네트워크 회선과 장치(서버·PC)를 연결하는 장비.** 한 포트로 들어온 패킷을 연결된 장치에 전달한다는 점에서 허브와 비슷하지만, 결정적 차이가 있다.

- **허브(L1)**: 들어온 신호를 **모든 포트로 전부** 뿌린다(브로드캐스트).
- **스위치(L2)**: 신호를 **필요한 포트로만** 전달한다 → 불필요 트래픽 감소 → 전송 속도 향상.

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 400" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="sw-red" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#d9534f"/></marker>
    <marker id="sw-grn" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#28a745"/></marker>
  </defs>

  <!-- ===== 상단: 허브 ===== -->
  <text x="280" y="22" text-anchor="middle" font-weight="bold" font-size="14">① 허브(L1): 목적지가 C여도 모든 포트로 전달</text>
  <!-- source -->
  <rect x="20" y="70" width="70" height="30" rx="4" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="55" y="90" text-anchor="middle" font-size="12">PC-A(송신)</text>
  <!-- hub -->
  <rect x="230" y="60" width="90" height="50" rx="4" fill="#f8d7da" stroke="#333" stroke-width="1.5"/>
  <text x="275" y="80" text-anchor="middle" font-size="12" font-weight="bold">HUB</text>
  <text x="275" y="98" text-anchor="middle" font-size="10" fill="#555">주소 모름</text>
  <!-- targets -->
  <rect x="460" y="40" width="70" height="26" rx="4" fill="#f1f1f1" stroke="#333"/><text x="495" y="58" text-anchor="middle" font-size="11">PC-B</text>
  <rect x="460" y="72" width="70" height="26" rx="4" fill="#d4edda" stroke="#28a745" stroke-width="2"/><text x="495" y="90" text-anchor="middle" font-size="11">PC-C ✔</text>
  <rect x="460" y="104" width="70" height="26" rx="4" fill="#f1f1f1" stroke="#333"/><text x="495" y="122" text-anchor="middle" font-size="11">PC-D</text>
  <!-- arrows -->
  <line x1="90" y1="85" x2="228" y2="85" stroke="#333" stroke-width="1.5" marker-end="url(#sw-red)"/>
  <line x1="320" y1="80" x2="458" y2="53" stroke="#d9534f" stroke-width="1.5" marker-end="url(#sw-red)"/>
  <line x1="320" y1="85" x2="458" y2="85" stroke="#d9534f" stroke-width="1.5" marker-end="url(#sw-red)"/>
  <line x1="320" y1="90" x2="458" y2="117" stroke="#d9534f" stroke-width="1.5" marker-end="url(#sw-red)"/>
  <text x="280" y="150" text-anchor="middle" font-size="11" fill="#d9534f">→ B·D는 필요 없는데도 수신 (불필요 트래픽, 충돌 발생)</text>

  <!-- ===== 하단: 스위치 ===== -->
  <text x="280" y="220" text-anchor="middle" font-weight="bold" font-size="14">② 스위치(L2): MAC 테이블 조회 후 C 포트로만 전달</text>
  <rect x="20" y="268" width="70" height="30" rx="4" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="55" y="288" text-anchor="middle" font-size="12">PC-A(송신)</text>
  <rect x="230" y="258" width="90" height="50" rx="4" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="275" y="278" text-anchor="middle" font-size="12" font-weight="bold">SWITCH</text>
  <text x="275" y="296" text-anchor="middle" font-size="10" fill="#555">MAC 테이블</text>
  <rect x="460" y="238" width="70" height="26" rx="4" fill="#f1f1f1" stroke="#333"/><text x="495" y="256" text-anchor="middle" font-size="11">PC-B</text>
  <rect x="460" y="270" width="70" height="26" rx="4" fill="#d4edda" stroke="#28a745" stroke-width="2"/><text x="495" y="288" text-anchor="middle" font-size="11">PC-C ✔</text>
  <rect x="460" y="302" width="70" height="26" rx="4" fill="#f1f1f1" stroke="#333"/><text x="495" y="320" text-anchor="middle" font-size="11">PC-D</text>
  <line x1="90" y1="283" x2="228" y2="283" stroke="#333" stroke-width="1.5" marker-end="url(#sw-grn)"/>
  <line x1="320" y1="283" x2="458" y2="283" stroke="#28a745" stroke-width="2" marker-end="url(#sw-grn)"/>
  <text x="280" y="360" text-anchor="middle" font-size="11" fill="#28a745">→ 목적지 포트로만 전달 (Collision Domain 분리, 트래픽 절감)</text>
</svg>

### 스위치의 MAC 주소 학습 동작

스위치는 연결된 장비의 **MAC 주소 ↔ 포트**를 기억(MAC 주소 테이블)해두고 다음처럼 동작한다.

1. **목적지 MAC을 아는 경우** → 기억해둔 해당 포트로만 전달.
2. **출발지 MAC이 처음 보는 주소** → 그 포트·MAC을 새로 학습(테이블에 기록).
3. **목적지 MAC이 처음 보는 주소** → **모든 포트로 뿌림(Flooding)**. 이후 응답이 오면 그 포트를 학습.

이렇게 스위치는 허브보다 똑똑하며, 신호가 필요 없는 포트로는 보내지 않기 때문에 **Collision Domain(충돌 영역)을 분리**하는 데 쓸 수 있다.

> 참고: 3계층 라우터의 네트워크 포트 수가 부족할 때, 포트를 확장하려고 붙여 쓰는 장비가 바로 **L3 스위치**다.

---

## 3. L1 ~ L7 스위치

ISO의 **OSI 7계층**은 7개 층으로 나뉜다. 스위치는 **어떤 주소를 다루느냐**(MAC / IP / Port / 패킷 내용)에 따라 계층별로 구분하며, **상위 계층(숫자 큰) 스위치는 하위 계층의 기능을 포함**한다.

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 360" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <text x="310" y="24" text-anchor="middle" font-weight="bold" font-size="15">L1 ~ L7 스위치 (상위 계층이 하위 기능 포함)</text>

  <!-- L7 -->
  <rect x="40" y="44" width="540" height="46" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="56" y="64" font-size="12" font-weight="bold">L7 스위치 (응용)</text>
  <text x="56" y="82" font-size="11" fill="#555">IP + Port + 패킷 내용(URL·쿠키·바이러스 패턴) → 정교한 로드밸런싱·보안(DDoS 방어) = "보안 스위치"</text>

  <!-- L4 -->
  <rect x="40" y="94" width="540" height="46" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="56" y="114" font-size="12" font-weight="bold">L4 스위치 (전송)</text>
  <text x="56" y="132" font-size="11" fill="#555">IP + Port → 부하 분산(로드밸런싱), Active-Active / Active-Standby 이중화</text>

  <!-- L3 -->
  <rect x="40" y="144" width="540" height="46" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="56" y="164" font-size="12" font-weight="bold">L3 스위치 = 라우터 / 공유기(AP) (네트워크)</text>
  <text x="56" y="182" font-size="11" fill="#555">IP 주소 → 라우팅(다른 네트워크 연결·대역폭 확장). L2 + 라우팅 기능</text>

  <!-- L2 -->
  <rect x="40" y="194" width="540" height="46" fill="#f8d7da" stroke="#333" stroke-width="1.5"/>
  <text x="56" y="214" font-size="12" font-weight="bold">L2 스위치 = 스위칭 허브 (데이터링크)</text>
  <text x="56" y="232" font-size="11" fill="#555">MAC 주소 → 목적지 포트 지정 전달. 가장 흔함. 저렴·고성능·단순, 단 라우팅 불가</text>

  <!-- L1 -->
  <rect x="40" y="244" width="540" height="46" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="56" y="264" font-size="12" font-weight="bold">L1 스위치 = 허브 / 더미 허브 (물리)</text>
  <text x="56" y="282" font-size="11" fill="#555">주소 개념 없음 → 연결된 모든 포트로 신호 브로드캐스트</text>

  <!-- side bracket -->
  <line x1="596" y1="52" x2="596" y2="282" stroke="#333" stroke-width="1.5"/>
  <path d="M596,52 l-6,0 M596,282 l-6,0" stroke="#333" stroke-width="1.5"/>
  <text x="610" y="170" text-anchor="middle" font-size="11" transform="rotate(90 610 170)" fill="#333">상위 계층일수록 다루는 정보↑</text>

  <text x="310" y="318" text-anchor="middle" font-size="11" fill="#555">다루는 주소: L1(없음) → L2(MAC) → L3(IP) → L4(IP+Port) → L7(+패킷 내용)</text>
  <text x="310" y="338" text-anchor="middle" font-size="11" fill="#555">L5·L6 기능은 보통 L7 스위치가 흡수하므로 실무에선 L7 하나만 알면 된다.</text>
</svg>

### L1 스위치 (허브 / 더미 허브) — 물리 계층
연결된 **모든 장비에 데이터를 전부 전달**. 이전 글의 허브가 곧 L1 스위치.

### L2 스위치 (스위칭 허브) — 데이터링크 계층
가장 흔히 보는 스위치. 각 장비의 **MAC 주소를 저장**해두고, 들어온 패킷의 MAC을 읽어 해당 장비 포트로만 전달.
- 장점: 저렴 · 고성능 · 단순한 구조 · 높은 신뢰성
- 단점: **라우팅 불가**(다른 네트워크 연결 X)

### L3 스위치 (라우터 / 공유기) — 네트워크 계층
**L2 스위치 + 라우팅 기능.** L2는 MAC까지만 알지만 L3는 **MAC + IP 주소**까지 안다. 네트워크 패킷을 이어주는 통로 역할, **대역폭 확장**이 주 기능.
- 가정용 **공유기**도 L3 + WiFi 기능을 포함 → **AP(Access Point)** 라고도 부름. 기업용 L3 스위치는 성능·가격이 극단적이지만, 가정용 공유기는 합리적.

### L4 스위치 — 전송 계층
외부 요청을 먼저 받아 내부 서버들에 **적절히 분산**. 핵심 역할은 **여러 서버를 한 대처럼 묶는 부하 분산(로드 밸런싱)**. 그래서 IP뿐 아니라 **Port 정보**까지 참고한다.

> **예시**: 공인 IP `125.125.12.5` 웹 서버 한 대로 버티다 트래픽이 넘쳐 `125.125.12.6` 서버를 증설했다. 사용자에게 "이제 .6으로 접속하세요"라고 공지할 필요가 있을까? → **전혀 없다.** L4 스위치가 요청을 두 서버로 알아서 분산한다.

- 서버 하나가 죽으면 다른 서버로 넘기는 **Active-Active / Active-Standby** 이중화도 제공
- 단점: 설정이 매우 복잡

### L7 스위치 (L5·L6 포함) — 응용 계층
L4처럼 로드 밸런싱을 하지만 **보는 정보의 범위**가 다르다.

| 구분 | L4 스위치 | L7 스위치 |
|------|-----------|-----------|
| 참조 정보 | 3~4계층: **IP + TCP/UDP Port** | 3~7계층: IP + Port + **패킷 내용** |
| 분산 기준 | Port 기반 | HTTP URL · 쿠키 · 바이러스 패턴 분석 |
| 보안 | 기본 | **Traffic filter · Security · VPN · DDoS 방어 · 감염 패킷 필터링** |
| 별칭 | - | **보안 스위치** |

L7 스위치는 패킷 내용까지 분석해 **더 정교하고 보안에 유리한** 로드 밸런싱이 가능하다.

---

## 4. 예시로 보는 스위치 — 네트워크 분리로 보안 확보

**상황**: L3 스위치를 쓰면 사용자가 **다른 대역의 사용자와도 통신**할 수 있게 된다(예: `192.168.10.0` 대역 ↔ `192.168.100.0` 대역).

- PC방이라면 상관없지만, **회사**라면? 모든 네트워크가 하나로 묶여 **내부 사용자가 마음먹으면 다른 부서 네트워크로 쉽게 진입**할 수 있다 → 보안 취약점.

**해결**: 아래로 **L2 스위치를 추가로 두어 네트워크(대역)를 분리**한다. 그러면 공공망 · 시스템 관리 · 일반 사용자 네트워크가 서로 차단된다.

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 360" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <text x="310" y="24" text-anchor="middle" font-weight="bold" font-size="14">L2 스위치로 대역을 분리해 부서 간 직접 통신 차단</text>

  <!-- L3 -->
  <rect x="240" y="46" width="140" height="44" rx="4" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="310" y="66" text-anchor="middle" font-size="12" font-weight="bold">L3 스위치 / 라우터</text>
  <text x="310" y="82" text-anchor="middle" font-size="10" fill="#555">외부(인터넷) 연결</text>

  <!-- links down -->
  <line x1="290" y1="90" x2="150" y2="150" stroke="#333" stroke-width="1.5"/>
  <line x1="330" y1="90" x2="470" y2="150" stroke="#333" stroke-width="1.5"/>

  <!-- L2 left -->
  <rect x="70" y="150" width="160" height="40" rx="4" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="150" y="170" text-anchor="middle" font-size="12" font-weight="bold">L2 스위치 A</text>
  <text x="150" y="185" text-anchor="middle" font-size="10" fill="#555">시스템 관리망</text>
  <!-- L2 right -->
  <rect x="390" y="150" width="160" height="40" rx="4" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="470" y="170" text-anchor="middle" font-size="12" font-weight="bold">L2 스위치 B</text>
  <text x="470" y="185" text-anchor="middle" font-size="10" fill="#555">일반 사용자망</text>

  <!-- hosts left -->
  <rect x="72" y="230" width="72" height="26" rx="3" fill="#e8f0fe" stroke="#333"/><text x="108" y="248" text-anchor="middle" font-size="10">192.168.10.11</text>
  <rect x="156" y="230" width="72" height="26" rx="3" fill="#e8f0fe" stroke="#333"/><text x="192" y="248" text-anchor="middle" font-size="10">192.168.10.12</text>
  <line x1="150" y1="190" x2="108" y2="228" stroke="#333"/>
  <line x1="150" y1="190" x2="192" y2="228" stroke="#333"/>
  <!-- hosts right -->
  <rect x="392" y="230" width="76" height="26" rx="3" fill="#e8f0fe" stroke="#333"/><text x="430" y="248" text-anchor="middle" font-size="10">192.168.100.11</text>
  <rect x="480" y="230" width="76" height="26" rx="3" fill="#e8f0fe" stroke="#333"/><text x="518" y="248" text-anchor="middle" font-size="10">192.168.100.12</text>
  <line x1="470" y1="190" x2="430" y2="228" stroke="#333"/>
  <line x1="470" y1="190" x2="518" y2="228" stroke="#333"/>

  <!-- blocked link -->
  <line x1="230" y1="170" x2="390" y2="170" stroke="#d9534f" stroke-width="2" stroke-dasharray="6 4"/>
  <text x="310" y="163" text-anchor="middle" font-size="22" fill="#d9534f" font-weight="bold">✕</text>
  <text x="310" y="290" text-anchor="middle" font-size="11" fill="#d9534f">두 대역은 L2로 분리되어 서로 직접 통신 불가 → 부서 간 침입 차단</text>
  <text x="310" y="312" text-anchor="middle" font-size="11" fill="#555">외부 통신은 상위 L3를 통해서만, 대역 간 횡적 이동(lateral movement)은 봉쇄</text>
</svg>

---

## 5. 핵심 비교 요약

| 구분 | 허브(L1) | 스위치(L2) | 라우터(L3) |
|------|:--------:|:----------:|:----------:|
| OSI 계층 | 물리 | 데이터링크 | 네트워크 |
| 식별 주소 | 없음 | MAC | IP |
| 전달 방식 | 전 포트 브로드캐스트 | 목적지 포트 지정 | 최적 경로 라우팅 |
| 네트워크 범위 | 내부 | **내부(같은 네트워크)** | **서로 다른 네트워크 연결** |
| Collision Domain | 공유 | 포트별 분리 | 분리 |
| 가격/설정 | 저렴/자동 | 저렴/대부분 자동 | 비쌈/수동 |

---

## 면접 예상 질문

**Q. 허브와 스위치의 차이는?**
→ 허브는 들어온 신호를 모든 포트로 브로드캐스트(L1)하지만, 스위치는 MAC 주소 테이블을 학습해 목적지 포트로만 전달(L2)한다. 그래서 스위치는 불필요 트래픽을 줄이고 Collision Domain을 포트별로 분리한다.

**Q. 스위치와 라우터의 차이는?**
→ 스위치는 MAC 주소로 **같은 네트워크 안**에서 포트를 골라 전달(2계층), 라우터는 IP 주소로 **서로 다른 네트워크를 연결**하고 경로를 선택(3계층)한다.

**Q. 스위치가 목적지 MAC을 모르면?**
→ 모든 포트로 뿌린다(Flooding). 응답이 오면 그 포트를 MAC 테이블에 학습해 다음부터는 해당 포트로만 보낸다.

**Q. L4 스위치와 L7 스위치의 차이는?**
→ L4는 IP + TCP/UDP Port까지 보고 로드 밸런싱한다. L7은 여기에 더해 패킷 내용(HTTP URL·쿠키·바이러스 패턴)까지 분석해 더 정교하고 보안에 유리한 분산이 가능하다(보안 스위치).

**Q. L3 스위치가 있는데 왜 L2 스위치를 추가로 두나?**
→ L3만 쓰면 서로 다른 대역이 모두 연결돼 부서 간 횡적 침입이 쉬워진다. 대역별로 L2 스위치를 두어 네트워크를 분리하면 대역 간 직접 통신을 차단해 보안을 확보할 수 있다.

**Q. 모든 곳에 라우터를 쓰면 되지 않나?**
→ 라우터는 비싸고 설정이 수동이라 관리가 까다롭다. 같은 네트워크 내 전달은 저렴하고 자동 설정되는 스위치가 효율적이다. 그래서 계층에 맞게 조합해 쓴다.
