---
title: Kafka
domain: infra
category: messaging
tags: [infra, messaging]
level: intermediate
status: published
created: 2026-07-15
updated: 2026-07-15
velog: true
related: []
---

# Kafka

> 📘 **내부 구조 심화**: 로그 세그먼트·레코드 포맷·ISR/High Watermark·zero-copy·리밸런싱·KRaft·로그 컴팩션을 SVG 다이어그램으로 정리 → [kafka_guide.html](kafka_guide.html)
> 이 문서는 아키텍처 개요 + PdM 모니터링 연계 + Python 구현 위주.

## 개요

- **분산 이벤트 스트리밍 플랫폼** — LinkedIn 개발, Apache 재단 오픈소스
- 대용량 메시지를 **디스크에 보존**하면서 여러 Consumer가 독립적으로 소비
- MQTT는 "전달 후 소멸", Kafka는 "전달 후 보존 + 재처리 가능"
- 초당 수백만 메시지 처리, 수평 확장 용이

```
핵심 특징
─────────────────────────────────────────────────
메시지 보존     디스크에 설정 기간만큼 저장 (기본 7일)
재처리          Consumer가 과거 메시지를 다시 읽기 가능
확장성          Broker / Partition 추가로 선형 확장
내결함성        복제(Replication)로 Broker 장애 대응
순서 보장       같은 Partition 내에서는 순서 보장
```

---

## 핵심 구조

```
┌─────────────────┐   ┌──────────────────────────────┐   ┌────────────────────────────────┐
│    Producer     │   │        Kafka Cluster          │   │      Consumer Group A          │
│                 │   │  ┌──────────────────────────┐ │   │  ┌──────────────────────────┐  │
│  [수집 서버]  ──┼──►│  │  Topic: pdm-vibration    │ │──►│  │  [분석 서버]             │  │
│                 │   │  │  Partition 0  ████████   │ │   │  │  [알람 처리]             │  │
│                 │   │  │  Partition 1  ████████   │ │   │  └──────────────────────────┘  │
│                 │   │  │  Partition 2  ████████   │ │   └────────────────────────────────┘
│                 │   │  └──────────────────────────┘ │
│                 │   │  ┌──────────────────────────┐ │   ┌────────────────────────────────┐
│  [알람 서버]  ──┼──►│  │  Topic: pdm-alarm        │ │   │      Consumer Group B          │
│                 │   │  │  Partition 0  ████████   │ │──►│  ┌──────────────────────────┐  │
└─────────────────┘   │  └──────────────────────────┘ │   │  │  [DB 저장]               │  │
                      └──────────────────────────────┘   │  │  [대시보드]              │  │
                                                          │  └──────────────────────────┘  │
                                                          └────────────────────────────────┘
```

- **같은 Topic을 여러 Consumer Group이 독립적으로 소비** → 서로 영향 없음
- 분석 서버와 DB 저장 서버가 같은 메시지를 각각 처리 가능

---

## 핵심 개념

### Topic / Partition

```
Topic: pdm-vibration
│
├── Partition 0   [msg0][msg1][msg4][msg7] ──────────────────────────► Consumer A
│
├── Partition 1   [msg2][msg5][msg8]       ──────────────────────────► Consumer B
│
└── Partition 2   [msg3][msg6][msg9]       ──────────────────────────► Consumer C

- Partition 수 = 병렬 처리 단위
- 같은 key → 항상 같은 Partition (순서 보장)
- pump_01의 메시지는 항상 Partition 0으로 → 순서 유지
```

### Offset

```
Partition 0:
┌────┬────┬────┬────┬────┬────┬─────
│ 0  │ 1  │ 2  │ 3  │ 4  │ 5  │ ...
└────┴────┴────┴────┴────┴────┴─────
   ▲                    ▲
   │                    │
가장 오래된           Consumer A의
메시지(earliest)      현재 위치(offset=4)

- Consumer는 자신의 offset을 관리
- 장애 후 재시작 → offset부터 이어서 읽기
- 과거로 돌려서 재처리도 가능
```

### Consumer Group

