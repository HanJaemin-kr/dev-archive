---
title: 임계값 기반 이상 감지
domain: pdm
category: anomaly
tags: [pdm, anomaly]
level: intermediate
status: published
created: 2026-05-12
updated: 2026-05-12
velog: false
related: []
---

# 임계값 기반 이상 감지

## 개념

측정값이 사전 정의된 기준을 초과하면 이상으로 판단.  
구현이 단순하고 결과가 명확하지만, 동작 조건 변화에 민감하다.

## 기본 임계값 구조

```python
THRESHOLDS = {
    "pump_01": {
        "rms": {"warn": 4.5, "alarm": 7.1, "danger": 11.2},
        "peak": {"warn": 15.0, "alarm": 25.0, "danger": 40.0},
        "crest_factor": {"warn": 3.5, "alarm": 5.0, "danger": 8.0},
        "kurtosis": {"warn": 4.0, "alarm": 6.0, "danger": 10.0},
        "temperature": {"warn": 70, "alarm": 85, "danger": 100},
    }
}

def evaluate(device_id, metrics):
    thresholds = THRESHOLDS.get(device_id, {})
    alarms = []

    for metric, value in metrics.items():
        t = thresholds.get(metric)
        if not t:
            continue
        if value >= t["danger"]:
            alarms.append({"metric": metric, "level": "danger", "value": value})
        elif value >= t["alarm"]:
            alarms.append({"metric": metric, "level": "alarm", "value": value})
        elif value >= t["warn"]:
            alarms.append({"metric": metric, "level": "warn", "value": value})

    return alarms
```

## 히스테리시스 (Hysteresis)

임계값 근처에서 알람이 반복 발생하는 채터링 방지.

```python
class HysteresisAlarm:
    def __init__(self, alarm_threshold, clear_threshold):
        self.alarm_th = alarm_threshold
        self.clear_th = clear_threshold   # 보통 alarm_th * 0.9
        self.active = False

    def update(self, value):
        if not self.active and value >= self.alarm_th:
            self.active = True
            return "ALARM_ON"
        elif self.active and value < self.clear_th:
            self.active = False
            return "ALARM_CLEAR"
        return "NO_CHANGE"
```

## 동적 임계값 (Statistical Threshold)

설비마다 고유한 진동 특성이 다르므로, 정상 운전 데이터로 기준을 자동 산출.

```python
import numpy as np

def compute_dynamic_threshold(baseline_rms_values, sigma=3):
    """
    정상 운전 데이터(baseline)로부터 통계적 임계값 산출.
    mean ± N×sigma 방식.
    """
    mean = np.mean(baseline_rms_values)
    std = np.std(baseline_rms_values)

    return {
        "warn":   mean + 2 * std,
        "alarm":  mean + 3 * std,
        "danger": mean + 4 * std,
        "mean": mean,
        "std": std
    }
```

## 트렌드 알람 (Rate of Change)

급격한 변화 감지. 절댓값은 정상이지만 빠르게 올라가는 경우.

```python
def trend_alarm(history, window=10, threshold_slope=0.5):
    """
    최근 N개 값의 기울기(증가 속도)가 임계값 초과 시 알람.
    """
    if len(history) < window:
        return False

    recent = history[-window:]
    x = np.arange(window)
    slope, _ = np.polyfit(x, recent, 1)

    return slope > threshold_slope
```

## Deadband (불감대)

작은 노이즈로 인한 잦은 상태 변화 방지.

```python
def deadband_filter(value, last_value, band=0.05):
    """
    변화량이 band 이하면 이전 값 유지.
    """
    if abs(value - last_value) < band:
        return last_value
    return value
```

## 지속 시간 조건 (Duration Check)

순간 스파이크가 아닌 지속적 초과만 알람 발생.

```python
from collections import deque
from datetime import datetime, timedelta

class DurationAlarm:
    def __init__(self, threshold, duration_sec=30):
        self.threshold = threshold
        self.duration = timedelta(seconds=duration_sec)
        self.exceed_since = None

    def update(self, value, now=None):
        now = now or datetime.utcnow()

        if value >= self.threshold:
            if self.exceed_since is None:
                self.exceed_since = now
            elif now - self.exceed_since >= self.duration:
                return "ALARM"  # 30초 이상 지속
        else:
            self.exceed_since = None

        return "OK"
```

## Redis 기반 알람 상태 관리

```python
import redis, json
from datetime import datetime

r = redis.Redis(host="redis", port=6379)

def set_alarm(device_id, metric, level, value):
    key = f"alarm:{device_id}"
    r.hset(key, metric, json.dumps({
        "level": level,
        "value": value,
        "triggered_at": datetime.utcnow().isoformat()
    }))

def get_alarms(device_id):
    key = f"alarm:{device_id}"
    raw = r.hgetall(key)
    return {k.decode(): json.loads(v) for k, v in raw.items()}

def clear_alarm(device_id, metric):
    r.hdel(f"alarm:{device_id}", metric)
```
