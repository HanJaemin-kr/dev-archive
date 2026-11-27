---
title: 진동 센서 (Vibration Sensors)
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

# 진동 센서 (Vibration Sensors)

설비 진동을 전기 신호로 바꾸는 센서들. **무엇을(변위/속도/가속도)**, **어떤 원리로**,
**어느 주파수 대역에서** 측정하느냐가 선정의 핵심. 진동 파라미터 자체는 [[vibration]],
측정 후 FFT 설정은 [[fft]] 참고.

## 측정 물리량 3계열

같은 진동도 무엇으로 재느냐에 따라 강조되는 주파수 대역이 다르다.

| 물리량 | 단위 | 강점 대역 | 대표 센서 |
|--------|------|----------|-----------|
| **변위 (Displacement)** | µm | 저주파 (~10 Hz) | 와전류식 변위계 |
| **속도 (Velocity)** | mm/s | 중주파 (10~1,000 Hz) | 동전기식 속도계 |
| **가속도 (Acceleration)** | g, m/s² | 고주파 (1 kHz~) | 압전 / MEMS 가속도계 |

```
변위 ──미분──► 속도 ──미분──► 가속도
     ◄──적분──      ◄──적분──
(가속도계로 재서 적분하면 속도·변위도 얻지만, 저주파에서 적분 오차 누적 주의)
```

## 주파수 응답 범위

<svg viewBox="0 0 660 242" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:sans-serif"><rect x="0" y="0" width="660" height="242" rx="8" fill="#ffffff" stroke="#e2e8f0"/><text x="20" y="28" font-size="15" font-weight="700" fill="#1e293b">센서별 주파수 응답 범위</text><line x1="150.0" y1="45" x2="150.0" y2="217" stroke="#eef2f6" stroke-width="1"/><text x="150.0" y="232" font-size="11" fill="#94a3b8" text-anchor="middle">0.1</text><line x1="240.5" y1="45" x2="240.5" y2="217" stroke="#eef2f6" stroke-width="1"/><text x="240.5" y="232" font-size="11" fill="#94a3b8" text-anchor="middle">1</text><line x1="331.1" y1="45" x2="331.1" y2="217" stroke="#eef2f6" stroke-width="1"/><text x="331.1" y="232" font-size="11" fill="#94a3b8" text-anchor="middle">10</text><line x1="421.6" y1="45" x2="421.6" y2="217" stroke="#eef2f6" stroke-width="1"/><text x="421.6" y="232" font-size="11" fill="#94a3b8" text-anchor="middle">100</text><line x1="512.2" y1="45" x2="512.2" y2="217" stroke="#eef2f6" stroke-width="1"/><text x="512.2" y="232" font-size="11" fill="#94a3b8" text-anchor="middle">1k</text><line x1="602.7" y1="45" x2="602.7" y2="217" stroke="#eef2f6" stroke-width="1"/><text x="602.7" y="232" font-size="11" fill="#94a3b8" text-anchor="middle">10k</text><text x="20" y="76" font-size="12.5" fill="#334155">변위계 (와전류)</text><rect x="150.0" y="60" width="362.2" height="20" rx="4" fill="#0891b2" opacity="0.85"/><text x="156.0" y="74" font-size="10.5" fill="#ffffff" font-weight="700">DC ~ 1k Hz</text><text x="20" y="114" font-size="12.5" fill="#334155">속도계 (동전기)</text><rect x="331.1" y="98" width="197.0" height="20" rx="4" fill="#059669" opacity="0.85"/><text x="337.1" y="112" font-size="10.5" fill="#ffffff" font-weight="700">10 ~ 1k Hz</text><text x="20" y="152" font-size="12.5" fill="#334155">MEMS 가속도계</text><rect x="177.3" y="136" width="398.2" height="20" rx="4" fill="#7c3aed" opacity="0.85"/><text x="183.3" y="150" font-size="10.5" fill="#ffffff" font-weight="700">DC ~ 5k Hz</text><text x="20" y="190" font-size="12.5" fill="#334155">압전 가속도계</text><rect x="240.5" y="174" width="362.2" height="20" rx="4" fill="#dc2626" opacity="0.85"/><text x="246.5" y="188" font-size="10.5" fill="#ffffff" font-weight="700">1 ~ 10k Hz</text></svg>

