---
title: 메모리 관리 (Memory Management)
domain: cs
category: os
tags: [cs, os, memory]
level: intermediate
status: published
created: 2026-07-16
updated: 2026-07-16
velog: false
related: []
---

# 메모리 관리 (Memory Management)

---

## 1. 메모리 계층 구조

```
빠름 / 비쌈 / 작음
┌──────────────┐
│  Register    │ ← CPU 내부, 수 byte
├──────────────┤
│  L1/L2/L3   │ ← CPU 캐시, KB~MB
│    Cache     │
├──────────────┤
│     RAM      │ ← 주기억장치, GB
│  (메인 메모리) │
├──────────────┤
│     SSD      │ ← 보조기억장치, TB
│    / HDD     │
└──────────────┘
느림 / 저렴 / 큼
```

---

## 2. 가상 메모리 (Virtual Memory)

물리 메모리보다 큰 프로그램을 실행하기 위해 **디스크 일부를 메모리처럼** 사용.

- 각 프로세스는 **독립적인 가상 주소 공간**을 갖음
- 실제 물리 메모리 주소로의 변환은 **MMU(Memory Management Unit)** 가 담당
- 당장 필요한 페이지만 메모리에 올림 → **요구 페이징(Demand Paging)**

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 420" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="mem-layout-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="210" y="26" text-anchor="middle" font-weight="bold" font-size="16">프로세스 가상 메모리 레이아웃</text>

  <text x="300" y="52" font-size="11" fill="#555">▲ High Address</text>

  <!-- Stack -->
  <rect x="90" y="58" width="240" height="60" fill="#f8d7da" stroke="#333" stroke-width="1.5"/>
  <text x="210" y="82" text-anchor="middle" font-size="13" font-weight="bold">Stack</text>
  <text x="210" y="102" text-anchor="middle" font-size="11">지역변수·함수 호출정보 (아래로 성장 ↓)</text>

  <!-- gap with arrows -->
  <rect x="90" y="118" width="240" height="90" fill="#f7f7f7" stroke="#333" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="210" y1="128" x2="210" y2="168" stroke="#333" stroke-width="2" marker-end="url(#mem-layout-arrow)"/>
  <text x="255" y="150" font-size="11" fill="#555">stack ↓</text>
  <line x1="150" y1="198" x2="150" y2="158" stroke="#333" stroke-width="2" marker-end="url(#mem-layout-arrow)"/>
  <text x="115" y="185" font-size="11" fill="#555">heap ↑</text>
  <text x="210" y="203" text-anchor="middle" font-size="10" fill="#888">(빈 공간 · 서로 마주보며 성장)</text>

  <!-- Heap -->
  <rect x="90" y="208" width="240" height="52" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="210" y="230" text-anchor="middle" font-size="13" font-weight="bold">Heap</text>
  <text x="210" y="249" text-anchor="middle" font-size="11">동적 할당 (malloc·new, 위로 성장 ↑)</text>

  <!-- BSS -->
  <rect x="90" y="260" width="240" height="40" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="210" y="285" text-anchor="middle" font-size="12">BSS — 초기화 안 된 전역/정적</text>

  <!-- Data -->
  <rect x="90" y="300" width="240" height="40" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="210" y="325" text-anchor="middle" font-size="12">Data — 초기화된 전역/정적</text>

  <!-- Code -->
  <rect x="90" y="340" width="240" height="40" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="210" y="365" text-anchor="middle" font-size="12">Code (Text) — 실행 코드</text>

  <text x="90" y="398" font-size="11" fill="#555">▼ Low Address</text>
</svg>

<sub>Stack은 높은 주소에서 아래로, Heap은 Data 위에서 위로 성장하며 가운데 빈 공간을 두고 서로 마주본다. 둘이 충돌하면 스택 오버플로/힙 고갈이 된다. Code·Data·BSS는 고정 크기 영역이다.</sub>

### 페이지 폴트 (Page Fault)

접근하려는 페이지가 물리 메모리에 없을 때 발생.

