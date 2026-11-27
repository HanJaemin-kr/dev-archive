---
title: "하네스 설계의 진화: Level 0 → Level 5"
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

# 하네스 설계의 진화: Level 0 → Level 5

기초적인 직접 호출부터 프로덕션급 이상적 설계까지 단계별로 살펴본다.

---

## Level 0: 직접 호출 (Don't do this)

```python
import requests
response = requests.post(
    "http://<IP>:<PORT>/v1/chat/completions",
    headers={"Authorization": "Bearer sk-xxx..."},
    json={"model": "qwen", "messages": [{"role":"user","content":"hi"}]}
).json()
print(response["choices"][0]["message"]["content"])
```

**문제점:**
- API 키가 코드에 노출
- 엔드포인트 하드코딩
- 실패 시 그냥 죽음
- 로그 없음
- 같은 코드가 곳곳에 복붙됨

---

## Level 1: 함수로 감싸기

```python
def chat(messages):
    response = requests.post(URL, headers=HEADERS, json={...})
    return response.json()["choices"][0]["message"]["content"]
```

**얻은 것:** 호출부 단순화
**여전한 문제:** 설정 분리 안 됨, 에러 처리 없음

---

## Level 2: 클래스 + 설정 분리 ⭐ (현재 우리 하네스의 출발점)

```python
class LLMConfig:
    base_url: str = os.getenv("QWEN_BASE_URL")
    api_key: str = os.getenv("QWEN_API_KEY")
    model: str = "qwen"

class LLMClient:
    def __init__(self, config):
        self.config = config

    def chat(self, messages):
        # API 호출
```

**얻은 것:**
- 환경별 설정 분리 (dev/staging/prod)
- 객체 주입으로 테스트 가능
- 설정 한 곳에서 관리

**여전한 문제:** 일시적 네트워크 장애에 무방비

---

## Level 3: 신뢰성 추가 ⭐ (현재 우리 하네스 수준)

```python
class LLMClient:
    def chat(self, messages):
        for attempt in range(self.max_retries):
            try:
                return self._call(messages)
            except HTTPError as e:
                if e.code in (500, 502, 503, 504):
                    time.sleep(2 ** attempt)  # exponential backoff
                    continue
                raise
        raise LLMError("Max retries exceeded")
```

**추가된 기능:**
- **Exponential Backoff**: 1초 → 2초 → 4초로 점진적 대기
- **Selective Retry**: 4xx는 재시도 안 함 (영구 실패)
- **타임아웃**: 무한 대기 방지

**프롬프트 관리도 분리:**
```python
class PromptTemplate:
    def render(self, **vars): return self.template.format(**vars)
```

**구조화 로깅도 추가:**
```python
{"timestamp":"...", "level":"INFO", "request_id":"abc",
 "tokens": 150, "latency_ms": 234}
```

---

## Level 4: 관찰성과 안전성 (이상적 설계의 시작)

```python
class LLMClient:
    def __init__(self, config, metrics, tracer, cache):
        self.metrics = metrics      # Prometheus
        self.tracer = tracer        # OpenTelemetry
        self.cache = cache          # Redis

    @trace_span("llm.chat")
    def chat(self, messages):
        # 1) 캐시 조회
        if cached := self.cache.get(hash(messages)):
            self.metrics.increment("llm.cache_hit")
            return cached

        # 2) 입력 검증 (PII 마스킹, 토큰 한도 체크)
        messages = self.sanitizer.clean(messages)

        # 3) Rate Limiter
        self.rate_limiter.acquire()

        # 4) 호출 + 메트릭
        with self.metrics.timer("llm.latency"):
            result = self._call_with_retry(messages)

        # 5) 출력 필터링 (욕설, 민감 정보)
        result = self.output_filter.scan(result)

        # 6) 캐시 저장
        self.cache.set(hash(messages), result, ttl=3600)

        return result
```

**Level 4의 핵심 개념:**

### A. 캐싱(Caching)
같은 질문이 반복되면 LLM 호출 비용 0. 의미적 캐싱(semantic cache)은 임베딩 유사도로 비슷한 질문도 매칭.

### B. Rate Limiting
```python
# 토큰 버킷 알고리즘
class TokenBucket:
    def acquire(self): ...  # 초당 N개 요청만 허용
```

### C. 입출력 검증
- **입력**: PII(주민번호, 카드번호) 마스킹, 프롬프트 인젝션 탐지
- **출력**: 환각(hallucination) 검증, 욕설 필터, JSON 스키마 검증

### D. 분산 트레이싱
```
[Request] → [Harness] → [Cache] → [LLM Server] → [Response]
   ↑           ↑           ↑           ↑              ↑
   └───── trace_id 공유, 각 단계 latency 측정 ──────┘
```

### E. 메트릭 수집
- `llm_request_total{model="qwen", status="success"}`
- `llm_token_usage{type="prompt"}`
- `llm_latency_seconds{quantile="0.99"}`

---

## Level 5: 이상적 엔터프라이즈 설계 🎯

