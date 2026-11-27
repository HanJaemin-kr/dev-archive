---
title: 진동 기초
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

# 진동 기초

## 진동이란

기계 설비에서 발생하는 주기적 또는 불규칙적 운동.  
정상 설비도 진동을 가지며, **패턴의 변화**가 이상 징후를 나타낸다.

## 핵심 파라미터

| 파라미터 | 단위 | 설명 |
|----------|------|------|
| **변위 (Displacement)** | µm, mm | 얼마나 움직이는가 (저주파 적합) |
| **속도 (Velocity)** | mm/s | 얼마나 빠르게 움직이는가 (중주파 적합) |
| **가속도 (Acceleration)** | m/s², g | 얼마나 급격히 변하는가 (고주파 적합) |

```
변위 → 속도 → 가속도
  적분 ←    미분 →

낮은 주파수 (10Hz 이하)  → 변위 측정
중간 주파수 (10~1000Hz) → 속도 측정
높은 주파수 (1kHz 이상)  → 가속도 측정
```

## 주요 측정값

| 측정값 | 설명 | 용도 |
|--------|------|------|
| **Peak** | 최댓값 | 충격성 이상 감지 |
| **Peak-to-Peak** | 최대 ~ 최소 | 변위 측정 |
| **RMS** (Root Mean Square) | 실효값, 에너지 대표값 | 임계값 기반 알람 |
| **Crest Factor** | Peak / RMS | 충격 정도 (높을수록 충격성 이상) |
| **Kurtosis** | 첨도 | 초기 결함 감지에 민감 |

```python
import numpy as np

signal = np.array([...])  # 진동 시계열

rms = np.sqrt(np.mean(signal**2))
peak = np.max(np.abs(signal))
crest_factor = peak / rms
kurtosis = np.mean((signal - signal.mean())**4) / signal.std()**4
```