```
가상 주소 접근
    ↓
페이지 테이블 조회
    ↓
물리 메모리에 없음 (Page Fault)
    ↓
디스크(스왑 영역)에서 페이지 로드
    ↓
페이지 테이블 갱신 → 재실행
```

---

## 3. 페이징 (Paging)

가상 메모리를 **고정 크기 블록(페이지)** 으로 나누는 방식.

- 페이지(Page): 가상 메모리의 단위 블록 (보통 4KB)
- 프레임(Frame): 물리 메모리의 동일 크기 블록
- 페이지 테이블: 가상 페이지 번호 → 물리 프레임 번호 매핑

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 300" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="mem-page-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="360" y="26" text-anchor="middle" font-weight="bold" font-size="16">페이징: 가상주소 → 페이지 테이블 → 물리 프레임</text>

  <!-- virtual address -->
  <text x="120" y="60" text-anchor="middle" font-size="13" font-weight="bold">① 가상 주소</text>
  <rect x="40" y="70" width="90" height="44" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="85" y="97" text-anchor="middle" font-size="12">페이지 번호 p</text>
  <rect x="130" y="70" width="80" height="44" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="170" y="97" text-anchor="middle" font-size="12">오프셋 d</text>

  <!-- page table -->
  <text x="360" y="60" text-anchor="middle" font-size="13" font-weight="bold">② 페이지 테이블</text>
  <rect x="300" y="70" width="120" height="180" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <line x1="300" y1="106" x2="420" y2="106" stroke="#333"/>
  <line x1="300" y1="142" x2="420" y2="142" stroke="#333"/>
  <line x1="300" y1="178" x2="420" y2="178" stroke="#333"/>
  <line x1="300" y1="214" x2="420" y2="214" stroke="#333"/>
  <text x="360" y="93" text-anchor="middle" font-size="11">p=0 → frame 5</text>
  <text x="360" y="129" text-anchor="middle" font-size="11">p=1 → frame 2</text>
  <rect x="300" y="142" width="120" height="36" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="360" y="165" text-anchor="middle" font-size="11" font-weight="bold">p=2 → frame 7</text>
  <text x="360" y="201" text-anchor="middle" font-size="11">p=3 → frame 1</text>
  <text x="360" y="237" text-anchor="middle" font-size="11">…</text>

  <!-- physical memory -->
  <text x="620" y="60" text-anchor="middle" font-size="13" font-weight="bold">③ 물리 메모리 (프레임)</text>
  <rect x="560" y="70" width="120" height="44" fill="#fff" stroke="#333" stroke-width="1.5"/>
  <text x="620" y="97" text-anchor="middle" font-size="11">frame 5</text>
  <rect x="560" y="118" width="120" height="44" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="620" y="140" text-anchor="middle" font-size="11" font-weight="bold">frame 7 (p=2 데이터)</text>
  <text x="620" y="156" text-anchor="middle" font-size="10">+ 오프셋 d</text>
  <rect x="560" y="166" width="120" height="44" fill="#fff" stroke="#333" stroke-width="1.5"/>
  <text x="620" y="193" text-anchor="middle" font-size="11">frame 1</text>

  <!-- arrows -->
  <line x1="85" y1="114" x2="130" y2="155" stroke="#333" stroke-width="2" marker-end="url(#mem-page-arrow)"/>
  <text x="150" y="150" font-size="11">p로 조회</text>
  <line x1="210" y1="160" x2="298" y2="160" stroke="#333" stroke-width="2" marker-end="url(#mem-page-arrow)"/>
  <line x1="420" y1="160" x2="558" y2="140" stroke="#333" stroke-width="2" marker-end="url(#mem-page-arrow)"/>
  <text x="490" y="145" text-anchor="middle" font-size="11">frame 7</text>

  <text x="360" y="285" text-anchor="middle" font-size="11" fill="#555">물리 주소 = (프레임 번호 × 페이지 크기) + 오프셋 d</text>
</svg>

