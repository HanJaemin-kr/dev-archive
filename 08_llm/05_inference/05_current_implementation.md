---
title: 현재 jaemin 하네스 구현 분석
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

# 현재 jaemin 하네스 구현 분석

`level 3` (클래스 + 설정 + 재시도 + 로깅 + 프롬프트 + 파이프라인) 수준으로 구현되어 있다.

---

## 전체 구조

```
jaemin/
├── .env                    실제 환경변수 (Git 추적 X)
├── .env.example            템플릿
├── README.md
├── requirements.txt
├── docs/                   ← 학습 기록
│   ├── 00_overview.md
│   ├── 01_design_decisions.md
│   ├── 02_api_reference.md
│   ├── 03_harness_concept.md
│   ├── 04_design_evolution.md
│   └── 05_current_implementation.md  (this)
├── harness/                ← 핵심 라이브러리
│   ├── __init__.py
│   ├── config.py           설정
│   ├── client.py           LLM API 호출
│   ├── prompt.py           프롬프트 템플릿
│   ├── pipeline.py         다단계 처리
│   └── logger.py           구조화 로깅
└── examples/
    ├── basic_chat.py       기본 사용 예시
    └── streaming_chat.py   스트리밍 예시
```

---

## 모듈별 상세 분석

### 1. `harness/config.py` — 설정 관리

```python
@dataclass
class LLMConfig:
    base_url: str = os.getenv("QWEN_BASE_URL", "http://<IP>:<PORT>")
    api_key: str = os.getenv("QWEN_API_KEY", "")
    model: str = os.getenv("QWEN_MODEL", "qwen")
    timeout: int = int(os.getenv("QWEN_TIMEOUT", "120"))
    max_retries: int = int(os.getenv("QWEN_MAX_RETRIES", "3"))
    temperature: float = float(os.getenv("QWEN_TEMPERATURE", "0.7"))
    max_tokens: int = int(os.getenv("QWEN_MAX_TOKENS", "2048"))
```

**설계 포인트:**

| 요소 | 의도 |
|------|------|
| `@dataclass` | 보일러플레이트 제거 (`__init__`, `__repr__` 자동 생성) |
| `field(default_factory=lambda: os.getenv(...))` | 인스턴스 생성 시점에 env 읽기 |
| 환경변수 prefix `QWEN_` | 다른 모델 추가 시 충돌 방지 |
| 모든 값에 기본값 | 빠진 설정 있어도 동작 |

**개선 여지:**
- `pydantic.BaseSettings` 쓰면 타입 검증 자동화
- 다중 백엔드 지원하려면 `BackendConfig` 추상화 필요

---

### 2. `harness/logger.py` — 구조화 로깅

```python
class JSONFormatter(logging.Formatter):
    def format(self, record):
        log = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "message": record.getMessage(),
        }
        if hasattr(record, "extra"):
            log.update(record.extra)
        return json.dumps(log, ensure_ascii=False)
```

**왜 JSON 로깅?**
- ELK Stack, Grafana Loki, Datadog 등 로그 수집 도구가 JSON을 그대로 파싱
- `request_id` 필드로 분산 시스템에서 요청 추적 가능
- `grep` 대신 구조화 쿼리: `{level="ERROR", request_id="abc"}`

**`new_request_id()`**: UUID 앞 8자리만 사용. 충돌 가능성 매우 낮으면서 로그 가독성 좋음.

---

### 3. `harness/client.py` — LLM 클라이언트 (핵심)

#### chat() 메서드 흐름

```
사용자 호출 client.chat(messages)
    │
    ▼
[1] request_id 생성 → 로그 시작
    │
    ▼
[2] for attempt in 1..max_retries:
    │
    ▼
[3] HTTP POST → /v1/chat/completions
    │
    ├─ 성공: 응답 파싱, usage 로깅, 반환 ────► END
    │
    ├─ HTTPError: 본문 로깅
    │   └─ max_retries 도달 → LLMError 발생
    │   └─ 아니면 2^attempt 초 대기 후 재시도
    │
    └─ 기타 예외: 동일 처리
```

**Exponential Backoff:**
- 1차 실패 → 2초 대기
- 2차 실패 → 4초 대기
- 3차 실패 → 8초 대기 후 `LLMError` raise

#### stream() 메서드

```python
def stream(self, messages, **kwargs):
    # ...
    with urllib.request.urlopen(req) as resp:
        for raw_line in resp:
            line = raw_line.decode("utf-8").strip()
            if not line.startswith("data:"):
                continue
            payload = line[5:].strip()
            if payload == "[DONE]":
                break
            chunk = json.loads(payload)
            token = chunk["choices"][0].get("delta", {}).get("content", "")
            if token:
                yield token
```

**Server-Sent Events (SSE) 파싱:**
- llama.cpp가 `data: {...}\n\n` 형식으로 토큰 스트리밍
- `data:` 접두어 제거 후 JSON 파싱
- `delta.content`만 추출 (누적 텍스트가 아닌 증분 토큰)
- `[DONE]` 신호로 종료

