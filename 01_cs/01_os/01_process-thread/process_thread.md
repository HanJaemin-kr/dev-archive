---
title: "프로세스와 스레드 (Process & Thread)"
domain: cs
category: os
tags: [cs, os, process-thread]
level: intermediate
status: published
created: 2026-07-16
updated: 2026-07-16
velog: false
related: []
---

# 프로세스와 스레드 (Process & Thread)

---

## 1. 프로세스 (Process)

운영체제로부터 자원을 할당받은 **독립적인 실행 단위**.

### 메모리 구조

```
High Address
┌─────────────┐
│    Stack    │ ← 지역변수, 함수 호출 정보 (아래로 성장)
├─────────────┤
│      ↓      │
│             │
│      ↑      │
├─────────────┤
│    Heap     │ ← 동적 할당 (malloc, new) (위로 성장)
├─────────────┤
│    BSS      │ ← 초기화 안 된 전역/정적 변수
├─────────────┤
│    Data     │ ← 초기화된 전역/정적 변수
├─────────────┤
│    Code     │ ← 실행 코드 (텍스트 영역)
└─────────────┘
Low Address
```

### PCB (Process Control Block)

OS가 프로세스를 관리하기 위해 저장하는 자료구조.

| 정보 | 내용 |
|------|------|
| PID | 프로세스 고유 ID |
| 프로세스 상태 | New / Ready / Running / Waiting / Terminated |
| PC (Program Counter) | 다음 실행할 명령어 주소 |
| CPU 레지스터 | 컨텍스트 스위치 시 저장 |
| 메모리 정보 | 페이지 테이블, 베이스/한계 레지스터 |
| I/O 상태 | 열린 파일 목록 등 |

### 프로세스 상태 전이

```
New → Ready → Running → Terminated
               ↑   ↓
            Waiting (I/O 대기)
```

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 300" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="pt-state-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="350" y="26" text-anchor="middle" font-weight="bold" font-size="16">프로세스 상태 전이도</text>

  <!-- states -->
  <rect x="20" y="120" width="90" height="46" rx="8" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="65" y="148" text-anchor="middle" font-size="14">New</text>

  <rect x="200" y="120" width="90" height="46" rx="8" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="245" y="148" text-anchor="middle" font-size="14">Ready</text>

  <rect x="420" y="120" width="90" height="46" rx="8" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="465" y="148" text-anchor="middle" font-size="14">Running</text>

  <rect x="600" y="120" width="90" height="46" rx="8" fill="#f8d7da" stroke="#333" stroke-width="1.5"/>
  <text x="645" y="148" text-anchor="middle" font-size="14">Terminated</text>

  <rect x="300" y="235" width="110" height="46" rx="8" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="355" y="263" text-anchor="middle" font-size="13">Waiting</text>

  <!-- New -> Ready (admit) -->
  <line x1="110" y1="143" x2="196" y2="143" stroke="#333" stroke-width="2" marker-end="url(#pt-state-arrow)"/>
  <text x="153" y="135" text-anchor="middle" font-size="11">① admit</text>

  <!-- Ready -> Running (dispatch) -->
  <line x1="290" y1="136" x2="416" y2="136" stroke="#333" stroke-width="2" marker-end="url(#pt-state-arrow)"/>
  <text x="353" y="128" text-anchor="middle" font-size="11">② dispatch</text>

  <!-- Running -> Ready (timeout/preempt) -->
  <line x1="416" y1="155" x2="292" y2="155" stroke="#333" stroke-width="2" marker-end="url(#pt-state-arrow)"/>
  <text x="353" y="172" text-anchor="middle" font-size="11">③ 선점(타임아웃)</text>

  <!-- Running -> Terminated (exit) -->
  <line x1="510" y1="143" x2="596" y2="143" stroke="#333" stroke-width="2" marker-end="url(#pt-state-arrow)"/>
  <text x="553" y="135" text-anchor="middle" font-size="11">⑥ exit</text>

  <!-- Running -> Waiting (I/O request) -->
  <line x1="450" y1="166" x2="390" y2="233" stroke="#333" stroke-width="2" marker-end="url(#pt-state-arrow)"/>
  <text x="470" y="210" text-anchor="middle" font-size="11">④ I/O 요청</text>

  <!-- Waiting -> Ready (I/O done) -->
  <line x1="300" y1="255" x2="252" y2="168" stroke="#333" stroke-width="2" marker-end="url(#pt-state-arrow)"/>
  <text x="238" y="215" text-anchor="middle" font-size="11">⑤ I/O 완료</text>
