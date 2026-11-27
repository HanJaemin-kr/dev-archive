---
title: 동기화 (Synchronization)
domain: cs
category: os
tags: [cs, os, sync]
level: intermediate
status: published
created: 2026-07-16
updated: 2026-07-16
velog: false
related: []
---

# 동기화 (Synchronization)

---

## 1. Race Condition (경쟁 조건)

두 개 이상의 스레드/프로세스가 **공유 자원에 동시 접근**할 때 실행 순서에 따라 결과가 달라지는 현상.

```python
# 잔액: 1000원, 두 스레드 동시 실행
# Thread A: 잔액 += 500    # Thread B: 잔액 += 300

# 이상적: 1000 + 500 + 300 = 1800
# Race Condition: 1000 + 500 = 1500  (B의 변경 무시)
#              or 1000 + 300 = 1300  (A의 변경 무시)
```

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 300" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="sync-race-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="350" y="24" text-anchor="middle" font-weight="bold" font-size="16">Race Condition — 인터리빙으로 갱신 손실</text>

  <!-- shared var -->
  <rect x="270" y="45" width="160" height="40" rx="6" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="350" y="70" text-anchor="middle" font-size="13">공유변수 잔액 = 1000</text>

  <!-- Thread A column -->
  <text x="150" y="115" text-anchor="middle" font-size="13" font-weight="bold" fill="#1a5fb4">Thread A (+500)</text>
  <rect x="60" y="125" width="180" height="34" rx="5" fill="#e8f0fe" stroke="#333" stroke-width="1.2"/>
  <text x="150" y="147" text-anchor="middle" font-size="11">① read 잔액 → 1000</text>
  <rect x="60" y="205" width="180" height="34" rx="5" fill="#e8f0fe" stroke="#333" stroke-width="1.2"/>
  <text x="150" y="227" text-anchor="middle" font-size="11">④ write 1000+500 = 1500</text>

  <!-- Thread B column -->
  <text x="550" y="115" text-anchor="middle" font-size="13" font-weight="bold" fill="#a51d2d">Thread B (+300)</text>
  <rect x="460" y="165" width="180" height="34" rx="5" fill="#f8d7da" stroke="#333" stroke-width="1.2"/>
  <text x="550" y="187" text-anchor="middle" font-size="11">② read 잔액 → 1000</text>
  <rect x="460" y="245" width="180" height="34" rx="5" fill="#f8d7da" stroke="#333" stroke-width="1.2"/>
  <text x="550" y="267" text-anchor="middle" font-size="11">③ write 1000+300 = 1300</text>

  <!-- time arrow -->
  <line x1="30" y1="120" x2="30" y2="285" stroke="#333" stroke-width="2" marker-end="url(#sync-race-arrow)"/>
  <text x="18" y="205" text-anchor="middle" font-size="11" transform="rotate(-90 18 205)">시간</text>

  <text x="350" y="295" text-anchor="middle" font-size="11" fill="#b00">결과 = 1500 (B의 +300이 사라짐) → 기대값 1800과 불일치</text>
</svg>

<sub>A와 B가 각자 잔액을 읽은 뒤(①②) 서로 모른 채 덮어쓰면(③④) 마지막에 쓴 값만 남아 한쪽 갱신이 사라진다. 읽기-수정-쓰기 구간을 한 번에 하나만 실행하도록 보호해야 한다.</sub>

---

## 2. Critical Section (임계 구역)

공유 자원에 접근하는 **코드 구간**. 한 번에 하나의 스레드만 진입해야 함.

### 해결 조건 3가지

| 조건 | 설명 |
|------|------|
| **상호 배제 (Mutual Exclusion)** | 한 프로세스가 CS에 있으면 다른 프로세스는 진입 불가 |
| **진행 (Progress)** | CS가 비었을 때 진입을 원하는 프로세스가 진입 가능해야 함 |
| **유한 대기 (Bounded Waiting)** | 무한정 대기하는 프로세스가 없어야 함 (기아 방지) |

---

## 3. Mutex (뮤텍스)

**상호 배제**를 위한 잠금 메커니즘. 소유자 개념 있음.

```
lock() → Critical Section → unlock()

Thread A: lock() 획득 → CS 진입
Thread B: lock() 시도 → 블로킹 → A가 unlock()하면 획득
```

