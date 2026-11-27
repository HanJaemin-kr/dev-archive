---
title: ML 기반 이상 감지
domain: pdm
category: anomaly
tags: [pdm, anomaly]
level: intermediate
status: published
created: 2026-07-15
updated: 2026-07-15
velog: false
related: []
---

# ML 기반 이상 감지

> 🎨 **심화(HTML+SVG)**: One-Class SVM으로 진동 특징 2개 → 정상영역 Bounding Box → 직사각형 임계치 추출 과정, Isolation Forest 원리·비교 → [../../07_ai/02_machine-learning/svm_anomaly_guide.html](../../07_ai/02_machine-learning/svm_anomaly_guide.html)

## 임계값 방식과 차이

| 항목 | 임계값 | ML |
|------|--------|----|
| 설정 방법 | 수동 or 통계 기준 | 데이터로 자동 학습 |
| 복합 패턴 감지 | 어려움 | 가능 |
| 해석 가능성 | 높음 | 낮음 (블랙박스) |
| 운영 조건 변화 | 취약 | 재학습으로 적응 가능 |
| 레이블 필요 | 불필요 | 비지도: 불필요 / 지도: 필요 |

## 비지도 학습 (라벨 없이)

### Isolation Forest

이상치는 정상 데이터보다 트리 분기 횟수가 적다는 원리.

```python
from sklearn.ensemble import IsolationForest
import numpy as np

# 특성 벡터 구성 (디바이스별)
# [rms, peak, crest_factor, kurtosis, dominant_freq]
X_train = np.array([...])  # 정상 운전 데이터

model = IsolationForest(
    contamination=0.01,  # 이상치 비율 예상 (1%)
    n_estimators=100,
    random_state=42
)
model.fit(X_train)

# 예측: -1 = 이상, 1 = 정상
new_data = np.array([[3.42, 9.87, 2.89, 3.1, 25.0]])
prediction = model.predict(new_data)
score = model.score_samples(new_data)  # 낮을수록 이상
```

### Autoencoder

정상 데이터로 학습 후, 재구성 오차가 크면 이상.

```python
import torch
import torch.nn as nn

class VibrationAutoencoder(nn.Module):
    def __init__(self, input_dim=5, latent_dim=2):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 16),
            nn.ReLU(),
            nn.Linear(16, latent_dim)
        )
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 16),
            nn.ReLU(),
            nn.Linear(16, input_dim)
        )

    def forward(self, x):
        return self.decoder(self.encoder(x))

model = VibrationAutoencoder()

# 학습 (정상 데이터만)
# ...

# 이상 점수 = 재구성 오차
def anomaly_score(model, x):
    model.eval()
    with torch.no_grad():
        reconstructed = model(x)
        return torch.mean((x - reconstructed)**2, dim=1)
```

### One-Class SVM

```python
from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_train)

oc_svm = OneClassSVM(kernel='rbf', nu=0.01, gamma='auto')
oc_svm.fit(X_scaled)

# -1: 이상, 1: 정상
pred = oc_svm.predict(scaler.transform(new_data))
```

## 지도 학습 (결함 레이블 있을 때)

### Random Forest 분류

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# 레이블: 0=정상, 1=불평형, 2=베어링결함, 3=정렬불량
X, y = load_labeled_data()
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_train, y_train)

# 결함 종류 예측
fault_type = clf.predict(new_data)
probabilities = clf.predict_proba(new_data)
```

## 특성 공학 (Feature Engineering)

원시 파형 → 의미 있는 특성 추출.

```python
import numpy as np
from scipy.stats import kurtosis, skew
from scipy.fft import rfft, rfftfreq

def extract_features(signal, fs):
    # 시간 도메인
    rms = np.sqrt(np.mean(signal**2))
    peak = np.max(np.abs(signal))
    crest_factor = peak / rms if rms > 0 else 0
    kurt = float(kurtosis(signal))
    skewness = float(skew(signal))
    shape_factor = rms / np.mean(np.abs(signal))

    # 주파수 도메인
    N = len(signal)
    fft_vals = np.abs(rfft(signal)) * 2 / N
    fft_freq = rfftfreq(N, d=1/fs)

    dominant_freq = float(fft_freq[np.argmax(fft_vals)])
    spectral_centroid = float(np.sum(fft_freq * fft_vals) / np.sum(fft_vals))

    # 주파수 대역별 에너지
    def band_energy(low, high):
        mask = (fft_freq >= low) & (fft_freq < high)
        return float(np.sum(fft_vals[mask]**2))

    return {
        "rms": rms,
        "peak": peak,
        "crest_factor": crest_factor,
        "kurtosis": kurt,
        "skewness": skewness,
        "shape_factor": shape_factor,
        "dominant_freq": dominant_freq,
        "spectral_centroid": spectral_centroid,
        "energy_0_100hz": band_energy(0, 100),
        "energy_100_500hz": band_energy(100, 500),
        "energy_500_2000hz": band_energy(500, 2000),
        "energy_2000hz_plus": band_energy(2000, fs/2),
    }
```

## 모델 운영 패턴

```python
import joblib, json
from datetime import datetime

class PDMModel:
    def __init__(self, device_id):
        self.device_id = device_id
        self.model = None
        self.scaler = None
        self.threshold = None  # anomaly_score 기준

    def train(self, X_normal):
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X_normal)

        self.model = IsolationForest(contamination=0.01)
        self.model.fit(X_scaled)

        scores = self.model.score_samples(X_scaled)
        self.threshold = np.percentile(scores, 1)  # 하위 1% 기준

    def predict(self, features):
        X = self.scaler.transform([features])
        score = self.model.score_samples(X)[0]
        return {
            "is_anomaly": score < self.threshold,
            "score": float(score),
            "threshold": float(self.threshold),
            "timestamp": datetime.utcnow().isoformat()
        }

    def save(self, path):
        joblib.dump({"model": self.model, "scaler": self.scaler,
                     "threshold": self.threshold}, path)

    def load(self, path):
        data = joblib.load(path)
        self.model = data["model"]
        self.scaler = data["scaler"]
        self.threshold = data["threshold"]
```