</svg>

<sub>① New→Ready: 생성 후 준비 큐 진입 · ② Ready→Running: 스케줄러가 CPU 할당 · ③ Running→Ready: 타임 퀀텀 소진/선점 · ④ Running→Waiting: I/O·이벤트 대기 · ⑤ Waiting→Ready: I/O 완료 후 다시 준비 · ⑥ Running→Terminated: 실행 종료.</sub>

---

## 2. 스레드 (Thread)

프로세스 내 **실행 흐름의 단위**. 프로세스의 자원을 공유.

### 스레드가 공유하는 것 vs 독립적인 것

| 공유 (프로세스 내) | 독립 (스레드별) |
|:-----------------:|:--------------:|
| Code 영역 | Stack |
| Data 영역 | PC (Program Counter) |
| Heap 영역 | 레지스터 |
| 파일/소켓 | Thread ID |

---

## 3. 프로세스 vs 스레드

| 비교 항목 | 프로세스 | 스레드 |
|-----------|---------|-------|
| 메모리 | 독립적 주소 공간 | 프로세스 내 공유 |
| 통신 방법 | IPC (pipe, socket, shared memory) | 공유 메모리 직접 접근 |
| 컨텍스트 스위치 비용 | 높음 (주소 공간 전환) | 낮음 |
| 안정성 | 하나가 죽어도 다른 프로세스 영향 없음 | 하나가 죽으면 전체 프로세스 위험 |
| 생성 비용 | 높음 | 낮음 |

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 360" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <text x="340" y="26" text-anchor="middle" font-weight="bold" font-size="16">멀티스레드 프로세스의 메모리 구조 (공유 vs 개별)</text>

  <!-- outer process box -->
  <rect x="20" y="45" width="640" height="295" rx="10" fill="#f7f7f7" stroke="#333" stroke-width="2"/>
  <text x="40" y="68" font-size="13" font-weight="bold">프로세스 (하나의 주소 공간)</text>

  <!-- shared region -->
  <rect x="40" y="80" width="230" height="230" rx="8" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="155" y="102" text-anchor="middle" font-size="13" font-weight="bold">공유 영역 (모든 스레드 공용)</text>

  <rect x="60" y="115" width="190" height="40" rx="5" fill="#fff" stroke="#333" stroke-width="1.2"/>
  <text x="155" y="140" text-anchor="middle" font-size="12">Code (실행 코드)</text>
  <rect x="60" y="162" width="190" height="40" rx="5" fill="#fff" stroke="#333" stroke-width="1.2"/>
  <text x="155" y="187" text-anchor="middle" font-size="12">Data / BSS (전역·정적)</text>
  <rect x="60" y="209" width="190" height="40" rx="5" fill="#fff" stroke="#333" stroke-width="1.2"/>
  <text x="155" y="234" text-anchor="middle" font-size="12">Heap (동적 할당)</text>
  <rect x="60" y="256" width="190" height="40" rx="5" fill="#fff" stroke="#333" stroke-width="1.2"/>
  <text x="155" y="281" text-anchor="middle" font-size="12">파일 / 소켓 등 자원</text>

  <!-- per-thread region -->
  <rect x="290" y="80" width="350" height="230" rx="8" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="465" y="102" text-anchor="middle" font-size="13" font-weight="bold">스레드별 개별 영역</text>

  <!-- Thread 1 -->
  <rect x="310" y="115" width="145" height="180" rx="6" fill="#fff3cd" stroke="#333" stroke-width="1.2"/>
  <text x="382" y="135" text-anchor="middle" font-size="12" font-weight="bold">Thread 1</text>
  <rect x="325" y="145" width="115" height="30" rx="4" fill="#fff" stroke="#333" stroke-width="1"/>
  <text x="382" y="165" text-anchor="middle" font-size="11">Stack</text>
  <rect x="325" y="182" width="115" height="30" rx="4" fill="#fff" stroke="#333" stroke-width="1"/>
  <text x="382" y="202" text-anchor="middle" font-size="11">PC (프로그램 카운터)</text>
  <rect x="325" y="219" width="115" height="30" rx="4" fill="#fff" stroke="#333" stroke-width="1"/>
  <text x="382" y="239" text-anchor="middle" font-size="11">레지스터</text>
  <rect x="325" y="256" width="115" height="30" rx="4" fill="#fff" stroke="#333" stroke-width="1"/>
  <text x="382" y="276" text-anchor="middle" font-size="11">Thread ID</text>

  <!-- Thread 2 -->
  <rect x="475" y="115" width="145" height="180" rx="6" fill="#fff3cd" stroke="#333" stroke-width="1.2"/>
  <text x="547" y="135" text-anchor="middle" font-size="12" font-weight="bold">Thread 2</text>
  <rect x="490" y="145" width="115" height="30" rx="4" fill="#fff" stroke="#333" stroke-width="1"/>
  <text x="547" y="165" text-anchor="middle" font-size="11">Stack</text>
  <rect x="490" y="182" width="115" height="30" rx="4" fill="#fff" stroke="#333" stroke-width="1"/>
  <text x="547" y="202" text-anchor="middle" font-size="11">PC (프로그램 카운터)</text>
  <rect x="490" y="219" width="115" height="30" rx="4" fill="#fff" stroke="#333" stroke-width="1"/>
  <text x="547" y="239" text-anchor="middle" font-size="11">레지스터</text>
  <rect x="490" y="256" width="115" height="30" rx="4" fill="#fff" stroke="#333" stroke-width="1"/>
  <text x="547" y="276" text-anchor="middle" font-size="11">Thread ID</text>