- **소유자만 해제 가능** (lock을 건 스레드만 unlock 가능)
- 이진 세마포어와 유사하지만 소유권 개념이 다름

---

## 4. Semaphore (세마포어)

**정수 카운터**를 사용하는 동기화 도구. 여러 스레드의 동시 접근 제어.

```
P(wait): S -= 1, S < 0 이면 블로킹
V(signal): S += 1, 대기 스레드 깨움
```

| | Mutex | Semaphore |
|--|:-----:|:---------:|
| 값 범위 | 0 또는 1 | 0 이상 임의의 정수 |
| 소유권 | 있음 (lock한 스레드만 unlock) | 없음 (다른 스레드도 signal 가능) |
| 사용처 | 상호 배제 | 순서 제어, 자원 개수 제한 |

**이진 세마포어(Binary Semaphore)**: S=0 or 1 → Mutex와 유사  
**계수 세마포어(Counting Semaphore)**: DB 커넥션 풀(최대 10개 등) 제한에 활용

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 320" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="sync-lock-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="350" y="24" text-anchor="middle" font-weight="bold" font-size="16">Mutex(1개 열쇠) vs Semaphore(N개 슬롯)</text>

  <!-- Mutex side -->
  <text x="175" y="56" text-anchor="middle" font-size="14" font-weight="bold">Mutex (상호배제, 값 0/1)</text>
  <rect x="40" y="70" width="270" height="220" rx="8" fill="#f7f7f7" stroke="#333" stroke-width="1.5"/>

  <rect x="120" y="90" width="110" height="46" rx="6" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="175" y="118" text-anchor="middle" font-size="12">Critical Section</text>

  <rect x="130" y="160" width="90" height="34" rx="5" fill="#e8f0fe" stroke="#333" stroke-width="1.2"/>
  <text x="175" y="182" text-anchor="middle" font-size="11">Thread A (보유 🔑)</text>
  <line x1="175" y1="160" x2="175" y2="138" stroke="#333" stroke-width="2" marker-end="url(#sync-lock-arrow)"/>
  <text x="235" y="152" font-size="10">lock() 획득</text>

  <rect x="60" y="230" width="90" height="34" rx="5" fill="#f8d7da" stroke="#333" stroke-width="1.2"/>
  <text x="105" y="252" text-anchor="middle" font-size="11">Thread B 대기</text>
  <rect x="200" y="230" width="90" height="34" rx="5" fill="#f8d7da" stroke="#333" stroke-width="1.2"/>
  <text x="245" y="252" text-anchor="middle" font-size="11">Thread C 대기</text>
  <text x="175" y="284" text-anchor="middle" font-size="10" fill="#555">A가 unlock() 해야만 다음 하나 진입 (소유자만 해제)</text>

  <!-- Semaphore side -->
  <text x="525" y="56" text-anchor="middle" font-size="14" font-weight="bold">Semaphore (자원 N개, 여기 N=2)</text>
  <rect x="390" y="70" width="270" height="220" rx="8" fill="#f7f7f7" stroke="#333" stroke-width="1.5"/>

  <rect x="430" y="90" width="90" height="46" rx="6" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="475" y="118" text-anchor="middle" font-size="11">슬롯 1</text>
  <rect x="530" y="90" width="90" height="46" rx="6" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="575" y="118" text-anchor="middle" font-size="11">슬롯 2</text>

  <rect x="430" y="160" width="90" height="34" rx="5" fill="#e8f0fe" stroke="#333" stroke-width="1.2"/>
  <text x="475" y="182" text-anchor="middle" font-size="11">Thread A</text>
  <rect x="530" y="160" width="90" height="34" rx="5" fill="#e8f0fe" stroke="#333" stroke-width="1.2"/>
  <text x="575" y="182" text-anchor="middle" font-size="11">Thread B</text>
  <line x1="475" y1="160" x2="475" y2="138" stroke="#333" stroke-width="2" marker-end="url(#sync-lock-arrow)"/>
  <line x1="575" y1="160" x2="575" y2="138" stroke="#333" stroke-width="2" marker-end="url(#sync-lock-arrow)"/>

  <rect x="480" y="230" width="90" height="34" rx="5" fill="#f8d7da" stroke="#333" stroke-width="1.2"/>
  <text x="525" y="252" text-anchor="middle" font-size="11">Thread C 대기</text>
  <text x="525" y="284" text-anchor="middle" font-size="10" fill="#555">S = 2 → 동시에 2개 진입, 3번째부터 P(wait) 블로킹</text>
