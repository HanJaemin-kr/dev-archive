---
title: 데이터 파이프라인
domain: pdm
category: architecture
tags: [pdm, architecture]
level: intermediate
status: published
created: 2026-07-20
updated: 2026-07-20
velog: false
related: []
---

# 데이터 파이프라인

> 📎 각 구간의 통신 규약(Modbus·OPC-UA·MQTT/Sparkplug·자동화 피라미드)은 [[protocols]] 참고.

## 전체 흐름

```
[센서]
  │ 진동, 온도, 전류 등
  ↓
[엣지 디바이스 / DAQ]
  │ 샘플링, 전처리, 버퍼링
  ↓
[메시지 브로커] (MQTT / Kafka)
  │ 비동기 전송, 버퍼
  ↓
[수집 서버]
  │ 파싱, 검증, 라우팅
  ↓
[시계열 DB] (InfluxDB)     [캐시] (Redis)
  │ 원시 데이터 저장          │ 최신값, 알람 상태
  ↓
[분석 엔진]
  │ FFT, 임계값, ML
  ↓
[알림 서버]               [시각화] (Grafana)
```

## 엣지 계층

### 역할

- 고속 샘플링 (10kHz 이상)
- 로컬 버퍼 (네트워크 단절 대비)
- 기본 전처리 (필터링, 다운샘플링)
- MQTT/HTTP로 서버 전송

### 샘플링 전략

```python
# 상시 저해상도 + 이벤트 시 고해상도
CONTINUOUS_FS = 1000   # 상시 1kHz (RMS, Overall)
TRIGGER_FS    = 25600  # 임계 초과 시 25.6kHz (FFT 분석용)

def adaptive_sampling(rms_value, threshold=7.1):
    if rms_value > threshold:
        return TRIGGER_FS   # 고해상도 수집
    return CONTINUOUS_FS
```

### MQTT 발행 예시

```python
import paho.mqtt.client as mqtt
import json, time

client = mqtt.Client()
client.connect("broker.local", 1883)

payload = {
    "device_id": "pump_01",
    "timestamp": int(time.time() * 1e9),  # nanoseconds
    "axis": "X",
    "rms": 3.42,
    "peak": 9.87,
    "crest_factor": 2.89,
    "fs": 1000,
    "samples": [0.12, -0.34, ...]  # 원시 파형 (고해상도 시만)
}

client.publish("pdm/vibration/pump_01", json.dumps(payload))
```

## 수집 서버 계층

### 역할

- MQTT 구독 / Kafka 컨슈머
- 데이터 검증 및 파싱
- InfluxDB 쓰기
- Redis 최신값 갱신
- 임계값 초과 시 알림 트리거

```python
import paho.mqtt.client as mqtt
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
import redis, json

influx = InfluxDBClient(url="http://influxdb:8086", token="TOKEN", org="pdm")
write_api = influx.write_api(write_options=SYNCHRONOUS)
r = redis.Redis(host="redis", port=6379)

def on_message(client, userdata, msg):
    data = json.loads(msg.payload)

    # InfluxDB 저장
    point = (
        Point("vibration")
        .tag("device_id", data["device_id"])
        .tag("axis", data["axis"])
        .field("rms", data["rms"])
        .field("peak", data["peak"])
        .field("crest_factor", data["crest_factor"])
    )
    write_api.write(bucket="raw_data", record=point)

    # Redis 최신값 갱신
    r.hset(f"latest:{data['device_id']}", mapping={
        "rms": data["rms"],
        "peak": data["peak"],
        "updated_at": data["timestamp"]
    })
    r.expire(f"latest:{data['device_id']}", 300)

mqtt_client = mqtt.Client()
mqtt_client.on_message = on_message
mqtt_client.connect("broker.local", 1883)
mqtt_client.subscribe("pdm/vibration/#")
mqtt_client.loop_forever()
```

## 저장 전략

### InfluxDB Bucket 설계

| Bucket | 보존 기간 | 해상도 | 내용 |
|--------|---------|--------|------|
| `raw_1s` | 7일 | 1초 | RMS, Peak, Crest Factor |
| `raw_waveform` | 3일 | 원시 파형 | 트리거 시 고해상도 파형 |
| `1min_agg` | 90일 | 1분 평균 | 다운샘플링 집계 |
| `1h_agg` | 3년 | 1시간 평균 | 장기 트렌드 |

### Task로 자동 다운샘플링

```flux
option task = {name: "downsample_vibration_1min", every: 1m, offset: 10s}

from(bucket: "raw_1s")
  |> range(start: -task.every)
  |> filter(fn: (r) => r._measurement == "vibration")
  |> aggregateWindow(every: 1m, fn: mean, createEmpty: false)
  |> to(bucket: "1min_agg", org: "pdm")
```

## 분석 계층

```python
from scipy.fft import rfft, rfftfreq
import numpy as np

def analyze_waveform(samples, fs, device_id):
    signal = np.array(samples)

    # 시간 도메인 지표
    rms = np.sqrt(np.mean(signal**2))
    peak = np.max(np.abs(signal))
    kurtosis = float(np.mean((signal - signal.mean())**4) / signal.std()**4)

    # 주파수 도메인
    fft_vals = np.abs(rfft(signal)) * 2 / len(signal)
    fft_freq = rfftfreq(len(signal), d=1/fs)

    return {
        "device_id": device_id,
        "rms": rms,
        "peak": peak,
        "kurtosis": kurtosis,
        "dominant_freq": float(fft_freq[np.argmax(fft_vals)]),
        "spectrum": fft_vals.tolist()
    }
```
