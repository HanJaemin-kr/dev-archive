---
title: 공진·고유진동수·위험속도 (Resonance / Natural Frequency / Critical Speed)
domain: pdm
category: signal
tags: [pdm, signal]
level: intermediate
status: published
created: 2026-07-20
updated: 2026-07-20
velog: false
related: []
---

# 공진·고유진동수·위험속도 (Resonance / Natural Frequency / Critical Speed)

모든 구조물·회전체는 **고유진동수(natural frequency)** 를 가진다. 가진(외력) 주파수가
이 값과 겹치면 **공진(resonance)** 이 일어나 진폭이 폭발적으로 커진다. 현장에서 "결함이
없는데도 진동이 유독 큰" 사례의 대표 원인이 공진이다 — 결함 주파수([[vibration]])나
밸런싱으로는 절대 안 잡힌다(원인이 구조에 있으므로). 모터 회전수는 [[motor]], FFT 설정은
[[fft]], 센서 위치는 [[sensor]] 참고.

## 고유진동수 (Natural Frequency)

외력 없이 스스로 진동하려는 주파수. 1자유도(SDOF) 모델로:

```
fₙ = (1 / 2π) · √(k / m)      k = 강성(N/m),  m = 질량(kg)

강성 k ↑  → fₙ ↑ (딱딱할수록 높은 음)
질량 m ↑  → fₙ ↓ (무거울수록 낮은 음)
```

- 감쇠(damping, ζ)는 고유진동수를 아주 조금 낮추지만, 그보다 **공진 첨예도**를 결정한다.
- 구조는 하나가 아니라 **여러 개의 모드(1차·2차·3차…)** 와 그만큼의 고유진동수를 가진다.

## 공진 (Resonance) — 왜 위험한가

가진 주파수 f 가 고유진동수 fₙ 에 가까워지면(주파수비 r = f/fₙ ≈ 1) 응답이 **배율 Q**
만큼 증폭된다.

```
증폭 배율(공진점)  Q = 1 / (2ζ)      ζ = 감쇠비(damping ratio)

ζ = 0.05 → Q = 10배,   ζ = 0.10 → 5배,   ζ = 0.25 → 2배
→ 감쇠가 작을수록 공진에서 진폭이 위험하게 치솟는다
```

<svg viewBox="0 0 660 240" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:sans-serif"><rect x="0" y="0" width="660" height="240" rx="8" fill="#ffffff" stroke="#e2e8f0"/><text x="20" y="26" font-size="15" font-weight="700" fill="#1e293b">주파수 응답 곡선 — 감쇠비 ζ 에 따른 공진 증폭</text><line x1="60" y1="200" x2="620" y2="200" stroke="#cbd5e1" stroke-width="1"/><line x1="60" y1="40" x2="60" y2="200" stroke="#cbd5e1" stroke-width="1"/><line x1="246.7" y1="40" x2="246.7" y2="200" stroke="#94a3b8" stroke-width="1" stroke-dasharray="5,4"/><text x="246.7" y="52" font-size="10.5" fill="#64748b" text-anchor="middle" font-weight="700">공진 r≈1</text><text x="60" y="214" font-size="10" fill="#94a3b8" text-anchor="middle">0</text><text x="246.7" y="214" font-size="10" fill="#94a3b8" text-anchor="middle">1</text><text x="433.3" y="214" font-size="10" fill="#94a3b8" text-anchor="middle">2</text><text x="620" y="214" font-size="10" fill="#94a3b8" text-anchor="middle">3</text><text x="340" y="232" font-size="11" fill="#334155" text-anchor="middle">주파수비  r = f / fₙ</text><text x="30" y="120" font-size="11" fill="#334155" transform="rotate(-90 30 120)" text-anchor="middle">진폭 배율 M</text><polyline points="60,184 106.7,183 153.3,179 200,165 228,139 246.7,120 265.3,147 293.3,174 340,188 386.7,192 433.3,195 526.7,197 620,198" fill="none" stroke="#dc2626" stroke-width="2.2"/><polyline points="60,184 153.3,180 200,172 246.7,168 293.3,181 340,189 433.3,195 526.7,197 620,198" fill="none" stroke="#2563eb" stroke-width="2.2"/><polyline points="60,184 153.3,182 246.7,184 340,192 433.3,196 526.7,197 620,198" fill="none" stroke="#059669" stroke-width="2.2"/><rect x="470" y="52" width="12" height="3" fill="#dc2626"/><text x="488" y="56" font-size="10.5" fill="#334155">ζ=0.10 (Q≈5)</text><rect x="470" y="70" width="12" height="3" fill="#2563eb"/><text x="488" y="74" font-size="10.5" fill="#334155">ζ=0.25 (Q≈2)</text><rect x="470" y="88" width="12" height="3" fill="#059669"/><text x="488" y="92" font-size="10.5" fill="#334155">ζ=0.50 (거의 무공진)</text></svg>

