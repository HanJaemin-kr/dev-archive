---
title: 모델 평가 지표 (Model Evaluation Metrics)
domain: ai
category: evaluation
tags: [ai, evaluation]
level: intermediate
status: published
created: 2026-07-09
updated: 2026-07-09
velog: false
related: []
---

# 모델 평가 지표 (Model Evaluation Metrics)

> 필수 개념 위주 정리 — 분류 / 회귀 / 검증 전략 / Bias-Variance

---

## 1. Confusion Matrix

![Confusion Matrix](confusion_matrix.svg)

| 용어 | 뜻 | 기억법 |
|------|-----|--------|
| **TP** (True Positive) | 양성 → 양성 예측 ✓ | 맞게(True) 양성(Positive) |
| **TN** (True Negative) | 음성 → 음성 예측 ✓ | 맞게(True) 음성(Negative) |
| **FP** (False Positive) | 음성 → 양성 예측 ✗ | 틀리게(False) 양성 — **오경보** |
| **FN** (False Negative) | 양성 → 음성 예측 ✗ | 틀리게(False) 음성 — **놓침** |

---

## 2. 분류 지표

### Accuracy (정확도)

$$\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}$$

- 클래스 **불균형 시 무의미** (암 환자 1% 데이터에서 전부 음성 예측 → Accuracy 99%)

---

### Precision (정밀도)

$$\text{Precision} = \frac{TP}{TP + FP}$$

> "양성으로 예측한 것 중 실제 양성 비율"  
> **FP를 줄이고 싶을 때** 중요  
> 예) 스팸 필터: 정상 메일을 스팸으로 잘못 분류하면 안 됨

---

### Recall (재현율 / Sensitivity)

$$\text{Recall} = \frac{TP}{TP + FN}$$

> "실제 양성 중 양성으로 예측한 비율"  
> **FN을 줄이고 싶을 때** 중요  
> 예) 암 진단: 암을 정상으로 놓치면 치명적

---

### F1-Score

$$F_1 = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$

- Precision과 Recall의 **조화평균** (단순 평균보다 낮은 쪽에 민감)
- 불균형 데이터에서 Accuracy 대신 사용

---

### Precision–Recall Tradeoff

![Precision–Recall Tradeoff](precision_recall_tradeoff.svg)

| 임계값(Threshold) | Precision | Recall |
|:-----------------:|:---------:|:------:|
| 높일수록 | ↑ | ↓ |
| 낮출수록 | ↓ | ↑ |

**도메인별 우선 지표:**

| 도메인 | 우선 지표 | 이유 |
|--------|----------|------|
| 스팸 필터 | Precision | 정상 메일이 스팸함으로 가면 안 됨 (FP 위험) |
| 암 진단 | Recall | 암을 놓치면 치명적 (FN 위험) |
| 사기 탐지 | F1 / Recall | 사기 놓치는 비용 > 오탐 비용 |
| 추천 시스템 | F1 / PR-AUC | 균형 필요 |

---

## 3. ROC-AUC

![ROC Curve](roc_curve.svg)

| 항목 | 설명 |
|------|------|
| **ROC Curve** | FPR(x) vs TPR(y) 그래프, 임계값 변화에 따른 궤적 |
| **AUC** | ROC 곡선 아래 면적. 0.5 = 랜덤, 1.0 = 완벽 |
| **장점** | 임계값에 독립적 → 모델 자체 성능 평가 |

### ROC-AUC vs PR-AUC

| | ROC-AUC | PR-AUC |
|--|:-------:|:------:|
| 균형 데이터 | ✅ | ✅ |
| **불균형 데이터** | ❌ 과낙관 | ✅ 적합 |
| y축 | TPR (Recall) | Precision |
| x축 | FPR | Recall |
| 면접 핵심 | "균형 데이터 기본값" | "불균형이면 이걸 써야" |

> **불균형 데이터(암 진단, 사기 탐지)**에서 ROC-AUC는 Negative가 많아 FPR이 낮게 나와 과낙관 → PR-AUC 사용

---

## 4. 회귀 지표

