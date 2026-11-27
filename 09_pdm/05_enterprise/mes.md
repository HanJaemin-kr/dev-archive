---
title: MES (Manufacturing Execution System)
domain: pdm
category: enterprise
tags: [pdm, enterprise]
level: intermediate
status: published
created: 2026-05-13
updated: 2026-05-13
velog: false
related: []
---

# MES (Manufacturing Execution System)

## 개념
- 공장 현장(shop floor)의 생산 실행을 관리하는 시스템
- ERP가 계획을 세우면, MES는 그 계획을 현장에서 실행하고 추적

## 핵심 기능

| 기능 | 설명 |
|------|------|
| 작업 지시 | ERP에서 받은 생산 계획을 현장 작업자/설비에 배분 |
| 실적 수집 | 생산량, 불량, 가동시간 등 실시간 데이터 수집 |
| 품질 관리 | 공정별 검사 결과 기록, SPC(통계적 공정 관리) |
| 설비 연동 | PLC/SCADA와 통신해 설비 상태 수집 (OPC-UA, MQTT) |
| 추적성 | 제품 이력 관리 (어떤 설비, 어떤 작업자, 어떤 재료) |

## ERP와의 관계

```
ERP (계획)
  └─ 생산 오더 전달
        ↓
MES (실행)
  └─ 작업 지시 → 설비/작업자
  └─ 실적 집계 → ERP에 피드백
        ↓
현장 (SCADA/PLC/설비)
```

## 데이터 흐름 특성
- **실시간성**: 설비 데이터는 초~분 단위 수집
- **고빈도 쓰기**: 시계열 DB (InfluxDB 등) 활용 이유
- **이벤트 기반**: 설비 이상 → 알림 → 작업 중단 흐름

## 관련 기술 스택
- 설비 연동: OPC-UA, MQTT, Modbus
- 데이터 저장: InfluxDB (시계열), RDBMS (트랜잭션)
- 메시지 브로커: MQTT broker, Kafka
- 대시보드: Grafana, 자체 웹 UI
