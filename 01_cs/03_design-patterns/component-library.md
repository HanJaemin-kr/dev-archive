---
title: 모듈식 재사용 가능 컴포넌트 라이브러리
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

# 모듈식 재사용 가능 컴포넌트 라이브러리

## 핵심 목표
- 한 번 만들어 여러 곳에서 재사용
- 변경이 한 곳에만 영향
- 조합으로 복잡한 UI/기능 구성

## 적용 패턴

### Composite
컴포넌트를 트리 구조로 조합 — 단일 컴포넌트와 복합 컴포넌트를 동일하게 다룸

```
Widget (interface)
  ├── AlarmTable     (단일)
  ├── TrendChart     (단일)
  └── Dashboard      (복합 - Widget들의 컨테이너)
```

### Template Method
공통 생명주기는 BaseWidget이 정의, 구체 구현은 자식

```
BaseWidget
  init()     → 공통 (데이터 구독, 권한 체크)
  render()   → 자식 구현
  destroy()  → 공통 (구독 해제)
```

### Decorator
기존 컴포넌트에 기능을 동적으로 추가 — 원본 수정 없이

```
AlarmTable
  → LoadingDecorator(AlarmTable)     로딩 스피너 추가
  → PermissionDecorator(AlarmTable)  권한 체크 추가
  → CacheDecorator(AlarmTable)       데이터 캐싱 추가
```

## MES UI 라이브러리 예시

```
BaseWidget (공통: 구독, 권한, 에러 처리)
  ├── EquipmentCard   설비 상태 카드
  ├── AlarmTable      알람 목록 테이블
  ├── TrendChart      시계열 트렌드 차트
  └── KPIGauge        OEE/가동률 게이지
```

- 각 위젯은 독립적으로 데이터 소스 설정 가능
- 대시보드는 위젯을 Composite로 조합해 구성
- 테마/스타일은 Decorator로 주입

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 320" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="cl-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
    <marker id="cl-tri" markerWidth="14" markerHeight="14" refX="11" refY="6" orient="auto">
      <path d="M0,0 L11,6 L0,12 Z" fill="#fff" stroke="#333" stroke-width="1"/>
    </marker>
  </defs>
  <text x="330" y="24" text-anchor="middle" font-weight="bold" font-size="16">위젯 라이브러리: Composite 트리 + Decorator 래핑</text>

  <!-- Widget interface -->
  <rect x="255" y="45" width="150" height="40" rx="4" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="330" y="70" text-anchor="middle" font-size="13" font-weight="bold">«interface» Widget</text>

  <!-- Composite: Dashboard -->
  <rect x="255" y="120" width="150" height="46" rx="4" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="330" y="140" text-anchor="middle" font-size="12" font-weight="bold">Dashboard</text>
  <text x="330" y="157" text-anchor="middle" font-size="11">(복합 / children[])</text>

  <!-- Dashboard implements Widget -->
  <line x1="330" y1="120" x2="330" y2="87" stroke="#333" stroke-width="2" marker-end="url(#cl-tri)"/>

  <!-- leaf widgets -->
  <rect x="30" y="215" width="130" height="42" rx="4" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="95" y="241" text-anchor="middle" font-size="12">EquipmentCard</text>

  <rect x="180" y="215" width="120" height="42" rx="4" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="240" y="241" text-anchor="middle" font-size="12">AlarmTable</text>

  <rect x="320" y="215" width="110" height="42" rx="4" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="375" y="241" text-anchor="middle" font-size="12">TrendChart</text>

  <rect x="450" y="215" width="100" height="42" rx="4" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="500" y="241" text-anchor="middle" font-size="12">KPIGauge</text>

  <!-- Dashboard contains leaves (composition) -->
  <line x1="290" y1="166" x2="120" y2="212" stroke="#333" stroke-width="2" marker-end="url(#cl-arrow)"/>
  <line x1="310" y1="166" x2="250" y2="212" stroke="#333" stroke-width="2" marker-end="url(#cl-arrow)"/>
  <line x1="350" y1="166" x2="375" y2="212" stroke="#333" stroke-width="2" marker-end="url(#cl-arrow)"/>
  <line x1="370" y1="166" x2="490" y2="212" stroke="#333" stroke-width="2" marker-end="url(#cl-arrow)"/>
  <text x="470" y="185" text-anchor="middle" font-size="11">① Composite로 자식 조합</text>

  <!-- Decorator wrapping (right side) -->
  <rect x="440" y="95" width="200" height="90" rx="6" fill="#f8d7da" stroke="#333" stroke-width="1.5" stroke-dasharray="5 3"/>
  <text x="540" y="114" text-anchor="middle" font-size="12" font-weight="bold">② Decorator 래핑</text>
  <rect x="455" y="122" width="170" height="24" rx="3" fill="#fff" stroke="#333" stroke-width="1"/>
  <text x="540" y="139" text-anchor="middle" font-size="11">Loading → Permission → Cache</text>
  <text x="540" y="166" text-anchor="middle" font-size="10.5">원본 위젯을 감싸 기능 추가</text>
  <line x1="440" y1="140" x2="408" y2="135" stroke="#333" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#cl-arrow)"/>
</svg>

<sub>단일 위젯(잎)과 Dashboard(복합)를 `Widget` 인터페이스로 동일하게 다뤄(Composite) 트리로 조합하고, 로딩·권한·캐싱 같은 부가 기능은 원본을 감싸는 Decorator 체인으로 붙인다(개방-폐쇄 원칙).</sub>

## 설계 원칙

| 원칙 | 적용 |
|------|------|
| 단일 책임 | 컴포넌트 하나는 하나의 역할만 |
| 개방-폐쇄 | 확장에는 열려있고, 수정에는 닫혀있음 (Decorator로 확장) |
| 인터페이스 분리 | 큰 인터페이스 대신 작은 인터페이스 여러 개 |
