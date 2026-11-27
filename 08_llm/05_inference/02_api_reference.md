---
title: API 레퍼런스
domain: llm
category: inference
tags: [llm, inference]
level: intermediate
status: published
created: 2026-07-13
updated: 2026-07-13
velog: false
related: []
---

# API 레퍼런스

## Qwen 서버 (내부 LLM 서버)

### 엔드포인트
```
POST http://<IP>:<PORT>/v1/chat/completions
```

### 헤더
```
Content-Type: application/json
Authorization: Bearer {QWEN_API_KEY}
```

### 요청 본문
```json
{
  "model": "qwen",
  "messages": [
    {"role": "system", "content": "시스템 프롬프트"},
    {"role": "user", "content": "사용자 메시지"}
  ],
  "temperature": 0.7,
  "max_tokens": 2048,
  "stream": false
}
```

### 응답 (non-streaming)
```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "응답 텍스트"
      }
    }
  ],
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 100
  }
}
```

### 응답 (streaming)
```
data: {"choices":[{"delta":{"content":"토"}}]}
data: {"choices":[{"delta":{"content":"큰"}}]}
data: [DONE]
```

## 하네스 API

### LLMClient.chat()
```python
client = LLMClient()
response = client.chat(
    messages=[{"role": "user", "content": "질문"}],
    temperature=0.7,
    max_tokens=1024
)
# → str: 응답 텍스트
```

### LLMClient.stream()
```python
for token in client.stream(messages):
    print(token, end="", flush=True)
```

### Pipeline.run()
```python
pipeline = Pipeline()
pipeline.add_step(Step(name="analyze", template_name="chain_of_thought",
                       template_vars={"question": "{input}"}))
results = pipeline.run(initial_input="입력 텍스트")
# → [{"step": "analyze", "input": "...", "output": "..."}]
```
