# AGENTS.md — 에이전트 탐색 가이드

> 이 저장소(`dev-archive`)를 코딩 에이전트가 신뢰성 있게 탐색·인용하기 위한 진입점이다.
> 사람이 읽는 개요는 [README.md](README.md), 도메인 지도는 [KNOWLEDGE_MAP.md](KNOWLEDGE_MAP.md)를 본다.

## 0. 생태계 역할 (4-repo 중 하나)

이 저장소는 사용자의 **작업 기록 생태계** 4개 중 **"일반화 학습 지식 + 블로그 발행"** 담당이다.
- 자매 repo: **worklog-dashboard**(한 일) · **jaemin-llm-wiki**(프로젝트 특이 운영·디버깅 지식) · **jaemin-portfolio**(성과 showcase).
- 여기엔 **어디서나 재사용할 CS/기술 학습**만 둔다. *이 프로젝트에서만 통하는 운영 지식*은 jaemin-llm-wiki로 보낸다.
- 중앙 라우터 = `/archive` 스킬. 역참조: 노트 frontmatter `related:` 에 llm-wiki slug·portfolio slug·commit 해시를 적어 자매 repo와 연결한다.
- 발행: frontmatter `velog: true`(GitHub Actions 자동) · `tistory: true`(`scripts/tistory_sync.py`, 기본 `--draft`).

## 1. 저장소 소개

개발 학습 아카이브 — CS 기초 · 언어 · 코딩테스트 · DB · 웹 · 인프라 · AI/ML · LLM · 설비 예지보전(PDM) · 산업 공정 도메인을 정리하는 **스터디용** Obsidian vault + git 저장소다. 대부분 한글 마크다운 노트이며, 일부는 Velog에 자동 동기화된다.

## 2. 여기서 시작 (탐색 진입 순서)

1. **[KNOWLEDGE_MAP.md](KNOWLEDGE_MAP.md)** — 전체 도메인 지도(자동 생성). 어떤 도메인에 무엇이 있는지 한눈에.
2. 관심 도메인의 **`_index.md`** — 폴더별 노트 목록(제목·요약·링크, 자동 생성). 예: `08_llm/_index.md`.
3. 개별 노트 — 상단 **YAML 프론트매터**(domain·tags·related)로 맥락 파악 후 본문 인용.

## 3. 폴더 레이아웃

| 폴더 | 내용 |
|------|------|
| `01_cs/` | CS 기초 (OS, 네트워크, 디자인 패턴) |
| `02_language/` | 언어 심화 (JavaScript, TypeScript) |
| `03_coding/` | 알고리즘 & 코딩테스트 (자료구조·유형별·플랫폼·기업대비) |
| `04_database/` | RDBMS, Redis, InfluxDB, Vector DB, NoSQL |
| `05_web/` | 브라우저, REST API, 인증, 성능 |
| `06_infra/` | 게이트웨이, CI/CD, 메시징, IIoT |
| `07_ai/` | 평가, 머신러닝, 딥러닝, 강화학습, 생성형 AI |
| `08_llm/` | 기초·프롬프트·RAG·파인튜닝·추론·에이전트·평가 |
| `09_pdm/` | 설비 예지보전 스터디 (신호처리·아키텍처·이상감지·알림) |
| `10_good/` | 잘 쓴 기술 글·엔지니어링 사례 스크랩 |
| `11_process/` | 산업 공정 지식 (철강·석유화학·반도체·공통설비, `assets/`에 SVG) |
| `12_side-project/` | 사이드 프로젝트 (Quiz Studio 등) |
| `13_certification/` | 자격증 대비 (정보처리기사 실기) |
| `scripts/` | 자동화 스크립트 (Velog 동기화, 인덱스 생성, 검증) |
| `private/` | **로컬 전용 비공개 자료 — 아래 "건드리지 말 것" 참조** |

## 4. 탐색법 (에이전트용)

- **도메인/주제로 찾기**: 노트 프론트매터의 `domain`·`category`·`tags`로 필터. 예: `tags`에 `mqtt`가 있는 모든 노트.
- **폴더 개요**: 각 폴더의 `_index.md`가 그 폴더 노트들의 제목·요약·링크를 담는다. 재귀 스캔 대신 `_index.md`를 먼저 읽어라.
- **연관 노트**: 노트의 `related:` 필드와 본문의 `[[wikilink]]`를 따라간다(Obsidian shortest-path 해석).
- **인용**: 프론트매터의 `title`과 파일 경로로 인용. 파일명은 한글/영문이 섞여 있으니 경로 그대로 사용.

## 5. 프론트매터 스키마

모든 노트 상단에 YAML 프론트매터가 있다(키는 영문, 값은 한글 허용).

```yaml
---
title: MQTT              # 노트 제목 (H1 또는 파일명)
domain: infra            # 최상위 폴더 (NN_ 제거)
category: iiot           # 2번째 폴더 (선택)
tags: [infra, iiot, mqtt]
level: intermediate      # beginner | intermediate | advanced
status: published        # draft | in-progress | published
created: 2025-05-13
updated: 2025-07-13
velog: true              # Velog 동기화 대상 여부
related: []              # 연관 노트 상대경로/wikilink
---
```

## 6. 명명·규칙

- **파일명은 리네임하지 말 것.** 한글/영문·snake_case/kebab-case 혼용은 의도적으로 남겨둔 상태이며, 리네임은 Velog 동기화와 wikilink를 깨뜨린다(§7).
- 새 노트는 README의 노트 템플릿(`## 핵심 개념` / `## 예제 코드` / `## 면접 예상 질문`)을 따른다.
- 문서 언어는 한글. 프론트매터 키만 영문.
- **문서에 비밀·자격증명·내부 IP·회사/포트폴리오 목적을 넣지 말 것.** 도메인 목적은 '스터디'로만 표기.

## 7. 건드리지 말 것 (DO NOT TOUCH)

- **`private/`** — gitignore된 로컬 전용 폴더. 민감 인프라 자료가 있을 수 있다. **읽어서 문서·인덱스·그래프에 넣지 말 것. 인덱싱 대상에서 제외됨.**
- **`velog_state.json`** — *마크다운 경로 → Velog 포스트 UUID* 매핑. 노트를 리네임/이동하면 이 매핑이 깨져 동기화가 중복 발행되거나 유실된다. 값을 임의로 바꾸지 말 것.
- **`.obsidian/`, `.gstack/`** — 툴 설정/상태. 편집하지 말 것.
- **자동 생성물**(`KNOWLEDGE_MAP.md`, `**/_index.md`) — 직접 편집하지 말고 `python scripts/build_index.py`로 재생성. `<!-- AUTO:BEGIN -->`~`<!-- AUTO:END -->` 밖의 사람 산문만 보존된다.

### 부득이하게 노트를 리네임해야 한다면
1. `velog_state.json`에서 옛 경로 키를 새 경로로 갱신(값 UUID 유지),
2. 저장소 전역에서 해당 `[[wikilink]]`를 grep해 수정,
3. `python scripts/check_links.py`로 dangling 링크 0 확인.

## 8. 유지보수 명령

```bash
python scripts/add_frontmatter.py            # 노트 프론트매터 백필(멱등)
python scripts/build_index.py                # _index.md + KNOWLEDGE_MAP.md 재생성(멱등)
python scripts/lint_frontmatter.py           # 프론트매터 검증
python scripts/check_links.py                # wikilink/related 링크 검증
python scripts/tistory_sync.py               # tistory:true 노트 티스토리 발행(기본 draft, --publish 로 발행)
pytest scripts/tests/                        # 스크립트 테스트
```
