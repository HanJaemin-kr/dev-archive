# Federated Learning (연합학습)

공개 논문 기반 연합학습 스터디 — FedAvg와 Non-IID 문제, 대표 대응 기법, 집계, 기여도 평가, 통신·엣지 효율화를 정리하고 각 노트에 참고문헌을 달았다.

## 목차

- [[00_fl-overview]] — 연합학습 개요: FedAvg, Non-IID 유형, 폴더 구성
- [[01_non-iid-methods]] — Non-IID 대응: FedProx·SCAFFOLD · FedSAM · 클러스터 FL(CFL, IFCA) · 개인화 FL · TTA
- [[02_fl-aggregation]] — 집계: loss barrier와 모델 정렬 · LLM 연합 파인튜닝과 LoRA 집계 · 클라이언트 드리프트
- [[03_client-contribution]] — 기여도·선택: Shapley 기반 기여도 · 클라이언트 선택 · 강건 집계
- [[04_edge-adaptation]] — 통신·엣지 효율화: 압축 · One-shot FL · Zeroth-order 학습 · 하이퍼네트워크 개인화
- [[99_eli5]] — ELI5 정리본: 레시피 비유로 폴더 전체를 아주 쉽게 (입문용)

## 다이어그램 (`svg/`)

| 파일 | 내용 |
|------|------|
| `fl_overview.svg` | 연합학습 기본 라운드 구조 |
| `non_iid_types.svg` | Non-IID 4유형 |
| `flat_vs_sharp_minima.svg` | flat minima가 분포 차이를 흡수하는 원리 |
| `clustered_fl.svg` | 클러스터 연합학습 |
| `linear_avg_pitfall.svg` | 선형 평균의 한계 (loss barrier) |
| `client_drift.svg` | 클라이언트 드리프트 |

## Mermaid 소스 (`diagrams/`)

ELI5 노트에 임베드된 mermaid의 원본 소스 (`.mmd`). 수정 시 소스를 고친 뒤 노트에 반영.

- `fl-eli5-round.mmd` — 레시피 비유 연합학습 라운드
- `fl-eli5-map.mmd` — 문제 → 해법 지도