## 센서 종류별 상세

### 압전식 가속도계 (Piezoelectric, PE)

압전 결정(수정·PZT)이 힘을 받으면 표면에 **전하**가 발생하는 원리.

<svg viewBox="0 0 660 290" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:sans-serif"><rect x="0" y="0" width="660" height="290" rx="8" fill="#ffffff" stroke="#e2e8f0"/><text x="20" y="26" font-size="15" font-weight="700" fill="#1e293b">압전식 가속도계 구조 (압축형)</text><rect x="110" y="240" width="235" height="8" fill="#e2e8f0"/><line x1="120" y1="256" x2="134" y2="244" stroke="#cbd5e1" stroke-width="1.5"/><line x1="150" y1="256" x2="164" y2="244" stroke="#cbd5e1" stroke-width="1.5"/><line x1="180" y1="256" x2="194" y2="244" stroke="#cbd5e1" stroke-width="1.5"/><line x1="210" y1="256" x2="224" y2="244" stroke="#cbd5e1" stroke-width="1.5"/><line x1="240" y1="256" x2="254" y2="244" stroke="#cbd5e1" stroke-width="1.5"/><line x1="270" y1="256" x2="284" y2="244" stroke="#cbd5e1" stroke-width="1.5"/><line x1="300" y1="256" x2="314" y2="244" stroke="#cbd5e1" stroke-width="1.5"/><rect x="150" y="95" width="150" height="150" rx="10" fill="#f8fafc" stroke="#64748b" stroke-width="1.5"/><rect x="163" y="214" width="124" height="24" fill="#cbd5e1" stroke="#94a3b8"/><rect x="163" y="178" width="124" height="32" fill="#f59e0b" opacity="0.9"/><rect x="177" y="115" width="96" height="58" rx="3" fill="#475569"/><line x1="225" y1="105" x2="225" y2="173" stroke="#94a3b8" stroke-width="2"/><circle cx="225" cy="104" r="5" fill="#94a3b8"/><text x="225" y="149" font-size="12" fill="#ffffff" font-weight="700" text-anchor="middle">질량 M</text><text x="225" y="199" font-size="11" fill="#7c2d12" font-weight="700" text-anchor="middle">압전 소자</text><text x="225" y="230" font-size="10.5" fill="#475569" text-anchor="middle">베이스</text><line x1="128" y1="150" x2="128" y2="235" stroke="#0891b2" stroke-width="2"/><polyline points="123,158 128,148 133,158" fill="none" stroke="#0891b2" stroke-width="2"/><polyline points="123,227 128,237 133,227" fill="none" stroke="#0891b2" stroke-width="2"/><text x="96" y="188" font-size="11" fill="#0891b2">진동</text><text x="96" y="202" font-size="11" fill="#0891b2">입력</text><line x1="289" y1="194" x2="340" y2="194" stroke="#dc2626" stroke-width="2"/><polyline points="333,189 343,194 333,199" fill="none" stroke="#dc2626" stroke-width="2"/><text x="346" y="198" font-size="10.5" fill="#dc2626" font-weight="700">전하 출력</text><rect x="400" y="104" width="14" height="14" rx="2" fill="#475569"/><text x="422" y="115" font-size="12" fill="#334155">시스믹 질량 (M)</text><rect x="400" y="134" width="14" height="14" rx="2" fill="#f59e0b"/><text x="422" y="145" font-size="12" fill="#334155">압전 소자 (PZT·수정)</text><rect x="400" y="164" width="14" height="14" rx="2" fill="#cbd5e1"/><text x="422" y="175" font-size="12" fill="#334155">베이스 (설비 부착면)</text><text x="20" y="278" font-size="11" fill="#334155">가속도 a → 질량 관성력 F = M·a → 압전소자 압축 → 전하 q ∝ a</text></svg>

