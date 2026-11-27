---
title: Vector DB 엔진 비교
domain: database
category: vector-db
tags: [database, vector-db]
level: intermediate
status: published
created: 2026-05-12
updated: 2026-05-12
velog: true
related: []
---

# Vector DB 엔진 비교

## 주요 엔진

| 엔진 | 형태 | 라이선스 | 특징 |
|------|------|---------|------|
| **Pinecone** | 클라우드 관리형 | 상용 | 완전 관리형, 간편한 시작 |
| **Qdrant** | 셀프호스팅 / 클라우드 | Apache 2.0 | Rust 구현, 고성능, 풍부한 필터 |
| **Weaviate** | 셀프호스팅 / 클라우드 | BSD | 멀티모달, GraphQL API |
| **Chroma** | 임베디드 / 셀프호스팅 | Apache 2.0 | 개발·프로토타입에 최적 |
| **Milvus** | 셀프호스팅 | Apache 2.0 | 대규모 프로덕션, 분산 아키텍처 |
| **pgvector** | PostgreSQL 확장 | OSS | 기존 PostgreSQL에 벡터 추가 |
| **FAISS** | 라이브러리 | MIT | Meta 개발, 메모리 내 ANN |

---

## Qdrant

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

client = QdrantClient(host="localhost", port=6333)

# 컬렉션 생성
client.create_collection(
    collection_name="documents",
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
)

# 데이터 삽입
client.upsert(
    collection_name="documents",
    points=[
        PointStruct(
            id=1,
            vector=[0.12, -0.34, ...],  # 1536차원
            payload={"text": "Redis는 인메모리 DB", "category": "database"}
        )
    ]
)

# 검색
results = client.search(
    collection_name="documents",
    query_vector=query_vector,
    limit=5,
    query_filter={"must": [{"key": "category", "match": {"value": "database"}}]}
)
```

---

## Chroma (개발/프로토타입)

```python
import chromadb

client = chromadb.Client()  # 메모리 내 (영속: PersistentClient)

collection = client.create_collection("documents")

# 삽입 (임베딩 자동 생성 가능)
collection.add(
    documents=["Redis는 인메모리 DB", "InfluxDB는 시계열 DB"],
    metadatas=[{"category": "database"}, {"category": "database"}],
    ids=["doc1", "doc2"]
)

# 텍스트로 직접 검색
results = collection.query(
    query_texts=["시간 데이터 저장"],
    n_results=3
)
```

---

## pgvector (PostgreSQL 확장)

기존 PostgreSQL에 벡터 검색 기능 추가. RDBMS와 벡터 검색을 한 곳에서.

```sql
-- 확장 설치
CREATE EXTENSION IF NOT EXISTS vector;

-- 벡터 컬럼 추가
CREATE TABLE documents (
  id      SERIAL PRIMARY KEY,
  content TEXT,
  embedding VECTOR(1536)
);

-- 데이터 삽입
INSERT INTO documents (content, embedding)
VALUES ('Redis는 인메모리 DB', '[0.12, -0.34, ...]');

-- 코사인 유사도 검색 (<=>) 
SELECT content, 1 - (embedding <=> '[쿼리벡터...]') AS similarity
FROM documents
ORDER BY embedding <=> '[쿼리벡터...]'
LIMIT 5;

-- 연산자
-- <->  Euclidean distance
-- <#>  Negative dot product
-- <=>  Cosine distance

-- HNSW 인덱스 생성 (검색 속도 향상)
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

---

## 선택 기준

```
프로토타입 / 로컬 개발
  → Chroma (설정 최소, 빠른 시작)

PostgreSQL 기반 서비스에 벡터 검색 추가
  → pgvector (별도 인프라 없음)

중대형 프로덕션, 셀프호스팅
  → Qdrant (성능 + 풍부한 필터링)

대규모 분산 환경
  → Milvus

인프라 관리 없이 빠른 프로덕션
  → Pinecone (비용 발생)
```

## 성능 튜닝 포인트

| 파라미터 | 설명 |
|----------|------|
| `m` (HNSW) | 그래프 연결 수. 높을수록 정확↑, 메모리↑ |
| `ef_construction` | 인덱스 구축 시 탐색 범위. 높을수록 품질↑, 구축 느림 |
| `ef` (검색 시) | 검색 정확도. 높을수록 정확↑, 속도↓ |
| 벡터 차원 | 작을수록 빠름. 모델 선택 시 trade-off 고려 |