<svg viewBox="0 0 660 300" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:sans-serif"><rect x="0" y="0" width="660" height="300" rx="8" fill="#ffffff" stroke="#e2e8f0"/><text x="20" y="26" font-size="15" font-weight="700" fill="#1e293b">진동 측정값: Peak · P2P · RMS · Crest Factor</text><line x1="45" y1="150" x2="555" y2="150" stroke="#e2e8f0" stroke-width="1"/><line x1="45" y1="45.0" x2="555" y2="45.0" stroke="#dc2626" stroke-width="1.2" stroke-dasharray="6,3"/><line x1="45" y1="255.0" x2="555" y2="255.0" stroke="#dc2626" stroke-width="1.2" stroke-dasharray="6,3"/><line x1="45" y1="76.4" x2="555" y2="76.4" stroke="#059669" stroke-width="1.2" stroke-dasharray="4,3"/><line x1="45" y1="223.6" x2="555" y2="223.6" stroke="#059669" stroke-width="1.2" stroke-dasharray="4,3"/><polyline points="45.0,133.5 47.0,124.5 48.9,115.9 50.9,108.0 52.9,100.6 54.8,93.9 56.8,87.9 58.8,82.8 60.8,78.4 62.7,74.9 64.7,72.1 66.7,70.2 68.6,69.0 70.6,68.4 72.6,68.6 74.5,69.2 76.5,70.4 78.5,71.9 80.4,73.8 82.4,75.8 84.4,77.9 86.4,80.0 88.3,82.1 90.3,83.9 92.3,85.5 94.2,86.7 96.2,87.6 98.2,88.0 100.1,87.9 102.1,87.3 104.1,86.2 106.0,84.7 108.0,82.6 110.0,80.2 111.9,77.4 113.9,74.2 115.9,70.9 117.9,67.3 119.8,63.8 121.8,60.2 123.8,56.8 125.7,53.7 127.7,50.9 129.7,48.5 131.6,46.7 133.6,45.5 135.6,45.0 137.5,45.3 139.5,46.3 141.5,48.2 143.5,51.0 145.4,54.7 147.4,59.2 149.4,64.6 151.3,70.8 153.3,77.7 155.3,85.4 157.2,93.6 159.2,102.3 161.2,111.5 163.1,120.9 165.1,130.6 167.1,140.3 169.1,150.0 171.0,159.5 173.0,168.8 175.0,177.7 176.9,186.1 178.9,194.0 180.9,201.2 182.8,207.7 184.8,213.4 186.8,218.4 188.7,222.5 190.7,225.9 192.7,228.4 194.7,230.2 196.6,231.2 198.6,231.6 200.6,231.3 202.5,230.5 204.5,229.2 206.5,227.6 208.4,225.7 210.4,223.7 212.4,221.5 214.3,219.4 216.3,217.5 218.3,215.7 220.3,214.2 222.2,213.0 224.2,212.3 226.2,212.0 228.1,212.2 230.1,212.9 232.1,214.1 234.0,215.8 236.0,217.9 238.0,220.5 239.9,223.4 241.9,226.6 243.9,230.0 245.8,233.6 247.8,237.1 249.8,240.6 251.8,244.0 253.7,247.0 255.7,249.7 257.7,252.0 259.6,253.6 261.6,254.7 263.6,255.0 265.5,254.5 267.5,253.3 269.5,251.1 271.4,248.1 273.4,244.3 275.4,239.5 277.4,233.9 279.3,227.5 281.3,220.4 283.3,212.6 285.2,204.3 287.2,195.4 289.2,186.2 291.1,176.7 293.1,167.0 295.1,157.2 297.0,147.6 299.0,138.1 301.0,128.9 303.0,120.2 304.9,111.9 306.9,104.2 308.9,97.1 310.8,90.8 312.8,85.3 314.8,80.5 316.7,76.5 318.7,73.4 320.7,71.1 322.6,69.5 324.6,68.6 326.6,68.4 328.6,68.8 330.5,69.8 332.5,71.1 334.5,72.8 336.4,74.8 338.4,76.9 340.4,79.0 342.3,81.1 344.3,83.0 346.3,84.7 348.2,86.1 350.2,87.2 352.2,87.8 354.2,88.0 356.1,87.7 358.1,86.8 360.1,85.5 362.0,83.7 364.0,81.5 366.0,78.8 367.9,75.8 369.9,72.6 371.9,69.1 373.8,65.6 375.8,62.0 377.8,58.5 379.7,55.2 381.7,52.2 383.7,49.7 385.7,47.6 387.6,46.0 389.6,45.2 391.6,45.0 393.5,45.7 395.5,47.2 397.5,49.5 399.4,52.7 401.4,56.8 403.4,61.8 405.3,67.6 407.3,74.2 409.3,81.5 411.3,89.4 413.2,97.9 415.2,106.9 417.2,116.2 419.1,125.8 421.1,135.5 423.1,145.2 425.0,154.8 427.0,164.2 429.0,173.3 430.9,182.0 432.9,190.1 434.9,197.6 436.9,204.5 438.8,210.6 440.8,216.0 442.8,220.6 444.7,224.3 446.7,227.3 448.7,229.4 450.6,230.8 452.6,231.5 454.6,231.5 456.5,231.0 458.5,229.9 460.5,228.5 462.5,226.7 464.4,224.7 466.4,222.6 468.4,220.5 470.3,218.4 472.3,216.5 474.3,214.9 476.2,213.6 478.2,212.6 480.2,212.1 482.1,212.1 484.1,212.5 486.1,213.4 488.1,214.9 490.0,216.8 492.0,219.2 494.0,221.9 495.9,225.0 497.9,228.3 499.9,231.8 501.8,235.3 503.8,238.9 505.8,242.3 507.7,245.5 509.7,248.4 511.7,250.9 513.6,252.9 515.6,254.2 517.6,254.9 519.6,254.9 521.5,254.0 523.5,252.3 525.5,249.8 527.4,246.3 529.4,242.0 531.4,236.8 533.3,230.8 535.3,224.1 537.3,216.6 539.2,208.5 541.2,199.9 543.2,190.8 545.2,181.4 547.1,171.8 549.1,162.1 551.1,152.4 553.0,142.8 555.0,133.5" fill="none" stroke="#2563eb" stroke-width="2"/><line x1="573.0" y1="45.0" x2="573.0" y2="255.0" stroke="#7c3aed" stroke-width="1.5"/><line x1="569.0" y1="45.0" x2="577.0" y2="45.0" stroke="#7c3aed" stroke-width="1.5"/><line x1="569.0" y1="255.0" x2="577.0" y2="255.0" stroke="#7c3aed" stroke-width="1.5"/><text x="587.0" y="118.0" font-size="11.5" fill="#7c3aed" font-weight="700" transform="rotate(90 587.0 150.0)">Peak-to-Peak</text><text x="51" y="39.0" font-size="11.5" fill="#dc2626" font-weight="700">Peak</text><text x="51" y="71.4" font-size="11.5" fill="#059669" font-weight="700">RMS</text><text x="20" y="288" font-size="12" fill="#334155">Crest Factor = Peak / RMS = 1.43  (정현파 ≈ 1.41 · 충격성일수록 ↑)</text></svg>

## 가속도 센서 (Accelerometer)

> 📎 센서 종류·설치·배선·자가진단 등 상세는 [[sensor]] 참고.

### 종류

