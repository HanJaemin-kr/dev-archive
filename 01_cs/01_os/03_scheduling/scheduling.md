---
title: CPU 스케줄링 (CPU Scheduling)
domain: cs
category: os
tags: [cs, os, scheduling]
level: intermediate
status: published
created: 2026-07-16
updated: 2026-07-16
velog: false
related: []
---

# CPU 스케줄링 (CPU Scheduling)

---

## 1. 개념

준비 큐(Ready Queue)에 있는 프로세스 중 **어떤 프로세스에게 CPU를 할당할지** 결정하는 정책.

### 성능 지표

| 지표 | 설명 | 방향 |
|------|------|------|
| **CPU 이용률** | CPU가 유휴 상태 없이 동작하는 비율 | 높을수록 좋음 |
| **처리량 (Throughput)** | 단위 시간당 완료된 프로세스 수 | 높을수록 좋음 |
| **응답 시간 (Response Time)** | 요청 후 첫 응답까지 걸리는 시간 | 낮을수록 좋음 |
| **대기 시간 (Waiting Time)** | Ready Queue에서 기다린 총 시간 | 낮을수록 좋음 |
| **반환 시간 (Turnaround Time)** | 제출 ~ 완료까지 전체 시간 | 낮을수록 좋음 |

---

## 2. 선점형 vs 비선점형

| | 선점형 (Preemptive) | 비선점형 (Non-Preemptive) |
|--|:-----------------:|:----------------------:|
| 의미 | OS가 강제로 CPU 회수 가능 | 프로세스가 자발적으로 양보 |
| 응답성 | 높음 | 낮음 |
| 문제 | Race Condition, 오버헤드 | 한 프로세스가 독점 가능 |
| 예시 | RR, SRTF, Priority(선점) | FCFS, SJF, Priority(비선점) |

---

## 3. 스케줄링 알고리즘

### FCFS (First-Come, First-Served)

- 도착 순서대로 처리. 비선점형.
- 단점: **호위 효과(Convoy Effect)** — 긴 작업이 앞에 있으면 짧은 작업들이 오래 대기

```
도착순: P1(24ms) → P2(3ms) → P3(3ms)
평균 대기시간: (0 + 24 + 27) / 3 = 17ms  ← 매우 큼
```

---

### SJF (Shortest Job First)

- 실행 시간이 가장 짧은 프로세스 먼저. 비선점형.
- **이론적 최소 평균 대기시간** 보장
- 단점: **기아(Starvation)** — 긴 작업은 영원히 실행 못 할 수 있음
- 실제 실행 시간을 미리 알 수 없어 구현 어려움 (예측 사용)

---

### SRTF (Shortest Remaining Time First)

- SJF의 선점형 버전. 더 짧은 작업이 오면 현재 작업 중단.
- 이론적으로 최적이지만 기아 문제, 오버헤드 동일

---

### Round Robin (RR)

- 각 프로세스에 **동일한 시간 할당량(Time Quantum)** 부여 후 순환.
- 대부분의 현대 OS가 사용. 선점형.

```
Time Quantum = 4ms
P1(24ms), P2(3ms), P3(3ms)

0-4: P1 | 4-7: P2 | 7-10: P3 | 10-14: P1 | ... | P1 완료
```

| Time Quantum | 특성 |
|:------------:|------|
| 매우 크면 | → FCFS와 동일 |
| 매우 작으면 | → 컨텍스트 스위치 오버헤드 증가 |
| 일반적으로 | 10~100ms 사용 |

---