- **광대역·고주파**에 강하고 견고 → 산업 진동 측정의 주력
- **DC 측정 불가** (AC 성분만) → 정적 기울기·영점은 못 잼
- 출력 방식 2가지:
  - **Charge output (전하형)** — 전하 그대로 출력. 고온 환경(엔진·터빈) 가능하나
    저잡음 케이블 + 외부 전하증폭기 필요
  - **IEPE / ICP (전압형)** — 아래 항목

### IEPE / ICP (내장 증폭 압전)

압전 소자 + **내장 전하증폭기**를 한 몸으로 만든 것. 산업 표준.

- 저임피던스 **전압 출력** → 일반 동축 케이블로 **장거리 전송에 강함**
- **2선식 정전류 구동**(보통 2~20 mA, 24 V) — 신호와 전원을 한 선으로
- 단점: 내장 IC 때문에 **고온 한계**(~120 ℃), 넓은 다이내믹레인지엔 charge형이 유리
- ※ ICP는 PCB사 상표, IEPE가 일반 명칭 (동의어로 통용)

### MEMS 가속도계

실리콘 미세 구조의 **정전용량 변화**로 가속도 측정 (MPU-6050, ADXL 계열 등).

- **DC 응답 가능** → 기울기·저주파 OK
- 초소형·초저가·저전력 → **IoT 엣지·다점 상시감시**에 적합
- 한계: 압전 대비 **고주파·노이즈·다이내믹레인지** 열세 (초기 결함의 고주파 충격엔 불리)

### 압저항식 (Piezoresistive)

변형에 따라 저항이 변하는 스트레인게이지 원리.

- **DC~저주파 응답**, 높은 충격(수천 g)에 강함 → 충격·크래시·발파 계측
- 감도가 낮고 온도 보상 필요

### 동전기식 속도계 (Velocity, Moving Coil)

자석-코일의 상대 운동으로 **속도에 비례하는 전압**을 자체 발생.

- **전원 불필요**(자가발전), 노이즈에 강함
- 중주파(10~1,500 Hz)에 적합, **저주파 한계**(내부 스프링 공진 ~10 Hz)
- 최근에는 압전 가속도계 + 적분으로 대체되는 추세

### 와전류식 변위계 (Eddy-current Proximity Probe)

프로브 코일의 고주파 자기장이 도체 표면에 만드는 **와전류로 간극(gap) 측정**. 비접촉.

- **DC~저주파**, 축과 베어링의 **상대 변위** 직접 측정
- **저널/슬리브 베어링**(터빈·대형 발전기)의 축 진동·편심 감시 표준
- 접촉하지 않아 마모 없음, 단 타깃 재질·설치 간극에 민감

## 가속도 → 속도·변위 적분 시 주의

가속도계 하나로 **속도·변위까지** 얻을 수 있다(적분). ISO 10816 판정은 속도(mm/s)라
실무에서 가속도→속도 적분이 흔하다. 단, 적분은 저주파에서 위험하다.

```
시간영역:  가속도 a(t) ──∫──► 속도 v(t) ──∫──► 변위 d(t)
주파수영역: V(f) = A(f) / (j2πf) ,   D(f) = A(f) / (j2πf)²
           → f 가 작을수록 이득 폭증 → 저주파 노이즈·DC 오프셋이 증폭됨
```

> [!warning] 저주파 적분 드리프트
> 작은 DC 오프셋이나 저주파 잡음도 적분하면 시간이 갈수록 커지는 **드리프트(ramp)**로
> 변한다. 이중 적분(변위)은 `1/f²` 이라 더 심각. 그대로 적분하면 파형이 휘어져 버린다.

- **대책 1 — 고역통과 필터(HPF)**: 적분 전/후로 저주파(예: 2~10 Hz 이하)를 차단.
- **대책 2 — 주파수영역 적분(omega arithmetic)**: 시간영역 누적보다 안정적.
- **대책 3 — 저주파가 관심이면** 처음부터 속도계·변위계를 쓴다(적분 회피).

