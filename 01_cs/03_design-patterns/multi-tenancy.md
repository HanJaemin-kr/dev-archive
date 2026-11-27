---
title: Multi-tenancy 아키텍처
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

# Multi-tenancy 아키텍처

## 개념
하나의 시스템 인스턴스로 여러 고객사(테넌트)를 독립적으로 서비스
- 각 테넌트는 서로의 데이터를 볼 수 없어야 함
- 운영/배포는 단일 시스템으로 통합

## 데이터 격리 전략

| 방식 | 구조 | 장점 | 단점 | 적합한 경우 |
|------|------|------|------|-------------|
| Shared DB + Shared Schema | `tenant_id` 컬럼 | 운영 단순, 비용 낮음 | 실수로 혼용 위험 | 소규모 SaaS 시작 |
| Shared DB + Separate Schema | 스키마 분리 | 중간 격리 | 마이그레이션 복잡 | 중간 규모 |
| Separate DB | DB 분리 | 완전 격리, 성능 독립 | 비용 높음, 운영 복잡 | 대형 고객사 |

**실무**: Shared Schema로 시작 → 대형 고객은 별도 DB 제공

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 250" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <text x="340" y="24" text-anchor="middle" font-weight="bold" font-size="16">테넌트 데이터 격리 3단계 (격리 ↑, 비용 ↑)</text>

  <!-- 1. Shared DB + Shared Schema -->
  <text x="120" y="52" text-anchor="middle" font-size="13" font-weight="bold">① Shared Schema</text>
  <rect x="30" y="60" width="180" height="150" rx="8" fill="#e2e3e5" stroke="#333" stroke-width="2"/>
  <text x="120" y="80" text-anchor="middle" font-size="11">하나의 DB · 하나의 테이블</text>
  <rect x="50" y="92" width="140" height="26" rx="3" fill="#e8f0fe" stroke="#333" stroke-width="1"/>
  <text x="120" y="110" text-anchor="middle" font-size="11">tenant_id=A · row</text>
  <rect x="50" y="124" width="140" height="26" rx="3" fill="#d4edda" stroke="#333" stroke-width="1"/>
  <text x="120" y="142" text-anchor="middle" font-size="11">tenant_id=B · row</text>
  <rect x="50" y="156" width="140" height="26" rx="3" fill="#fff3cd" stroke="#333" stroke-width="1"/>
  <text x="120" y="174" text-anchor="middle" font-size="11">tenant_id=C · row</text>
  <text x="120" y="200" text-anchor="middle" font-size="10.5">비용↓ · 혼용 위험↑</text>

  <!-- 2. Shared DB + Separate Schema -->
  <text x="340" y="52" text-anchor="middle" font-size="13" font-weight="bold">② Separate Schema</text>
  <rect x="250" y="60" width="180" height="150" rx="8" fill="#e2e3e5" stroke="#333" stroke-width="2"/>
  <text x="340" y="80" text-anchor="middle" font-size="11">하나의 DB · 스키마 분리</text>
  <rect x="270" y="92" width="140" height="28" rx="3" fill="#e8f0fe" stroke="#333" stroke-width="1"/>
  <text x="340" y="111" text-anchor="middle" font-size="11">schema_A</text>
  <rect x="270" y="126" width="140" height="28" rx="3" fill="#d4edda" stroke="#333" stroke-width="1"/>
  <text x="340" y="145" text-anchor="middle" font-size="11">schema_B</text>
  <rect x="270" y="160" width="140" height="28" rx="3" fill="#fff3cd" stroke="#333" stroke-width="1"/>
  <text x="340" y="179" text-anchor="middle" font-size="11">schema_C</text>
  <text x="340" y="202" text-anchor="middle" font-size="10.5">중간 격리 · 마이그레이션↑</text>

  <!-- 3. Separate DB -->
  <text x="560" y="52" text-anchor="middle" font-size="13" font-weight="bold">③ Separate DB</text>
  <rect x="470" y="92" width="180" height="30" rx="6" fill="#e8f0fe" stroke="#333" stroke-width="2"/>
  <text x="560" y="112" text-anchor="middle" font-size="11">DB_A (테넌트 A 전용)</text>
  <rect x="470" y="128" width="180" height="30" rx="6" fill="#d4edda" stroke="#333" stroke-width="2"/>
  <text x="560" y="148" text-anchor="middle" font-size="11">DB_B (테넌트 B 전용)</text>
  <rect x="470" y="164" width="180" height="30" rx="6" fill="#fff3cd" stroke="#333" stroke-width="2"/>
  <text x="560" y="184" text-anchor="middle" font-size="11">DB_C (테넌트 C 전용)</text>
  <text x="560" y="212" text-anchor="middle" font-size="10.5">완전 격리 · 비용↑ · 운영↑</text>
</svg>