<sub>① 가상 주소를 페이지 번호 p와 오프셋 d로 분리 → ② 페이지 테이블에서 p에 대응하는 프레임 번호를 찾음 → ③ 프레임 시작 주소에 오프셋 d를 더해 실제 물리 주소를 계산한다. 오프셋 d는 변환 과정에서 그대로 유지된다.</sub>

**장점**: 외부 단편화 없음  
**단점**: 내부 단편화 발생 (페이지 마지막 공간 낭비), 페이지 테이블 자체의 메모리 비용

---

## 4. 세그멘테이션 (Segmentation)

프로그램을 **논리적 단위(Code, Data, Stack 등)** 로 나누는 방식.

- 세그먼트마다 크기가 가변적
- **장점**: 외부 단편화 발생 가능, 내부 단편화 없음
- 현대 OS는 페이징+세그멘테이션 혼합 사용

---

## 5. 페이지 교체 알고리즘

물리 메모리가 꽉 찼을 때 어떤 페이지를 디스크로 내보낼지 결정.

| 알고리즘 | 설명 | 특징 |
|----------|------|------|
| **OPT** | 앞으로 가장 오래 사용되지 않을 페이지 교체 | 최적이지만 미래 예측 불가 → 이론적 기준 |
| **FIFO** | 가장 오래된 페이지 교체 | 구현 쉬움, Belady's Anomaly 발생 가능 |
| **LRU** | 가장 오랫동안 사용되지 않은 페이지 교체 | 실용적, 스택/카운터로 구현 |
| **LFU** | 사용 빈도가 가장 낮은 페이지 교체 | 자주 쓰이던 오래된 페이지 보호 안 됨 |
| **Clock** | LRU 근사 알고리즘, 참조 비트 사용 | LRU보다 구현 단순, 성능 유사 |

> **Belady's Anomaly**: FIFO에서 프레임 수를 늘렸는데 오히려 페이지 폴트가 증가하는 현상 (LRU는 발생 안 함)

---

## 6. 메모리 단편화 (Fragmentation)

| 종류         | 설명                         | 발생 원인            |
| ---------- | -------------------------- | ---------------- |
| **내부 단편화** | 할당된 공간 > 실제 사용 공간          | 페이징 (마지막 페이지 낭비) |
| **외부 단편화** | 총 여유 공간 > 요청 크기지만 연속 공간 없음 | 세그멘테이션, 가변 분할    |

**해결법**:
- 내부 단편화 → 페이지 크기를 작게
- 외부 단편화 → 압축(Compaction), 페이징

---

## 7. TLB (Translation Lookaside Buffer)

페이지 테이블 접근을 빠르게 하기 위한 **캐시**.

```
가상 주소
    ↓
TLB 조회 → Hit: 물리 주소 즉시 반환 (빠름)
           Miss: 페이지 테이블 접근 → TLB 갱신
```

- TLB Hit Rate가 높을수록 메모리 접근 속도 향상
- 컨텍스트 스위치 시 TLB 플러시 필요 (프로세스마다 주소 공간 다름)

---

## 면접 자주 출제 Q&A

**Q. 가상 메모리란?**  
→ 물리 메모리 이상의 공간을 사용 가능하게 하는 기술. 디스크 일부를 스왑 영역으로 사용. 각 프로세스에 독립적인 주소 공간 제공 → 보안·안정성 향상.

**Q. 페이지 폴트가 자주 발생하면?**  
→ 스래싱(Thrashing) 발생. CPU가 실제 작업보다 페이지 교체에 대부분의 시간을 씀 → CPU 이용률 급감. 해결: 프로세스 수 줄이기, 물리 메모리 증설, Working Set 기법.

**Q. LRU를 실제로 구현하는 방법?**  
→ Hash Map + 이중 연결 리스트(Doubly Linked List) 조합. O(1) 접근과 O(1) 삽입/삭제 가능 (LRU Cache 문제가 이것).

**Q. 내부 단편화 vs 외부 단편화?**  
→ 내부는 할당 공간 내부의 낭비(페이징에서 발생), 외부는 할당 공간들 사이의 작은 빈 공간들(세그멘테이션에서 발생).