```python
# 주파수영역 적분: 가속도 스펙트럼 → 속도 스펙트럼 (저주파 안정적)
w = 2 * np.pi * freq
w[0] = np.inf                    # DC(0 Hz) 나눗셈 방지 → 성분 0 처리
vel_spec = accel_spec / w        # 1회 적분(속도). 변위는 / w**2
```

## 센서 사양 읽는 법

| 사양 | 의미 | 실무 감각 |
|------|------|----------|
| **감도 (Sensitivity)** | 진동 → 출력 비율 (mV/g) | 100 mV/g 표준 · 저진동엔 500 mV/g · 고진동/충격엔 10 mV/g |
| **주파수 응답** | 평탄 구간 (±3 dB 또는 ±10%) | 이 범위 밖은 진폭 오차 커짐 |
| **측정 범위** | 최대 측정 가속도 (±g) | 초과 시 클리핑 |
| **공진 주파수** | 센서 자체 공진점 | **사용 상한 ≤ 공진의 1/3** (그 위는 부풀려짐) |
| **온도 범위** | 동작 보장 온도 | IEPE ~120 ℃ / charge형은 더 높음 |

> [!warning] 공진 주파수 함정
> 카탈로그의 "측정 상한"은 종종 공진 근처까지 표기돼 있다. 공진 부근에서는 진폭이
> 크게 부풀려지므로, **실사용 상한은 공진 주파수의 약 1/3 이하**로 잡아야 안전하다.
> (예: 공진 30 kHz 센서 → 실사용 ~10 kHz)

## 감도(Sensitivity) 심화 — 10 / 100 / 500 mV/g

감도는 **진동을 전압으로 바꾸는 환산 비율**(mV/g)이고 센서마다 고정돼 있다.
값이 클수록 "예민"하지만 무조건 좋은 게 아니라 **측정 범위·노이즈와 맞바꾸는** 선택이다.

### 핵심 트레이드오프 — 감도 ↔ 측정 범위

IEPE 센서 출력은 바이어스 전압 위에서 대략 **±5 V(AC 스윙)** 안에서만 흔들린다.
이 스윙이 고정돼 있으니, 감도가 높으면 **작은 진동에서 전압을 다 써버려** 큰 진동은
잘려(clipping) 버린다.

```
클리핑 없는 최대 측정 가속도 ≈ 출력 스윙(≈5,000 mV) / 감도(mV/g)

  500 mV/g →  ±10 g    (미세 진동 정밀, 큰 충격엔 포화)
  100 mV/g →  ±50 g    (표준 · 균형)
   10 mV/g →  ±500 g   (충격·고진동 여유, 미세 신호는 묻힘)
```