```
                         Topic: pdm-vibration
              ┌────────────────────────────────────────┐
              │  Partition 0 │ Partition 1 │ Partition 2│
              └──────┬───────┴──────┬──────┴─────┬──────┘
                     │              │             │
          ┌──────────┼──────────────┼─────────────┼──────────┐
          │          ▼              ▼             ▼          │
          │  Consumer Group "analysis"                       │
          │  ┌────────────┐ ┌────────────┐ ┌────────────┐   │
          │  │ Consumer A │ │ Consumer B │ │ Consumer C │   │
          │  │ (P0 담당)  │ │ (P1 담당)  │ │ (P2 담당)  │   │
          │  └────────────┘ └────────────┘ └────────────┘   │
          └──────────────────────────────────────────────────┘
                     │              │             │
          ┌──────────┼──────────────┼─────────────┼──────────┐
          │          ▼              ▼             ▼          │
          │  Consumer Group "storage"                        │
          │       ┌──────────────────────────────────┐       │
          │       │  Consumer D  (P0 + P1 + P2 담당) │       │
          │       └──────────────────────────────────┘       │
          └──────────────────────────────────────────────────┘

→ 두 그룹은 서로 독립 → 같은 메시지를 각자 처리
```

### Replication (복제)

```
Topic: pdm-vibration  /  Partition 0
                                                replication-factor = 3
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌───────────────────────┐                                      │
│  │  Broker 1  [Leader]   │ ◄── Producer 쓰기 / Consumer 읽기   │
│  │  offset 0..N          │                                      │
│  └───────────┬───────────┘                                      │
│              │  복제(sync)                                      │
│       ┌──────┴───────┐                                          │
│       ▼              ▼                                          │
│  ┌─────────────┐  ┌─────────────┐                              │
│  │  Broker 2   │  │  Broker 3   │                              │
│  │ [Follower]  │  │ [Follower]  │                              │
│  │ offset 0..N │  │ offset 0..N │                              │
│  └─────────────┘  └─────────────┘                              │
└─────────────────────────────────────────────────────────────────┘

Broker 1 장애 → Broker 2 또는 3이 자동으로 Leader 승격
```

---

## MQTT vs Kafka — 언제 뭘 쓰는가

```
MQTT                              Kafka
──────────────────────────────    ──────────────────────────────
디바이스 ↔ 서버                   서버 ↔ 서버
연결 수십~수백 개                  처리량 기준 (초당 수만~수백만)
메시지 소멸 (기본)                 메시지 보존 + 재처리
Broker가 라우팅                   Partition으로 병렬 소비
저전력·저대역폭 환경               고처리량·고신뢰 서버 환경
연결 유지 프로토콜                 배치/스트리밍 처리
```

**현재 시스템에서의 역할 분리:**

```
┌──────────┐        ┌─────────────┐        ┌─────────────────────┐
│  센서    │  MQTT  │  MQTT       │        │   Kafka Cluster     │
│ (엣지)   │───────►│  Broker     │        │  ┌───────────────┐  │
│          │        │             │        │  │ Topic:        │  │
└──────────┘        └──────┬──────┘        │  │ pdm-vibration │  │
                           │               │  └───────┬───────┘  │
                           ▼               └──────────┼──────────┘
                    ┌─────────────┐                   │
                    │  Collector  │                   │  (독립 소비)
                    │  (Python)   │──── Kafka ───────►├──────────► [분석 서버]
                    └─────────────┘    produce        ├──────────► [InfluxDB 저장]
                                                      ├──────────► [알람 처리]
                                                      └──────────► [대시보드 push]

   ◄── MQTT 영역 ───────────────────► ◄──────── Kafka 영역 ──────────────────►
        엣지 ↔ 서버                              서버 ↔ 서버
```

→ MQTT는 엣지-서버 간, Kafka는 서버-서버 간

---

## 실제 모니터링 시스템 연계