**왜 `urllib`만 쓰나?**
- `requests`, `httpx` 의존성 없이 stdlib만으로 동작
- 단순 환경에서도 `pip install` 없이 즉시 실행 가능
- 프로덕션이라면 `httpx` 비동기 클라이언트 권장

---

### 4. `harness/prompt.py` — 프롬프트 템플릿 관리

```python
class PromptTemplate:
    def render(self, **kwargs):
        return self.template.format(**kwargs)

class PromptManager:
    _templates: Dict[str, PromptTemplate] = {}

    def register(self, name, template):
        self._templates[name] = PromptTemplate(template)

    def get(self, name):
        return self._templates[name]
```

**기본 등록 템플릿:**
- `system_default`: 일반 시스템 프롬프트
- `chain_of_thought`: "단계적으로 생각해" 유도
- `summarize`: 요약 템플릿

**왜 분리?**
- 프롬프트 수정 시 코드 손대지 않음
- 같은 템플릿을 여러 곳에서 재사용
- 향후 외부 YAML/JSON 파일 로드로 확장 가능

**개선 여지:**
- Jinja2 사용하면 조건문/반복문 가능 (`{% if %}`, `{% for %}`)
- 템플릿 버전 관리 (`summarize_v1`, `summarize_v2`)
- A/B 테스트용 변형 템플릿 자동 선택

---

### 5. `harness/pipeline.py` — 다단계 처리

```python
@dataclass
class Step:
    name: str
    template_name: str
    template_vars: Dict
    postprocess: Callable | None
    system_prompt: str

class Pipeline:
    def run(self, initial_input):
        current = initial_input
        results = []
        for step in self.steps:
            user_content = self.prompt_manager.render(step.template_name,
                                                      input=current,
                                                      **step.template_vars)
            output = self.client.chat([
                {"role": "system", "content": step.system_prompt},
                {"role": "user", "content": user_content},
            ])
            if step.postprocess:
                output = step.postprocess(output)
            results.append({"step": step.name, "input": current, "output": output})
            current = output
        return results
```

**왜 파이프라인?**
- 복잡한 작업을 작은 단계로 분해
- 각 단계 입출력 추적 가능
- 단계 추가/제거가 코드 한 줄

**예시 시나리오:**
```python
pipeline = (Pipeline()
    .add_step(Step("analyze", "chain_of_thought", {"question": "{input}"}))
    .add_step(Step("summarize", "summarize", {"text": "{input}", "language": "Korean"}))
)
results = pipeline.run("긴 문서 텍스트...")
# → [{step: "analyze", ...}, {step: "summarize", ...}]
```

**개선 여지:**
- 병렬 단계 (`fan-out`/`fan-in`)
- 조건부 분기 (이전 단계 결과에 따라 다음 단계 선택)
- 실패 시 부분 재실행

---

### 6. `examples/basic_chat.py` — 사용 패턴

```python
config = LLMConfig.from_env()
client = LLMClient(config)
response = client.chat([
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."},
])
```

**`from_env()` 패턴**: 환경변수 로드 책임을 명시. 테스트에서는 `LLMConfig(api_key="test")`처럼 직접 인자 전달.

---

## 검증 결과

| 테스트 | 결과 |
|--------|------|
| 하네스→LLM 서버 네트워크 연결 | ✅ |
| API 키 인증 | ✅ |
| 한국어 응답 생성 | ✅ |
| 스트리밍 토큰 출력 | ✅ |
| JSON 구조화 로그 출력 | ✅ |
| 재시도 로직 (의도적 실패 시) | ✅ |

---

## 다음에 뭘 추가할 수 있을까?

`04_design_evolution.md`의 Level 4를 향해 가려면:

1. **응답 캐싱** — `harness/cache.py` 추가, 동일 질문 → 즉시 반환
2. **메트릭 수집** — 토큰 사용량, latency 누적 카운터
3. **입력 검증** — 프롬프트 토큰 길이 사전 체크
4. **출력 검증** — JSON 응답 강제 시 스키마 검증
5. **비동기 클라이언트** — `aiohttp` 기반 `AsyncLLMClient`
6. **Tool/Function Calling** — `@tool` 데코레이터로 함수 등록
7. **RAG 통합** — 벡터 DB 검색 → context 주입 파이프라인

---

## 정리

현재 하네스는 **"학습용 베이스라인이자 작은 프로젝트의 MVP"** 로 충분한 수준이다.
- 의존성 거의 없음 (`python-dotenv`만)
- 코드량 적어 전체 흐름 파악 쉬움
- Enterprise 패턴(설정/로깅/재시도/파이프라인)을 압축적으로 담음

여기서부터 **실습으로 한 단계씩 Level을 올리는 것**이 학습 경로다.