</svg>

<sub>Mutex는 열쇠가 하나뿐이라 한 번에 한 스레드만 임계구역에 들어가고 lock을 건 스레드만 해제할 수 있다(소유권). Semaphore는 카운터 S만큼(예: S=2) 동시 진입을 허용하고 소유권이 없어 다른 스레드도 V(signal)로 카운트를 올릴 수 있다.</sub>

---

## 5. Monitor (모니터)

언어 수준에서 지원하는 동기화 구조체. Mutex + Condition Variable 내장.

- Java의 `synchronized`, Python의 `with Lock`
- 개발자가 직접 lock/unlock 관리 불필요 → Mutex보다 실수 줄어듦

---

## 6. 교착상태 (Deadlock)

두 개 이상의 프로세스가 서로 상대방의 자원을 기다리며 **무한히 블로킹**되는 상태.

### 발생 4가지 조건 (모두 성립해야 교착상태)

| 조건 | 설명 |
|------|------|
| **상호 배제 (Mutual Exclusion)** | 자원을 한 번에 하나의 프로세스만 사용 |
| **점유와 대기 (Hold & Wait)** | 자원을 가진 채로 다른 자원을 기다림 |
| **비선점 (No Preemption)** | 자원을 강제로 뺏을 수 없음 |
| **순환 대기 (Circular Wait)** | 프로세스 간 자원 대기가 원형을 이룸 |

```
P1 → R2 대기  (P1은 R1 보유)
P2 → R1 대기  (P2는 R2 보유)
→ 순환 대기 → Deadlock
```

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 360" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="sync-dead-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="350" y="24" text-anchor="middle" font-weight="bold" font-size="16">데드락 4대 조건 &amp; 순환 대기</text>

  <!-- four conditions box -->
  <rect x="30" y="45" width="280" height="290" rx="8" fill="#f7f7f7" stroke="#333" stroke-width="1.5"/>
  <text x="170" y="70" text-anchor="middle" font-size="13" font-weight="bold">동시에 4개 모두 성립해야 발생</text>

  <rect x="50" y="85" width="240" height="52" rx="6" fill="#e8f0fe" stroke="#333" stroke-width="1.2"/>
  <text x="170" y="107" text-anchor="middle" font-size="12" font-weight="bold">① 상호 배제</text>
  <text x="170" y="126" text-anchor="middle" font-size="10">자원을 한 번에 하나만 사용</text>

  <rect x="50" y="145" width="240" height="52" rx="6" fill="#fff3cd" stroke="#333" stroke-width="1.2"/>
  <text x="170" y="167" text-anchor="middle" font-size="12" font-weight="bold">② 점유와 대기</text>
  <text x="170" y="186" text-anchor="middle" font-size="10">가진 채로 다른 자원 대기</text>

  <rect x="50" y="205" width="240" height="52" rx="6" fill="#d4edda" stroke="#333" stroke-width="1.2"/>
  <text x="170" y="227" text-anchor="middle" font-size="12" font-weight="bold">③ 비선점</text>
  <text x="170" y="246" text-anchor="middle" font-size="10">강제로 뺏을 수 없음</text>

  <rect x="50" y="265" width="240" height="52" rx="6" fill="#f8d7da" stroke="#333" stroke-width="1.2"/>
  <text x="170" y="287" text-anchor="middle" font-size="12" font-weight="bold">④ 순환 대기</text>
  <text x="170" y="306" text-anchor="middle" font-size="10">대기 관계가 원형을 이룸 →</text>

  <!-- circular wait graph -->
  <text x="510" y="70" text-anchor="middle" font-size="13" font-weight="bold">④ 순환 대기 (자원 할당 그래프)</text>

  <!-- P1 -->
  <circle cx="430" cy="140" r="32" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="430" y="145" text-anchor="middle" font-size="13">P1</text>
  <!-- R1 -->
  <rect x="565" y="110" width="60" height="60" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="595" y="145" text-anchor="middle" font-size="13">R1</text>
  <!-- P2 -->
  <circle cx="590" cy="270" r="32" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="590" y="275" text-anchor="middle" font-size="13">P2</text>
  <!-- R2 -->
  <rect x="405" y="240" width="60" height="60" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="435" y="275" text-anchor="middle" font-size="13">R2</text>

  <!-- R1 -> P1 (assigned) -->
  <line x1="565" y1="130" x2="464" y2="135" stroke="#333" stroke-width="2" marker-end="url(#sync-dead-arrow)"/>
  <text x="515" y="118" text-anchor="middle" font-size="10">보유</text>
  <!-- P1 -> R2 (request) -->
  <line x1="430" y1="172" x2="435" y2="238" stroke="#333" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#sync-dead-arrow)"/>
  <text x="393" y="210" text-anchor="middle" font-size="10">요청</text>
  <!-- R2 -> P2 (assigned) -->
  <line x1="465" y1="272" x2="556" y2="270" stroke="#333" stroke-width="2" marker-end="url(#sync-dead-arrow)"/>
  <text x="510" y="262" text-anchor="middle" font-size="10">보유</text>
  <!-- P2 -> R1 (request) -->
  <line x1="595" y1="238" x2="595" y2="172" stroke="#333" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#sync-dead-arrow)"/>
  <text x="630" y="210" text-anchor="middle" font-size="10">요청</text>

  <text x="500" y="335" text-anchor="middle" font-size="11" fill="#b00">P1→R2→P2→R1→P1 사이클 형성 → 교착상태</text>
