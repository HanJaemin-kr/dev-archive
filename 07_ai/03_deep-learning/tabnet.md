---
title: "TabNet: Attentive Interpretable Tabular Learning"
domain: ai
category: deep-learning
tags: [ai, deep-learning]
level: intermediate
status: published
created: 2026-07-15
updated: 2026-07-15
velog: false
related: []
---

# TabNet: Attentive Interpretable Tabular Learning

> 정형(tabular) 데이터를 위한 딥러닝 아키텍처 (Arık & Pfister, Google Cloud AI, 2019 · AAAI 2021)
> 원논문: [arXiv:1908.07442](https://arxiv.org/abs/1908.07442)

트리 앙상블([[ensemble_trees]], [[boosting_comparison]])이 지배하던 정형 데이터 영역에서, **전처리 없이 raw 피처를 그대로 받아** 학습하면서도 **트리 수준의 해석 가능성**을 유지하는 신경망. 어텐션 기반의 순차적 피처 선택이 핵심.

---

## 1. 왜 TabNet인가 — 동기

- 일반 MLP는 정형 데이터에서 트리 앙상블을 잘 못 이김 (초평면 결정경계가 트리의 축-정렬 분할보다 비효율)
- TabNet은 **step마다 어떤 피처를 볼지 학습된 마스크로 선택** → 트리처럼 축-정렬적이면서 딥러닝의 표현력·엔드투엔드 학습·자기지도 사전학습을 얻음
- **해석 가능**: 각 step의 마스크를 모으면 인스턴스별 / 전역 피처 중요도가 나옴 (GBDT의 feature importance 대응물)

---

## 2. 전체 구조

![TabNet 전체 구조](tabnet_architecture.svg)

입력 피처는 (임베딩 후) **배치 정규화**만 거쳐 그대로 들어간다. 이후 **N개의 decision step**을 순차적으로 통과하며, 각 step은

1. 볼 피처를 고르고(**attentive transformer → mask**),
2. 고른 피처를 처리해(**feature transformer**),
3. 결과를 둘로 나눠(**split**) 하나는 **출력에 더하고** 하나는 **다음 step으로** 넘긴다.

모든 step의 출력 기여를 합쳐 FC를 거치면 최종 예측이 되고, 모든 step의 마스크를 모으면 피처 중요도가 된다.

---

## 3. Decision Step 내부

![TabNet decision step](tabnet_decision_step.svg)

### 3-1. Attentive Transformer — "무엇을 볼까"

$$M[i] = \text{sparsemax}\big(P[i-1] \cdot h_i(a[i-1])\big)$$

- `FC → BN` 으로 이전 step의 처리 결과 $a[i-1]$ 를 변환
- **prior scale** $P[i-1]$ 를 곱해 이미 많이 쓴 피처를 억제
- **sparsemax**로 정규화 → 대부분 0인 **희소 마스크** $M[i]$ 생성

> **Sparsemax**: softmax와 달리 확률 심플렉스로의 유클리드 사영이라 **불필요한 피처 가중치를 정확히 0**으로 만든다. 이게 "소수 피처만 선택"과 해석 가능성의 핵심.

**Prior scale 갱신** (피처 재사용 제어):

$$P[i] = \prod_{j=1}^{i} (\gamma - M[j])$$

- $\gamma$ (relaxation, 보통 $[1,2]$): 클수록 한 피처를 여러 step에서 재사용하도록 허용
- $\gamma = 1$ 이면 각 피처는 한 step에서만 쓰임

### 3-2. Feature Transformer — "어떻게 처리할까"

마스킹된 피처 $M[i] \odot f$ 를 처리하는 블록. 각 서브블록은 `FC → BN → GLU(Gated Linear Unit)`.

- **4개 블록**: 2개는 **모든 step 공유**(파라미터 효율), 2개는 **step별 독립**
- **잔차 연결 + $\sqrt{0.5}$ 스케일링**으로 분산 안정화
- 출력을 **split**: 앞부분 $d[i]$ 는 ReLU 후 출력 합산에, 뒷부분 $a[i]$ 는 다음 attentive transformer 입력으로

### 3-3. 최종 출력·중요도

$$d_{\text{out}} = \sum_{i=1}^{N} \text{ReLU}(d[i]), \qquad \hat{y} = W_{\text{final}} \, d_{\text{out}}$$

피처 중요도는 각 step 마스크를 출력 규모로 가중해 집계 → **인스턴스별(local)** 과 **전역(global)** 해석 모두 제공.

---

## 4. 학습 관련 핵심 요소

| 요소 | 내용 |
|------|------|
| **Ghost BN** | 큰 배치를 가상 배치(virtual batch size)로 쪼개 BN 적용 → 대배치 일반화 성능 유지 |
| **Sparsity 정규화** | 마스크 엔트로피 항 $L_{sparse}$ 를 손실에 추가, 계수 $\lambda_{sparse}$ 로 희소성 강화 |
| **자기지도 사전학습** | 인코더-디코더로 **일부 피처를 마스킹하고 복원**하는 pretext task → 라벨 적은 상황에서 강력 |
| **엔드투엔드** | 결측·정규화 외 별도 피처 엔지니어링 없이 raw 입력 학습 |

전체 손실: $L = L_{task} + \lambda_{sparse} \, L_{sparse}$

---

## 5. 주요 하이퍼파라미터 (pytorch-tabnet 기준)

| 파라미터 | 의미 | 권장 |
|----------|------|------|
| `n_d` / `n_a` | 결정(d) / 어텐션(a) 차원 | 8–64, 보통 `n_d = n_a` |
| `n_steps` | decision step 수 N | 3–10 |
| `gamma` | prior relaxation $\gamma$ | 1.0–2.0 |
| `lambda_sparse` | 희소성 정규화 계수 | 1e-3–1e-5 |
| `n_shared` / `n_independent` | 공유/독립 GLU 블록 수 | 각 2 |
| `virtual_batch_size` | Ghost BN 가상 배치 | 128–512 |
| `mask_type` | 마스크 함수 | `sparsemax` (또는 `entmax`) |

---

## 6. 트리 앙상블과의 관계

| 관점 | GBDT (LightGBM 등) | TabNet |
|------|--------------------|--------|
| 결정 방식 | 축-정렬 분할 | 학습된 sparse 마스크 (축-정렬 유사) |
| 전처리 | 범주형 인코딩 등 필요 | raw 피처 + BN, 최소 |
| 해석 | feature importance | step별 마스크 → local/global 중요도 |
| 사전학습 | 없음 | 자기지도(마스크 복원) 가능 |
| 강점 | 중소규모에서 여전히 강함·빠름 | 대규모·비지도 데이터·엔드투엔드 파이프라인 |

> 실무 요령: 데이터가 크지 않으면 GBDT가 여전히 강력한 베이스라인. TabNet은 데이터가 크거나, 라벨이 부족해 자기지도 사전학습 이점이 있거나, 딥러닝 파이프라인에 자연스럽게 통합해야 할 때 빛난다. 논문에서도 여러 벤치마크에서 GBDT와 대등하거나 상회.

---

## 7. 최소 사용 예 (pytorch-tabnet)

```python
from pytorch_tabnet.tab_model import TabNetClassifier
import numpy as np

clf = TabNetClassifier(
    n_d=16, n_a=16, n_steps=5,
    gamma=1.5, lambda_sparse=1e-4,
    n_shared=2, n_independent=2,
    virtual_batch_size=256, mask_type="sparsemax",
)

clf.fit(
    X_train, y_train,
    eval_set=[(X_valid, y_valid)],
    eval_metric=["auc"],
    max_epochs=200, patience=20,
    batch_size=4096,
)

# 해석: step별 마스크 & 집계 중요도
explain_matrix, masks = clf.explain(X_valid)   # 인스턴스별 기여
importances = clf.feature_importances_          # 전역 중요도
```

자기지도 사전학습은 `TabNetPretrainer`로 라벨 없이 먼저 학습한 뒤 위 분류기에 `from_unsupervised=`로 넘긴다.

---

## 관련 노트

- [[ensemble_trees]] — Random Forest & LightGBM
- [[boosting_comparison]] — XGBoost · LightGBM · CatBoost
- [[../01_evaluation/model_evaluation|모델 평가 지표]]

## 참고

- Arık, S. Ö., & Pfister, T. (2021). *TabNet: Attentive Interpretable Tabular Learning.* AAAI. [arXiv:1908.07442](https://arxiv.org/abs/1908.07442)
- 구현: [dreamquark-ai/tabnet (PyTorch)](https://github.com/dreamquark-ai/tabnet)