### 간트 차트 비교 (P1=24ms, P2=3ms, P3=3ms · 동시 도착 가정)

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 340" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <text x="350" y="24" text-anchor="middle" font-weight="bold" font-size="16">FCFS · SJF · RR(Q=4) 간트 차트 비교</text>

  <!-- time scale reference: 30ms total, x from 60 to 660 => 20px/ms -->

  <!-- FCFS row -->
  <text x="55" y="66" text-anchor="end" font-size="13" font-weight="bold">FCFS</text>
  <rect x="60"  y="50" width="480" height="34" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="300" y="72" text-anchor="middle" font-size="12">P1 (24)</text>
  <rect x="540" y="50" width="60"  height="34" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="570" y="72" text-anchor="middle" font-size="12">P2</text>
  <rect x="600" y="50" width="60"  height="34" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="630" y="72" text-anchor="middle" font-size="12">P3</text>
  <text x="60"  y="98" font-size="10">0</text>
  <text x="533" y="98" font-size="10">24</text>
  <text x="593" y="98" font-size="10">27</text>
  <text x="653" y="98" font-size="10">30</text>
  <text x="60" y="118" font-size="11" fill="#b00">평균 대기시간 = (0+24+27)/3 = 17ms  ← 호위 효과</text>

  <!-- SJF row -->
  <text x="55" y="166" text-anchor="end" font-size="13" font-weight="bold">SJF</text>
  <rect x="60"  y="150" width="60"  height="34" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="90"  y="172" text-anchor="middle" font-size="12">P2</text>
  <rect x="120" y="150" width="60"  height="34" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="150" y="172" text-anchor="middle" font-size="12">P3</text>
  <rect x="180" y="150" width="480" height="34" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="420" y="172" text-anchor="middle" font-size="12">P1 (24)</text>
  <text x="60"  y="198" font-size="10">0</text>
  <text x="113" y="198" font-size="10">3</text>
  <text x="173" y="198" font-size="10">6</text>
  <text x="653" y="198" font-size="10">30</text>
  <text x="60" y="218" font-size="11" fill="#080">평균 대기시간 = (6+0+3)/3 = 3ms  ← 짧은 작업 먼저 → 최소</text>

  <!-- RR row -->
  <text x="55" y="266" text-anchor="end" font-size="13" font-weight="bold">RR(Q=4)</text>
  <rect x="60"  y="250" width="80" height="34" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="100" y="272" text-anchor="middle" font-size="11">P1</text>
  <rect x="140" y="250" width="60" height="34" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="170" y="272" text-anchor="middle" font-size="11">P2</text>
  <rect x="200" y="250" width="60" height="34" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="230" y="272" text-anchor="middle" font-size="11">P3</text>
  <rect x="260" y="250" width="400" height="34" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="460" y="272" text-anchor="middle" font-size="11">P1 (나머지 20)</text>
  <text x="60"  y="298" font-size="10">0</text>
  <text x="133" y="298" font-size="10">4</text>
  <text x="193" y="298" font-size="10">7</text>
  <text x="253" y="298" font-size="10">10</text>
  <text x="653" y="298" font-size="10">30</text>
  <text x="60" y="318" font-size="11" fill="#555">짧은 작업(P2·P3)이 일찍 반응 → 응답시간↓, 대신 컨텍스트 스위치↑</text>
</svg>

<sub>같은 세 작업이라도 순서 정책에 따라 평균 대기시간이 크게 달라진다. FCFS는 긴 P1이 앞에 있어 뒤 작업이 오래 대기(호위 효과), SJF는 짧은 것부터 처리해 평균 대기시간이 최소, RR은 퀀텀(4ms)마다 순환해 짧은 작업이 빨리 반응하지만 스위칭 오버헤드가 늘어난다.</sub>

---

### Priority Scheduling

- 우선순위 높은 프로세스 먼저 실행.
- 선점/비선점 모두 가능.
- 단점: **기아(Starvation)** → 해결: **에이징(Aging)** (오래 대기할수록 우선순위 높임)

---

### MLQ / MLFQ (Multi-Level (Feedback) Queue)

- 여러 개의 Ready Queue, 각 큐마다 다른 스케줄링 정책

```
Queue 1 (우선순위 최高): RR, Q=8ms   ← 인터랙티브 프로세스
Queue 2:                RR, Q=16ms
Queue 3 (우선순위 최低): FCFS         ← CPU 집중 프로세스
```

**MLFQ**: 실행 시간이 길수록 낮은 큐로 이동 → 동적으로 우선순위 조정

---

## 4. 기아 (Starvation) & 에이징 (Aging)

- **기아**: 우선순위 낮은 프로세스가 영원히 CPU를 못 받는 현상
- **에이징**: 대기 시간에 비례해 우선순위를 점진적으로 올려 기아 방지

---

## 면접 자주 출제 Q&A

**Q. Round Robin에서 Time Quantum을 어떻게 정해야 하나?**  
→ 너무 크면 FCFS처럼 응답성 저하, 너무 작으면 컨텍스트 스위치 오버헤드 증가. 일반적으로 컨텍스트 스위치 시간의 10~100배를 목표. 대부분의 프로세스가 한 Quantum 내에 완료될 수 있을 만큼 크게.

**Q. SJF가 최적인데 왜 실제로 잘 안 쓰나?**  
→ 미래의 실행 시간을 예측해야 하기 때문. 과거 실행 시간을 지수 평균(exponential averaging)으로 예측하지만 부정확함. 기아 문제도 있음.

**Q. 현대 OS의 스케줄링은?**  
→ MLFQ 기반에 Priority와 에이징 조합. Linux는 CFS(Completely Fair Scheduler) — 가상 런타임(vruntime) 기반 적색-흑색 트리로 구현.
