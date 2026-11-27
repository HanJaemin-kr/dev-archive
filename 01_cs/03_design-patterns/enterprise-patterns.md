---
title: 기업 시스템의 디자인 패턴
domain: cs
category: design-patterns
tags: [cs, design-patterns]
level: intermediate
status: published
created: 2026-07-16
updated: 2026-07-16
velog: true
related: []
---

# 기업 시스템의 디자인 패턴

## Repository Pattern
- DB 접근 로직을 비즈니스 로직에서 분리
- 서비스 레이어는 DB가 뭔지 모름 → 테스트 용이, DB 교체 가능

```
Service → Repository (interface)
               ↓
         JpaRepository / MyBatisRepository (구현체 교체 가능)
```

**MES/ERP 적용**: `OrderRepository`, `EquipmentRepository`처럼 도메인별 분리

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 260" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="ent-repo-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
    <marker id="ent-repo-tri" markerWidth="14" markerHeight="14" refX="11" refY="6" orient="auto">
      <path d="M0,0 L11,6 L0,12 Z" fill="#fff" stroke="#333" stroke-width="1"/>
    </marker>
  </defs>
  <text x="260" y="24" text-anchor="middle" font-weight="bold" font-size="16">Repository 패턴 (DB 의존성 역전)</text>

  <!-- Service -->
  <rect x="180" y="45" width="160" height="44" rx="4" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="260" y="72" text-anchor="middle" font-size="13" font-weight="bold">Service (비즈니스 로직)</text>

  <!-- Repository interface -->
  <rect x="170" y="120" width="180" height="44" rx="4" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="260" y="141" text-anchor="middle" font-size="12" font-weight="bold">«interface»</text>
  <text x="260" y="157" text-anchor="middle" font-size="12">OrderRepository</text>

  <!-- Service depends on interface -->
  <line x1="260" y1="120" x2="260" y2="91" stroke="#333" stroke-width="2" marker-end="url(#ent-repo-arrow)"/>
  <text x="345" y="108" text-anchor="middle" font-size="11">① 인터페이스에만 의존</text>

  <!-- implementations -->
  <rect x="30" y="200" width="200" height="42" rx="4" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="130" y="226" text-anchor="middle" font-size="12">JpaOrderRepository</text>

  <rect x="290" y="200" width="200" height="42" rx="4" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="390" y="226" text-anchor="middle" font-size="12">MyBatisOrderRepository</text>

  <!-- impls implement interface -->
  <line x1="150" y1="200" x2="230" y2="166" stroke="#333" stroke-width="2" marker-end="url(#ent-repo-tri)"/>
  <line x1="370" y1="200" x2="290" y2="166" stroke="#333" stroke-width="2" marker-end="url(#ent-repo-tri)"/>
  <text x="260" y="190" text-anchor="middle" font-size="11">② 구현체 교체 가능 (테스트는 Mock)</text>
</svg>

<sub>Service는 구체 DB 기술이 아니라 `Repository` 인터페이스에만 의존한다. 그래서 JPA↔MyBatis 교체나 테스트용 In-Memory/Mock 주입이 자유롭다(의존성 역전).</sub>

---

## Factory / Abstract Factory
- 객체 생성 로직을 한 곳에 모아 분기 제거

```
EquipmentFactory.create("FANUC")  → FanucDriver
EquipmentFactory.create("SIEMENS") → SiemensDriver
```

**MES 적용**: 장비 타입별 통신 드라이버 생성. 새 장비 추가 시 팩토리만 수정

---

## Strategy
- 알고리즘을 캡슐화해 런타임에 교체 가능

```
PriceCalculator
  ├── RegularPriceStrategy
  ├── VIPPriceStrategy
  └── PromotionPriceStrategy
```

**ERP 적용**: 고객 등급별 가격 정책, 국가별 세금 계산 로직 분기 제거

---

## Observer / Event-Driven
- 상태 변화 시 등록된 구독자에게 자동 전파

```
EquipmentStatusChanged (이벤트)
  ├── AlertService.onEvent()
  ├── LogService.onEvent()
  └── DashboardService.onEvent()
```

**MES 적용**: 설비 이상 감지 → 알림 + 로그 + 대시보드 동시 업데이트  
Kafka/RabbitMQ 기반 아키텍처의 개념적 토대

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 230" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="ent-evt-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="280" y="24" text-anchor="middle" font-weight="bold" font-size="16">Event-Driven: 이벤트 하나 → 구독자 다중 반응</text>

  <!-- Event source -->
  <rect x="20" y="90" width="160" height="60" rx="6" fill="#f8d7da" stroke="#333" stroke-width="1.5"/>
  <text x="100" y="115" text-anchor="middle" font-size="12" font-weight="bold">설비 이상 감지</text>
  <text x="100" y="134" text-anchor="middle" font-size="11">EquipmentStatusChanged</text>

  <!-- broker -->
  <rect x="230" y="95" width="90" height="50" rx="6" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="275" y="118" text-anchor="middle" font-size="12" font-weight="bold">Event Bus</text>
  <text x="275" y="135" text-anchor="middle" font-size="10.5">(Kafka/MQ)</text>

  <line x1="180" y1="120" x2="226" y2="120" stroke="#333" stroke-width="2" marker-end="url(#ent-evt-arrow)"/>
  <text x="203" y="110" text-anchor="middle" font-size="10.5">① 발행</text>

  <!-- subscribers -->
  <rect x="390" y="45" width="150" height="40" rx="6" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="465" y="70" text-anchor="middle" font-size="12">AlertService</text>

  <rect x="390" y="100" width="150" height="40" rx="6" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="465" y="125" text-anchor="middle" font-size="12">LogService</text>

  <rect x="390" y="155" width="150" height="40" rx="6" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="465" y="180" text-anchor="middle" font-size="12">DashboardService</text>

  <!-- fan out -->
  <line x1="320" y1="115" x2="386" y2="66" stroke="#333" stroke-width="2" marker-end="url(#ent-evt-arrow)"/>
  <line x1="320" y1="120" x2="386" y2="120" stroke="#333" stroke-width="2" marker-end="url(#ent-evt-arrow)"/>
  <line x1="320" y1="125" x2="386" y2="174" stroke="#333" stroke-width="2" marker-end="url(#ent-evt-arrow)"/>
  <text x="355" y="215" text-anchor="middle" font-size="10.5">② 구독자에게 팬아웃 — 발행자는 구독자를 모름(느슨한 결합)</text>
</svg>

<sub>이벤트 발행자는 누가 구독하는지 알 필요 없이 이벤트만 던진다. 알림·로그·대시보드가 각자 독립적으로 반응하므로, 새 반응(예: SMS 발송)을 추가해도 발행 측 코드는 그대로다.</sub>

---

## Facade
- 복잡한 내부 구조를 단순한 인터페이스로 감싸기

```
OrderFacade.placeOrder(request)
  내부: 재고확인 → 가격계산 → 결제 → 생산오더 생성 → 알림
```

**ERP 적용**: 외부 시스템(MES, PLM)에 단순 API 제공, 내부 복잡도 숨김

---

## Template Method
- 공통 흐름은 부모 클래스에 정의, 세부 구현은 자식이 오버라이드

```
ReportGenerator
  generate()          ← 공통 흐름 (final)
    fetchData()       ← 자식 구현
    format()          ← 자식 구현
    export()          ← 자식 구현
```

**ERP 적용**: 일일/주간/월간 보고서가 같은 흐름, 데이터 소스만 다름
