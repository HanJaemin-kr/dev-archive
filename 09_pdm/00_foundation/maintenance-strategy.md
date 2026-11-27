---
title: "정비 전략 & CBM 개론 (Maintenance Strategy & Condition-Based Monitoring)"
domain: pdm
category: foundation
tags: [pdm, foundation]
level: intermediate
status: published
created: 2026-07-20
updated: 2026-07-20
velog: false
related: []
---

# 정비 전략 & CBM 개론 (Maintenance Strategy & Condition-Based Monitoring)

예지보전(PdM)이 **왜** 필요한지, 정비 패러다임이 어떻게 진화했는지, 그리고 설비 상태를
**어떤 기법으로** 감시하는지의 큰 그림. 이 문서는 09_pdm 전체의 개념 토대다 — 구체적인
진동 진단은 [[vibration]]·[[resonance]]·[[motor]], 센서는 [[sensor]], 이상감지 알고리즘은
[[ml]]·[[threshold]], 시스템 구성은 아키텍처 폴더 참고.

## 정비 전략의 진화 — 4단계

| 전략 | 영문 | 언제 정비하나 | 근거 | 한계 |
|------|------|--------------|------|------|
| **사후보전** | Reactive / Run-to-Failure | 고장 난 뒤 | 없음(고장) | 돌발정지·2차손상·안전위험 |
| **예방보전** | Preventive (time-based) | 정해진 주기마다 | 시간·가동시간 | 과잉정비·멀쩡한 부품 교체, 돌발고장 여전 |
| **예지보전** | Predictive (condition-based) | 징후가 보이면 | 실측 상태 | 센서·분석 인프라 필요 |
| **처방보전** | Prescriptive | 징후 + AI 처방 | 상태+예측(RUL) | 데이터·모델 성숙 필요 |

<svg viewBox="0 0 660 170" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:sans-serif"><rect x="0" y="0" width="660" height="170" rx="8" fill="#ffffff" stroke="#e2e8f0"/><text x="20" y="26" font-size="15" font-weight="700" fill="#1e293b">정비 전략 정교화 — 돌발정지↓ · 비용효율↑</text><rect x="20" y="50" width="140" height="58" rx="6" fill="#dc2626" opacity="0.88"/><text x="90" y="76" font-size="12.5" fill="#ffffff" font-weight="700" text-anchor="middle">사후보전</text><text x="90" y="94" font-size="9.5" fill="#ffffff" text-anchor="middle">고장 후 수리</text><rect x="175" y="50" width="140" height="58" rx="6" fill="#f59e0b" opacity="0.9"/><text x="245" y="76" font-size="12.5" fill="#ffffff" font-weight="700" text-anchor="middle">예방보전</text><text x="245" y="94" font-size="9.5" fill="#ffffff" text-anchor="middle">주기적 교체</text><rect x="330" y="50" width="140" height="58" rx="6" fill="#2563eb" opacity="0.9"/><text x="400" y="76" font-size="12.5" fill="#ffffff" font-weight="700" text-anchor="middle">예지보전</text><text x="400" y="94" font-size="9.5" fill="#ffffff" text-anchor="middle">상태 기반</text><rect x="485" y="50" width="140" height="58" rx="6" fill="#059669" opacity="0.9"/><text x="555" y="76" font-size="12.5" fill="#ffffff" font-weight="700" text-anchor="middle">처방보전</text><text x="555" y="94" font-size="9.5" fill="#ffffff" text-anchor="middle">AI 처방·RUL</text><line x1="20" y1="130" x2="605" y2="130" stroke="#94a3b8" stroke-width="1.5"/><polyline points="599,125 609,130 599,135" fill="none" stroke="#94a3b8" stroke-width="1.5"/><text x="312" y="152" font-size="10.5" fill="#64748b" text-anchor="middle">데이터·성숙도 →  (모든 설비를 최고 단계로 하지 않는다 — 중요도로 결정)</text></svg>

> [!note] "더 정교한 게 항상 옳은 것은 아니다"
> 값싸고 예비품 흔한 비핵심 설비는 **사후보전**이 오히려 경제적이다. 전략은 설비
> **중요도(criticality)** 로 차등한다(아래 매트릭스). PdM은 만능이 아니라 **선택 적용**.

## P-F 곡선 — 예지보전의 심장