> [!note] 공진점의 위상 180° 반전
> 공진을 지날 때 응답 위상이 급변한다 — 공진 아래선 가진과 **동상**, 공진점에서 정확히
> **90° 지연**, 공진 위에선 **180°(역상)**. 런업/코스트다운에서 위상이 90°를 지나며
> 급변하는 회전수가 곧 위험속도다.

## 위험속도 (Critical Speed)

회전기계에서 **회전수(1×)가 로터-베어링계의 고유진동수와 일치하는 회전수**. 통과 시
진동이 급증하므로, 운전 중 그 근처에 머물면 안 된다.

- **강성 로터**: 운전속도가 1차 위험속도보다 아래 → 항상 아래에서 운전.
- **유연 로터**(고속 터빈·압축기): 위험속도를 **빠르게 통과(run through)** 해 그 위에서 운전.
- **분리 여유(Separation Margin)**: 운전속도는 위험속도에서 최소 ±10~20% 떨어뜨린다(API 기준).
- 가변속(VFD) 설비는 운전 대역 안에 위험속도가 들어오면 **스킵 주파수(skip band)** 로 회피.

## 공진 vs 결함 — 어떻게 구별하나

| | 공진 | 결함(불평형 등) |
|---|------|----------------|
| 주파수 | fₙ 에 고정(구조가 정함) | 1×·2× 등 회전수에 종속 |
| 회전수 바꾸면 | 특정 RPM에서만 급증 | 진폭은 대체로 완만히 변함 |
| 밸런싱하면 | **안 잡힘**(원인이 구조) | 잡힘 |
| 확인법 | 런업/코스트다운·범프 테스트 | 스펙트럼 1× 성분 |

## 진단 시험

### 범프 테스트 (Bump / Impact Test)
- **정지 상태**에서 구조를 해머로 때리고 응답을 FFT → 자연히 튀어나오는 피크 = 고유진동수.
- 간단·저비용, 단 운전 정지 필요. 가진력은 몰라도 fₙ 위치는 알 수 있다.

### 임팩트 해머 + FRF (모달 분석)
- **가진력(force)과 응답(accel)을 동시 측정** → 주파수응답함수(FRF), 나아가 모드 형상.
- 어느 방향·어느 부위가 약한지(모드 shape)까지 파악.

### ODS (Operating Deflection Shape, 운전 변형 형상)
- **운전 중** 여러 지점의 진폭·**위상**을 측정해 구조가 실제로 어떻게 휘는지 애니메이션화.
- 공진·약한 지지·느슨함을 눈으로 확인. (모달과 달리 운전 상태 그대로)

### 런업 / 코스트다운 (Run-up / Coast-down)
- 시동·정지 중 RPM이 스윕되며 여러 주파수를 훑는다 → **보드 선도**(진폭·위상 vs RPM)나
  **캐스케이드(워터폴)** 로 위험속도·공진을 포착.

## 캠벨 선도 (Campbell Diagram)

회전속도(x)에 대해 가진 성분의 차수선(1×·2×·3×…)과 구조 고유진동수(수평선)를 함께
그린 것. **교점 = 공진(위험속도)** 이 일어나는 회전수.