| 지표 | 수식 | 특징 |
|------|------|------|
| **MAE** | mean(\|y − ŷ\|) | 이상치 영향 적음, 단위 동일, 직관적 |
| **MSE** | mean((y − ŷ)²) | 이상치 민감, 미분 가능 (최적화 유리) |
| **RMSE** | √MSE | MSE의 단위 보정, 큰 오차 패널티 |
| **R²** | 1 − SS_res/SS_tot | 0~1 (1에 가까울수록 설명력 높음) |
| **MAPE** | mean(\|(y−ŷ)/y\|)×100 | % 단위, y=0이면 무한대 (주의) |

> **면접 핵심**: RMSE는 큰 오차에 더 민감, MAE는 이상치에 robust  
> 이상치가 많은 데이터 → MAE, 큰 오차를 더 패널티하고 싶다 → RMSE

---

## 5. 교차 검증 (Cross-Validation)

### K-Fold Cross-Validation

```
전체 데이터 → K개 Fold로 분할

Fold 1: [검증] [학습] [학습] [학습] [학습]
Fold 2: [학습] [검증] [학습] [학습] [학습]
Fold 3: [학습] [학습] [검증] [학습] [학습]
Fold 4: [학습] [학습] [학습] [검증] [학습]
Fold 5: [학습] [학습] [학습] [학습] [검증]

최종 성능 = K번 검증 성능의 평균
```

- K=5 또는 K=10이 일반적
- 모든 데이터가 검증셋으로 한 번씩 사용됨

### Stratified K-Fold

- 각 Fold에 **클래스 비율을 동일하게** 유지
- **불균형 데이터에 필수** (예: 양성 5% → 각 Fold도 5% 유지)

### Leave-One-Out (LOO)

- K = 데이터 수, 하나씩 검증
- 데이터가 극히 적을 때만 사용 (연산 비용 높음)

---

## 6. Bias-Variance Tradeoff

![Bias-Variance Tradeoff](bias_variance.svg)

$$\text{Total Error} = \text{Bias}^2 + \text{Variance} + \text{Irreducible Error}$$

| | 고편향 (Underfitting) | 고분산 (Overfitting) |
|--|:--------------------:|:-------------------:|
| 학습 오차 | 높음 | 낮음 |
| 검증 오차 | 높음 | 높음 |
| 원인 | 모델이 너무 단순 | 모델이 너무 복잡 |
| 해결 | 피처 추가, 복잡도 증가, 모델 변경 | 정규화(L1/L2), Dropout, 데이터 증강, Early Stopping |

### 정규화 (Regularization)

| 방법 | 수식 | 효과 |
|------|------|------|
| L1 (Lasso) | λ Σ\|w\| | 희소 가중치, 피처 선택 |
| L2 (Ridge) | λ Σw² | 가중치 전반적으로 작게 |
| Dropout | 학습 시 뉴런 무작위 비활성화 | 앙상블 효과 |
| Early Stopping | 검증 오차 최저점에서 학습 중단 | 과적합 방지 |

---

## 면접 자주 출제 Q&A

**Q. Accuracy가 높은데 모델이 나쁠 수 있나?**  
→ 불균형 데이터에서 가능. 예: 정상 99% 데이터에서 전부 정상 예측 → Accuracy 99%이지만 쓸모없음. F1 또는 PR-AUC로 평가해야 함.

**Q. Precision과 Recall 중 어떤 걸 우선해야 하나?**  
→ FP 비용 > FN 비용이면 Precision (스팸 필터, 법원 판결). FN 비용 > FP 비용이면 Recall (암 진단, 화재 감지). 균형이면 F1.

**Q. ROC-AUC vs PR-AUC 언제 쓰나?**  
→ 불균형 데이터에서 ROC-AUC는 Negative가 많아 FPR이 낮게 나와 과낙관됨. 불균형 데이터엔 PR-AUC가 더 정직한 지표.

**Q. Bias-Variance Tradeoff란?**  
→ 모델 복잡도를 높이면 Bias↓ Variance↑, 낮추면 Bias↑ Variance↓. 둘의 합이 최소가 되는 최적 복잡도를 찾는 것이 목표.

**Q. 교차 검증을 쓰는 이유?**  
→ 데이터가 적을 때 단일 Train/Test 분리는 분할 방식에 따라 성능이 크게 달라짐. K-Fold는 모든 데이터를 검증에 활용해 편향 없는 성능 추정 가능.

**Q. MAE vs RMSE 언제 쓰나?**  
→ 이상치가 많거나 큰 오차가 실제로 치명적이지 않은 경우 MAE. 큰 오차를 더 엄중히 다루어야 하는 경우 RMSE.
