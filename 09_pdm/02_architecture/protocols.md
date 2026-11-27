---
title: 산업 통신 프로토콜 (Industrial Communication Protocols)
domain: pdm
category: architecture
tags: [pdm, architecture]
level: intermediate
status: published
created: 2026-07-20
updated: 2026-07-20
velog: false
related: []
---

# 산업 통신 프로토콜 (Industrial Communication Protocols)

모니터링 서버가 설비·센서·PLC·DCS에서 데이터를 받아오는 **통신 계층**. 현장(OT)에서
서버(IT)까지 계층마다 요구가 달라 프로토콜이 다르다 — 아래는 실시간·결정적, 위는
집약·추상적. 수집 파이프라인은 [[pipeline]], 서버 스택(브로커·DB)은 [[stack]],
엣지에서 뽑는 특징은 [[feature_extraction]] 참고.

## 자동화 피라미드 — 계층별 프로토콜

<svg viewBox="0 0 660 330" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:sans-serif"><rect x="0" y="0" width="660" height="330" rx="8" fill="#ffffff" stroke="#e2e8f0"/><text x="20" y="28" font-size="15" font-weight="700" fill="#1e293b">자동화 피라미드 — 계층별 통신 프로토콜</text><polygon points="240,50 276,100 204,100" fill="#7c3aed" opacity="0.9"/><polygon points="204,100 276,100 312,150 168,150" fill="#2563eb" opacity="0.9"/><polygon points="168,150 312,150 348,200 132,200" fill="#0891b2" opacity="0.9"/><polygon points="132,200 348,200 384,250 96,250" fill="#059669" opacity="0.9"/><polygon points="96,250 384,250 420,300 60,300" fill="#f59e0b" opacity="0.92"/><text x="240" y="86" font-size="10.5" fill="#ffffff" font-weight="700" text-anchor="middle">ERP</text><text x="240" y="131" font-size="11" fill="#ffffff" font-weight="700" text-anchor="middle">MES</text><text x="240" y="181" font-size="11" fill="#ffffff" font-weight="700" text-anchor="middle">SCADA</text><text x="240" y="231" font-size="11" fill="#ffffff" font-weight="700" text-anchor="middle">제어 (PLC/DCS)</text><text x="240" y="282" font-size="11" fill="#ffffff" font-weight="700" text-anchor="middle">필드 (센서/밸브)</text><line x1="263" y1="82" x2="432" y2="82" stroke="#cbd5e1" stroke-width="1"/><text x="436" y="86" font-size="9.5" fill="#334155">REST · SQL · MQTT</text><line x1="295" y1="127" x2="432" y2="127" stroke="#cbd5e1" stroke-width="1"/><text x="436" y="131" font-size="9.5" fill="#334155">OPC-UA · MQTT(Sparkplug)</text><line x1="331" y1="177" x2="432" y2="177" stroke="#cbd5e1" stroke-width="1"/><text x="436" y="181" font-size="9.5" fill="#334155">OPC-UA · Modbus TCP</text><line x1="367" y1="227" x2="432" y2="227" stroke="#cbd5e1" stroke-width="1"/><text x="436" y="231" font-size="9.5" fill="#334155">PROFINET·EtherNet/IP·Modbus</text><line x1="404" y1="278" x2="432" y2="278" stroke="#cbd5e1" stroke-width="1"/><text x="436" y="282" font-size="9.5" fill="#334155">4~20mA·HART·IO-Link·PROFIBUS</text><text x="20" y="320" font-size="10.5" fill="#64748b">아래=실시간·결정적(µs~ms)·소량   ·   위=집약·추상화(초~분)   ·   중간이 OT↔IT 경계</text></svg>

## 대표 프로토콜 비교

| 프로토콜 | 계층 | 매체 | 모델 | 특징 | PdM 활용 |
|----------|------|------|------|------|----------|
| **Modbus RTU/TCP** | 제어/감시 | RS-485 / Ethernet | Master-Slave 폴링 | 단순·범용·무료, 16bit 레지스터, 자기기술 없음 | PLC 태그(온도·RMS) 읽기 |
| **PROFIBUS / PROFINET** | 제어 | RS-485 / Ethernet | Master-Slave / RT | 유럽 표준, PROFINET은 실시간 Ethernet | 라인 설비 상태 |
| **EtherNet/IP** | 제어 | Ethernet | CIP | 북미 표준(Rockwell) | 상동 |
| **EtherCAT** | 제어 | Ethernet | 마스터 순환 | µs급 초저지연·동기 | 고속 모션·다축 동기 |
| **OPC-UA** | 감시~MES | Ethernet | Client-Server / Pub-Sub | **정보모델·보안·플랫폼 독립**, IT/OT 통합 | 자산 모델링·보안 원격수집 |
| **MQTT (+Sparkplug B)** | MES~IT | TCP/IP | Broker Pub-Sub | 경량·불안정망 강함·QoS | **엣지→서버 표준**(특징·스냅샷) |
| **HART** | 필드 | 4~20mA 위 중첩 | Master-Slave | 아날로그 + 디지털 진단 | 스마트 계기 진단값 |
| **CAN / CANopen** | 필드/제어 | 2선 버스 | 멀티마스터 | 차량·모바일 장비 | 이동장비 센서 |
| **IEC 61850 / DNP3** | 전력 | Ethernet/Serial | — | 변전·전력 자동화 | 전력설비 감시 |
| **BACnet** | 빌딩 | Ethernet/Serial | — | 공조·빌딩 설비 | 유틸리티 설비 |

