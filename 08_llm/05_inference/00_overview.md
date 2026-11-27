---
title: LLM 하네스 시스템 개요
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

# LLM 하네스 시스템 개요

## 목적

내부 LLM 서버에서 실행 중인 Qwen3.5-27B 모델을 연결하는 enterprise 수준의 LLM 하네스 구현 실습.

## 시스템 구성

```
[하네스 서버]  →  HTTP  →  [LLM 서버: Qwen3.5-27B]
     harness/                    llama.cpp server
     examples/                   port <PORT>
     docs/                       OpenAI-compatible API
```

## 아키텍처 레이어

| 레이어 | 파일 | 역할 |
|--------|------|------|
| 설정 | `harness/config.py` | 환경변수 기반 설정 관리 |
| 로깅 | `harness/logger.py` | JSON 구조화 로그 |
| 클라이언트 | `harness/client.py` | API 호출, 재시도, 스트리밍 |
| 프롬프트 | `harness/prompt.py` | 템플릿 관리 |
| 파이프라인 | `harness/pipeline.py` | 다단계 처리 체인 |

## 데이터 흐름

```
사용자 입력
   ↓
PromptManager (템플릿 렌더링)
   ↓
LLMClient (API 호출 + 재시도)
   ↓
Qwen3.5-27B on 내부 LLM 서버
   ↓
응답 파싱 + 로깅
   ↓
Pipeline 다음 단계 (또는 최종 출력)
```

## 모델 정보

- 모델명: Qwen3.5-27B-Q5_K_M (GGUF 양자화)
- 엔드포인트: `http://<IP>:<PORT>`
- API 형식: OpenAI-compatible
- 유효 컨텍스트: ~16K tokens
- GPU: NVIDIA A10 x2