<svg viewBox="0 0 660 232" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:sans-serif"><rect x="0" y="0" width="660" height="232" rx="8" fill="#ffffff" stroke="#e2e8f0"/><text x="20" y="28" font-size="15" font-weight="700" fill="#1e293b">감도별 측정 범위(다이내믹 윈도우) — 같은 폭, 다른 위치</text><line x1="150.0" y1="46" x2="150.0" y2="200" stroke="#eef2f6" stroke-width="1"/><text x="150.0" y="215" font-size="11" fill="#94a3b8" text-anchor="middle">0.001 g</text><line x1="226.7" y1="46" x2="226.7" y2="200" stroke="#eef2f6" stroke-width="1"/><text x="226.7" y="215" font-size="11" fill="#94a3b8" text-anchor="middle">0.01</text><line x1="303.3" y1="46" x2="303.3" y2="200" stroke="#eef2f6" stroke-width="1"/><text x="303.3" y="215" font-size="11" fill="#94a3b8" text-anchor="middle">0.1</text><line x1="380.0" y1="46" x2="380.0" y2="200" stroke="#eef2f6" stroke-width="1"/><text x="380.0" y="215" font-size="11" fill="#94a3b8" text-anchor="middle">1 g</text><line x1="456.7" y1="46" x2="456.7" y2="200" stroke="#eef2f6" stroke-width="1"/><text x="456.7" y="215" font-size="11" fill="#94a3b8" text-anchor="middle">10</text><line x1="533.3" y1="46" x2="533.3" y2="200" stroke="#eef2f6" stroke-width="1"/><text x="533.3" y="215" font-size="11" fill="#94a3b8" text-anchor="middle">100</text><line x1="610.0" y1="46" x2="610.0" y2="200" stroke="#eef2f6" stroke-width="1"/><text x="610.0" y="215" font-size="11" fill="#94a3b8" text-anchor="middle">1000 g</text><text x="20" y="78" font-size="12" fill="#334155">500 mV/g</text><rect x="150.0" y="62" width="306.7" height="24" rx="4" fill="#7c3aed" opacity="0.85"/><text x="156.0" y="78" font-size="10.5" fill="#ffffff" font-weight="700">노이즈 낮음 · ~±10 g</text><text x="20" y="118" font-size="12" fill="#334155">100 mV/g</text><rect x="203.6" y="102" width="306.7" height="24" rx="4" fill="#059669" opacity="0.85"/><text x="209.6" y="118" font-size="10.5" fill="#ffffff" font-weight="700">표준 · 균형 · ~±50 g</text><text x="20" y="158" font-size="12" fill="#334155">10 mV/g</text><rect x="280.3" y="142" width="306.7" height="24" rx="4" fill="#f59e0b" opacity="0.9"/><text x="286.3" y="158" font-size="10.5" fill="#ffffff" font-weight="700">충격 여유 · ~±500 g</text><text x="20" y="228" font-size="11" fill="#334155">셋 다 다이내믹레인지(≈4 decade)는 비슷 — 감도가 낮을수록 윈도우가 오른쪽(고진동)으로 이동</text></svg>

### 감도별 비교

| 감도 | 측정 범위(대략) | 노이즈 바닥 | 강점 | 적합 대상 |
|------|----------------|------------|------|-----------|
| **500 mV/g** | 좁음 (~±10 g) | 가장 낮음(µg급) | 미세 진동·초기 결함 분해능 | 저속·저진동 정밀 진단, 구조물 |
| **100 mV/g** | 중간 (~±50 g) | 보통 | 범용 균형 | 일반 회전기계 상시 감시(표준) |
| **10 mV/g** | 넓음 (~±500 g) | 높음 | 큰 충격에도 안 포화 | 프레스·발파·기어박스 충격, 고진동 |

### 노이즈 바닥과 분해능

- 고감도 센서는 **broadband 노이즈 바닥(µg/√Hz)이 낮아** 수 µg 수준의 미세 초기
  결함(초기 베어링·저속 설비)을 잡아낸다.
- 같은 ADC라도 고감도면 1 g당 더 많은 비트를 써서 **작은 신호의 분해능**이 좋다.
- 반대로 저감도 센서로 미세 신호를 재면 노이즈에 묻혀 보이지 않는다.

> [!tip] 감도는 예상 진동 크기에 맞춰라
> 예상 최대 진동이 센서 범위의 **절반 안쪽**에 들어오도록 감도를 고른다. 너무 높으면
> 포화(clipping), 너무 낮으면 미세 신호 손실. "예상 진폭 → 감도 → 범위" 순으로 검토.

> [!warning] 감도 오차·경년 변화
> 실제 감도는 표기값과 ±5~10% 오차가 있고 온도·경년·충격으로 변한다. 그래서
> **TEDS로 개별 교정 감도**를 읽거나 감도값을 정확히 입력해야 진폭(mm/s·g)이 맞는다.
> 감도 하나만 틀려도 그 채널의 판정이 통째로 어긋난다. → 아래 캘리브레이션 절 참고.

## 마운팅과 주파수 한계

센서 성능이 좋아도 **설치 방식이 고주파 상한을 결정**한다. 헐거울수록 상한이 낮아짐.