## PdM 모니터링 서버 관점 — 핵심 3형제

### Modbus — "최소공배수"
- **Master가 Slave의 레지스터/코일을 폴링**해서 읽는다. TCP는 502포트. RTU는 RS-485.
- 장점: 어디에나 있고 구현 단순, 사실상 무료. 대부분의 PLC·계기가 지원.
- 한계: **자기기술(메타데이터) 없음** → 레지스터 주소·데이터타입·스케일을 문서로 관리해야.
  보안 없음(평문), 폴링 방식(이벤트 푸시 아님), 기본 16bit.
- 용도: 기존 PLC에서 온도·압력·상태·간이 진동지표(RMS) 정도를 읽어올 때 무난.

### OPC-UA — "IT/OT 통합 표준" (IEC 62541)
- **주소공간(Address Space)에 노드로 정보 모델링** → 태그가 의미·단위·관계를 스스로 기술.
- **보안 내장**(인증서·암호화·권한), 플랫폼 독립. Client-Server + **Pub-Sub(UA over MQTT)**.
- Companion Spec으로 설비 표준 모델 정의 가능. 방화벽/원격 수집에 적합.
- 용도: 설비 자산을 의미 있게 모델링하고 **보안 원격 수집**이 필요한 상위 통합.

### MQTT (+ Sparkplug B) — "경량 IoT Pub/Sub"
- **브로커 중심 발행/구독**. QoS 0/1/2, Retained, **LWT(Last Will)** 로 엣지 생사 감지.
- 대역폭 작고 불안정한 망에 강함 → **다수 엣지 디바이스** 수집에 최적.
- **Sparkplug B**: 산업용 토픽 구조·payload 규약(장치 birth/death, 상태 일관성)으로 MQTT의
  "자유도 과다" 문제를 표준화.
- 용도: 그들의 스택(Mosquitto/EMQX + InfluxDB, [[stack]])에서 **엣지→서버 표준 채널**.

## PdM 데이터를 어떻게 실어보내나 (대역폭 현실)

> [!warning] 고샘플 raw 파형은 상시 전송 대상이 아니다
> 진동 raw(수 kHz~수십 kHz × 다채널)를 산업 프로토콜로 **상시** 보내는 건 비현실적이다.
> **엣지에서 특징 추출**(RMS·Peak·스펙트럼 피크·[[feature_extraction]]) 후 MQTT/OPC-UA로
> 보내고, **임계 초과 이벤트 때만 raw 파형**을 올린다(→ [[pipeline]] 샘플링 전략).

- **시간 동기**: 다채널 위상 분석(밸런싱·ODS)이 필요하면 **PTP(IEEE 1588)** 로 채널 간
  시각을 맞춘다. 일반 트렌드 감시는 불필요.
- **게이트웨이**: 현장 Modbus/PROFINET → 엣지 게이트웨이가 정규화 → 상위엔 **OPC-UA/MQTT**
  로 변환·전달(프로토콜 변환 + 버퍼링 + 보안 종단).

## OT 보안 (놓치면 안 됨)

- **Purdue 모델**로 계층 분리, IT/OT 사이 **DMZ**. 중요망은 **단방향 게이트웨이(data diode)**.
- OPC-UA 보안 프로파일·**TLS**, 최소권한, 세그멘테이션. 기준: **IEC 62443**.
- Modbus·기본 MQTT는 평문 → 반드시 **VPN/TLS·망분리** 뒤에 둔다.

## 선택 가이드 (요약)

| 상황 | 추천 |
|------|------|
| 기존 PLC 레지스터를 간단히 읽기 | **Modbus TCP** |
| 자산 의미모델·보안·원격 통합 | **OPC-UA** |
| 다수 엣지·불안정망·경량 수집 | **MQTT (Sparkplug B)** |
| µs급 고속 모션 동기 | **EtherCAT** |
| 전력 변전 설비 | **IEC 61850 / DNP3** |
| 빌딩·공조 유틸리티 | **BACnet** |

---

## 참고

- 계층: 필드(4~20mA·HART) → 제어(PROFINET·Modbus) → 감시(OPC-UA) → MES/IT(MQTT)
- PdM 실무: **엣지 특징추출 + MQTT/OPC-UA**, raw는 이벤트 기반. 상시 raw 스트리밍은 지양
- 보안은 선택이 아니라 필수(IEC 62443, 망분리, TLS)

### 관련 표준

| 표준 | 내용 |
|------|------|
| **IEC 62541** | OPC-UA |
| **IEC 61158 / 61784** | 필드버스·산업 이더넷 |
| **ISO/IEC 20922** | MQTT (v3.1.1) |
| **Eclipse Sparkplug** | 산업용 MQTT 페이로드 규약 |
| **IEC 62443** | 산업제어시스템(OT) 사이버보안 |
| **IEEE 1588 (PTP)** | 정밀 시간 동기 |

- 관련 노트: [[pipeline]] (수집 파이프라인) · [[stack]] (브로커·DB 스택) · [[feature_extraction]] (엣지 특징) · [[sensor]] (센서 인터페이스)
