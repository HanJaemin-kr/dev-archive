---
title: 모니터링 서버 스택
domain: pdm
category: architecture
tags: [pdm, architecture]
level: intermediate
status: published
created: 2026-05-12
updated: 2026-05-12
velog: false
related: []
---

# 모니터링 서버 스택

## 전체 구성

```
┌─────────────────────────────────────────────┐
│                  Edge Layer                 │
│  [센서] → [DAQ / Raspberry Pi / PLC]        │
│           MQTT publish                      │
└──────────────────┬──────────────────────────┘
                   │ MQTT
┌──────────────────▼──────────────────────────┐
│              Message Broker                 │
│              Mosquitto / EMQX               │
└──────────────────┬──────────────────────────┘
                   │ Subscribe
┌──────────────────▼──────────────────────────┐
│            Collection Server                │
│   Python Worker (asyncio / multiprocess)   │
│   - 파싱 / 검증 / 라우팅                     │
└────────┬─────────────────────┬──────────────┘
         │                     │
┌────────▼──────┐    ┌─────────▼──────┐
│   InfluxDB    │    │     Redis      │
│  시계열 저장   │    │  최신값·알람   │
│  장기 트렌드   │    │  분산락·캐시   │
└────────┬──────┘    └─────────┬──────┘
         │                     │
┌────────▼─────────────────────▼──────────────┐
│              Analysis Engine                │
│   FFT / 임계값 / ML 이상감지                 │
└────────┬────────────────────────────────────┘
         │
┌────────▼──────┐    ┌─────────────────────────┐
│   Alerting    │    │         Grafana          │
│  Slack / SMS  │    │  실시간 대시보드·트렌드   │
└───────────────┘    └─────────────────────────┘
```

## 컴포넌트별 역할

### MQTT 브로커 (Mosquitto / EMQX)

- 엣지 디바이스와 서버 간 비동기 통신
- 네트워크 불안정 시 QoS로 전달 보장
- 토픽 구조: `pdm/{site}/{equipment_type}/{device_id}`

```
pdm/line1/pump/pump_01/vibration
pdm/line1/motor/motor_03/temperature
```

### InfluxDB

- 시계열 데이터 저장 전담
- Bucket별 Retention으로 자동 정리
- Flux Task로 다운샘플링 자동화
- Grafana와 네이티브 연동

```
raw_1s     (7일)  ← 수집 서버가 직접 쓰기
1min_agg   (90일) ← Task 자동 생성
1h_agg     (3년)  ← Task 자동 생성
waveform   (3일)  ← 트리거 시 원시 파형
```

### Redis

```
latest:{device_id}       Hash   최신 측정값 (TTL 5분)
alarm:{device_id}        Hash   현재 알람 상태
lock:analysis:{device_id} String 분산 락 (중복 분석 방지)
rms_history:{device_id}  List   최근 60개 RMS (슬라이딩 윈도우)
```

### 분석 엔진

- 수집 서버와 분리 (독립 프로세스 or 서비스)
- InfluxDB에서 주기적으로 데이터 조회 or 큐에서 소비
- FFT, 임계값, Kurtosis, ML 모델 실행

### Grafana

- InfluxDB datasource 연결
- 실시간 패널: 최근 1시간 RMS 트렌드
- 스펙트럼 패널: 최신 FFT 결과
- 알람 히스토리 패널

## Docker Compose 구성

```yaml
version: "3.8"

services:
  mosquitto:
    image: eclipse-mosquitto:2
    ports:
      - "1883:1883"
    volumes:
      - ./mosquitto/config:/mosquitto/config
      - mosquitto_data:/mosquitto/data

  influxdb:
    image: influxdb:2.7
    ports:
      - "8086:8086"
    environment:
      DOCKER_INFLUXDB_INIT_MODE: setup
      DOCKER_INFLUXDB_INIT_ORG: pdm
      DOCKER_INFLUXDB_INIT_BUCKET: raw_1s
      DOCKER_INFLUXDB_INIT_ADMIN_TOKEN: ${INFLUX_TOKEN}
    volumes:
      - influxdb_data:/var/lib/influxdb2

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  collector:
    build: ./collector
    depends_on:
      - mosquitto
      - influxdb
      - redis
    environment:
      MQTT_HOST: mosquitto
      INFLUX_URL: http://influxdb:8086
      INFLUX_TOKEN: ${INFLUX_TOKEN}
      REDIS_HOST: redis
    restart: unless-stopped

  analyzer:
    build: ./analyzer
    depends_on:
      - influxdb
      - redis
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    depends_on:
      - influxdb
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  mosquitto_data:
  influxdb_data:
  redis_data:
  grafana_data:
```

## 성능 고려사항

| 항목 | 고려 포인트 |
|------|------------|
| 수집 주기 | 상시 1초 집계 + 트리거 시 원시 파형 |
| 동시 디바이스 | 100대 이하: 단일 Python Worker / 이상: 멀티프로세스 or Kafka |
| InfluxDB 쓰기 | 배치 쓰기 (500~1000 points/batch) |
| 분석 병렬화 | 디바이스별 독립 분석 → asyncio or ProcessPoolExecutor |
| 네트워크 단절 | 엣지에서 로컬 버퍼 → 재연결 시 일괄 전송 |
