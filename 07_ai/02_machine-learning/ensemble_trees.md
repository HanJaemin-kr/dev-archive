---
title: "트리 앙상블: Random Forest & LightGBM"
domain: ai
category: machine-learning
tags: [ai, machine-learning]
level: intermediate
status: published
created: 2026-07-15
updated: 2026-07-15
velog: false
related: []
---

# 트리 앙상블: Random Forest & LightGBM

> 두 앙상블 트리 모델이 "여러 트리를 어떻게 조합하는가"에서 어떻게 갈리는지 정리 — 배깅 vs 부스팅

---

## 1. 큰 그림 — 배깅 vs 부스팅

### Random Forest (Bagging)

![Random Forest 구조](random_forest_structure.svg)

데이터를 여러 번 **부트스트랩 샘플링** → 깊은 트리들을 서로 **독립적**으로 학습 → 결과를 다수결(분류)/평균(회귀).

- 핵심은 **분산 감소 (variance reduction)**
- 트리 하나하나는 과적합되기 쉬운 깊은 나무지만, 서로 다른 샘플·다른 피처로 독립 학습된 다수를 평균 내면 개별 오차가 상쇄됨
- 트리 간 순서·의존성 없음 → **병렬 학습 가능**

### LightGBM (Gradient Boosting)

![LightGBM 구조](lightgbm_structure.svg)

첫 트리가 예측 → 남은 오차(**잔차, residual**)를 다음 트리가 학습 → 반복하며 예측을 조금씩 더함.

$$F_m(x) = F_{m-1}(x) + \eta \cdot T_m(x)$$

- 핵심은 **편향 감소 (bias reduction)**
- 각 트리는 앞 트리들이 못 맞춘 부분만 집중 학습, 학습률 $\eta$로 조금씩 반영
- 순서가 중요 → **순차 학습**
- LightGBM = 여기에 leaf-wise 성장 + 히스토그램 기반 분할로 속도를 끌어올린 구현

> **한 줄 요약:** 여러 전문가에게 독립적으로 물어보고 투표(RF) vs 한 사람이 틀린 부분을 계속 고쳐나가기(LightGBM)

---

## 2. 트리를 키우는 방식 — level-wise vs leaf-wise

![level-wise vs leaf-wise](tree_growth_levelwise_vs_leafwise.svg)

| 구분 | Level-wise | Leaf-wise (LightGBM) |
|------|------------|----------------------|
| 성장 방식 | 한 레벨을 다 채우고 다음 레벨 | 손실 감소 최대 리프만 우선 분할 |
| 트리 모양 | 얕고 대칭 | 깊고 비대칭 |
| 정확도 | 안정적 | 같은 트리 수로 더 높음 |
| 과적합 | 상대적으로 강함 | `num_leaves`·`max_depth` 제어 필수 |
| 대표 | XGBoost 기본, RF의 트리 감각 | LightGBM |

---

## 3. 편향·분산 관점

- **Random Forest**: 이미 과적합된(분산 큰) 깊은 트리들을 평균 내 분산을 깎음 → 튜닝 대충 해도 안정적, 트리를 더 넣어도 과적합 심화 안 됨
- **LightGBM**: 약한(편향 큰) 트리를 순차적으로 더해 편향을 깎음 → 트리를 계속 더하면 과적합 가능 → **early stopping 거의 필수**

---

## 4. 꼭 알아야 할 하이퍼파라미터

### Random Forest

| 파라미터 | 역할 |
|----------|------|
| `n_estimators` | 트리 수 (많을수록 좋지만 수익 체감) |
| `max_features` | 각 분할에서 볼 피처 수 — **트리 간 다양성의 핵심** |
| `max_depth` / `min_samples_leaf` | 개별 트리 크기 |

### LightGBM

| 파라미터 | 역할 |
|----------|------|
| `num_leaves` | 리프 개수 — **모델 복잡도의 핵심**, 너무 크면 과적합 |
| `learning_rate` ($\eta$) | 작게 두고 트리를 많이 |
| `n_estimators` | early stopping과 함께 사용 |
| `max_depth` | leaf-wise 폭주 방지 |
| `min_child_samples` | 리프 최소 샘플 수 (과적합 억제) |
| `feature_fraction` / `bagging_fraction` | 피처·데이터 서브샘플링 |
| `lambda_l1` / `lambda_l2` | L1/L2 정규화 |

> 경험칙: `num_leaves` $< 2^{\text{max\_depth}}$ 로 두는 게 안전

---

## 5. 언제 무엇을 쓰나

| 상황 | 추천 |
|------|------|
| 빠른 견고한 베이스라인 | **Random Forest** — 튜닝 거의 없이 안정적 |
| 노이즈 많고 데이터 작음 | **Random Forest** — 과적합에 강함 |
| 해석·안정성 중시 | **Random Forest** |
| 정형 데이터 최고 성능 | **LightGBM** — 사실상 표준 |
| 대용량·학습 속도 중요 | **LightGBM** — 히스토그램 분할로 빠름 |
| 대회·마지막 정확도 짜내기 | **LightGBM / XGBoost / CatBoost** |

LightGBM은 튜닝·검증 설계에 손이 더 가고, 작은 데이터에선 쉽게 과적합한다는 대가가 있음.

---

## 6. 공통점

- 결정 트리 앙상블 → **스케일링(정규화) 불필요**
- 결측치·범주형·비선형 관계를 잘 다룸
- 피처 중요도(feature importance) 추출 가능
- 차이는 오직 **"트리들을 어떻게 조합하느냐"** (병렬 투표 vs 순차 보정)

---

## 관련 노트

- [[boosting_comparison]] — XGBoost · LightGBM · CatBoost 비교
- [[tabnet]] — 정형 데이터용 딥러닝 대안
- [[model_evaluation]] — 모델 평가 지표 (bias-variance 포함)