| 방법           | 주파수 상한  | 특징                   |
| ------------ | ------- | -------------------- |
| 스터드 볼트       | ~10 kHz | 가장 정확, 영구·고주파 측정 최우선 |
| 접착제 (에폭시/왁스) | ~6 kHz  | 영구 설치, 스터드 대안        |
| 자석           | ~2 kHz  | 탈착 간편, 순회 점검용 임시 측정  |
| 프로브 (손)      | ~1 kHz  | 부정확, 반복성 낮음 — 권장 안 함 |

<svg viewBox="0 0 660 235" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:sans-serif"><rect x="0" y="0" width="660" height="235" rx="8" fill="#ffffff" stroke="#e2e8f0"/><text x="20" y="28" font-size="15" font-weight="700" fill="#1e293b">마운팅 방법별 주파수 상한</text><line x1="150.0" y1="42" x2="150.0" y2="211" stroke="#eef2f6" stroke-width="1"/><text x="150.0" y="226" font-size="11" fill="#94a3b8" text-anchor="middle">10</text><line x1="301.1" y1="42" x2="301.1" y2="211" stroke="#eef2f6" stroke-width="1"/><text x="301.1" y="226" font-size="11" fill="#94a3b8" text-anchor="middle">100</text><line x1="452.3" y1="42" x2="452.3" y2="211" stroke="#eef2f6" stroke-width="1"/><text x="452.3" y="226" font-size="11" fill="#94a3b8" text-anchor="middle">1k</text><line x1="603.4" y1="42" x2="603.4" y2="211" stroke="#eef2f6" stroke-width="1"/><text x="603.4" y="226" font-size="11" fill="#94a3b8" text-anchor="middle">10k</text><text x="20" y="71" font-size="12.5" fill="#334155">스터드 볼트</text><rect x="150.0" y="55" width="453.4" height="20" rx="4" fill="#059669" opacity="0.85"/><text x="156.0" y="69" font-size="10.5" fill="#ffffff" font-weight="700">~10k Hz</text><text x="20" y="109" font-size="12.5" fill="#334155">접착제</text><rect x="150.0" y="93" width="419.9" height="20" rx="4" fill="#2563eb" opacity="0.85"/><text x="156.0" y="107" font-size="10.5" fill="#ffffff" font-weight="700">~6k Hz</text><text x="20" y="147" font-size="12.5" fill="#334155">자석</text><rect x="150.0" y="131" width="347.8" height="20" rx="4" fill="#f59e0b" opacity="0.85"/><text x="156.0" y="145" font-size="10.5" fill="#ffffff" font-weight="700">~2k Hz</text><text x="20" y="185" font-size="12.5" fill="#334155">프로브 (손)</text><rect x="150.0" y="169" width="302.3" height="20" rx="4" fill="#dc2626" opacity="0.85"/><text x="156.0" y="183" font-size="10.5" fill="#ffffff" font-weight="700">~1k Hz</text></svg>

## 측정 위치와 방향

센서 성능만큼 **어디에·어느 방향으로** 붙이느냐가 데이터 품질을 좌우한다.

- **위치**: 진동이 잘 전달되는 강성 부위(**베어링 하우징**), 하중 구간(load zone)에 가깝게.
  팬 커버·판금 같은 얇은 부위는 자체 공진으로 왜곡 → 금지.
- **방향 3축**:
  - **수평 (H)** — 대부분 결함이 가장 크게 나타남 (불평형 등)
  - **수직 (V)** — 구조 강성·기초 느슨함
  - **축방향 (A)** — 정렬 불량, 스러스트, 헬리컬 기어
- **삼축(triaxial) 가속도계**로 H/V/A 동시 측정하거나, 단축을 위치 옮겨가며 측정.
- **트렌드 일관성**: 상태 추이 비교를 위해 항상 **같은 지점·같은 방향**에서 측정 (마킹 필수).

## 케이블·배선·접지 & 노이즈

