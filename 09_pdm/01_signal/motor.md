---
title: 전동기(모터) 진단 — 극수·슬립·전기적 결함
domain: pdm
category: signal
tags: [pdm, signal]
level: intermediate
status: published
created: 2026-07-17
updated: 2026-07-17
velog: false
related: []
---

# 전동기(모터) 진단 — 극수·슬립·전기적 결함

회전기계의 구동원 대부분은 **3상 유도전동기(Induction Motor)**. 진동 진단에서 모터는
두 얼굴을 가진다 — ① 다른 기계처럼 **기계적 결함**(불평형·정렬·베어링)을 겪고,
② 전자기에서 비롯된 **전기적 결함**(회전자바·편심·고정자)을 겪는다. 이 둘을 가르는
출발점이 **극수(pole)** 와 **슬립(slip)**. 기계적 결함 주파수·진동 파라미터는
[[vibration]], 스펙트럼 분해능 설정은 [[fft]], 센서 선정은 [[sensor]] 참고.

## 극수(Pole)와 동기속도

극(pole)은 고정자 권선이 만드는 자극(N–S)이다. **항상 짝수**(N–S가 쌍으로) → 2, 4, 6, 8…
극수가 많을수록 자기장 한 바퀴에 더 많은 극을 거치므로 **회전이 느려진다**.

```
동기속도 Ns [RPM] = 120 × f / P
   f = 라인(전원) 주파수 [Hz],  P = 극수
```

| 극수 | 60 Hz 동기속도 | 50 Hz 동기속도 |
|------|---------------|---------------|
| **2극** | 3,600 RPM | 3,000 RPM |
| **4극** | 1,800 RPM | 1,500 RPM |
| 6극 | 1,200 RPM | 1,000 RPM |
| 8극 | 900 RPM | 750 RPM |

<svg viewBox="0 0 660 232" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:sans-serif"><rect x="0" y="0" width="660" height="232" rx="8" fill="#ffffff" stroke="#e2e8f0"/><text x="20" y="28" font-size="15" font-weight="700" fill="#1e293b">극수별 동기속도 (60 Hz) — Ns = 120·f / P</text><text x="24" y="75" font-size="12.5" fill="#334155" font-weight="700">2극</text><rect x="120" y="58" width="480" height="24" rx="4" fill="#dc2626" opacity="0.88"/><text x="126" y="75" font-size="11" fill="#ffffff" font-weight="700">3,600 RPM</text><text x="24" y="115" font-size="12.5" fill="#334155" font-weight="700">4극</text><rect x="120" y="98" width="240" height="24" rx="4" fill="#2563eb" opacity="0.88"/><text x="126" y="115" font-size="11" fill="#ffffff" font-weight="700">1,800 RPM</text><text x="24" y="155" font-size="12.5" fill="#334155" font-weight="700">6극</text><rect x="120" y="138" width="160" height="24" rx="4" fill="#059669" opacity="0.88"/><text x="126" y="155" font-size="11" fill="#ffffff" font-weight="700">1,200 RPM</text><text x="24" y="195" font-size="12.5" fill="#334155" font-weight="700">8극</text><rect x="120" y="178" width="120" height="24" rx="4" fill="#7c3aed" opacity="0.88"/><text x="126" y="195" font-size="11" fill="#ffffff" font-weight="700">900 RPM</text><text x="20" y="224" font-size="11" fill="#94a3b8">50 Hz는 ×5/6 (2극 3,000 · 4극 1,500 · 6극 1,000 · 8극 750)</text></svg>

같은 출력(kW)이라면 **극수↑ → 속도↓ → 토크↑** (T[N·m] ≈ 9,550 × kW / RPM). 저속 모터가
힘이 센 이유.

## 슬립(Slip) — 유도전동기는 동기속도보다 느리다

유도전동기 회전자는 동기속도보다 **항상 조금 느리게** 돈다. 그래야 회전자 도체가
자속을 "끊어" 유도전류·토크가 생긴다(동기속도로 같이 돌면 상대운동=0 → 토크=0).
이 속도 차가 **슬립**.

```
슬립  s = (Ns − Nr) / Ns          (Nr = 회전자 실제 회전수, 보통 s = 1~3%)
슬립주파수  Fslip = s × f          (회전자 전류의 주파수)
```