</svg>

<sub>네 조건(①~④)이 동시에 성립할 때만 데드락이 생긴다. 오른쪽 그래프처럼 P1은 R1을 쥔 채 R2를, P2는 R2를 쥔 채 R1을 요청하면 대기 관계가 원형(사이클)이 되어 서로 영원히 기다린다. 예방은 이 중 한 조건만 깨면 된다.</sub>

---

### 교착상태 처리 방법

| 방법 | 전략 | 내용 |
|------|------|------|
| **예방 (Prevention)** | 4가지 조건 중 하나를 제거 | 자원 순서 고정, 모든 자원 한 번에 할당 등 |
| **회피 (Avoidance)** | 안전 상태 유지 | Banker's Algorithm — 자원 할당 전 안전 여부 검사 |
| **탐지 (Detection)** | 발생 허용 후 탐지 | 자원 할당 그래프, 사이클 탐지 |
| **회복 (Recovery)** | 탐지 후 해결 | 프로세스 종료 or 자원 선점 |
| **무시** | 발생 가능성 낮다면 무시 | UNIX/Linux의 현실적 선택 |

---

## 7. 라이브락 (Livelock) & 기아 (Starvation)

| | Deadlock | Livelock | Starvation |
|--|:--------:|:--------:|:----------:|
| 상태 | 블로킹 | 계속 상태 변화 | 블로킹 |
| 원인 | 순환 대기 | 서로 양보 반복 | 낮은 우선순위 |
| 비유 | 둘 다 멈춤 | 복도에서 계속 비켜주기 | 줄 서는데 새치기 계속 |

---

## 면접 자주 출제 Q&A

**Q. Mutex와 Semaphore의 차이는?**  
→ Mutex는 소유권이 있어 lock한 스레드만 unlock 가능. Semaphore는 소유권 없이 다른 스레드도 signal 가능. Mutex는 상호 배제, Semaphore는 순서 제어나 자원 개수 제한에 적합.

**Q. Deadlock 발생 조건과 해결법은?**  
→ 상호 배제 + 점유와 대기 + 비선점 + 순환 대기 모두 성립 시 발생. 예방(조건 제거), 회피(Banker's), 탐지+회복, 무시 중 선택.

**Q. Spinlock이란?**  
→ 락이 해제될 때까지 루프로 계속 확인(바쁜 대기, Busy Waiting). 컨텍스트 스위치 없이 짧은 대기에 유리. 멀티코어 + 매우 짧은 CS에 적합. 단일 코어나 긴 대기엔 CPU 낭비.

**Q. 생산자-소비자 문제를 Semaphore로 해결하려면?**  
→ 세 개의 세마포어 사용: mutex(버퍼 접근 상호배제), empty(빈 슬롯 수), full(채워진 슬롯 수). 생산자는 P(empty)→P(mutex)→생산→V(mutex)→V(full), 소비자는 반대.
