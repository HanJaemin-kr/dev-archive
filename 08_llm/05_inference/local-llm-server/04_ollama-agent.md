---
title: 로컬 LLM 서버 구축기 4편 — 에이전트(Agent) 구현
domain: llm
category: inference
tags: [llm, inference, ollama, agent, tool-calling, react]
level: intermediate
status: published
created: 2026-05-11
updated: 2026-11-27
velog: false
related: ["[[01_ollama-local-llm]]", "[[02_ollama-fastapi-server]]", "[[03_ollama-rag-pipeline]]", "[[05_ollama-harness-engineering]]", "[[rag-concepts]]"]
---

# 로컬 LLM 서버 구축기 4편 — 에이전트(Agent) 구현

> 3편에서 RAG 파이프라인을 구축했습니다. 이번 편에서는 LLM이 스스로 도구를 선택하고 실행하는 에이전트를 구현합니다.

---

## 에이전트란?

지금까지 만든 RAG는 이렇습니다.

```
사용자 질문 → 문서 검색 → LLM → 답변
```

항상 문서 검색만 합니다. 수동적이에요.

에이전트는 다릅니다.

```
사용자 질문 → LLM이 스스로 판단 → 필요한 도구 선택 → 실행 → 답변
```

**"3호 펌프 마지막 점검일이 며칠 전이야?"** 라는 질문을 받으면

```
1. 점검일은 문서에 있겠다  → search_docs 호출
2. 오늘 날짜는 모른다      → get_current_time 호출
3. 날짜 차이 계산          → calculate 호출
```

LLM이 스스로 판단해서 필요한 도구만 골라 씁니다.

---

## RAG vs 에이전트

| | RAG | 에이전트 |
|--|-----|---------|
| 도구 선택 | 항상 문서 검색만 | 상황에 따라 다른 도구 선택 |
| 사고 과정 | 없음 | 스스로 판단 |
| 다단계 처리 | 불가 | 여러 도구 연속 호출 가능 |

RAG는 에이전트가 사용하는 **도구 중 하나**입니다.

```
에이전트
├── 도구1: search_docs    ← RAG (벡터 DB 검색)
├── 도구2: get_current_time
├── 도구3: calculate
└── 도구N: ...            ← 얼마든지 추가 가능
```

---

## 도구(Tool) 설계 원칙

도구는 3가지로 구성됩니다.

```python
{
    "name": "search_docs",
    "description": "사내 문서에서 정보를 검색합니다.",  # LLM이 읽고 언제 쓸지 판단
    "function": search_docs_func                        # 실제 실행할 함수
}
```

**description이 가장 중요합니다.** LLM이 이걸 읽고 어떤 도구를 쓸지 결정하기 때문입니다.

```
나쁜 예: "정보를 검색합니다"
좋은 예: "사내 설비 매뉴얼에서 정보를 검색합니다. 진동 기준값, 점검 이력 등을 찾을 때 사용하세요."
```

---

## 디렉토리 구조

```
llm-server/
└── app/
    ├── main.py
    ├── rag/
    │   ├── chunker.py
    │   ├── embedder.py
    │   └── retriever.py
    └── agent/              ← 새로 추가
        ├── __init__.py
        ├── tools.py        ← 도구 정의
        └── runner.py       ← 에이전트 루프
```

---

## 1단계 — tools.py

```python
from datetime import datetime
from rag.embedder import embed
from rag.retriever import search

async def search_docs(query: str) -> str:
    vector = await embed(query)
    chunks = search(vector, k=3)
    return "\n\n".join(chunks)

async def get_current_time(_: str = "") -> str:
    return datetime.now().strftime("%Y년 %m월 %d일 %H시 %M분")

async def calculate(expression: str) -> str:
    try:
        result = eval(expression)
        return str(result)
    except Exception as e:
        return f"계산 실패: {str(e)}"

TOOLS = [
    {
        "name": "search_docs",
        "description": "사내 문서에서 정보를 검색합니다. 설비 매뉴얼, 점검 이력, 기준값 등을 찾을 때 사용하세요.",
        "function": search_docs
    },
    {
        "name": "get_current_time",
        "description": "현재 날짜와 시간을 반환합니다. 날짜 관련 질문이 있을 때 먼저 호출하세요.",
        "function": get_current_time
    },
    {
        "name": "calculate",
        "description": "수식을 계산합니다. 숫자 연산이 필요할 때 사용하세요. 예) '8.5 - 7.1'",
        "function": calculate
    }
]
```

