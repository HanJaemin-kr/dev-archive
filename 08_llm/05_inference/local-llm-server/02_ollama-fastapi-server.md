---
title: 로컬 LLM 서버 구축기 2편 — FastAPI로 Ollama API 서버 만들기
domain: llm
category: inference
tags: [llm, inference, ollama, fastapi, api-server]
level: intermediate
status: published
created: 2026-05-11
updated: 2026-11-27
velog: false
related: ["[[01_ollama-local-llm]]", "[[03_ollama-rag-pipeline]]", "[[04_ollama-agent]]", "[[05_ollama-harness-engineering]]", "[[rag-concepts]]"]
---

# 로컬 LLM 서버 구축기 2편 — FastAPI로 Ollama API 서버 만들기

> 1편에서 Ollama + Docker 환경을 구축했습니다. 이번 편에서는 FastAPI로 Ollama를 감싸는 API 서버를 만들어 실제 서비스 구조를 갖춥니다.

---

## 왜 FastAPI로 감싸나?

Ollama 자체도 REST API를 제공하므로 직접 호출할 수 있습니다. 그런데 실무에서는 부족합니다.

```
[AS-IS] 클라이언트 → Ollama (11434포트) 직접 호출
[TO-BE] 클라이언트 → FastAPI → Ollama
```

| 기능 | 설명 |
|------|------|
| **인증** | API 키 없으면 못 쓰게 막기 |
| **로깅** | 누가 뭘 물어봤는지 기록 |
| **RAG 연결** | 질문이 들어오면 DB 검색 후 Ollama에 전달 |
| **모델 교체** | 클라이언트 코드 수정 없이 내부 모델 교체 가능 |
| **에러 처리** | Ollama 오류를 깔끔하게 가공해서 반환 |
| **포트 통일** | 외부엔 8000포트만 노출, Ollama는 내부에 숨김 |

> Ollama = 주방(실제 요리), FastAPI = 홀 직원(주문 받고 검증하고 서빙)

나중에 RAG를 붙일 때도 FastAPI가 중간에 없으면 구조가 복잡해집니다.

---

## 최종 디렉토리 구조

```
llm-server/
├── docker-compose.yml
└── app/
    ├── Dockerfile
    ├── main.py
    └── requirements.txt
```

---

## 1단계 — FastAPI 앱 작성

### requirements.txt

```
fastapi
uvicorn
httpx
```

### main.py

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx

app = FastAPI()

OLLAMA_URL = "http://ollama:11434"

class ChatRequest(BaseModel):
    model: str = "qwen2.5:7b"
    prompt: str

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
```

**포인트:**
- `OLLAMA_URL = "http://ollama:11434"` — Docker 내부 네트워크에서 컨테이너명으로 통신
- `httpx.AsyncClient` — 비동기 HTTP 클라이언트 (FastAPI의 async와 궁합이 좋음)
- `timeout=120` — LLM 응답이 느릴 수 있으므로 넉넉하게 설정
- `"response" not in data` — Ollama 에러 응답 처리 (모델명 오류 등)

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 2단계 — docker-compose.yml 업데이트

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

  api:
    build: ./app
    container_name: llm-api
    restart: unless-stopped
    ports:
      - "8000:8000"
    depends_on:
      - ollama

volumes:
  ollama_data:
```

**포인트:**
- `depends_on: ollama` — api 컨테이너가 ollama보다 나중에 시작됨
- `build: ./app` — app 디렉토리의 Dockerfile로 이미지 빌드
- ollama는 외부에서 직접 접근할 필요 없으면 `ports` 제거해도 됨

---

## 3단계 — 실행

```bash
docker compose up -d --build
```

```
✔ Image llm-server-api Built
✔ Container ollama     Running
✔ Container llm-api    Started
```

---

## 4단계 — 테스트

### 헬스체크

```bash
curl http://localhost:8000/health
# {"status":"ok"}
```

### 채팅 API

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "안녕? 간단하게 자기소개 해줘"}'
```

```json
{
  "response": "안녕하세요! 저는 Qwen이라고 합니다. Alibaba Cloud에서 만든 대형 언어 모델로, 다양한 주제에 대해 대화할 수 있습니다."
}
```

---

## 삽질 기록

### 모델을 다시 받아야 했던 이유

`docker compose up --build` 시 ollama 컨테이너가 재생성되면서 이전에 받은 모델이 사라졌습니다.

원인은 처음에 볼륨 설정 전에 모델을 받았기 때문입니다.  
볼륨이 제대로 마운트된 상태에서 모델을 받으면 이후 재시작해도 유지됩니다.

볼륨 마운트 확인 방법:
```bash
docker inspect ollama | grep -A 10 Mounts
```

```json
{
  "Type": "volume",
  "Name": "llm-server_ollama_data",
  "Source": "/var/lib/docker/volumes/llm-server_ollama_data/_data",
  "Destination": "/root/.ollama"
}
```

### KeyError: 'response'

Ollama가 에러를 반환할 때 `response` 키가 없어서 발생한 에러입니다.

```json
{"error": "model 'qwen2.5:7b' not found"}
```

에러 응답에 대한 처리를 추가해서 해결했습니다.

```python
if "response" not in data:
    raise HTTPException(status_code=500, detail=data)
```

---

## 최종 구조 요약

```
클라이언트 (curl / 앱)
        ↓  POST /chat  (8000포트)
  FastAPI 서버
        ↓  내부 네트워크 통신
  Ollama  (11434포트)
        ↓
  NVIDIA A2 GPU × 2
        ↓
  qwen2.5:7b 모델
```

---

## 다음 편 예고

- RAG(Retrieval-Augmented Generation) 파이프라인 구축
- 문서 업로드 → 벡터 DB 저장 → 질문하면 문서 기반으로 답변
- LangChain + Chroma 연동

---

## 참고 링크

- [FastAPI 공식 문서](https://fastapi.tiangolo.com)
- [httpx 공식 문서](https://www.python-httpx.org)
- [Ollama API 문서](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [Docker Compose depends_on 문서](https://docs.docker.com/compose/how-tos/startup-order/)