잠재고장이 **감지 가능해지는 시점 P**부터 실제로 기능을 잃는 **기능고장 F**까지의 구간을
**P-F 간격**이라 한다. 이 구간이 있어야 "미리" 손쓸 수 있다.

<svg viewBox="0 0 660 285" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:sans-serif"><rect x="0" y="0" width="660" height="285" rx="8" fill="#ffffff" stroke="#e2e8f0"/><text x="20" y="26" font-size="15" font-weight="700" fill="#1e293b">P-F 곡선 — 기법별 조기 검출 시점</text><line x1="70" y1="240" x2="630" y2="240" stroke="#cbd5e1" stroke-width="1"/><line x1="70" y1="45" x2="70" y2="240" stroke="#cbd5e1" stroke-width="1"/><text x="40" y="140" font-size="11" fill="#334155" transform="rotate(-90 40 140)" text-anchor="middle">설비 상태 (건전 → 고장)</text><text x="350" y="268" font-size="11" fill="#334155" text-anchor="middle">시간 →</text><polyline points="70,80 240,80 300,95 360,120 410,145 470,175 520,200 560,215 600,232" fill="none" stroke="#2563eb" stroke-width="2.4"/><line x1="300" y1="60" x2="300" y2="240" stroke="#94a3b8" stroke-width="1" stroke-dasharray="5,4"/><text x="300" y="54" font-size="11" fill="#334155" text-anchor="middle" font-weight="700">P 잠재고장</text><line x1="560" y1="60" x2="560" y2="240" stroke="#dc2626" stroke-width="1" stroke-dasharray="5,4"/><text x="560" y="54" font-size="11" fill="#dc2626" text-anchor="middle" font-weight="700">F 기능고장</text><line x1="310" y1="70" x2="550" y2="70" stroke="#334155" stroke-width="1.2"/><polyline points="316,66 306,70 316,74" fill="none" stroke="#334155" stroke-width="1.2"/><polyline points="544,66 554,70 544,74" fill="none" stroke="#334155" stroke-width="1.2"/><text x="430" y="66" font-size="10" fill="#334155" text-anchor="middle">P-F 간격 (점검주기 &lt; ½)</text><circle cx="300" cy="95" r="5" fill="#7c3aed"/><text x="308" y="99" font-size="9.5" fill="#7c3aed" font-weight="700">초음파·AE (가장 이름)</text><circle cx="360" cy="120" r="5" fill="#2563eb"/><text x="368" y="124" font-size="9.5" fill="#2563eb" font-weight="700">진동 분석</text><circle cx="410" cy="145" r="5" fill="#0891b2"/><text x="418" y="149" font-size="9.5" fill="#0891b2" font-weight="700">오일 분석</text><circle cx="470" cy="175" r="5" fill="#f59e0b"/><text x="478" y="179" font-size="9.5" fill="#f59e0b" font-weight="700">열화상</text><circle cx="520" cy="200" r="5" fill="#ea580c"/><text x="416" y="214" font-size="9.5" fill="#ea580c" font-weight="700">소음·촉감·육안</text></svg>

- **점검 주기는 P-F 간격보다 촘촘히**(보통 1/2~1/3). 그래야 P와 F 사이에 최소 한 번 잡는다.
- 같은 결함도 **더 일찍 잡는 기법**이 있다: 초음파/AE → 진동 → 오일 → 열화상 → 소음/체감.
  일찍 잡을수록 대응 여유(부품 발주·계획 정지)가 커진다.

## 고장 패턴 — "주기 교체"가 잘 안 통하는 이유

전통적 **욕조곡선**(초기결함 → 우발고장 → 마모)만 믿고 "일정 시간마다 교체"하면 많은
설비에서 효과가 없다. Nowlan & Heap 연구(항공)에서 실제 고장의 **약 89%는 사용시간과
무관한 랜덤 패턴**이었고, 마모형(age-related)은 **~11%뿐**이었다.

| 함의 | 설명 |
|------|------|
| 마모형(소수) | 시간 기반 예방보전(PM)이 유효 |
| 랜덤형(다수) | 주기 교체 무의미 → **상태 기반(CBM/PdM)** 이 정답 |

→ 대부분 설비에서 "언제 고장 날지 시간으로 못 정한다" → **상태를 봐야 한다** = CBM 정당화.

## CBM 기법 지도 (Condition Monitoring Techniques)

