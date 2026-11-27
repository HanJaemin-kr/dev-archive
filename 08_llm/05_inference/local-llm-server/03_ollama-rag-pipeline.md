---
title: 로컬 LLM 서버 구축기 3편 — RAG 파이프라인 구현
domain: llm
category: inference
tags: [llm, inference, ollama, rag, chroma, embedding]
level: intermediate
status: published
created: 2026-05-11
updated: 2026-11-27
velog: false
related: ["[[01_ollama-local-llm]]", "[[02_ollama-fastapi-server]]", "[[04_ollama-agent]]", "[[05_ollama-harness-engineering]]", "[[rag-concepts]]"]
---

# 로컬 LLM 서버 구축기 3편 — RAG 파이프라인 구현

> 2편에서 FastAPI + Ollama 서버를 구축했습니다. 이번 편에서는 문서를 업로드하면 LLM이 해당 문서를 참고해서 답변하는 RAG 파이프라인을 구현합니다.

---

## RAG란?

**RAG(Retrieval-Augmented Generation)** — LLM이 모르는 정보를 외부 문서에서 찾아서 답변하게 하는 기술

```
[RAG 없이]
사용자: "3호 펌프 베어링 결함 언제 발생했어?"
LLM: "모릅니다" 또는 거짓말

[RAG 있으면]
사용자: "3호 펌프 베어링 결함 언제 발생했어?"
서버: 유지보수 문서에서 관련 내용 찾아서 LLM에 전달
LLM: "2024년 3월 15일에 발생했습니다"
```

---

## 전체 구조

```
[문서 저장 파이프라인]
TXT/PDF 업로드
        ↓
텍스트 추출
        ↓
청크 분할 (500자, overlap 50자)
        ↓
bge-m3로 벡터 변환
        ↓
Chroma에 저장

[질문 답변 파이프라인]
사용자 질문
        ↓
bge-m3로 질문 벡터 변환
        ↓
Chroma에서 유사 청크 top-3 검색
        ↓
프롬프트 조립 (청크 + 질문)
        ↓
qwen2.5:7b 답변 생성
```

---

## 최종 디렉토리 구조

```
llm-server/
├── docker-compose.yml
└── app/
    ├── Dockerfile
    ├── main.py
    ├── requirements.txt
    └── rag/
        ├── __init__.py
        ├── chunker.py    ← 텍스트 청크 분할
        ├── embedder.py   ← 벡터 변환
        └── retriever.py  ← Chroma 저장/검색
```

---

## 1단계 — Chroma 컨테이너 추가

### docker-compose.yml

```yaml
services:
  ollama:
    image: ollama/ollama
    container_name: ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]

  chroma:
    image: chromadb/chroma
    container_name: chroma
    restart: unless-stopped
    ports:
      - "8001:8000"
    volumes:
      - chroma_data:/chroma/chroma

  api:
    build: ./app
    container_name: llm-api
    restart: unless-stopped
    ports:
      - "8000:8000"
    depends_on:
      - ollama
      - chroma

volumes:
  ollama_data:
  chroma_data:
```

**Chroma 포트:** 컨테이너 내부는 8000, 외부는 8001로 노출 (FastAPI가 8000 사용 중이라 충돌 방지)

---

## 2단계 — 임베딩 모델 받기

```bash
docker exec -it ollama ollama pull bge-m3
```

**bge-m3를 선택한 이유:**
- 한국어 포함 다국어 지원
- 1024 차원으로 의미 표현이 정밀함
- Ollama에서 바로 실행 가능

**중요:** 문서 저장할 때와 질문할 때 반드시 같은 임베딩 모델을 사용해야 합니다. 다른 모델을 쓰면 벡터 공간이 달라져서 유사도 검색이 엉터리로 됩니다.

---

## 3단계 — RAG 모듈 작성

### chunker.py — 텍스트 청크 분할

```python
def split_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap

    return chunks
```

**overlap이 필요한 이유:**

```
[overlap 없이]
청크1: "...철수는 2024년에 입사했으며"
청크2: "영업팀 소속이다. 팀장을 맡고 있다"  ← 철수가 누군지 문맥 없음

[overlap 있이]
청크1: "...철수는 2024년에 입사했으며"
청크2: "철수는 2024년에 입사했으며 영업팀 소속이다."  ← 문맥 이어짐
```

### embedder.py — 텍스트 → 벡터 변환

```python
import httpx

OLLAMA_URL = "http://ollama:11434"

async def embed(text: str) -> list[float]:
    async with httpx.AsyncClient(timeout=60) as client:
        res = await client.post(
            f"{OLLAMA_URL}/api/embeddings",
            json={"model": "bge-m3", "prompt": text}
        )
    return res.json()["embedding"]
```

Ollama의 `/api/embeddings` 엔드포인트를 호출해서 텍스트를 1024차원 벡터로 변환합니다.

### retriever.py — Chroma 저장/검색

```python
import chromadb

client = chromadb.HttpClient(host="chroma", port=8000)
collection = client.get_or_create_collection(name="documents")

def save(chunks: list[str], embeddings: list[list[float]], source: str):
    ids = [f"{source}_{i}" for i in range(len(chunks))]
    collection.add(
        ids=ids,
        documents=chunks,
        embeddings=embeddings,
        metadatas=[{"source": source} for _ in chunks]
    )

def search(query_embedding: list[float], k: int = 3) -> list[str]:
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=k
    )
    return results["documents"][0]
```