<svg viewBox="0 0 660 235" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:sans-serif"><rect x="0" y="0" width="660" height="235" rx="8" fill="#ffffff" stroke="#e2e8f0"/><text x="20" y="26" font-size="15" font-weight="700" fill="#1e293b">캠벨 선도 — 차수선 × 고유진동수 교점 = 위험속도</text><line x1="70" y1="200" x2="620" y2="200" stroke="#cbd5e1" stroke-width="1"/><line x1="70" y1="40" x2="70" y2="200" stroke="#cbd5e1" stroke-width="1"/><text x="70" y="214" font-size="10" fill="#94a3b8" text-anchor="middle">0</text><text x="253.3" y="214" font-size="10" fill="#94a3b8" text-anchor="middle">1200</text><text x="436.7" y="214" font-size="10" fill="#94a3b8" text-anchor="middle">2400</text><text x="620" y="214" font-size="10" fill="#94a3b8" text-anchor="middle">3600 RPM</text><text x="345" y="230" font-size="11" fill="#334155" text-anchor="middle">회전속도 (RPM)</text><text x="34" y="120" font-size="11" fill="#334155" transform="rotate(-90 34 120)" text-anchor="middle">주파수 (Hz)</text><line x1="70" y1="170" x2="620" y2="170" stroke="#059669" stroke-width="2" stroke-dasharray="6,4"/><text x="80" y="164" font-size="10.5" fill="#059669" font-weight="700">고유진동수 fₙ = 45 Hz</text><line x1="70" y1="200" x2="620" y2="160" stroke="#2563eb" stroke-width="1.8"/><text x="624" y="162" font-size="10" fill="#2563eb" font-weight="700">1×</text><line x1="70" y1="200" x2="620" y2="120" stroke="#7c3aed" stroke-width="1.8"/><text x="624" y="122" font-size="10" fill="#7c3aed" font-weight="700">2×</text><line x1="70" y1="200" x2="620" y2="80" stroke="#f59e0b" stroke-width="1.8"/><text x="624" y="82" font-size="10" fill="#f59e0b" font-weight="700">3×</text><circle cx="482.5" cy="170" r="5.5" fill="none" stroke="#dc2626" stroke-width="2.2"/><circle cx="276.3" cy="170" r="5.5" fill="none" stroke="#dc2626" stroke-width="2.2"/><circle cx="207.5" cy="170" r="5.5" fill="none" stroke="#dc2626" stroke-width="2.2"/><text x="482.5" y="190" font-size="9" fill="#dc2626" text-anchor="middle" font-weight="700">2700</text><text x="276.3" y="190" font-size="9" fill="#dc2626" text-anchor="middle" font-weight="700">1350</text><text x="207.5" y="190" font-size="9" fill="#dc2626" text-anchor="middle" font-weight="700">900</text><text x="300" y="58" font-size="10.5" fill="#dc2626" font-weight="700">● = 위험속도 (RPM)</text></svg>

## 대책 — 공진을 확인했다면

fₙ 를 옮기거나(강성·질량), 감쇠를 늘리거나, 운전점을 피한다.

| 방향 | 방법 | 원리 |
|------|------|------|
| **fₙ 올리기** | 보강재·거싯·베이스 강성↑ | `k↑ → fₙ↑` |
| **fₙ 내리기** | 질량 추가 | `m↑ → fₙ↓` |
| **증폭 줄이기** | 감쇠 패드·댐퍼 추가 | `Q = 1/2ζ` |
| **가진 회피** | 운전속도 변경, VFD 스킵밴드, 분리 여유 확보 | r 을 1에서 멀리 |
| **에너지 흡수** | 동흡진기(TMD) | 반공진으로 상쇄 |
| **기초** | 소프트풋 제거·기초 보강·그라우팅 | 지지 강성 회복 |

> [!warning] 국부 공진에 속지 말 것
> 팬 커버·판금·파이프·센서 브래킷 같은 **얇은 국부 구조**도 자체 공진을 갖는다. 여기서
> 잰 진동은 설비 본체가 아니라 그 판의 공진일 수 있다 → 센서는 강성 부위(베어링 하우징)에
> ([[sensor]] 측정 위치 참고).

---

## 참고

- `fₙ = (1/2π)√(k/m)` · 공진 증폭 `Q = 1/(2ζ)` · 위험속도 = 1× ∩ fₙ
- 공진은 **밸런싱·정렬로 안 잡힌다** — 구조(강성·질량·감쇠)를 바꾸거나 운전점을 피한다
- 범프 테스트(정지)·ODS(운전)·런업/코스트다운(캠벨)으로 확인

### 관련 표준

| 표준 | 내용 |
|------|------|
| **API 684** | 회전체 동역학·위험속도·밸런싱 튜토리얼 |
| **API 610 / 617** | 펌프·압축기 위험속도 분리 여유 요구 |
| **ISO 10816 / 20816** | 진동 평가(공진 시 진폭 급증 판정) |
| **ISO 7919 / 20816-2** | 축 진동(위험속도 통과 평가) |

- 관련 노트: [[vibration]] (결함 주파수), [[motor]] (회전수·2×LF), [[fft]] (워터폴·분해능), [[sensor]] (측정 위치·공진 상한)