### 전체 파이프라인

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
│   [현장 센서]    │  │   [수집 계층]    │  │     [Kafka]      │  │     [소비 계층]      │
│                  │  │                  │  │                  │  │                      │
│  ┌────────────┐  │  │ ┌─────────────┐ │  │ ┌──────────────┐ │  │ ┌──────────────────┐ │
│  │  진동센서  │  │  │ │    MQTT     │ │  │ │ Topic:       │ │  │ │  분석 서버       │ │
│  └─────┬──────┘  │  │ │   Broker   │ │  │ │ pdm-vibration│ │  │ │  (FFT / ML)      │ │
│        │ MQTT    │  │ └──────┬──────┘ │  │ │  Partition 0 ├─┼─►│ │  FFT 계산       │ │
│        └─────────┼─►│        │        │  │ │  Partition 1 ├─┼─►│ │  Kurtosis       │ │
│                  │  │        │        │  │ │  Partition 2 ├─┼─►│ │  이상감지       │ │
│                  │  │        ▼        │  │ └──────────────┘ │  │ └──────────────────┘ │
│                  │  │ ┌─────────────┐ │  │                  │  │                      │
│                  │  │ │  Collector  │ │  │ ┌──────────────┐ │  │ ┌──────────────────┐ │
│                  │  │ │  (Python)   ├─┼─►│ │ Topic:       │ │  │ │  InfluxDB 저장   │ │
│                  │  │ └─────────────┘ │  │ │ pdm-alarm    ├─┼─►│ │  (시계열 보존)   │ │
│                  │  │                 │  │ │  Partition 0 │ │  │ └──────────────────┘ │
│                  │  │                 │  │ └──────────────┘ │  │                      │
│                  │  │                 │  │                  │  │ ┌──────────────────┐ │
│                  │  │                 │  │                  ├─►│ │  Redis 갱신      │ │
│                  │  │                 │  │                  │  │ └──────────────────┘ │
│                  │  │                 │  │                  │  │                      │
│                  │  │                 │  │                  │  │ ┌──────────────────┐ │
│                  │  │                 │  │                  ├─►│ │  대시보드        │ │
│                  │  │                 │  │                  │  │ │  (WebSocket push)│ │
│                  │  │                 │  │                  │  │ └──────────────────┘ │
└──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────────┘
```

### Topic 설계

```
pdm-vibration      ← 진동 RMS/Peak 1초 데이터
pdm-waveform       ← 고해상도 원시 파형 (트리거 시)
pdm-temperature    ← 온도 데이터
pdm-alarm          ← 알람 이벤트
pdm-analysis       ← FFT 분석 결과
pdm-status         ← 설비 연결 상태 (LWT 결과)

Partition key = device_id
→ 같은 설비 메시지는 항상 같은 Partition → 순서 보장
```

---

## 구현 — Python (aiokafka)

```bash
pip install aiokafka
```

### Producer (Collector → Kafka)

```python
import asyncio
import json
from aiokafka import AIOKafkaProducer

BROKER = "kafka:9092"

async def main():
    producer = AIOKafkaProducer(
        bootstrap_servers=BROKER,
        value_serializer=lambda v: json.dumps(v).encode(),
        key_serializer=lambda k: k.encode() if k else None,
        # 전달 보장 설정
        acks="all",           # 모든 복제본 확인 후 ack (유실 방지)
        enable_idempotence=True,  # 중복 전송 방지
    )
    await producer.start()

    try:
        data = {
            "device_id": "pump_01",
            "timestamp": 1719360000000000000,
            "rms": 3.42,
            "peak": 9.87,
            "crest_factor": 2.89,
            "axis": "X",
        }
        await producer.send(
            topic="pdm-vibration",
            key="pump_01",        # 같은 설비 → 같은 Partition
            value=data,
        )
    finally:
        await producer.stop()
```

### Consumer (분석 서버)

```python
from aiokafka import AIOKafkaConsumer

async def analysis_consumer():
    consumer = AIOKafkaConsumer(
        "pdm-vibration",
        bootstrap_servers=BROKER,
        group_id="analysis-group",    # 그룹 단위로 offset 관리
        value_deserializer=lambda v: json.loads(v.decode()),
        auto_offset_reset="latest",   # 새 메시지부터 (earliest: 처음부터)
        enable_auto_commit=True,
        auto_commit_interval_ms=1000,
    )
    await consumer.start()

    try:
        async for msg in consumer:
            data = msg.value
            device_id = data["device_id"]

            # FFT 분석
            if data.get("samples"):
                result = await run_fft(data["samples"], data["fs"])
                # 분석 결과를 다시 Kafka로 발행
                await producer.send("pdm-analysis", key=device_id, value=result)

            # 임계값 체크
            if data["rms"] > 7.1:
                await producer.send("pdm-alarm", key=device_id, value={
                    "device_id": device_id,
                    "type": "vibration_high",
                    "value": data["rms"],
                    "threshold": 7.1,
                })
    finally:
        await consumer.stop()
```

### Consumer (InfluxDB 저장 서버)

```python
from influxdb_client.client.influxdb_client_async import InfluxDBClientAsync
from influxdb_client import Point

async def storage_consumer():
    consumer = AIOKafkaConsumer(
        "pdm-vibration",
        "pdm-analysis",
        bootstrap_servers=BROKER,
        group_id="storage-group",    # 분석 그룹과 독립 → 같은 메시지 별도 소비
        value_deserializer=lambda v: json.loads(v.decode()),
        auto_offset_reset="latest",
    )
    await consumer.start()

    async with InfluxDBClientAsync(url=INFLUX_URL, token=TOKEN, org=ORG) as client:
        write = client.write_api()
        async for msg in consumer:
            data = msg.value
            point = (
                Point(msg.topic.replace("pdm-", ""))
                .tag("device_id", data["device_id"])
                .field("rms",  data.get("rms"))
                .field("peak", data.get("peak"))
            )
            await write.write(bucket="raw_1s", record=point)