- 예) 4극·60 Hz, 실측 **1,770 RPM** → Ns=1,800, s=(1800−1770)/1800 = **1.67 %**
  → 실제 1× = 1,770/60 = **29.5 Hz** (동기 30 Hz가 아님!)
- **부하가 커질수록 슬립↑(속도↓)**, 무부하면 슬립≈0(거의 동기속도).

> [!important] 진단은 "명판 RPM"이 아니라 "실측 회전수"로
> 동기속도(3,600·1,800…)로 1×를 잡으면 슬립만큼 어긋난다. 태코/키페이저([[sensor]])나
> 스펙트럼의 1× 피크로 **실제 회전수**를 먼저 확정하고 결함 주파수를 계산한다.

## 2극 vs 4극 — 실무 차이 한눈에

| 항목 | **2극 (고속)** | **4극 (범용)** |
|------|---------------|---------------|
| 동기속도(60/50 Hz) | 3,600 / 3,000 | 1,800 / 1,500 |
| 실회전(정격 부하) | ~3,450–3,570 | ~1,750–1,785 |
| **1× 주파수** | **~57–59 Hz** | **~29–30 Hz** |
| 토크(동일 출력) | 낮음 | 약 2배 |
| 대표 용도 | 원심펌프·압축기·블로워 등 고속 | 팬·컨베이어·일반 부하(주력) |
| **불평형 민감도** | **매우 큼**(속도²) | 보통 |
| 소음·발열 | 큼 | 보통 |
| 위험속도·오일훨(슬리브) | 우려 큼(고속) | 여유 |
| 베어링 결함 주파수 | 높음 → **fmax↑ 필요** | 낮음 |

## 진단 관점 ① 불평형 민감도 — 원심력 ∝ 회전수²

불평형에 의한 원심력 `F = m·e·ω²` (ω = 2π·RPM/60). 2극은 4극보다 **속도가 2배**
→ ω²이 **4배** → 같은 잔류 불평형이라도 **진동이 약 4배**.

- 그래서 2극 기계는 **밸런싱 등급(ISO 21940, 옛 ISO 1940 G-grade)** 을 더 엄격히,
  정렬·기초 설치도 더 신경 써야 한다.
- 반대로 6·8극 저속 대형기는 1×가 10~20 Hz대라 **변위·저주파 측정**과 적분 드리프트에
  주의(→ [[sensor]] 저주파 적분).

## 진단 관점 ② 전기적 결함 주파수

### 2×라인주파수 (2×LF) — 전기적 결함의 대표 신호

고정자 권선 단락·**상(phase) 불평형**·전자기적 소프트풋·편심 등 많은 전기적 결함은
**라인주파수의 2배**에서 진동한다.

```
2×LF = 2 × f  →  60 Hz 전원 = 120 Hz,   50 Hz 전원 = 100 Hz   (극수와 무관!)
```

자기 흡인력은 극 극성과 무관하게 전원 반주기마다(1주기에 2번) 최대가 되므로 항상 2×LF.
**극수가 바뀌어도 이 값은 안 변한다** — 60 Hz면 언제나 120 Hz.

### 극통과주파수(Pole Pass Frequency, Fp)와 회전자바 손상

```
Fp = 극수 × 슬립주파수 = P × s × f
```

**회전자바(rotor bar) 균열·엔드링 파손** → **1×RPM 주위에 ±Fp 간격의 사이드밴드**.
(1×의 고조파 2×·3× 주위에도 나타남. 사이드밴드가 여러 개·크면 심각.)

- 예) 4극·60 Hz, s=1.67 % → Fp = 4 × 0.0167 × 60 ≈ **4.0 Hz** → 1×(29.5 Hz) 양옆 ±4 Hz.

