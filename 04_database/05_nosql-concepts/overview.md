---
title: NoSQL 개념 정리
domain: database
category: nosql-concepts
tags: [database, nosql-concepts]
level: intermediate
status: published
created: 2026-07-16
updated: 2026-07-16
velog: true
related: []
---

# NoSQL 개념 정리

## SQL vs NoSQL

| 항목 | SQL (RDBMS) | NoSQL |
|------|------------|-------|
| 스키마 | 고정 스키마 | 유연한 스키마 |
| 확장 방식 | 수직 확장 (Scale-Up) | 수평 확장 (Scale-Out) |
| 트랜잭션 | ACID 완전 지원 | 제한적 (BASE) |
| 일관성 | 강한 일관성 | 최종적 일관성 |
| 조인 | 지원 | 일반적으로 미지원 |

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 240" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="nosql-scale-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="310" y="24" text-anchor="middle" font-weight="bold" font-size="16">확장 방식: 수직(Scale-Up) vs 수평(Scale-Out)</text>

  <!-- Scale up -->
  <text x="155" y="52" text-anchor="middle" font-size="13" font-weight="bold">SQL · 수직 확장</text>
  <rect x="110" y="160" width="90" height="30" rx="4" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="155" y="180" text-anchor="middle" font-size="11">1대 서버</text>
  <rect x="118" y="130" width="74" height="30" rx="4" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <rect x="126" y="100" width="58" height="30" rx="4" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <line x1="155" y1="100" x2="155" y2="72" stroke="#333" stroke-width="2" marker-end="url(#nosql-scale-arrow)"/>
  <text x="155" y="210" text-anchor="middle" font-size="11" fill="#555">한 장비 성능(CPU·RAM) 증강</text>

  <line x1="310" y1="60" x2="310" y2="215" stroke="#ccc" stroke-width="1"/>

  <!-- Scale out -->
  <text x="465" y="52" text-anchor="middle" font-size="13" font-weight="bold">NoSQL · 수평 확장</text>
  <rect x="360" y="130" width="55" height="40" rx="4" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="387" y="155" text-anchor="middle" font-size="10">노드1</text>
  <rect x="425" y="130" width="55" height="40" rx="4" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="452" y="155" text-anchor="middle" font-size="10">노드2</text>
  <rect x="490" y="130" width="55" height="40" rx="4" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="517" y="155" text-anchor="middle" font-size="10">노드3</text>
  <line x1="548" y1="150" x2="576" y2="150" stroke="#333" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#nosql-scale-arrow)"/>
  <text x="590" y="154" text-anchor="middle" font-size="10" fill="#555">…</text>
  <text x="465" y="210" text-anchor="middle" font-size="11" fill="#555">저가 장비를 여러 대로 분산</text>
</svg>

## NoSQL 유형

| 유형 | 대표 DB | 구조 | 적합한 사용 사례 |
|------|---------|------|----------------|
| **Document** | MongoDB, CouchDB | JSON/BSON 문서 | 유연한 스키마, 빠른 개발 |
| **Key-Value** | Redis, DynamoDB | 키-값 쌍 | 캐싱, 세션, 리더보드 |
| **Column-Family** | Cassandra, HBase | 컬럼 단위 저장 | 대용량 쓰기, 시계열 |
| **Graph** | Neo4j, Neptune | 노드 + 엣지 | SNS 관계, 추천, 경로 탐색 |
| **Time-Series** | InfluxDB, TimescaleDB | 시간 순서 데이터 | 메트릭, 센서, 모니터링 |
| **Vector** | Qdrant, Pinecone | 고차원 벡터 | 의미 검색, RAG, 추천 |

## CAP 정리

분산 시스템은 세 가지 속성 중 동시에 두 가지만 보장할 수 있다.