**metadatas에 source를 저장하는 이유:**
- 답변 출처 표시 가능
- 특정 파일에서만 검색 가능 (`where={"source": "파일명"}`)
- 파일 교체 시 해당 파일 청크만 삭제 가능

---

## 4단계 — main.py 업데이트

```python
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import httpx

from rag.chunker import split_text
from rag.embedder import embed
from rag.retriever import save, search

app = FastAPI()

OLLAMA_URL = "http://ollama:11434"

class ChatRequest(BaseModel):
    model: str = "qwen2.5:7b"
    prompt: str

class RAGRequest(BaseModel):
    question: str
    k: int = 3

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/chat")
async def chat(req: ChatRequest):
    async with httpx.AsyncClient(timeout=120) as client:
        res = await client.post(
            f"{OLLAMA_URL}/api/generate",
            json={"model": req.model, "prompt": req.prompt, "stream": False}
        )
    data = res.json()
    if "response" not in data:
        raise HTTPException(status_code=500, detail=data)
    return {"response": data["response"]}

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    content = await file.read()
    text = content.decode("utf-8")

    # 1. 청크 분할
    chunks = split_text(text)

    # 2. 각 청크를 벡터로 변환
    embeddings = []
    for chunk in chunks:
        vector = await embed(chunk)
        embeddings.append(vector)

    # 3. Chroma에 저장
    save(chunks, embeddings, source=file.filename)

    return {"message": f"{file.filename} 저장 완료", "chunks": len(chunks)}

@app.post("/rag")
async def rag(req: RAGRequest):
    # 1. 질문을 벡터로 변환
    query_vector = await embed(req.question)

    # 2. Chroma에서 유사 청크 검색
    chunks = search(query_vector, k=req.k)

    # 3. 프롬프트 조립
    context = "\n\n".join([f"문서{i+1}: {c}" for i, c in enumerate(chunks)])
    prompt = f"""아래 문서를 참고해서 질문에 답해줘. 문서에 없는 내용은 모른다고 해줘.

{context}

질문: {req.question}"""

    # 4. Ollama에 전달
    async with httpx.AsyncClient(timeout=120) as client:
        res = await client.post(
            f"{OLLAMA_URL}/api/generate",
            json={"model": "qwen2.5:7b", "prompt": prompt, "stream": False}
        )
    data = res.json()
    if "response" not in data:
        raise HTTPException(status_code=500, detail=data)

    return {"response": data["response"], "sources": chunks}
```

**엔드포인트 정리:**

| 엔드포인트 | 역할 |
|-----------|------|
| `GET /health` | 서버 상태 확인 |
| `POST /chat` | 일반 LLM 채팅 |
| `POST /upload` | 문서 업로드 → 청크 → 벡터 → Chroma 저장 |
| `POST /rag` | 질문 → 검색 → LLM → 답변 |

---

## 5단계 — requirements.txt

```
fastapi
uvicorn
httpx
chromadb
python-multipart
```

`python-multipart` — 파일 업로드(`multipart/form-data`)를 처리하는 데 필요

---

## 6단계 — 실행 및 테스트

```bash
docker compose up -d --build
```

### 문서 업로드

```bash
curl -X POST http://localhost:8000/upload \
  -F "file=@vibration_maintenance.txt"
```

```json
{"message": "vibration_maintenance.txt 저장 완료", "chunks": 2}
```

### RAG 질문

```bash
curl -X POST http://localhost:8000/rag \
  -H "Content-Type: application/json" \
  -d '{"question": "베어링 결함이 발생했을 때 진동 패턴이 어떻게 돼?"}'
```

```json
{
  "response": "베어링 결함이 발생했을 때의 진동 패턴은 베어링 고유 주파수(BPFO, BPFI)에서 충격성 진동이 발생합니다.",
  "sources": ["...검색된 청크 내용..."]
}
```

---

## 삽질 기록

### ModuleNotFoundError: No module named 'rag'

Dockerfile에서 `COPY main.py .` 만 복사하고 `rag/` 폴더를 누락했습니다.

```dockerfile
# 잘못된 방법
COPY main.py .

# 올바른 방법
COPY . .  ← 전체 디렉토리 복사
```

### RuntimeError: Form data requires "python-multipart"

파일 업로드 시 `multipart/form-data` 처리를 위해 `python-multipart` 패키지가 별도로 필요합니다. `requirements.txt`에 추가해서 해결했습니다.

---

## 전체 시스템 구성도

```
[클라이언트]
     ↓
[FastAPI :8000]
  POST /upload  →  chunker → embedder → retriever.save()
  POST /rag     →  embedder → retriever.search() → Ollama
     ↓                  ↓
[Chroma :8001]    [Ollama :11434]
벡터 DB             qwen2.5:7b (답변)
                    bge-m3 (임베딩)
                         ↓
                   [NVIDIA A2 × 2]
```

---

## 다음 편 예고

- 에이전트(Agent) 구현
- LLM이 스스로 도구를 선택해서 실행
- 웹 검색, DB 조회 등을 LLM이 직접 판단해서 호출

---

## 참고 링크

- [Chroma 공식 문서](https://docs.trychroma.com)
- [bge-m3 모델 소개](https://huggingface.co/BAAI/bge-m3)
- [FastAPI 파일 업로드 문서](https://fastapi.tiangolo.com/tutorial/request-files/)
- [Ollama 임베딩 API](https://github.com/ollama/ollama/blob/main/docs/api.md#generate-embeddings)