상태 감시는 진동만이 아니다. 서로 **강점과 조기성이 달라 상호보완**적이다.

| 기법 | 무엇을 감지 | 조기성 | 주 대상 |
|------|------------|--------|---------|
| **진동 분석** | 불평형·정렬·베어링·기어·공진 | 중~조기 | 회전기계 전반(주력) |
| **초음파 / AE** | 초기 베어링·누설·아크·부분방전 | **가장 조기** | 베어링·밸브·전기 |
| **오일 분석(트라이볼로지)** | 마모입자·오염·산화·점도 | 조기~중 | 기어박스·엔진·유압 |
| **열화상(적외선)** | 과열: 전기접점·베어링·단열 손상 | 중~후 | 전기설비·기계 |
| **MCSA(전류)** | 회전자바·편심·상 불평형 | 중 | 유도전동기([[motor]]) |
| **성능·공정 감시** | 효율·유량·차압·온도 트렌드 | 후 | 펌프·열교환기·공정 |

> [!tip] 진동이 왜 주력인가
> 회전기계 고장의 대다수(불평형·정렬·베어링·기어)가 **진동에 먼저·명확히** 나타나고,
> 주파수 분석으로 **원인까지 특정**되기 때문. 다만 전기적 결함은 MCSA, 윤활계는 오일분석,
> 전기 접점은 열화상이 더 낫다 → 중요 설비는 **복합 감시**.

## 설비 중요도 매트릭스 — 무엇을 어디까지 감시할까

```
중요도(Criticality) = 고장 영향(안전·생산·비용) × 고장 확률
```

| 등급 | 예시 | 감시 수준 |
|------|------|-----------|
| **A (핵심)** | 정지 시 라인 전체 정지·안전 위험 | **온라인 상시감시** + 다중 기법 |
| **B (중요)** | 예비 있으나 영향 큼 | 주기적 루트 점검(휴대형) + 트렌드 |
| **C (일반)** | 예비 흔함·영향 작음 | 사후보전 or 최소 점검 |

## RCM — 어떤 정비를 고를지 정하는 방법

**신뢰성 중심 정비(Reliability-Centered Maintenance)**: 설비마다 기능→기능고장→고장모드
(FMEA)→영향을 분석해 **고장모드별로 가장 적합한 정비 방식**을 선택한다(SAE JA1011).

- 결과는 "전부 PdM"이 아니라 모드별로 **PdM / PM / 개선 / 사후보전** 혼합.
- 숨은 고장(보호장치 등)은 **주기적 기능시험**으로 발견.

## 경제성 지표 (KPI)

| 지표 | 의미 |
|------|------|
| **MTBF** | 평균 고장 간격 (Mean Time Between Failures) — 높을수록 신뢰성↑ |
| **MTTR** | 평균 수리 시간 (Mean Time To Repair) — 낮을수록 정비성↑ |
| **가용도(Availability)** | MTBF / (MTBF + MTTR) |
| **OEE** | 종합설비효율 = 가동률 × 성능 × 양품률 |

- PdM ROI: **돌발정지↓ · 정비비↓ · 부품·설비 수명↑ · 안전·환경 위험↓ · 예비품 재고↓**.

---

## 참고

- 정비 4단계: 사후 → 예방 → 예지 → 처방. 정교함은 **중요도에 맞춰** 차등 적용
- **P-F 곡선**: 점검주기 < P-F 간격의 1/2, 일찍 잡는 기법일수록 대응 여유↑
- 고장의 다수는 랜덤 → 시간 기반 교체보다 **상태 기반(CBM)** 이 유효
- CBM 기법은 상호보완: 진동(주력) + 초음파·오일·열화상·MCSA

### 관련 표준

| 표준 | 내용 |
|------|------|
| **ISO 17359** | 상태감시·진단 일반 지침(가이드라인) |
| **ISO 13379** | 진단 데이터 해석·기법 |
| **ISO 13381** | 예후(prognostics)·잔여수명(RUL) |
| **ISO 55000** | 자산관리(Asset Management) |
| **SAE JA1011 / JA1012** | RCM 기준·가이드 |

- 관련 노트: [[industry-faults]] (산업별 대표 결함·진단) · [[vibration]] · [[resonance]] · [[motor]] · [[sensor]] · [[ml]] · [[threshold]]
