---
title: Vector DB 기초
domain: database
category: vector-db
tags: [database, vector-db]
level: intermediate
status: published
created: 2026-07-16
updated: 2026-07-16
velog: true
related: []
---

# Vector DB 기초

## 개념

텍스트, 이미지, 오디오 등을 **임베딩(Embedding)** — 고차원 실수 벡터 — 으로 변환해 저장하고, 의미적 유사도 기반으로 검색하는 DB.

```
"강아지" → [0.12, -0.34, 0.87, ..., 0.05]  (1536차원)
"퍼피"   → [0.11, -0.33, 0.89, ..., 0.04]  (비슷한 벡터)
"자동차" → [-0.45, 0.67, -0.23, ..., 0.78] (다른 벡터)
```

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 320" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="vdb-emb-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="330" y="24" text-anchor="middle" font-weight="bold" font-size="16">임베딩 → 벡터공간 → 최근접 이웃(ANN) 검색</text>

  <!-- raw text -->
  <rect x="20" y="60" width="120" height="34" rx="6" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="80" y="82" text-anchor="middle" font-size="12">"강아지"</text>
  <rect x="20" y="150" width="120" height="34" rx="6" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="80" y="172" text-anchor="middle" font-size="12">"퍼피"</text>
  <rect x="20" y="240" width="120" height="34" rx="6" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="80" y="262" text-anchor="middle" font-size="12">"자동차"</text>

  <!-- embedding model -->
  <rect x="180" y="120" width="90" height="90" rx="8" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="225" y="160" text-anchor="middle" font-size="12">임베딩</text>
  <text x="225" y="178" text-anchor="middle" font-size="12">모델</text>
  <line x1="140" y1="77" x2="178" y2="140" stroke="#333" stroke-width="1.5" marker-end="url(#vdb-emb-arrow)"/>
  <line x1="140" y1="167" x2="178" y2="167" stroke="#333" stroke-width="1.5" marker-end="url(#vdb-emb-arrow)"/>
  <line x1="140" y1="257" x2="178" y2="192" stroke="#333" stroke-width="1.5" marker-end="url(#vdb-emb-arrow)"/>

  <!-- vector space (2D projection) -->
  <rect x="330" y="55" width="310" height="230" rx="8" fill="#f7f7f7" stroke="#333" stroke-width="1.5"/>
  <text x="485" y="76" text-anchor="middle" font-size="12" font-weight="bold">벡터 공간 (2D로 축약 표현)</text>
  <line x1="200" y1="167" x2="328" y2="150" stroke="#333" stroke-width="1.5" marker-end="url(#vdb-emb-arrow)"/>

  <!-- clustered dog vectors -->
  <circle cx="440" cy="130" r="8" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="440" y="118" text-anchor="middle" font-size="10">강아지</text>
  <circle cx="465" cy="150" r="8" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="490" y="150" text-anchor="middle" font-size="10">퍼피</text>

  <!-- query vector -->
  <circle cx="452" cy="140" r="6" fill="#c0392b" stroke="#333" stroke-width="1.5"/>
  <text x="452" y="182" text-anchor="middle" font-size="10" fill="#c0392b">쿼리 벡터</text>
  <!-- neighbor ring -->
  <circle cx="452" cy="140" r="35" fill="none" stroke="#c0392b" stroke-width="1.2" stroke-dasharray="4 3"/>

  <!-- far vector -->
  <circle cx="590" cy="245" r="8" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="590" y="233" text-anchor="middle" font-size="10">자동차</text>

  <text x="485" y="275" text-anchor="middle" font-size="10" fill="#555">가까운 벡터 = 의미가 유사</text>

  <text x="330" y="305" text-anchor="middle" font-size="11" fill="#555">쿼리를 같은 공간에 임베딩한 뒤, 가장 가까운 top-k 이웃을 찾는다 (ANN).</text>
</svg>

## 임베딩 (Embedding)

비정형 데이터를 벡터로 변환하는 과정.

```python
# OpenAI Embedding API
from openai import OpenAI

client = OpenAI()
response = client.embeddings.create(
    model="text-embedding-3-small",
    input="오늘 날씨가 맑고 기온이 높습니다."
)
vector = response.data[0].embedding  # 1536차원 float 배열
```

## 유사도 측정 방법

| 방법 | 공식 | 특징 |
|------|------|------|
| **Cosine Similarity** | `cos(θ) = A·B / (‖A‖‖B‖)` | 방향 기반, 크기 무관. 텍스트 검색에 주로 사용 |
| **Dot Product** | `A·B` | 빠름. 벡터가 정규화된 경우 코사인과 동일 |
| **Euclidean Distance** | `‖A-B‖` | 거리 기반. 값이 작을수록 유사 |

