# dev-archive

> 개발 학습 아카이브 — CS 기초 · 언어 · 코딩 테스트 · 인프라 · AI/LLM · 설비 예지보전(PDM) · 산업 공정 도메인을 체계적으로 정리하는 저장소  
> Claude Code 팀 자동화(Velog 자동 업로드 등) 실험도 함께 진행 중

---

## 폴더 구조

```
dev-archive/
│
├── 01_cs/                  # CS 기초
│   ├── 01_os/              # 프로세스·스레드, 메모리, 스케줄링, 동기화
│   ├── 02_network/         # OSI 7계층, TCP/IP, HTTP, DNS, WebSocket, MQTT
│   └── 03_design-patterns/ # GoF 디자인 패턴
│
├── 02_language/            # 언어 심화
│   ├── 01_javascript/      # 클로저, 이벤트 루프, 프로토타입, 비동기
│   └── 02_typescript/      # 타입 시스템, 제네릭, 유틸리티 타입
│
├── 03_coding/              # 알고리즘 & 코딩 테스트
│   ├── 01_data-structures/ # 자료구조 구현
│   ├── 02_algorithms/      # 알고리즘 유형별 예제
│   ├── 03_platforms/       # Programmers · LeetCode · BOJ 풀이
│   ├── 04_mock-tests/      # 90분 모의테스트 기록
│   ├── 05_templates/       # 문제 템플릿 & DS 스니펫
│   └── 06_notes/           # 커리큘럼, 복잡도 치트시트, 오답 노트
│
├── 04_database/            # 데이터베이스
│   ├── 01_rdbms/           # SQL 최적화, 인덱스, 트랜잭션(ACID/MVCC)
│   ├── 02_redis/           # Redis 캐시, 자료구조
│   ├── 03_influxdb/        # 시계열 DB, 센서 데이터
│   ├── 04_vector-db/       # 벡터 DB 개념
│   └── 05_nosql-concepts/  # NoSQL 비교
│
├── 05_web/                 # 웹 & API
│   ├── 01_browser/         # 렌더링 파이프라인, 이벤트 루프
│   ├── 02_rest-api/        # RESTful 설계, OpenAPI
│   ├── 03_auth/            # JWT, OAuth2, 세션
│   └── 04_performance/     # 캐싱, 번들 최적화, 웹 지표
│
├── 06_infra/               # 인프라 & DevOps
│   ├── 01_gateway/         # Nginx 리버스 프록시, HSTS, 블루-그린 설정
│   ├── 02_CI-CD/           # GitHub Actions, 배포 자동화
│   ├── 03_messaging/       # 메시지 큐 개념
│   └── 04_iiot/            # IIoT 아키텍처
│
├── 07_ai/                  # AI / ML
│   ├── 01_evaluation/            # 모델 평가 지표
│   ├── 02_machine-learning/      # 머신러닝 (이상탐지, 앙상블 트리, TabNet)
│   ├── 03_deep-learning/         # 딥러닝
│   ├── 04_reinforcement-learning/# 강화학습
│   └── 05_generative-ai/         # 생성형 AI
│
├── 08_llm/                 # LLM
│   ├── 01_fundamentals/       # LLM 기초
│   ├── 02_prompt-engineering/ # 프롬프트 엔지니어링
│   ├── 03_rag/                # RAG
│   ├── 04_fine-tuning/        # 파인튜닝
│   ├── 05_inference/          # 추론 최적화
│   ├── 06_agents/             # 에이전트
│   └── 07_evaluation/         # LLM 평가
│
├── 09_pdm/                 # 설비 예지보전 (Predictive Maintenance)
│   ├── 00_foundation/      # 정비 전략·CBM 개론·산업별 결함 (P-F곡선·RCM·산업별 진단)
│   ├── 01_signal/          # 신호 처리, 진동 분석 (진동·센서·모터·공진·FFT)
│   ├── 02_architecture/    # 모니터링 서버 설계 (파이프라인·스택·산업 통신 프로토콜)
│   ├── 03_anomaly/         # 이상 감지 알고리즘
│   ├── 04_alerting/        # 알림 시스템
│   └── 05_enterprise/      # 엔터프라이즈 적용 사례
│
├── 10_good/                # 잘 쓴 기술 글·엔지니어링 사례 스크랩
│
├── 11_process/             # 산업 공정 (제조·화학 도메인 지식, 회사 아닌 공정 기준)
│   ├── 00_overview.md      # 공정 산업 큰그림 (장치산업, 연속/배치)
│   ├── 01_steel/           # 철강: 제선·제강·연주·압연 + SVG
│   ├── 02_chemical/        # 석유화학·정유: 증류·분해·중합 + SVG
│   ├── 03_semiconductor/   # 반도체: 8대 공정·포토·식각/증착 + SVG
│   └── 99_common/          # 공통 단위공정: 열교환기·펌프/압축기·반응기 + SVG
│
├── 12_side-project/        # 사이드 프로젝트
│   ├── Quiz Studio/        # 퀴즈 생성 웹앱 (Node.js — server.js, DB, 배포 스크립트)
│   └── Data Maker/         # 데이터 생성 도구 (예정)
│
├── 13_certification/       # 자격증 대비
│   └── 정보처리기사-실기/   # 실기 빈출 정리 (설계·DB·OS/네트워크·보안·테스트·신기술용어, 코딩 제외)
│
├── scripts/                # 자동화 스크립트
│   ├── velog_sync.py       # Velog 자동 업로드 스크립트
│   ├── conftest.py
│   └── tests/              # 스크립트 단위 테스트
│
├── private/                # 비공개 자료 (.gitignore — 로컬 전용, 커밋 안 됨)
│
└── .github/
    └── workflows/          # GitHub Actions (Velog 자동 동기화 등)
```

---

## 진행 중인 작업

| 영역 | 내용 | 상태 |
|------|------|------|
| Claude Code 자동화 | Velog 자동 업로드 워크플로우 구축 | 진행 중 |
| 06_infra | Nginx 블루-그린 배포 구성 정리 | 진행 중 |
| 07_ai | AI/ML 이상탐지·앙상블·TabNet 정리 | 진행 중 |
| 08_llm | LLM 학습 정리 (RAG·에이전트·추론) | 진행 중 |
| 09_pdm | 설비 예지보전 아키텍처 문서화 | 진행 중 |
| 11_process | 공정 지식 (철강·석유화학·반도체·공통설비 1차 정리 완료) | 진행 중 |
| 13_certification | 정보처리기사 실기 빈출 정리 (코딩 제외) | 진행 중 |

---

## 자동화 구성

### Velog 자동 업로드 (`scripts/velog_sync.py`)
- 이 저장소의 마크다운 파일을 Velog에 자동으로 동기화
- GitHub Actions로 push 시 자동 실행
- 상태 파일: `velog_state.json`

---

## 노트 작성 규칙

```markdown
# 주제 이름

## 핵심 개념
...

## 예제 코드 (있을 경우)
\`\`\`js
...
\`\`\`

## 면접 예상 질문
- Q: ...
  A: ...
```

파일명: `주제명.md` 또는 `주제명.js`