<sub>왼쪽에서 오른쪽으로 갈수록 격리 수준과 운영 비용이 함께 오른다. 소규모는 ①로 시작하고, 규제·성능 요구가 큰 대형 고객만 ③으로 분리하는 하이브리드가 실무 정석.</sub>

## Tenant Context 패턴

요청마다 테넌트를 식별하고 하위 레이어에 자동 전달

```
HTTP 요청 (헤더: X-Tenant-ID: company-a)
  ↓
TenantFilter → TenantContext.set("company-a")  ← Thread-local 저장
  ↓
Service → Repository
  ↓
Repository에서 TenantContext.get()으로 tenant_id 자동 주입
```

- 서비스/레포지토리 코드에서 tenant_id를 직접 파라미터로 넘기지 않아도 됨
- 요청 종료 시 반드시 TenantContext.clear() 필요 (스레드 재사용 문제)

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 230" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="mt-ctx-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="340" y="24" text-anchor="middle" font-weight="bold" font-size="16">Tenant Context 전파 흐름</text>

  <!-- HTTP request -->
  <rect x="20" y="55" width="150" height="54" rx="6" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="95" y="78" text-anchor="middle" font-size="12" font-weight="bold">HTTP 요청</text>
  <text x="95" y="96" text-anchor="middle" font-size="11">X-Tenant-ID: A</text>

  <!-- TenantFilter -->
  <rect x="200" y="55" width="150" height="54" rx="6" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="275" y="78" text-anchor="middle" font-size="12" font-weight="bold">TenantFilter</text>
  <text x="275" y="96" text-anchor="middle" font-size="11">context.set("A")</text>

  <!-- Service -->
  <rect x="380" y="55" width="130" height="54" rx="6" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="445" y="86" text-anchor="middle" font-size="12" font-weight="bold">Service</text>

  <!-- Repository -->
  <rect x="530" y="55" width="130" height="54" rx="6" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="595" y="86" text-anchor="middle" font-size="12" font-weight="bold">Repository</text>

  <!-- flow arrows -->
  <line x1="170" y1="82" x2="196" y2="82" stroke="#333" stroke-width="2" marker-end="url(#mt-ctx-arrow)"/>
  <line x1="350" y1="82" x2="376" y2="82" stroke="#333" stroke-width="2" marker-end="url(#mt-ctx-arrow)"/>
  <line x1="510" y1="82" x2="526" y2="82" stroke="#333" stroke-width="2" marker-end="url(#mt-ctx-arrow)"/>

  <!-- Thread-local store -->
  <rect x="200" y="150" width="310" height="44" rx="6" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="355" y="177" text-anchor="middle" font-size="12">TenantContext (Thread-local) = "A"</text>

  <!-- filter writes -->
  <line x1="275" y1="109" x2="275" y2="147" stroke="#333" stroke-width="2" marker-end="url(#mt-ctx-arrow)"/>
  <text x="275" y="130" text-anchor="middle" font-size="10.5">① set</text>

  <!-- repository reads -->
  <line x1="595" y1="109" x2="510" y2="165" stroke="#333" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#mt-ctx-arrow)"/>
  <text x="580" y="140" text-anchor="middle" font-size="10.5">② get → WHERE tenant_id=A</text>

  <!-- clear -->
  <text x="95" y="180" font-size="11" fill="#b02a37" font-weight="bold">③ 응답 후 clear() 필수</text>
</svg>

<sub>필터가 요청 헤더에서 테넌트를 읽어 Thread-local에 저장하면, 하위 레이어는 파라미터 없이 `get()`으로 꺼내 쓴다. 스레드 풀 재사용 때문에 요청 종료 시 `clear()`를 빠뜨리면 다른 테넌트 데이터가 섞일 수 있다.</sub>

## Strategy로 테넌트별 비즈니스 규칙 분기

```
ApprovalStrategy (interface)
  ├── TwoStepApproval   (A사: 팀장 → 임원 승인)
  └── OneStepApproval   (B사: 팀장 승인만)

ApprovalFactory.getStrategy(tenantId) → 해당 전략 반환
```

if/else 분기 없이 테넌트별 로직 교체

## 주요 고려사항

**테넌트 식별 방법**
- 서브도메인: `company-a.myapp.com`
- 헤더: `X-Tenant-ID`
- JWT 클레임: `{ tenant: "company-a" }`

**공통 함정**
- 쿼리에 `WHERE tenant_id = ?` 빠뜨리면 데이터 혼용 → Row Level Security(RLS)로 DB 레벨 강제
- 캐시 키에 tenant_id 포함 필수 (`cache:company-a:users`)
- 파일 스토리지 경로도 테넌트별 분리 (`/uploads/{tenantId}/...`)

## MES/ERP SaaS 적용

- 공장 A, B, C가 같은 MES를 사용하지만 데이터는 완전 분리
- 테넌트별 설비 목록, 알람 임계값, 보고서 양식이 다를 수 있음 → Strategy 패턴으로 커스터마이징