```

---

## 설치 및 설정

### Docker Compose

```yaml
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.6.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
    volumes:
      - zookeeper_data:/var/lib/zookeeper/data

  kafka:
    image: confluentinc/cp-kafka:7.6.0
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_LOG_RETENTION_HOURS: 168    # 7일 보존
      KAFKA_LOG_RETENTION_BYTES: -1     # 크기 제한 없음
    volumes:
      - kafka_data:/var/lib/kafka/data

  # Zookeeper 없는 최신 방식 (KRaft 모드, Kafka 3.3+)
  # KAFKA_PROCESS_ROLES: broker,controller
  # KAFKA_NODE_ID: 1

volumes:
  zookeeper_data:
  kafka_data:
```

### Topic 생성

```bash
# 컨테이너 내부에서
kafka-topics.sh --create \
  --bootstrap-server kafka:9092 \
  --topic pdm-vibration \
  --partitions 3 \          # 설비 수 기준으로 설정
  --replication-factor 1    # 단일 Broker이면 1, 운영은 3

# 목록 확인
kafka-topics.sh --list --bootstrap-server kafka:9092

# 상세 정보
kafka-topics.sh --describe --topic pdm-vibration --bootstrap-server kafka:9092
```

### 메시지 직접 확인 (디버깅)

```bash
# 메시지 실시간 확인
kafka-console-consumer.sh \
  --bootstrap-server kafka:9092 \
  --topic pdm-vibration \
  --from-beginning

# 특정 Partition만
kafka-console-consumer.sh \
  --bootstrap-server kafka:9092 \
  --topic pdm-vibration \
  --partition 0 \
  --offset 0
```

---

## 주요 설정값

| 설정 | 기본값 | 설명 | 권장 |
|------|--------|------|------|
| `log.retention.hours` | 168 (7일) | 메시지 보존 기간 | 진동 원시: 3일, 집계: 90일 |
| `log.segment.bytes` | 1GB | 세그먼트 파일 크기 | 기본값 유지 |
| `replication.factor` | 1 | 복제 수 | 운영: 3 |
| `min.insync.replicas` | 1 | acks=all 시 최소 동기화 복제본 | 운영: 2 |
| `partitions` | 1 | Partition 수 | 동시 Consumer 수에 맞게 |
| `compression.type` | none | 메시지 압축 | snappy (처리량 많을 때) |

---

## 알아두면 좋은 것

### Partition 수 결정 기준

```
설비 100대, 초당 100 메시지 → Partition 3~5개로 충분
Consumer(분석 서버)를 나중에 늘릴 계획이면 → Partition을 미리 넉넉히
Partition 수 > Consumer 수면 → 일부 Consumer가 여러 Partition 담당
Partition 수 < Consumer 수면 → 일부 Consumer는 놀게 됨
```

### 수동 Offset 관리 (재처리 필요할 때)

```python
consumer = AIOKafkaConsumer(
    "pdm-vibration",
    group_id="analysis-group",
    enable_auto_commit=False,    # 자동 커밋 끄기
)

async for msg in consumer:
    try:
        await process(msg.value)
        # 처리 성공 후에만 commit
        await consumer.commit({
            TopicPartition(msg.topic, msg.partition): OffsetAndMetadata(msg.offset + 1)
        })
    except Exception:
        # 실패 시 commit 안 함 → 재시작 후 다시 읽힘
        pass
```

### Kafka UI (모니터링)

```yaml
# docker-compose에 추가
kafka-ui:
  image: provectuslabs/kafka-ui:latest
  ports:
    - "8090:8080"
  environment:
    KAFKA_CLUSTERS_0_NAME: pdm-cluster
    KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:9092
```

→ `http://localhost:8090` 에서 Topic / Consumer Group / Offset 시각적 확인

### 현재 시스템 규모에서 Kafka 도입 판단

```
지금 도입 필요 없는 경우
  - 센서 100대 이하
  - 분석 서버 1~2개
  - Python asyncio + MQTT로 충분히 처리
  → MQTT Collector → InfluxDB/Redis 직접 연결로 유지

Kafka 도입을 고려하는 경우
  - 분석 서버를 여러 개 붙이고 싶은데 같은 메시지를 각자 처리해야 할 때
  - 분석 실패 시 재처리가 필요할 때 (메시지 보존 이점)
  - 수집 서버와 분석 서버를 완전히 분리하고 싶을 때
  - 센서 수가 수백 대 이상으로 늘어날 때
```