| 속성 | 설명 |
|------|------|
| **C**onsistency | 모든 노드가 같은 데이터를 봄 |
| **A**vailability | 모든 요청에 응답 (실패 없음) |
| **P**artition tolerance | 네트워크 분리 상황에서도 동작 |

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <text x="240" y="26" text-anchor="middle" font-weight="bold" font-size="16">CAP 정리 삼각형</text>

  <!-- triangle -->
  <polygon points="240,60 70,300 410,300" fill="#f7f7f7" stroke="#333" stroke-width="2"/>

  <!-- vertices -->
  <circle cx="240" cy="60" r="30" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="240" y="58" text-anchor="middle" font-size="15" font-weight="bold">C</text>
  <text x="240" y="74" text-anchor="middle" font-size="9">일관성</text>

  <circle cx="70" cy="300" r="30" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="70" y="298" text-anchor="middle" font-size="15" font-weight="bold">A</text>
  <text x="70" y="314" text-anchor="middle" font-size="9">가용성</text>

  <circle cx="410" cy="300" r="30" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="410" y="298" text-anchor="middle" font-size="15" font-weight="bold">P</text>
  <text x="410" y="314" text-anchor="middle" font-size="9">분단 내성</text>

  <!-- edge labels -->
  <rect x="90" y="150" width="90" height="30" rx="6" fill="#f8d7da" stroke="#333" stroke-width="1.2"/>
  <text x="135" y="170" text-anchor="middle" font-size="12" font-weight="bold">CP</text>
  <text x="70" y="200" text-anchor="middle" font-size="9" fill="#555">A 포기</text>

  <rect x="300" y="150" width="90" height="30" rx="6" fill="#f8d7da" stroke="#333" stroke-width="1.2"/>
  <text x="345" y="170" text-anchor="middle" font-size="12" font-weight="bold">AP</text>
  <text x="410" y="200" text-anchor="middle" font-size="9" fill="#555">C 포기</text>

  <rect x="195" y="308" width="90" height="28" rx="6" fill="#e2e3e5" stroke="#333" stroke-width="1.2"/>
  <text x="240" y="327" text-anchor="middle" font-size="12" font-weight="bold">CA (이론상)</text>

  <text x="240" y="352" text-anchor="middle" font-size="11" fill="#c0392b">P는 분산에서 필수 → 현실 선택지는 삼각형의 두 변(CP · AP)뿐</text>
</svg>

> 네트워크 파티션은 현실에서 반드시 발생하므로, 실제 선택은 **CP vs AP**.
> (CA는 파티션이 없다고 가정한 단일 노드에서만 성립하는 이론적 조합)

| 조합 | 포기하는 것 | 예시 |
|------|------------|------|
| **CP** | 가용성 | MongoDB, HBase, ZooKeeper |
| **AP** | 일관성 | Cassandra, DynamoDB, CouchDB |

## PACELC 정리

CAP의 확장. 파티션이 없는 정상 상태에서도 Latency vs Consistency 트레이드오프 존재.

```
if Partition:  C vs A   (CAP 정리)
else:          L vs C   (지연 vs 일관성)
```

| DB | 파티션 시 | 정상 시 |
|----|----------|--------|
| Cassandra | AP | EL (지연 우선) |
| MongoDB | CP | EC (일관성 우선) |
| DynamoDB | AP | EL |

## BASE

NoSQL의 일관성 모델.

| 개념 | 설명 |
|------|------|
| **B**asically Available | 항상 응답 (일부 실패 허용) |
| **S**oft State | 입력 없어도 시간이 지나면 상태 변할 수 있음 |
| **E**ventually Consistent | 결국에는 일관성 도달 |

## 선택 가이드

```
복잡한 관계 & 정합성 중요     → PostgreSQL, MySQL
유연한 스키마, 빠른 개발      → MongoDB
캐싱, 세션, 실시간 순위       → Redis
대용량 쓰기, 고가용성         → Cassandra
메트릭, 센서, 시계열 데이터   → InfluxDB, TimescaleDB
의미 검색, AI/LLM 연동        → Qdrant, pgvector
관계 탐색, 그래프 분석        → Neo4j
```