<svg viewBox="0 0 660 220" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:sans-serif"><rect x="0" y="0" width="660" height="220" rx="8" fill="#ffffff" stroke="#e2e8f0"/><text x="20" y="26" font-size="15" font-weight="700" fill="#1e293b">회전자바 손상 — 1×RPM 주위 ±Fp 사이드밴드</text><line x1="100" y1="175" x2="610" y2="175" stroke="#cbd5e1" stroke-width="1"/><text x="100" y="192" font-size="10" fill="#94a3b8" text-anchor="middle">20</text><text x="225" y="192" font-size="10" fill="#94a3b8" text-anchor="middle">25</text><text x="350" y="192" font-size="10" fill="#94a3b8" text-anchor="middle">30</text><text x="475" y="192" font-size="10" fill="#94a3b8" text-anchor="middle">35</text><text x="600" y="192" font-size="10" fill="#94a3b8" text-anchor="middle">40 Hz</text><line x1="337.5" y1="175" x2="337.5" y2="55" stroke="#dc2626" stroke-width="3"/><text x="337.5" y="49" font-size="10.5" fill="#dc2626" font-weight="700" text-anchor="middle">1×RPM (29.5 Hz)</text><line x1="237.5" y1="175" x2="237.5" y2="105" stroke="#2563eb" stroke-width="2.6"/><line x1="437.5" y1="175" x2="437.5" y2="105" stroke="#2563eb" stroke-width="2.6"/><text x="237.5" y="99" font-size="9.5" fill="#2563eb" font-weight="700" text-anchor="middle">−Fp</text><text x="437.5" y="99" font-size="9.5" fill="#2563eb" font-weight="700" text-anchor="middle">+Fp</text><line x1="137.5" y1="175" x2="137.5" y2="142" stroke="#60a5fa" stroke-width="2.2"/><line x1="537.5" y1="175" x2="537.5" y2="142" stroke="#60a5fa" stroke-width="2.2"/><text x="137.5" y="136" font-size="9" fill="#60a5fa" text-anchor="middle">−2Fp</text><text x="537.5" y="136" font-size="9" fill="#60a5fa" text-anchor="middle">+2Fp</text><text x="20" y="212" font-size="11" fill="#334155">Fp = 극수 × 슬립 × 라인주파수 (예: 4 × 0.0167 × 60 ≈ 4 Hz)</text></svg>

- **회전자바통과주파수(RBPF)** = 회전자바 수 × 회전수[Hz], ±2×LF 사이드밴드 → 편심·회전자 문제.

### 진단 관점 ③ 2극의 함정 — 2×RPM ≈ 2×LF

2극 모터를 60 Hz로 돌리면 실회전 ~3,500 RPM → **2×RPM ≈ 2 × 58 = 116 Hz**.
전기적 **2×LF = 120 Hz**. **둘이 겨우 4 Hz 차이!**

<svg viewBox="0 0 660 262" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:sans-serif"><rect x="0" y="0" width="660" height="262" rx="8" fill="#ffffff" stroke="#e2e8f0"/><text x="20" y="26" font-size="15" font-weight="700" fill="#1e293b">2극 모터의 함정 — 2×회전(116 Hz) ≈ 2×라인(120 Hz)</text><path d="M250,205 Q357,120 460,205" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="6,4"/><text x="357" y="128" font-size="10.5" fill="#94a3b8" text-anchor="middle" font-weight="700">저분해능이면 한 봉우리로 뭉침</text><line x1="60" y1="205" x2="620" y2="205" stroke="#cbd5e1" stroke-width="1"/><text x="80" y="222" font-size="10" fill="#94a3b8" text-anchor="middle">110</text><text x="253.3" y="222" font-size="10" fill="#94a3b8" text-anchor="middle">115</text><text x="426.7" y="222" font-size="10" fill="#94a3b8" text-anchor="middle">120</text><text x="600" y="222" font-size="10" fill="#94a3b8" text-anchor="middle">125 Hz</text><line x1="288.0" y1="205" x2="288.0" y2="95" stroke="#2563eb" stroke-width="3"/><text x="288.0" y="89" font-size="10.5" fill="#2563eb" font-weight="700" text-anchor="middle">116 Hz · 2×RPM (기계·정렬)</text><line x1="426.7" y1="205" x2="426.7" y2="72" stroke="#dc2626" stroke-width="3"/><text x="426.7" y="66" font-size="10.5" fill="#dc2626" font-weight="700" text-anchor="middle">120 Hz · 2×LF (전기)</text><line x1="298" y1="165" x2="417" y2="165" stroke="#334155" stroke-width="1.2"/><polyline points="304,161 296,165 304,169" fill="none" stroke="#334155" stroke-width="1.2"/><polyline points="411,161 419,165 411,169" fill="none" stroke="#334155" stroke-width="1.2"/><text x="357" y="160" font-size="10" fill="#334155" text-anchor="middle">Δ 4 Hz</text><text x="20" y="248" font-size="11" fill="#334155">→ Δf &lt; 1 Hz 고분해능 FFT 또는 전원 차단 테스트로 구분</text></svg>