```python
import numpy as np

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
```

## ANN (Approximate Nearest Neighbor)

정확한 최근접 이웃 탐색은 O(N·d) — 수백만 벡터에선 너무 느림.  
ANN은 약간의 정확도를 포기하고 속도를 얻는 근사 탐색.

### 주요 알고리즘

| 알고리즘 | 방식 | 특징 |
|----------|------|------|
| **HNSW** (Hierarchical Navigable Small World) | 그래프 기반 | 고속, 높은 정확도, 메모리 사용 높음 |
| **IVF** (Inverted File Index) | 클러스터링 기반 | 메모리 효율적, 클러스터 수 튜닝 필요 |
| **PQ** (Product Quantization) | 벡터 압축 | 메모리 대폭 절감, 정확도 다소 하락 |
| **LSH** (Locality Sensitive Hashing) | 해시 기반 | 구현 단순, 정확도 낮음 |

## 기본 워크플로우

```python
# 1. 텍스트를 벡터로 변환
documents = ["Redis는 인메모리 DB다", "InfluxDB는 시계열 DB다", "PostgreSQL은 관계형 DB다"]
vectors = [embed(doc) for doc in documents]

# 2. 벡터 DB에 저장
for i, (doc, vec) in enumerate(zip(documents, vectors)):
    vector_db.upsert(id=f"doc_{i}", vector=vec, metadata={"text": doc})

# 3. 쿼리 벡터 생성
query = "시간 데이터 저장에 좋은 DB는?"
query_vector = embed(query)

# 4. 유사 문서 검색
results = vector_db.query(vector=query_vector, top_k=3)
# → "InfluxDB는 시계열 DB다" 가장 유사하게 나옴
```

## 메타데이터 필터링

벡터 유사도 검색 + 일반 필터 조합.

```python
results = vector_db.query(
    vector=query_vector,
    top_k=10,
    filter={
        "category": {"$eq": "database"},
        "date": {"$gte": "2024-01-01"}
    }
)
```

## RAG (Retrieval-Augmented Generation)

LLM의 한계(최신 정보 없음, 환각)를 보완하기 위해 Vector DB에서 관련 문서를 검색해 컨텍스트로 제공.

```
사용자 질문
    ↓
질문 임베딩
    ↓
Vector DB 유사 문서 검색
    ↓
[문서 내용 + 질문]을 LLM에 전달
    ↓
정확도 높은 답변 생성
```

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 180" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="vdb-rag-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="330" y="24" text-anchor="middle" font-weight="bold" font-size="16">RAG 파이프라인</text>

  <rect x="20" y="70" width="110" height="46" rx="8" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="75" y="92" text-anchor="middle" font-size="12">① 사용자</text>
  <text x="75" y="108" text-anchor="middle" font-size="12">질문</text>

  <rect x="170" y="70" width="110" height="46" rx="8" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="225" y="92" text-anchor="middle" font-size="12">② 질문</text>
  <text x="225" y="108" text-anchor="middle" font-size="12">임베딩</text>

  <rect x="320" y="70" width="120" height="46" rx="8" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="380" y="92" text-anchor="middle" font-size="12">③ Vector DB</text>
  <text x="380" y="108" text-anchor="middle" font-size="12">유사 문서 검색</text>

  <rect x="480" y="70" width="90" height="46" rx="8" fill="#f8d7da" stroke="#333" stroke-width="1.5"/>
  <text x="525" y="92" text-anchor="middle" font-size="12">④ LLM</text>
  <text x="525" y="108" text-anchor="middle" font-size="11">(문서+질문)</text>

  <rect x="600" y="70" width="45" height="46" rx="8" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="622" y="97" text-anchor="middle" font-size="12">⑤ 답변</text>

  <line x1="130" y1="93" x2="168" y2="93" stroke="#333" stroke-width="2" marker-end="url(#vdb-rag-arrow)"/>
  <line x1="280" y1="93" x2="318" y2="93" stroke="#333" stroke-width="2" marker-end="url(#vdb-rag-arrow)"/>
  <line x1="440" y1="93" x2="478" y2="93" stroke="#333" stroke-width="2" marker-end="url(#vdb-rag-arrow)"/>
  <line x1="570" y1="93" x2="598" y2="93" stroke="#333" stroke-width="2" marker-end="url(#vdb-rag-arrow)"/>

  <text x="330" y="150" text-anchor="middle" font-size="11" fill="#555">검색된 문서를 컨텍스트로 넣어 환각을 줄이고 최신 정보를 반영한다.</text>
</svg>