| 종류 | 특징 |
|------|------|
| **IEPE / ICP** | 내장 증폭기, 장거리 신호 전송에 강함. 산업용 표준 |
| **MEMS** | 소형·저가, IoT 엣지 디바이스에 적합 (MPU-6050 등) |
| **압전형 (Piezoelectric)** | 고주파 특화, 충격 측정에 강함 |

### 설치 방법 (마운팅)

| 방법 | 주파수 한계 | 특징 |
|------|------------|------|
| 스터드 볼트 | ~10kHz | 가장 정확, 최우선 |
| 접착제 | ~6kHz | 영구 설치 |
| 자석 | ~3kHz | 탈착 간편, 임시 측정 |
| 프로브 (손) | ~1kHz | 부정확, 권장 안 함 |

## 주요 결함과 진동 특성

> 📎 모터(전동기) 극수·슬립·전기적 결함(2×LF·회전자바·2극의 함정)은 [[motor]] 참고.
> 📎 결함이 없는데 진동이 큰 경우(공진·위험속도·고유진동수)는 [[resonance]] 참고.

| 결함 | 특징 주파수 | 증상 |
|------|------------|------|
| **불평형 (Unbalance)** | 1× RPM | 회전 방향 진동 |
| **정렬 불량 (Misalignment)** | 2× RPM 우세 | 축 방향 진동도 큼 |
| **느슨함 (Looseness)** | 0.5×, 1×, 2×, ... 고조파 | 스펙트럼 복잡 |
| **베어링 결함** | BPFI / BPFO / BSF / FTF | 고주파 대역 충격 |
| **기어 결함** | GMF (Gear Mesh Frequency) | 기어 맞물림 주파수 |