```
┌──────────────────────────────────────────────────────────┐
│                    Application Layer                      │
└────────────┬─────────────────────────────────────────────┘
             ▼
┌──────────────────────────────────────────────────────────┐
│                     Gateway / Router                      │
│  • A/B 테스트 (50% Qwen, 50% GPT-4)                      │
│  • 모델 라우팅 (간단한 질문→작은 모델, 복잡한 질문→큰 모델) │
│  • 폴백 (Qwen 실패 → GPT-4 자동 전환)                     │
└────────────┬─────────────────────────────────────────────┘
             ▼
┌──────────────────────────────────────────────────────────┐
│                       Middleware                          │
│  ┌─────────────┬─────────────┬──────────────────────┐    │
│  │ Auth        │ Rate Limit  │ Quota (사용자별)     │    │
│  │ Cache       │ Sanitizer   │ Cost Tracker         │    │
│  └─────────────┴─────────────┴──────────────────────┘    │
└────────────┬─────────────────────────────────────────────┘
             ▼
┌──────────────────────────────────────────────────────────┐
│                    Core Harness                           │
│  ┌──────────┬──────────┬──────────┬──────────────────┐   │
│  │ Client   │ Prompt   │ Pipeline │ Tools (Function) │   │
│  │ Streaming│ Memory   │ Agent    │ RAG Connector    │   │
│  └──────────┴──────────┴──────────┴──────────────────┘   │
└────────────┬─────────────────────────────────────────────┘
             ▼
┌──────────────────────────────────────────────────────────┐
│                   Observability                           │
│   Logs (JSON) │ Metrics (Prometheus) │ Traces (OTel)     │
│   Eval Suite  │ Replay/Audit Log     │ Alert Manager     │
└──────────────────────────────────────────────────────────┘
```

### Level 5 핵심 컴포넌트

#### 1. Model Router
요청 특성에 따라 다른 모델로 라우팅. 간단한 분류 질문은 Qwen-3B로, 복잡한 추론은 Qwen-27B로. **비용 70% 절감 가능.**

#### 2. Fallback Chain
```python
chain = FallbackChain([qwen_27b, qwen_7b, gpt4])
result = chain.invoke(messages)  # 첫 번째 실패 시 다음 모델로
```

#### 3. Memory Layer
- **Short-term**: 현재 대화의 컨텍스트 윈도우 관리(요약/슬라이딩 윈도우)
- **Long-term**: 사용자별 선호도, 과거 대화 임베딩 저장

#### 4. Tool Use / Function Calling
```python
@tool
def get_weather(city: str) -> str: ...

agent = Agent(client, tools=[get_weather])
agent.run("서울 날씨 알려줘")  # 모델이 함수 호출 → 실행 → 결과 반영
```

#### 5. RAG Connector
```python
rag_pipeline = (
    Pipeline()
    .add_step(Retrieve(vector_db, top_k=5))
    .add_step(Rerank(cross_encoder))
    .add_step(Generate(llm, template="rag_qa"))
)
```

#### 6. Evaluation Suite
- **자동 평가**: 골든 데이터셋 1000건에 대해 매일 회귀 테스트
- **메트릭**: Accuracy, BLEU, BERTScore, LLM-as-a-Judge
- **CI 게이트**: 평가 점수 임계치 미달 시 배포 차단

#### 7. Cost Tracking
```python
{
    "user_id": "u123",
    "request_id": "abc",
    "model": "qwen-27b",
    "prompt_tokens": 1500,
    "completion_tokens": 300,
    "cost_usd": 0.012,
    "department": "sales"
}
```
부서별/사용자별 비용 청구, 월별 한도 강제.

#### 8. Audit Log / Replay
모든 입출력을 immutable 로그로 저장. 사고 발생 시 정확히 재현 가능. 규제 산업(금융, 의료)에서 필수.

---

## 진화 단계 정리

| Level | 핵심 추가 | 우리 하네스 위치 |
|-------|-----------|------------------|
| 0 | 직접 호출 | ❌ |
| 1 | 함수 추출 | ❌ |
| 2 | 클래스 + 설정 분리 | ✅ |
| 3 | 재시도 + 로깅 + 프롬프트/파이프라인 | ✅ ← **현재** |
| 4 | 캐시 + Rate Limit + 트레이싱 + 검증 | 🎯 다음 |
| 5 | 라우팅 + Fallback + Tool + RAG + Eval | 🎯 최종 목표 |

---

## 실무 조언: 어디까지 만들 것인가?

> 처음부터 Level 5를 만들지 마라. **YAGNI(You Ain't Gonna Need It)** 원칙이 LLM 시스템에서도 통한다.

**단계적 도입 전략:**

1. **MVP 단계(Level 2-3)**: 우리가 지금 만든 수준. 작동하는 챗봇 하나 출시
2. **Pilot 단계(Level 4)**: 실사용자 100명 → 캐시·메트릭으로 비용·성능 측정
3. **Scale 단계(Level 5)**: 수천 명 → 라우팅·평가·감사 추가

각 단계마다 **"이게 정말 필요한가?"** 를 자문하는 게 핵심이다.
