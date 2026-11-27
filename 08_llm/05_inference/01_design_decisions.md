---
title: 설계 결정 근거
domain: llm
category: inference
tags: [llm, inference]
level: intermediate
status: published
created: 2026-04-30
updated: 2026-04-30
velog: false
related: []
---

# 설계 결정 근거

## 1. 환경변수 기반 설정 분리

**결정**: API 키, 엔드포인트를 `.env` 파일로 분리, 코드에 하드코딩 금지

**이유**:
- 개발/스테이징/프로덕션 환경마다 다른 모델 서버 사용 가능
- 키 노출 없이 git 관리 가능
- 12-Factor App 원칙 준수

**적용**: `.env.example` → 실제 `.env` 복사 후 값 채우기

---

## 2. 표준 라이브러리만 사용 (urllib)

**결정**: `requests` 대신 `urllib` 사용

**이유**:
- 외부 의존성 최소화 (설치 없이 동작)
- 서버 환경에서 pip install 불필요한 경우 대비
- 스트리밍은 직접 SSE 파싱

---

## 3. Exponential Backoff 재시도

**결정**: 실패 시 2^n 초 대기 후 최대 3회 재시도

**이유**:
- 모델 서버가 heavy request 처리 중일 때 일시적 실패 발생
- 즉시 재시도는 서버 부하 악화
- 3회로 제한해 무한 루프 방지

---

## 4. Pipeline 패턴

**결정**: 여러 LLM 호출을 Step으로 체인

**이유**:
- 복잡한 태스크를 단계별로 분해 (분석→요약→번역 등)
- 각 단계 입력/출력 추적 가능
- 후처리 함수(postprocess)로 파싱 유연성 확보

---

## 5. JSON 구조화 로깅

**결정**: 일반 텍스트 대신 JSON 로그

**이유**:
- ELK Stack, Grafana Loki 등 로그 수집 도구와 호환
- request_id로 요청 추적 가능
- 토큰 사용량 모니터링 가능