</svg>

<sub>같은 프로세스 안의 스레드들은 Code·Data·Heap·자원(파란 영역)을 공유하고, Stack·PC·레지스터·Thread ID(노란 영역)만 스레드마다 따로 갖는다. 그래서 공유 영역 동시 접근 시 Race Condition이 발생한다.</sub>

---

## 4. 멀티프로세스 vs 멀티스레드

| | 멀티프로세스 | 멀티스레드 |
|--|------------|----------|
| 안정성 | 높음 (독립) | 낮음 (공유) |
| 자원 효율 | 낮음 (중복 메모리) | 높음 (공유) |
| 통신 속도 | 느림 (IPC) | 빠름 (공유 메모리) |
| 동기화 이슈 | 없음 | Race Condition 주의 |
| 예시 | Chrome 탭 (각 탭 = 프로세스) | 웹 서버 요청 처리 |

---

## 5. 컨텍스트 스위치 (Context Switch)

CPU가 현재 실행 중인 프로세스/스레드를 멈추고 다른 것으로 전환하는 과정.

```
프로세스 A 실행
    ↓
인터럽트 / 스케줄러 개입
    ↓
A의 상태(PCB) 저장
    ↓
B의 상태(PCB) 복원
    ↓
프로세스 B 실행
```

- **오버헤드 발생**: 저장/복원하는 시간이 낭비 → 자주 일어날수록 비효율
- 스레드 간 전환은 Stack만 바꾸면 되므로 프로세스 전환보다 빠름

---

## 6. 사용자 수준 스레드 vs 커널 수준 스레드

| | 사용자 수준 스레드 | 커널 수준 스레드 |
|--|:----------------:|:--------------:|
| 관리 주체 | 사용자 라이브러리 | OS 커널 |
| 컨텍스트 스위치 | 빠름 (커널 개입 없음) | 느림 (시스템 콜) |
| 병렬 실행 | 불가 (커널이 모름) | 가능 |
| 하나 블로킹 시 | 전체 블로킹 | 해당 스레드만 |

---

## 면접 자주 출제 Q&A

**Q. 프로세스와 스레드의 차이는?**  
→ 프로세스는 독립적인 메모리 공간을 가진 실행 단위, 스레드는 프로세스 내에서 Code/Data/Heap을 공유하며 Stack만 독립적으로 갖는 실행 흐름. 스레드는 생성 비용이 낮고 통신이 빠르지만 동기화 문제가 발생할 수 있음.

**Q. 멀티스레드를 쓸 때 주의할 점은?**  
→ 여러 스레드가 공유 자원에 동시 접근하면 Race Condition 발생. Critical Section을 Mutex/Semaphore로 보호해야 함. 또한 하나의 스레드 오류가 전체 프로세스를 죽일 수 있음.

**Q. 컨텍스트 스위치 비용을 줄이는 방법은?**  
→ 스레드 풀(Thread Pool) 사용, 코루틴(Coroutine) 활용, CPU 친화성(CPU Affinity) 설정, Lock-free 자료구조 사용.

**Q. 크롬은 왜 탭마다 프로세스를 쓰나?**  
→ 하나의 탭이 죽어도 다른 탭에 영향이 없도록 안정성 확보. 보안 샌드박스 격리도 가능. 단점은 메모리를 많이 쓴다는 것.