---

## 2단계 — runner.py (Ollama Tool Calling 활용)

### 처음 구현한 방식 (텍스트 파싱)

처음에는 LLM에게 텍스트 형식으로 응답하도록 유도했습니다.

```python
# 프롬프트로 형식 강제
"도구를 사용하려면 아래 형식으로 응답하세요.\nTOOL: 도구이름\nINPUT: 입력값"

# 텍스트 파싱
if response.startswith("TOOL:"):
    tool_name = ...  # 직접 파싱
```

**문제점:**
- LLM이 형식을 안 지키면 파싱 실패
- 중국어로 응답하거나 도구 호출 문법이 답변에 섞여 나옴
- 7B 모델의 한계로 불안정

### 개선된 방식 (Ollama Native Tool Calling)

Ollama의 `/api/chat` 엔드포인트는 OpenAI 호환 Tool Calling을 지원합니다. 도구를 JSON 스펙으로 넘기면 구조화된 형태로 응답합니다.

```python
TOOL_SPECS = [
    {
        "type": "function",
        "function": {
            "name": "search_docs",
            "description": "사내 문서에서 정보를 검색합니다.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "검색할 내용"}
                },
                "required": ["query"]
            }
        }
    },
    ...
]
```

응답이 이렇게 구조화되어 나옵니다.

```json
{
  "message": {
    "role": "assistant",
    "tool_calls": [
      {
        "function": {
          "name": "search_docs",
          "arguments": {"query": "3호 펌프 마지막 점검일"}
        }
      }
    ]
  }
}
```

텍스트 파싱이 사라지고 JSON으로 바로 처리합니다.

### runner.py 전체 코드

```python
import httpx
from agent.tools import TOOLS

OLLAMA_URL = "http://ollama:11434"

TOOL_SPECS = [
    {
        "type": "function",
        "function": {
            "name": "search_docs",
            "description": "사내 문서에서 정보를 검색합니다. 설비 매뉴얼, 점검 이력, 기준값 등을 찾을 때 사용하세요.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "검색할 내용"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_current_time",
            "description": "현재 날짜와 시간을 반환합니다. 날짜 관련 질문이 있을 때 먼저 호출하세요.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "calculate",
            "description": "수식을 계산합니다. 숫자 연산이 필요할 때 사용하세요.",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {"type": "string", "description": "계산할 수식"}
                },
                "required": ["expression"]
            }
        }
    }
]

async def execute_tool(name: str, arguments: dict) -> str:
    for tool in TOOLS:
        if tool["name"] == name:
            if name == "search_docs":
                return await tool["function"](arguments.get("query", ""))
            elif name == "get_current_time":
                return await tool["function"]()
            elif name == "calculate":
                return await tool["function"](arguments.get("expression", ""))
    return f"도구 '{name}'를 찾을 수 없습니다."

async def run_agent(question: str) -> dict:
    tool_logs = []
    messages = [
        {
            "role": "system",
            "content": "당신은 도구를 사용하는 한국어 에이전트입니다. 반드시 한국어로만 답변하세요."
        },
        {
            "role": "user",
            "content": question
        }
    ]

    async with httpx.AsyncClient(timeout=120) as client:
        for i in range(10):
            res = await client.post(
                f"{OLLAMA_URL}/api/chat",
                json={
                    "model": "qwen2.5:7b",
                    "messages": messages,
                    "tools": TOOL_SPECS,
                    "stream": False
                }
            )
            data = res.json()
            message = data["message"]

            # 도구 호출 없으면 최종 답변
            if not message.get("tool_calls"):
                return {"answer": message["content"], "steps": tool_logs}

            # 도구 호출 있으면 실행
            messages.append(message)

            for tool_call in message["tool_calls"]:
                name = tool_call["function"]["name"]
                arguments = tool_call["function"]["arguments"]

                result = await execute_tool(name, arguments)
                tool_logs.append({
                    "step": i + 1,
                    "tool": name,
                    "input": arguments,
                    "result": result
                })

                messages.append({
                    "role": "tool",
                    "content": result
                })

    return {"answer": "에이전트가 답변을 완성하지 못했습니다.", "steps": tool_logs}
```