<svg viewBox="0 0 660 380" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:sans-serif"><rect x="0" y="0" width="660" height="380" rx="8" fill="#ffffff" stroke="#e2e8f0"/><text x="20" y="26" font-size="15" font-weight="700" fill="#1e293b">결함별 특징 스펙트럼 (회전 주파수 배수 = 차수)</text><text x="45" y="70" font-size="12.5" font-weight="700" fill="#1e293b">불평형 (Unbalance)</text><line x1="45" y1="185" x2="295" y2="185" stroke="#cbd5e1" stroke-width="1"/><text x="83.5" y="198" font-size="9" fill="#b6c2cf" text-anchor="middle">1x</text><text x="121.9" y="198" font-size="9" fill="#b6c2cf" text-anchor="middle">2x</text><text x="160.4" y="198" font-size="9" fill="#b6c2cf" text-anchor="middle">3x</text><text x="198.8" y="198" font-size="9" fill="#b6c2cf" text-anchor="middle">4x</text><text x="237.3" y="198" font-size="9" fill="#b6c2cf" text-anchor="middle">5x</text><text x="275.8" y="198" font-size="9" fill="#b6c2cf" text-anchor="middle">6x</text><line x1="83.5" y1="185" x2="83.5" y2="85.2" stroke="#dc2626" stroke-width="2.6"/><text x="375" y="70" font-size="12.5" font-weight="700" fill="#1e293b">정렬 불량 (Misalignment)</text><line x1="375" y1="185" x2="625" y2="185" stroke="#cbd5e1" stroke-width="1"/><text x="413.5" y="198" font-size="9" fill="#b6c2cf" text-anchor="middle">1x</text><text x="451.9" y="198" font-size="9" fill="#b6c2cf" text-anchor="middle">2x</text><text x="490.4" y="198" font-size="9" fill="#b6c2cf" text-anchor="middle">3x</text><text x="528.8" y="198" font-size="9" fill="#b6c2cf" text-anchor="middle">4x</text><text x="567.3" y="198" font-size="9" fill="#b6c2cf" text-anchor="middle">5x</text><text x="605.8" y="198" font-size="9" fill="#b6c2cf" text-anchor="middle">6x</text><line x1="413.5" y1="185" x2="413.5" y2="137.8" stroke="#2563eb" stroke-width="2.6"/><line x1="451.9" y1="185" x2="451.9" y2="85.2" stroke="#dc2626" stroke-width="2.6"/><line x1="490.4" y1="185" x2="490.4" y2="148.2" stroke="#2563eb" stroke-width="2.6"/><text x="45" y="240" font-size="12.5" font-weight="700" fill="#1e293b">느슨함 (Looseness)</text><line x1="45" y1="355" x2="295" y2="355" stroke="#cbd5e1" stroke-width="1"/><text x="83.5" y="368" font-size="9" fill="#b6c2cf" text-anchor="middle">1x</text><text x="121.9" y="368" font-size="9" fill="#b6c2cf" text-anchor="middle">2x</text><text x="160.4" y="368" font-size="9" fill="#b6c2cf" text-anchor="middle">3x</text><text x="198.8" y="368" font-size="9" fill="#b6c2cf" text-anchor="middle">4x</text><text x="237.3" y="368" font-size="9" fill="#b6c2cf" text-anchor="middle">5x</text><text x="275.8" y="368" font-size="9" fill="#b6c2cf" text-anchor="middle">6x</text><line x1="64.2" y1="355" x2="64.2" y2="323.5" stroke="#2563eb" stroke-width="2.6"/><line x1="83.5" y1="355" x2="83.5" y2="281.5" stroke="#dc2626" stroke-width="2.6"/><line x1="102.7" y1="355" x2="102.7" y2="307.8" stroke="#2563eb" stroke-width="2.6"/><line x1="121.9" y1="355" x2="121.9" y2="292.0" stroke="#2563eb" stroke-width="2.6"/><line x1="141.2" y1="355" x2="141.2" y2="313.0" stroke="#2563eb" stroke-width="2.6"/><line x1="160.4" y1="355" x2="160.4" y2="297.2" stroke="#2563eb" stroke-width="2.6"/><line x1="179.6" y1="355" x2="179.6" y2="321.4" stroke="#2563eb" stroke-width="2.6"/><line x1="198.8" y1="355" x2="198.8" y2="307.8" stroke="#2563eb" stroke-width="2.6"/><line x1="218.1" y1="355" x2="218.1" y2="327.7" stroke="#2563eb" stroke-width="2.6"/><line x1="237.3" y1="355" x2="237.3" y2="319.3" stroke="#2563eb" stroke-width="2.6"/><text x="47" y="226" font-size="9.5" fill="#94a3b8">0.5x·정수배 다수 하모닉</text><text x="375" y="240" font-size="12.5" font-weight="700" fill="#1e293b">베어링 결함 (Bearing)</text><line x1="375" y1="355" x2="625" y2="355" stroke="#cbd5e1" stroke-width="1"/><text x="413.5" y="368" font-size="9" fill="#b6c2cf" text-anchor="middle">1x</text><text x="451.9" y="368" font-size="9" fill="#b6c2cf" text-anchor="middle">2x</text><text x="490.4" y="368" font-size="9" fill="#b6c2cf" text-anchor="middle">3x</text><text x="528.8" y="368" font-size="9" fill="#b6c2cf" text-anchor="middle">4x</text><text x="567.3" y="368" font-size="9" fill="#b6c2cf" text-anchor="middle">5x</text><text x="605.8" y="368" font-size="9" fill="#b6c2cf" text-anchor="middle">6x</text><line x1="413.5" y1="355" x2="413.5" y2="336.1" stroke="#2563eb" stroke-width="2.6"/><line x1="505.8" y1="355" x2="505.8" y2="325.6" stroke="#dc2626" stroke-width="2.6"/><line x1="514.2" y1="355" x2="514.2" y2="297.2" stroke="#dc2626" stroke-width="2.6"/><line x1="522.7" y1="355" x2="522.7" y2="268.9" stroke="#dc2626" stroke-width="2.6"/><line x1="531.2" y1="355" x2="531.2" y2="297.2" stroke="#dc2626" stroke-width="2.6"/><line x1="539.6" y1="355" x2="539.6" y2="323.5" stroke="#dc2626" stroke-width="2.6"/><text x="377" y="226" font-size="9.5" fill="#94a3b8">비동기 고주파 + 사이드밴드</text></svg>

### 베어링 결함 주파수 계산

```
N: 볼 수, RPM: 회전수, α: 접촉각, d: 볼 직경, D: 피치 직경

BPFO (외륜) = N/2 × RPM/60 × (1 - d/D × cosα)
BPFI (내륜) = N/2 × RPM/60 × (1 + d/D × cosα)
BSF  (볼)   = D/(2d) × RPM/60 × (1 - (d/D × cosα)²)
FTF  (케이지)= 1/2 × RPM/60 × (1 - d/D × cosα)
```

## ISO 10816 진동 기준 (속도 RMS, mm/s)

| 등급 | 기계 크기 | Good | Acceptable | Unsatisfactory | Unacceptable |
|------|---------|------|------------|----------------|--------------|
| I | 소형 (<15kW) | <0.28 | <1.12 | <2.8 | ≥2.8 |
| II | 중형 (15~75kW) | <1.12 | <2.8 | <7.1 | ≥7.1 |
| III | 대형 강성 기초 | <1.8 | <4.5 | <11.2 | ≥11.2 |
| IV | 대형 유연 기초 | <2.8 | <7.1 | <18 | ≥18 |