- 저분해능 FFT면 두 봉우리가 **한 덩어리**로 뭉쳐 "정렬 불량(2×기계)"인지 "전기적
  결함(2×LF)"인지 구분 불가.
- **해결 ①** 고분해능 FFT — `Δf`를 1 Hz 이하로(라인 수↑ 또는 fmax↓, → [[fft]]) → 116·120 분리.
- **해결 ②** 전원 차단 테스트(아래).
- **4극은** 2×RPM ≈ 59 Hz vs 2×LF = 120 Hz로 멀찍이 떨어져 이 혼동이 없다 → **2극 특유의 난제**.

## 전기 vs 기계 판별 — 전원 차단 테스트(coast-down)

운전 중 **전원을 끊고** 진동을 지켜보면 성분의 기원을 즉시 가른다.

| 전원 차단 직후 거동 | 결론 |
|---------------------|------|
| 피크가 **즉시(수십 ms) 사라짐** | **전기적**(자기력 소멸) — 2×LF, 회전자바 등 |
| 회전수 따라 **서서히 감쇠·주파수 하강** | **기계적**(관성으로 계속 회전) — 불평형·정렬·베어링 |

스펙트럼을 연속 캡처하며 실행하면 어떤 라인이 전기 기원인지 명확해진다.

## MCSA — 전류 신호 분석 (Motor Current Signature Analysis)

진동 대신 **전류(current)** 를 FFT. 회전자바 손상 → 라인주파수 주위 **(1 ± 2s)·f** 사이드밴드.

- 예) 60 Hz, s=1.67 % → 2s·f = 2 Hz → **60 ± 2 Hz** 사이드밴드. 사이드밴드 크기(dB)로 손상 정도 추정.
- **장점**: 센서 부착 없이 MCC 패널의 CT로 측정, 회전자 결함에 민감.
- **한계**: 기계적 결함엔 둔감 → 진동 분석과 **상보적**으로 병행.

## 극수 판별법 (명판 RPM)

명판(nameplate) 정격 RPM은 동기속도 **바로 아래** 값 → 여기서 극수를 역산.

| 명판 RPM(60 Hz) | 극수 | 명판 RPM(50 Hz) |
|-----------------|------|-----------------|
| 3,450–3,580 | **2극** | 2,850–2,970 |
| 1,720–1,780 | **4극** | 1,440–1,485 |
| 1,140–1,180 | 6극 | 950–985 |
| 850–880 | 8극 | 705–735 |

## 결함–주파수 정리표

| 결함 | 특징 주파수 | 극수 의존성 | 비고 |
|------|------------|------------|------|
| 불평형 | 1×RPM | 속도가 극수로 결정 | 2극은 진동 크기 민감(속도²) |
| 정렬 불량 | 2×RPM 우세 | 위치가 극수로 결정 | 2극은 2×LF와 혼동 |
| 느슨함 | 0.5×·정수배 하모닉 | 속도가 극수로 결정 | — |
| 베어링 | BPFO/BPFI/BSF/FTF | 속도가 극수로 결정 | 2극은 고주파 → fmax↑ |
| 회전자바 손상 | 1×RPM ± Fp | Fp = P·s·f | 사이드밴드 다수면 심각 |
| 고정자/상 불평형 | 2×LF (100/120 Hz) | **무관**(항상 2×LF) | 전원 차단 시 즉시 소멸 |
| 편심(air-gap) | 2×LF, RBPF ± 2×LF | 무관 / 회전자바 수 | 정적·동적 편심 |

---

## 참고

- `Ns = 120·f/P` · `s = (Ns−Nr)/Ns` · `Fp = P·s·f` · `2×LF`는 극수 무관 상수(60 Hz→120, 50 Hz→100)
- 2극은 고속 → 불평형·위험속도·고주파 결함에 취약, 4극은 범용 주력
- **명판 RPM으로 극수**, **실측 회전수로 1×**를 잡는다

### 관련 표준

| 표준 | 내용 |
|------|------|
| **ISO 10816 / 20816** | 진동 평가 기준(속도 RMS) |
| **ISO 21940** (옛 ISO 1940) | 회전체 밸런싱 품질 등급(G-grade) |
| **IEC 60034** | 회전 전기기기(유도전동기) 규격 |
| **ISO 13373** | 상태 감시·진단 지침 |

- 관련 노트: [[vibration]] (결함 주파수·진동 파라미터), [[fft]] (분해능·2×LF 분리), [[sensor]] (센서·회전 기준 신호)