---

## 3단계 — main.py에 에이전트 엔드포인트 추가

```python
from agent.runner import run_agent

class AgentRequest(BaseModel):
    question: str

@app.post("/agent")
async def agent(req: AgentRequest):
    result = await run_agent(req.question)
    return result
```

---

## 4단계 — 테스트

```bash
curl -X POST http://localhost:8000/agent \
  -H "Content-Type: application/json" \
  -d '{"question": "3호 펌프 마지막 점검일이 언제야? 그리고 오늘 기준으로 며칠 지났어?"}'
```

```json
{
  "answer": "3호 펌프의 마지막 점검일은 2024년 3월 15일입니다.",
  "steps": [
    {"step": 1, "tool": "search_docs", "input": {"query": "3호 펌프 점검 일정"}, "result": "..."},
    {"step": 2, "tool": "get_current_time", "input": {}, "result": "2026년 05월 11일"},
    {"step": 3, "tool": "calculate", "input": {"expression": "..."}, "result": "..."}
  ]
}
```

`steps`에 에이전트가 어떤 도구를 어떤 순서로 호출했는지 기록됩니다.

---

## 삽질 기록

### 텍스트 파싱 방식의 한계

처음에는 프롬프트로 `TOOL: 도구이름 / INPUT: 입력값` 형식을 강제했습니다.

문제는 7B 모델이 형식을 제대로 안 지켜서 파싱이 자주 깨졌습니다.

```
LLM 응답 예시 (망가진 경우):
"TOOL: search_docs
INPUT: 3호 펌프 最后一次检查  ← 중국어 혼용
```

### Ollama Tool Calling으로 해결

`/api/generate` → `/api/chat` + `tools` 파라미터로 변경했습니다.

LLM이 도구 호출을 텍스트가 아닌 JSON으로 반환하기 때문에 파싱 실패가 없어졌고, 한국어 검색 쿼리도 안정적으로 생성됩니다.

```
기존: "INPUT: 3호 펌프 最后一次检查"  ← 중국어 혼용
개선: {"query": "3호 펌프 점검 일정"}  ← 한국어 정상
```

### 7B 모델의 에이전트 한계

Tool Calling으로 형식 문제는 해결됐지만 **복잡한 추론은 여전히 부족**합니다.

문서에서 특정 설비 정보만 정확히 골라내는 능력이 7B 모델에서는 불안정합니다.

| 모델 크기 | 에이전트 성능 |
|-----------|-------------|
| 7B | 단순 도구 선택 가능, 복잡한 추론 부족 |
| 32B | 안정적인 에이전트 동작 |
| 70B+ | 높은 정확도 |

A2 GPU 30GB VRAM 환경에서 `qwen2.5:32b` (4bit 양자화, 약 20GB) 실행이 가능합니다.

---

## 전체 시스템 구성도

```
[클라이언트]
     ↓
[FastAPI :8000]
  POST /chat    → 일반 LLM 채팅
  POST /upload  → 문서 업로드 → RAG 파이프라인
  POST /rag     → 문서 기반 질문 답변
  POST /agent   → 에이전트 (도구 선택 + 실행)
     ↓                    ↓
[Chroma :8001]      [Ollama :11434]
벡터 DB               qwen2.5:7b (답변)
                      bge-m3 (임베딩)
                           ↓
                     [NVIDIA A2 × 2]
```

---

## 다음 편 예고

- `qwen2.5:32b`로 모델 업그레이드
- 에이전트 정확도 개선 확인
- Docker로 전체 서비스 묶기 완성

---

## 참고 링크

- [Ollama Tool Calling 문서](https://ollama.com/blog/tool-support)
- [Ollama API /api/chat](https://github.com/ollama/ollama/blob/main/docs/api.md#chat)
- [ReAct 패턴 논문](https://arxiv.org/abs/2210.03629)
- [OpenAI Function Calling (호환 참고)](https://platform.openai.com/docs/guides/function-calling)
