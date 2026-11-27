---
title: inference 인덱스
domain: llm
category: inference
generated: true
---

# 08_llm/05_inference 인덱스

<!-- AUTO:BEGIN — build_index.py가 생성/관리합니다. 직접 편집하지 말고 `python scripts/build_index.py`로 재생성하세요. -->

## 노트

| 노트 | 요약 |
|------|------|
| [[08_llm/05_inference/00_overview|LLM 하네스 시스템 개요]] | 내부 LLM 서버에서 실행 중인 Qwen3.5-27B 모델을 연결하는 enterprise 수준의 LLM 하네스 구현 실습. |
| [[08_llm/05_inference/01_design_decisions|설계 결정 근거]] | 결정: API 키, 엔드포인트를 .env 파일로 분리, 코드에 하드코딩 금지 |
| [[08_llm/05_inference/02_api_reference|API 레퍼런스]] |  |
| [[08_llm/05_inference/03_harness_concept|LLM 하네스(Harness)란?]] | 하네스(Harness) 는 원래 "마구(馬具)" 를 뜻한다. 말에 안장과 고삐를 채워서 사람이 통제할 수 있게 만드는 장치다. |
| [[08_llm/05_inference/04_design_evolution|하네스 설계의 진화: Level 0 → Level 5]] | 기초적인 직접 호출부터 프로덕션급 이상적 설계까지 단계별로 살펴본다. |
| [[08_llm/05_inference/05_current_implementation|현재 jaemin 하네스 구현 분석]] | level 3 (클래스 + 설정 + 재시도 + 로깅 + 프롬프트 + 파이프라인) 수준으로 구현되어 있다. |
| [[08_llm/05_inference/local-llm-server/01_ollama-local-llm|로컬 LLM 서버 구축기 1편 — Docker + Ollama + GPU 환경 세팅]] | ChatGPT나 Claude 같은 API를 쓰면 편하지만 기업 환경에서는 제약이 많습니다. |
| [[08_llm/05_inference/local-llm-server/02_ollama-fastapi-server|로컬 LLM 서버 구축기 2편 — FastAPI로 Ollama API 서버 만들기]] | Ollama 자체도 REST API를 제공하므로 직접 호출할 수 있습니다. 그런데 실무에서는 부족합니다. |
| [[08_llm/05_inference/local-llm-server/03_ollama-rag-pipeline|로컬 LLM 서버 구축기 3편 — RAG 파이프라인 구현]] | RAG(Retrieval-Augmented Generation) — LLM이 모르는 정보를 외부 문서에서 찾아서 답변하게 하는… |
| [[08_llm/05_inference/local-llm-server/04_ollama-agent|로컬 LLM 서버 구축기 4편 — 에이전트(Agent) 구현]] | 지금까지 만든 RAG는 이렇습니다. |
| [[08_llm/05_inference/local-llm-server/05_ollama-harness-engineering|로컬 LLM 서버 구축기 5편 — Harness Engineering & Defensive Engineering]] | 에이전트는 본질적으로 예측 불가능합니다. |

<!-- AUTO:END -->
