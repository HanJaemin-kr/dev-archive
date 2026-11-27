---
title: "그래디언트 부스팅 3대장: XGBoost · LightGBM · CatBoost"
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

# 그래디언트 부스팅 3대장: XGBoost · LightGBM · CatBoost

> [[ensemble_trees]]의 부스팅 갈래를 확장 — 세 구현체의 차이와 선택 기준, 학습·비교 예제

---

## 1. 공통 뿌리

셋 다 **그래디언트 부스팅 결정 트리(GBDT)** 구현체다. 잔차를 순차적으로 학습하는 원리는 같고, 차이는 **트리 성장 방식·범주형 처리·속도 최적화**에 있다.

$$F_m(x) = F_{m-1}(x) + \eta \cdot T_m(x)$$

---

## 2. 핵심 차이 비교

| 항목 | XGBoost | LightGBM | CatBoost |
|------|---------|----------|----------|
| 트리 성장 | level-wise (균형) | **leaf-wise** (손실 우선) | **symmetric / oblivious** (레벨마다 같은 분할) |
| 분할 탐색 | pre-sorted + 히스토그램 | **히스토그램 기반** | 히스토그램 기반 |
| 속도 | 보통 | **가장 빠름** (대용량) | 중간 |
| 범주형 처리 | 직접 인코딩 필요 | 정수 인코딩 지원 | **네이티브 + Ordered TS** |
| 과적합 성향 | 낮음 | 높음(제어 필요) | 낮음 (대칭 트리 규제 효과) |
| 대표 강점 | 안정·생태계 | 속도·대용량 | 범주형 많은 데이터·기본값 강함 |

### 각 구현의 시그니처 기법

- **XGBoost**: 2차 테일러 근사(gradient + hessian) 기반 분할, 정규화 항($\lambda$, $\gamma$)을 목적함수에 명시
- **LightGBM**: **GOSS**(gradient 큰 샘플 위주 샘플링) + **EFB**(상호 배타 피처 묶기)로 속도↑
- **CatBoost**: **Ordered Target Statistics**로 타깃 누수 없이 범주형 인코딩, **oblivious tree**로 추론 빠르고 규제됨

---

## 3. 파라미터 대응표

| 개념 | XGBoost | LightGBM | CatBoost |
|------|---------|----------|----------|
| 트리 수 | `n_estimators` | `n_estimators` | `iterations` |
| 학습률 | `learning_rate` | `learning_rate` | `learning_rate` |
| 복잡도 | `max_depth` | `num_leaves` | `depth` |
| L2 정규화 | `lambda` | `lambda_l2` | `l2_leaf_reg` |
| 데이터 샘플링 | `subsample` | `bagging_fraction` | `subsample` |
| 피처 샘플링 | `colsample_bytree` | `feature_fraction` | `rsm` |

---

## 4. 학습·비교 예제 (Python)

```python
import numpy as np, time
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

from sklearn.ensemble import RandomForestClassifier
import lightgbm as lgb
import xgboost as xgb
from catboost import CatBoostClassifier

X, y = make_classification(n_samples=50_000, n_features=40,
                           n_informative=15, weights=[0.9, 0.1],
                           random_state=42)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2,
                                          stratify=y, random_state=42)

def bench(name, model, fit_kwargs=None):
    t = time.time()
    model.fit(X_tr, y_tr, **(fit_kwargs or {}))
    p = model.predict_proba(X_te)[:, 1]
    print(f"{name:12s}  AUC={roc_auc_score(y_te, p):.4f}  "
          f"time={time.time()-t:.1f}s")

bench("RandomForest", RandomForestClassifier(
        n_estimators=300, n_jobs=-1, random_state=42))

bench("XGBoost", xgb.XGBClassifier(
        n_estimators=1000, learning_rate=0.05, max_depth=6,
        subsample=0.8, colsample_bytree=0.8,
        eval_metric="auc", early_stopping_rounds=50, n_jobs=-1),
      fit_kwargs=dict(eval_set=[(X_te, y_te)], verbose=False))

bench("LightGBM", lgb.LGBMClassifier(
        n_estimators=1000, learning_rate=0.05, num_leaves=31,
        subsample=0.8, colsample_bytree=0.8, n_jobs=-1),
      fit_kwargs=dict(eval_set=[(X_te, y_te)],
                      callbacks=[lgb.early_stopping(50, verbose=False)]))

bench("CatBoost", CatBoostClassifier(
        iterations=1000, learning_rate=0.05, depth=6,
        l2_leaf_reg=3, verbose=False),
      fit_kwargs=dict(eval_set=(X_te, y_te),
                      early_stopping_rounds=50))
```

> 불균형 데이터라 정확도 대신 **AUC**로 비교. 부스팅 3종은 모두 `early_stopping`으로 과적합 전에 멈춘다. 보통 정형 데이터에서 부스팅이 RF보다 AUC가 높고, LightGBM이 학습 속도에서 유리하다.

---

## 5. 선택 가이드

- **범주형 피처가 많다** → CatBoost (전처리 최소, 기본값이 강함)
- **데이터가 크고 속도가 중요** → LightGBM
- **안정성·풍부한 생태계·해석 도구** → XGBoost
- **튜닝 없이 견고한 베이스라인** → Random Forest ([[ensemble_trees]])

---

## 관련 노트

- [[ensemble_trees]] — Random Forest & LightGBM 기초
- [[tabnet]] — 딥러닝 기반 정형 데이터 모델 (부스팅의 대안)