| 항목 | 내용 |
|------|------|
| **IEPE 케이블** | 저임피던스 → 일반 동축으로 수십~수백 m 가능. 단, 긴 케이블 × 고주파는 정전용량 때문에 감쇠 → 구동 전류를 늘려야 함 |
| **Charge형 케이블** | 고임피던스 → **low-noise 전용 케이블 필수**. 케이블 흔들림 = 트리보전기(triboelectric) 노이즈, 길이 제한 |
| **접지 루프** | 센서-DAQ 양단 접지 시 전원 험(50/60 Hz) 유입 → **한쪽만 접지**(절연형 센서 또는 절연 마운팅 패드) |
| **포설** | 실드는 한 점 접지, 인버터·모터 전력선과 **분리 포설** (EMI 회피) |
| **커넥터** | 2-pin MIL, 10-32 마이크로닷(charge), BNC 등 |

## IEPE 바이어스 전압 & 센서 자가진단

> [!tip] 모니터링 서버 설계에 유용
> IEPE 센서는 정전류로 구동되며, 신호가 **바이어스 전압(보통 8~14 V DC)** 위에 실려 온다.
> 이 DC 값만 읽어도 센서·케이블 상태를 **자동 진단**할 수 있다.

| 바이어스 전압 | 상태 |
|--------------|------|
| **8 ~ 14 V** | 정상 |
| **≈ 0 V** | 케이블 단락(short) 또는 센서 고장 |
| **≈ 공급 전압** | 케이블 단선(open) / 커넥터 빠짐 |

- 상시 감시 시스템은 매 측정 전 **bias check**로 결선 이상을 자동 검출 → 오측정·결측 방지.
- 채널별 바이어스 트렌드를 로깅하면 센서 열화·접촉 불량을 조기에 잡을 수 있다.

## TEDS (스마트 센서)

- **IEEE 1451.4** 규격. 센서 내부 EEPROM에 **감도·모델·일련번호·교정일** 등을 저장.
- DAQ가 연결 시 자동 인식 → 감도 수기 입력 실수 제거, 다점 시스템 구성/이력 관리 간편.

## 위상·회전 기준 센서 (태코미터 / 키페이저)

진동 **진폭만으론 부족**하고 **위상(phase)·차수(order)**가 필요한 분석(밸런싱, 정렬,
Order Tracking)에는 회전 기준 신호(1펄스/회전)가 함께 필요하다.

- **광학 태코** (reflective tape), **근접 센서**(키홈 = key phasor), **레이저 태코**
- 회전수에 동기 → RPM이 변해도 **차수 분석(Order Tracking)** 가능 (가변속 설비 필수)

## 온라인 상시감시 vs 휴대형 점검

| 구분 | 온라인 (상시) | 휴대형 (루트 점검) |
|------|--------------|-------------------|
| 설치 | 영구 (스터드/접착) | 자석/프로브 |
| 대상 | 중요·연속운전 설비 24h | 순회 정기 점검 |
| 센서 | 고정 IEPE/MEMS 다수 | 1~3축 휴대 프로브 |
| 데이터 | 실시간 트렌드·알람 | 주기적 스냅샷 |

## 무선 진동 센서

배터리 구동 + 무선 전송(BLE · WirelessHART · LoRa 등). 배선 비용·설치 시간을 크게 줄여
**접근 어려운 곳·다점 확장**에 유리하지만, 전원·대역폭 제약이 분명하다.

| 구분 | 유선(IEPE) | 무선 |
|------|-----------|------|
| 데이터 | 상시 raw 스트리밍 | 주기적 스냅샷 + 요약 특징 |
| 전원 | 외부 급전 | 배터리 (수명 ↔ 전송주기 트레이드오프) |
| 대역폭 | 넓음 (고주파 raw) | 제한 → RMS·Peak·부분 FFT 전송 위주 |
| 동기화 | 채널 동기 용이 | 센서 간 위상 동기 어려움 |

- **적합**: 중요도 중간, 배선 곤란한 다점 **상시 트렌드 감시**
- **부적합**: 고속 상세 진단, **위상·Order 분석**, 트립 보호(실시간성 필요)

