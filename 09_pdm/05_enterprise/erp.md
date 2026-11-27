---
title: ERP (Enterprise Resource Planning)
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

# ERP (Enterprise Resource Planning)

## 개념
- 기업의 핵심 업무(생산, 구매, 재고, 회계, 인사)를 하나의 통합 시스템으로 관리
- 부서 간 데이터 사일로 제거, 단일 데이터 소스(Single Source of Truth)

## 주요 모듈

| 모듈 | 역할 |
|------|------|
| 생산관리 | 생산 계획(MRP), 자재 소요 계산 |
| 구매/조달 | 발주, 입고, 공급업체 관리 |
| 재고관리 | 창고, 재고 이동, 재고 평가 |
| 회계/재무 | 전표, 원가, 손익 |
| 인사 | 급여, 근태, 조직 |

## ERP vs MES vs PLM

```
PLM → 제품 설계/개발 단계 관리 (BOM, 도면, 변경 이력)
 ↓
ERP → 경영 계획 (생산 오더, 자재, 원가)
 ↓
MES → 현장 실행 (작업 지시, 실적, 품질)
 ↓
SCADA/PLC → 설비 제어
```

## 개발자 관점에서 ERP

- **대용량 트랜잭션**: 재고 차감, 회계 전표는 원자성 보장 필수
- **복잡한 도메인 로직**: 원가 계산, MRP 로직은 비즈니스 규칙이 핵심
- **외부 연동**: MES, PLM, 물류사, 세금계산서 등 다양한 시스템과 API 연동
- **커스터마이징**: 고객사마다 업무 프로세스 달라 → Multi-tenancy, 설정 기반 로직

## 대표 솔루션
- SAP S/4HANA (글로벌 대기업)
- Oracle ERP Cloud
- Microsoft Dynamics 365
- 더존 iCUBE, 영림원 K-System (국내 중소기업)
