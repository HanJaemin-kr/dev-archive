---
title: PLM (Product Lifecycle Management)
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

# PLM (Product Lifecycle Management)

## 개념
- 제품의 기획 → 설계 → 생산 → 폐기까지 전체 수명주기 데이터 관리
- 도면, BOM, 설계 변경 이력, 인증 문서 등을 중앙 관리

## 핵심 개념

**BOM (Bill of Materials)**
- 제품을 구성하는 부품 목록과 수량, 계층 구조
- 설계 BOM(E-BOM) → 제조 BOM(M-BOM)으로 변환되어 ERP/MES에 전달

**ECO (Engineering Change Order)**
- 설계 변경 요청/승인 프로세스
- 변경 이력 관리가 핵심 (언제, 누가, 왜 바꿨는지)

## PLM → ERP → MES 데이터 흐름

```
PLM: 제품 BOM 확정, 도면 승인
  ↓ BOM 전달
ERP: 자재 소요 계산(MRP), 생산 계획
  ↓ 생산 오더 전달
MES: 현장 작업 지시, 실적 수집
```

## 개발자 관점
- **버전 관리**: 도면/BOM의 revision 관리 (git과 유사한 개념)
- **워크플로우 엔진**: 설계 변경 승인 프로세스 자동화
- **대용량 파일**: CAD 도면 파일 저장/검색 (오브젝트 스토리지)
- **시스템 연동**: ERP BOM 동기화가 가장 복잡한 연동 포인트

## 대표 솔루션
- Siemens Teamcenter
- PTC Windchill
- Dassault Systèmes ENOVIA