> [!note] 배터리 vs 진단 깊이
> 상시 고샘플링 스트리밍은 배터리로 불가능. 보통 **평시엔 저빈도 트렌드(RMS 등)** 만
> 보내다가 **임계 초과 시에만 raw 파형**을 전송하는 이벤트 기반 전략을 쓴다.

## 방폭·위험지역 설치 (ATEX / 본질안전)

가연성 가스·분진 지역(정유·화학·제분 등)에서는 **방폭 인증 센서·배리어**가 필수.

- **위험 구역**: Zone 0/1/2 (가스) · Zone 20/21/22 (분진) — 위험도 순
- **방폭 방식**: 진동 센서는 대부분 **본질안전(Ex ia / ib)** — 회로 에너지를 점화 불가
  수준으로 제한. (그 외 내압방폭 Ex d 등)
- **안전 배리어**: 안전지역 쪽에 **제너/절연 배리어**를 두어 위험지역으로 가는 에너지를 제한.
- **인증**: ATEX(유럽) · IECEx(국제) · KCs(국내 방폭검정).

> [!important] 루프 전체가 인증되어야 함
> 센서만 방폭이면 안 되고 **센서 + 케이블 + 배리어 + DAQ 입력**까지 하나의 인증된
> 본질안전 루프로 구성해야 한다.

## 캘리브레이션 (검교정)

- **ISO 16063** 규격. 기준 가속도계 대비(back-to-back) 또는 레이저 절대 교정.
- 감도는 경년·충격으로 변함 → **주기적(보통 1~2년) 재교정** 필요.
- 현장 빠른 점검: 핸드헬드 shaker(**159.2 Hz, 1 g** 기준 진동) 로 출력 확인.

## 선정 가이드

| 상황 | 추천 센서 |
|------|----------|
| 범용 회전기계 상시 감시 | **IEPE 압전 100 mV/g** (스터드 마운팅) |
| 초기 베어링 결함(고주파 충격) | 압전 가속도계 + Envelope 분석 |
| 저속·슬리브/저널 베어링 (터빈) | **와전류 변위계** |
| 저진동 정밀 측정 | 고감도 압전 500 mV/g |
| IoT 다점·저가 상시 모니터링 | **MEMS 가속도계** |
| 충격·발파·크래시 계측 | 압저항식 (고 g) |

### 선정 체크리스트

- [ ] 측정 물리량(변위 / 속도 / 가속도)이 목적에 맞는가?
- [ ] 관심 주파수 대역(fmax) < 센서 주파수 응답 & 공진 여유(≤ 공진의 1/3)?
- [ ] 예상 진동 크기 → 감도·측정 범위 적절? (클리핑 방지)
- [ ] 환경: 온도, 습기(IP 등급), 방폭(ATEX), 자기장?
- [ ] 설치: 마운팅 방식·공간, 케이블 길이/종류?
- [ ] 인터페이스: IEPE / charge / 전압, TEDS 지원, 구동 전류?
- [ ] 상시(온라인) vs 휴대(루트), 축 수(1축 / 3축)?

---

## 참고

- 감도 100 mV/g → 출력 1 V 는 진동 10 g 를 의미
- IEPE = ICP(PCB 상표)와 동의어, 산업 표준 인터페이스
- 바이어스 전압으로 센서·케이블 상태 자가진단 가능(상시감시)

### 관련 표준

| 표준 | 내용 |
|------|------|
| **ISO 5348** | 가속도계 기계적 장착 |
| **ISO 16063** | 진동·충격 센서 교정 |
| **IEEE 1451.4** | TEDS 스마트 트랜스듀서 |
| **API 670** | 기계 보호 시스템 (근접 프로브·키페이저) |
| **ISO 10816 / 20816** | 진동 평가 기준(속도 RMS) |
| **ISO 13373** | 상태 감시·진단 지침 |

- 관련 노트: [[vibration]] (진동 파라미터·결함 주파수), [[fft]] (샘플링·FFT 설정), [[feature_extraction]] (특징 지표)
