---
title: MQTT
domain: cs
category: network
tags: [cs, network, mqtt]
level: intermediate
status: published
created: 2026-07-16
updated: 2026-07-16
velog: false
related: ["[[06_infra/04_iiot/mqtt|MQTT (IIoT·산업 통신 관점)]]"]
---

# MQTT

## 개요

- **M**essage **Q**ueuing **T**elemetry **T**ransport
- TCP 기반 경량 Pub/Sub 메시지 프로토콜
- 저전력·저대역폭 환경(IoT, 센서, 설비)을 위해 설계됨
- 연결을 유지하면서 비동기로 메시지를 주고받음

## HTTP / WebSocket / MQTT 비교

| 항목 | HTTP | WebSocket | MQTT |
|------|------|-----------|------|
| 연결 방식 | 요청마다 | 연결 유지 | 연결 유지 |
| 방향 | 단방향 | 양방향 | 양방향 (Broker 경유) |
| 중간 서버 | 없음 | 없음 | Broker 필수 |
| 주요 용도 | REST API | 실시간 채팅/대시보드 | 센서, 설비, IoT |
| 헤더 크기 | 수백 byte | 최초 1회 | 최소 2 byte |
| QoS 보장 | 없음 | 없음 | 0 / 1 / 2 단계 |

---

## 핵심 구조 — Pub/Sub

```
   Publisher                    Broker                   Subscriber
  (센서/설비)                  (중간 서버)               (모니터링 서버)

┌──────────────┐           ┌──────────────────┐      ┌─────────────────┐
│  진동센서 A  │ ────────► │                  │ ───► │  대시보드 서버  │
├──────────────┤           │    Mosquitto      │      ├─────────────────┤
│  온도센서 B  │ ────────► │    EMQX 등        │ ───► │  알람 처리 서버 │
├──────────────┤           │                  │      ├─────────────────┤
│  압력센서 C  │ ────────► │  토픽 기반 라우팅 │ ───► │  DB 저장 서버   │
└──────────────┘           └──────────────────┘      └─────────────────┘
```

- **Publisher** — 데이터를 특정 Topic으로 발행
- **Subscriber** — 관심 있는 Topic을 구독, 메시지 수신
- **Broker** — 중간에서 라우팅. Publisher와 Subscriber는 서로 모름
- Publisher와 Subscriber는 직접 연결하지 않음 → Broker가 전부 처리

---

## Topic 구조

토픽은 `/`로 계층 구분하는 문자열

```
factory/line1/machine3/vibration
factory/line1/machine3/temperature
factory/line2/machine1/pressure

└─ factory          : 최상위 (공장)
   └─ line1         : 라인 번호
      └─ machine3   : 설비 ID
         └─ vibration : 데이터 종류
```

### 와일드카드

```
factory/line1/+/vibration    → + : 한 단계 모두 구독
                               ex) line1의 모든 설비 진동값

factory/#                    → # : 하위 전체 구독
                               ex) 공장 내 모든 센서 데이터
```

---

## QoS (Quality of Service)

메시지 전달 보장 수준을 3단계로 설정

```
┌─────────────────────────────────────────────────────────────────────┐
│  QoS 0 — At most once  (최대 1회)                                   │
│                                                                     │
│  Publisher ──────────────────────────────────────────► Subscriber  │
│              PUBLISH →                                              │
│                                                                     │
│  빠르지만 유실 가능. 응답 없음.                                       │
│  → 유실돼도 괜찮은 고빈도 센서값 (ex. 1초마다 오는 온도)               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  QoS 1 — At least once  (최소 1회)                                  │
│                                                                     │
│  Publisher ──────────────────────────────────────────► Subscriber  │
│              PUBLISH →                                              │
│             ◄── PUBACK                                              │
│                                                                     │
│  중복 가능하지만 반드시 전달됨.                                        │
│  → 알람, 이벤트 등 누락 방지 필요한 경우                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  QoS 2 — Exactly once  (정확히 1회)                                 │
│                                                                     │
│  Publisher ◄──────────────────────────────────────────► Broker     │
│              → PUBLISH   → PUBREC   → PUBREL   → PUBCOMP           │
│                                                                     │
│  Broker ◄──────────────────────────────────────────► Subscriber    │
│              (동일한 4-way handshake)                               │
│                                                                     │
│  느리지만 중복 없이 정확히 1번만 도달.                                 │
│  → 제어 명령, 설정 변경 등 중복 실행 시 위험한 경우                    │
└─────────────────────────────────────────────────────────────────────┘
```

| QoS | 전달 보장 | 중복 가능 | 속도 | 용도 |
|-----|---------|---------|------|------|
| 0 | 보장 없음 | 없음 | 가장 빠름 | 고빈도 센서 |
| 1 | 최소 1회 | 가능 | 보통 | 알람, 이벤트 |
| 2 | 정확히 1회 | 없음 | 느림 | 제어 명령 |

### QoS 0 / 1 / 2 메시지 흐름 비교

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 340" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="mqtt-qos-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="330" y="24" text-anchor="middle" font-weight="bold" font-size="16">QoS 0 / 1 / 2 메시지 교환 (Sender ↔ Receiver)</text>

  <!-- QoS 0 -->
  <text x="110" y="52" text-anchor="middle" font-size="13" font-weight="bold">QoS 0 (최대 1회)</text>
  <line x1="50" y1="64" x2="50" y2="300" stroke="#333" stroke-width="1.5"/>
  <line x1="170" y1="64" x2="170" y2="300" stroke="#333" stroke-width="1.5"/>
  <text x="50" y="78" text-anchor="middle" font-size="10">Sender</text>
  <text x="170" y="78" text-anchor="middle" font-size="10">Receiver</text>
  <line x1="50" y1="108" x2="170" y2="108" stroke="#333" stroke-width="1.5" marker-end="url(#mqtt-qos-arrow)"/>
  <text x="110" y="102" text-anchor="middle" font-size="10">PUBLISH</text>
  <rect x="22" y="250" width="176" height="44" fill="#d4edda" stroke="#333" stroke-width="1.2"/>
  <text x="110" y="270" text-anchor="middle" font-size="10">응답 없음 (fire &amp; forget)</text>
  <text x="110" y="285" text-anchor="middle" font-size="10">유실 가능 · 가장 빠름</text>

  <!-- QoS 1 -->
  <text x="330" y="52" text-anchor="middle" font-size="13" font-weight="bold">QoS 1 (최소 1회)</text>
  <line x1="270" y1="64" x2="270" y2="300" stroke="#333" stroke-width="1.5"/>
  <line x1="390" y1="64" x2="390" y2="300" stroke="#333" stroke-width="1.5"/>
  <text x="270" y="78" text-anchor="middle" font-size="10">Sender</text>
  <text x="390" y="78" text-anchor="middle" font-size="10">Receiver</text>
  <line x1="270" y1="108" x2="390" y2="108" stroke="#333" stroke-width="1.5" marker-end="url(#mqtt-qos-arrow)"/>
  <text x="330" y="102" text-anchor="middle" font-size="10">PUBLISH</text>
  <line x1="390" y1="150" x2="270" y2="150" stroke="#333" stroke-width="1.5" marker-end="url(#mqtt-qos-arrow)"/>
  <text x="330" y="144" text-anchor="middle" font-size="10">PUBACK</text>
  <rect x="242" y="250" width="176" height="44" fill="#fff3cd" stroke="#333" stroke-width="1.2"/>
  <text x="330" y="270" text-anchor="middle" font-size="10">ACK 없으면 재전송</text>
  <text x="330" y="285" text-anchor="middle" font-size="10">→ 중복 도착 가능</text>

  <!-- QoS 2 -->
  <text x="550" y="52" text-anchor="middle" font-size="13" font-weight="bold">QoS 2 (정확히 1회)</text>
  <line x1="490" y1="64" x2="490" y2="300" stroke="#333" stroke-width="1.5"/>
  <line x1="610" y1="64" x2="610" y2="300" stroke="#333" stroke-width="1.5"/>
  <text x="490" y="78" text-anchor="middle" font-size="10">Sender</text>
  <text x="610" y="78" text-anchor="middle" font-size="10">Receiver</text>
  <line x1="490" y1="104" x2="610" y2="104" stroke="#333" stroke-width="1.5" marker-end="url(#mqtt-qos-arrow)"/>
  <text x="550" y="98" text-anchor="middle" font-size="10">PUBLISH</text>
  <line x1="610" y1="138" x2="490" y2="138" stroke="#333" stroke-width="1.5" marker-end="url(#mqtt-qos-arrow)"/>
  <text x="550" y="132" text-anchor="middle" font-size="10">PUBREC</text>
  <line x1="490" y1="172" x2="610" y2="172" stroke="#333" stroke-width="1.5" marker-end="url(#mqtt-qos-arrow)"/>
  <text x="550" y="166" text-anchor="middle" font-size="10">PUBREL</text>
  <line x1="610" y1="206" x2="490" y2="206" stroke="#333" stroke-width="1.5" marker-end="url(#mqtt-qos-arrow)"/>
  <text x="550" y="200" text-anchor="middle" font-size="10">PUBCOMP</text>
  <rect x="462" y="250" width="176" height="44" fill="#f8d7da" stroke="#333" stroke-width="1.2"/>
  <text x="550" y="270" text-anchor="middle" font-size="10">4-way로 중복 제거</text>
  <text x="550" y="285" text-anchor="middle" font-size="10">가장 느림 · 정확히 1회</text>
</svg>

*QoS가 올라갈수록 확인 패킷(PUBACK / PUBREC·PUBREL·PUBCOMP)이 늘어 신뢰성은 높아지지만 왕복 횟수와 지연이 커진다. 고빈도 센서값은 0, 알람은 1, 제어 명령은 2가 적합하다.*

---

## Retain / LWT

### Retain 메시지
```
Broker가 마지막 메시지를 저장해둠
→ 새 Subscriber가 연결되면 즉시 마지막 값 수신
→ 설비 현재 상태값 유지에 유용
```

```python
client.publish("factory/line1/machine3/status", "running", retain=True)
# 이후 새로 연결된 subscriber도 "running" 바로 수신
```

### LWT (Last Will and Testament) — 유언 메시지
```
클라이언트가 비정상 종료 시 Broker가 대신 발행하는 메시지
→ 설비 연결 끊김 감지에 핵심
```

```python
client.will_set(
    topic="factory/line1/machine3/status",
    payload="disconnected",
    qos=1,
    retain=True
)
# 센서가 갑자기 끊기면 Broker가 "disconnected" 자동 발행
```

---

## 실무 구조 — 설비 예지보전 모니터링

```
     [현장]                    [브로커]                  [서버]                [서비스]
                           ┌──────────────┐
┌────────────────┐         │              │         ┌──────────────┐
│  진동센서      │         │  Mosquitto   │         │  FastAPI     │      ┌──────────────┐
│ (Raspberry Pi) │ ──────► │   Broker     │ ──────► │  Node 서버   │ ───► │  대시보드    │
│ publish        │         │              │         │  (subscribe) │      │ (웹브라우저) │
│ factory/line1/ │         │              │         └──────┬───────┘      └──────────────┘
│ machine1/vib.. │         │              │                │
└────────────────┘         │              │                ▼
                           │              │         ┌──────────────┐
┌────────────────┐         │              │         │  InfluxDB    │
│  온도센서      │ ──────► │              │ ──────► │ (TimeSeries) │
│  (ESP32)       │         │              │         └──────────────┘
│ publish        │         │              │
│ factory/line1/ │         │              │
│ machine1/temp..│         │              │
└────────────────┘         │              │
                           │              │                           ┌──────────────┐
┌────────────────┐         │              │ ────────────────────────► │  설비 제어기 │
│  제어 서버     │ ──────► │              │                           │  (subscribe) │
│ publish        │         │              │                           └──────────────┘
│ factory/line1/ │         └──────────────┘
│ machine1/cmd   │
└────────────────┘
```

---

## 구현 — Python (paho-mqtt)

### 설치
```bash
pip install paho-mqtt
```

### Publisher (센서 → Broker)
```python
import paho.mqtt.client as mqtt
import json, time

BROKER = "192.168.1.100"
TOPIC  = "factory/line1/machine1/vibration"

client = mqtt.Client(client_id="sensor-vib-001")

# LWT 등록: 비정상 종료 시 Broker가 자동 발행
client.will_set(
    topic="factory/line1/machine1/status",
    payload="disconnected",
    qos=1,
    retain=True,
)

client.connect(BROKER, port=1883, keepalive=60)
client.loop_start()

while True:
    payload = json.dumps({
        "machine_id": "machine1",
        "value": read_vibration_sensor(),  # 실제 센서 읽기
        "unit": "mm/s",
        "timestamp": time.time(),
    })
    client.publish(TOPIC, payload, qos=1)
    time.sleep(1)
```

### Subscriber (서버 → DB 저장)
```python
import paho.mqtt.client as mqtt
import json

BROKER = "192.168.1.100"

def on_connect(client, userdata, flags, rc):
    print(f"Connected: {rc}")
    client.subscribe("factory/#", qos=1)   # 공장 전체 구독

def on_message(client, userdata, msg):
    topic = msg.topic
    data  = json.loads(msg.payload.decode())
    print(f"[{topic}] {data}")
    save_to_influxdb(topic, data)           # DB 저장

client = mqtt.Client(client_id="monitor-server")
client.on_connect = on_connect
client.on_message = on_message

client.connect(BROKER, port=1883, keepalive=60)
client.loop_forever()   # 블로킹, 메시지 계속 수신
```

### 비동기 처리 (FastAPI + aiomqtt)
```python
# pip install aiomqtt
import asyncio
import aiomqtt

async def listen():
    async with aiomqtt.Client("192.168.1.100") as client:
        await client.subscribe("factory/#")
        async for message in client.messages:
            topic = str(message.topic)
            data  = message.payload.decode()
            await process(topic, data)

asyncio.run(listen())
```

---

## Broker 선택

| Broker | 특징 | 적합한 규모 |
|--------|------|-----------|
| Mosquitto | 경량, 오픈소스, 설정 단순 | 소규모, 단일 서버 |
| EMQX | 클러스터, 웹 대시보드, 고성능 | 중~대규모 |
| HiveMQ | 엔터프라이즈, 유료 | 대규모 상용 |
| AWS IoT Core | 관리형, AWS 연동 | 클라우드 기반 |

### Mosquitto 빠른 설정
```bash
# 설치
sudo apt install mosquitto mosquitto-clients

# 설정 (/etc/mosquitto/mosquitto.conf)
listener 1883
allow_anonymous true   # 개발용. 운영은 반드시 인증 추가

# 재시작
sudo systemctl restart mosquitto

# 테스트
mosquitto_sub -h localhost -t "factory/#" -v &
mosquitto_pub -h localhost -t "factory/line1/machine1/vibration" -m '{"value": 3.2}'
```

---

## 보안

```
운영 환경에서는 반드시 적용

1. 인증 (username/password)
   client.username_pw_set("user", "password")

2. TLS 암호화
   client.tls_set(ca_certs="ca.crt")
   client.connect(BROKER, port=8883)   # 8883 = MQTT over TLS

3. ACL (토픽별 권한 제어)
   sensor-001 → publish  factory/line1/machine1/#
   monitor    → subscribe factory/#
```

---

## 주요 고려사항

### 연결 유지
- `keepalive` 초 단위 설정 → 이 시간 내 통신 없으면 PINGREQ 자동 전송
- 네트워크 단절 시 `on_disconnect` 콜백에서 재연결 로직 구현

```python
def on_disconnect(client, userdata, rc):
    if rc != 0:
        client.reconnect()   # 비정상 종료 시 재연결
```

### 메시지 버퍼링
- QoS 1/2는 Broker가 오프라인 Subscriber를 위해 메시지 큐잉
- Subscriber 재연결 시 Clean Session = False 로 설정하면 미수신 메시지 수신 가능

```python
client = mqtt.Client(client_id="monitor-server", clean_session=False)
```

### 스케일 아웃
```
단일 Broker 한계 초과 시 → EMQX 클러스터 구성
                          또는 토픽별 Broker 분리
                          + 백엔드에서 메시지 큐(Kafka) 연동
```

---

## 실제 모니터링 시스템 연계

> 실제 운영 중인 설비 예지보전 시스템 기준. 내부 서버 구조에 MQTT가 어떻게 들어가는지.

### 전체 데이터 흐름

```
      [엣지]                  [브로커]              [Collector]          [저장 / 분석]           [서비스]

┌──────────────────┐    ┌──────────────┐    ┌────────────────┐    ┌──────────────────┐    ┌──────────────┐
│  진동센서        │    │              │    │                │    │    InfluxDB      │    │   Grafana    │
│ (Raspberry Pi    │    │  Mosquitto   │    │    Python      │    │  raw_1s   (7일)  │    │  대시보드    │
│  / DAQ)          │    │   Broker     │    │   Collector    │───►│  1min_agg (90일) │    │              │
│  QoS 1           │───►│ ( internal ) │───►│                │    │  1h_agg   (3년)  │    ├──────────────┤
│  pdm/.../vib     │    │              │    │                │    │  waveform (3일)  │    │  WebSocket   │
├──────────────────┤    │              │    │                │    └──────────────────┘    │  실시간 push │
│  온도센서        │    │              │    │                │                            │              │
│  (ESP32)         │───►│  pdm/#       │    │                │    ┌──────────────────┐───►│  웹 대시보드 │
│  QoS 1           │    │  구독        │    │                │    │      Redis       │    └──────────────┘
│  pdm/.../temp    │    │              │    │                │───►│  latest:{id}     │
└──────────────────┘    │              │    │                │    │  alarm:{id}      │    ┌──────────────┐
                        │              │    └────────────────┘    │  rms_history:{id}│    │  Alerting    │
┌──────────────────┐    │              │                          └──────────────────┘    │  Slack / SMS │
│  LWT 감지        │    │              │    ┌────────────────┐                            └──────────────┘
│ (비정상 종료)    │    │              │    │ Analysis Engine│    ┌──────────────────┐          ▲
│  Broker 자동발행 │───►│              │───►│  FFT / Kurtosis│───►│  이상 감지 결과  │──────────┘
└──────────────────┘    └──────────────┘    │  ML 이상감지   │    └──────────────────┘
                                            └────────────────┘
```

---

### 토픽 네이밍 규칙

```
pdm/{site}/{equipment_type}/{device_id}/{data_type}

pdm/line1/pump/pump_01/vibration       ← 진동 RMS/Peak
pdm/line1/pump/pump_01/temperature     ← 온도
pdm/line1/motor/motor_03/current       ← 전류
pdm/line1/pump/pump_01/waveform        ← 고해상도 원시 파형 (트리거 시)
pdm/line1/pump/pump_01/status          ← LWT 연결 상태
```

와일드카드 활용:
```
pdm/line1/pump/+/vibration   → line1 모든 펌프 진동값만
pdm/line1/#                  → line1 전체 데이터
pdm/#                        → 전 공장 데이터
```

---

### QoS 선택 기준 (실제 적용)

| 데이터 | QoS | 이유 |
|--------|-----|------|
| 1초 주기 RMS, 온도 | **0** | 유실돼도 다음 메시지 곧 옴. 속도 우선 |
| 알람 이벤트, 임계 초과 | **1** | 누락 불가. 중복은 멱등 처리로 수용 |
| 제어 명령 (설비 ON/OFF) | **2** | 중복 실행 시 위험 → 정확히 1회 보장 |
| 고해상도 파형 (트리거) | **1** | 크기가 크므로 재전송 부담 고려, 누락 방지 우선 |

---

### Python Collector 실제 구현 패턴

```python
import asyncio
import aiomqtt
import json
from influxdb_client.client.influxdb_client_async import InfluxDBClientAsync
from influxdb_client import Point
import redis.asyncio as aioredis

BROKER  = "mosquitto"       # docker-compose 서비스명
INFLUX  = "http://influxdb:8086"
TOKEN   = "..."
ORG     = "pdm"
BUCKET  = "raw_1s"

async def handle(topic: str, data: dict):
    parts = topic.split("/")           # pdm/line1/pump/pump_01/vibration
    device_id  = parts[3]
    data_type  = parts[4]

    async with InfluxDBClientAsync(url=INFLUX, token=TOKEN, org=ORG) as client:
        write = client.write_api()
        point = (
            Point(data_type)
            .tag("device_id", device_id)
            .tag("site", parts[1])
            .tag("equipment", parts[2])
            .field("rms",          data.get("rms"))
            .field("peak",         data.get("peak"))
            .field("crest_factor", data.get("crest_factor"))
        )
        await write.write(bucket=BUCKET, record=point)

    r = aioredis.Redis(host="redis", port=6379)
    await r.hset(f"latest:{device_id}", mapping={
        "rms":        data.get("rms"),
        "peak":       data.get("peak"),
        "updated_at": data.get("timestamp"),
    })
    await r.expire(f"latest:{device_id}", 300)   # 5분 TTL

async def main():
    async with aiomqtt.Client(BROKER) as client:
        await client.subscribe("pdm/#", qos=1)
        async for msg in client.messages:
            topic = str(msg.topic)
            data  = json.loads(msg.payload.decode())
            asyncio.create_task(handle(topic, data))   # 비블로킹 처리

asyncio.run(main())
```

---

### 엣지 디바이스 네트워크 단절 대응

현장 네트워크는 불안정할 수 있음. 단절 중 데이터 유실 방지 패턴:

```python
import sqlite3, threading, queue

local_q = queue.Queue()   # 메모리 큐 (단기 버퍼)

def publish_with_retry(client, topic, payload, qos=1):
    try:
        result = client.publish(topic, payload, qos=qos)
        if result.rc != 0:
            raise Exception("publish failed")
    except Exception:
        # 로컬 SQLite에 저장 (네트워크 단절 시 백업)
        with sqlite3.connect("local_buffer.db") as db:
            db.execute(
                "INSERT INTO buffer (topic, payload, ts) VALUES (?,?,?)",
                (topic, payload, time.time())
            )

def flush_local_buffer(client):
    """재연결 후 호출 — 로컬에 쌓인 메시지 일괄 전송"""
    with sqlite3.connect("local_buffer.db") as db:
        rows = db.execute("SELECT rowid, topic, payload FROM buffer ORDER BY ts").fetchall()
        for rowid, topic, payload in rows:
            client.publish(topic, payload, qos=1)
            db.execute("DELETE FROM buffer WHERE rowid=?", (rowid,))

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        flush_local_buffer(client)   # 연결 복구 시 자동 flush
```

---

### LWT로 설비 연결 상태 감지

```python
# 센서 프로세스 시작 시 LWT 등록
client.will_set(
    topic=f"pdm/line1/pump/pump_01/status",
    payload=json.dumps({"status": "disconnected", "ts": time.time()}),
    qos=1,
    retain=True,
)
client.connect(BROKER, 1883, keepalive=30)

# 정상 연결 시 status를 online으로 발행
client.publish(
    f"pdm/line1/pump/pump_01/status",
    json.dumps({"status": "online", "ts": time.time()}),
    qos=1,
    retain=True,
)
```

```python
# 수집 서버에서 status 토픽 모니터링
async def handle_status(device_id, data):
    status = data.get("status")
    r = aioredis.Redis(host="redis", port=6379)

    if status == "disconnected":
        await r.hset(f"alarm:{device_id}", mapping={"type": "connection_lost"})
        await send_slack_alert(f"설비 {device_id} 연결 끊김")
    elif status == "online":
        await r.hdel(f"alarm:{device_id}", "type")
```

---

### 적응형 샘플링 + 파형 트리거

```
┌──────────────────────────────────┬──────────────────────────────────────┐
│         평상시                    │          임계 초과 시                 │
├──────────────────────────────────┼──────────────────────────────────────┤
│  진동센서                         │  진동센서                             │
│  │ 1kHz 샘플링                   │  │ 25.6kHz 고해상도 샘플링            │
│  │ RMS / Peak 계산               │  │ 원시 파형 수집                     │
│  │                               │  │                                   │
│  │ publish QoS 0                 │  │ publish QoS 1                     │
│  │ pdm/.../vibration             │  │ pdm/.../waveform                  │
│  │ {"rms": 3.4, "peak": 9.8}    │  │ {"samples": [...25600개...],      │
│  │                               │  │  "fs": 25600}                     │
│  ▼                               │  ▼                                   │
│  InfluxDB raw_1s                 │  InfluxDB waveform bucket            │
│  (정기 저장)                      │  (3일 보존, FFT 분석용)               │
└──────────────────────────────────┴──────────────────────────────────────┘
```

```python
THRESHOLD_RMS = 7.1   # mm/s

def decide_sampling(rms):
    if rms > THRESHOLD_RMS:
        # 고해상도 파형 수집 후 별도 토픽으로 발행
        waveform = capture_waveform(fs=25600, duration=1.0)
        client.publish(
            f"pdm/line1/pump/pump_01/waveform",
            json.dumps({"samples": waveform, "fs": 25600, "trigger_rms": rms}),
            qos=1
        )
```

---

### 개발 / 운영 서버 배포 구조에서의 MQTT 위치

```
                    ┌────────────────────┐
                    │    현장 센서        │
                    │  (Raspberry Pi     │
                    │   / ESP32 / DAQ)   │
                    └────────┬───────────┘
                             │ MQTT 1883
               ┌─────────────┴──────────────┐
               ▼                            ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│       개발 서버            │  │       운영 서버            │
│  ← 개발 / 테스트 환경     │  │  ← 프로덕션 환경          │
├──────────────────────────┤  ├──────────────────────────┤
│  Mosquitto  (dev)        │  │  Mosquitto  (prod)       │
│  Python Collector (dev)  │  │  Python Collector (prod) │
│  InfluxDB   (dev)        │  │  InfluxDB   (prod)       │
│  Redis      (dev)        │  │  Redis      (prod)       │
└──────────────────────────┘  └────────────┬─────────────┘
                                           │ WebSocket (socket.io)
                                           ▼
                              ┌──────────────────────────┐
                              │   nginx-server (int)     │
                              └────────────┬─────────────┘
                                           │ HTTPS
                                           ▼
                              ┌──────────────────────────┐
                              │    브라우저 대시보드       │
                              │   <DOMAIN>        │
                              └──────────────────────────┘
```

- MQTT Broker는 외부 노출 없이 내부 컨테이너 네트워크로만 통신
- 센서 → Broker 구간만 네트워크 개방 (포트 1883 / TLS는 8883)
- 대시보드로의 실시간 push는 MQTT가 아닌 WebSocket (socket.io) 사용

---

### 알아두면 좋은 것

#### MQTT vs Kafka — 언제 Kafka로 넘어가는가
```
MQTT                           Kafka
────────────────────           ────────────────────
디바이스 ↔ 서버 통신            서버 ↔ 서버 통신
연결 수 많고 메시지 작음        메시지 처리량이 기준
Broker가 라우팅                파티션으로 병렬 소비
메시지 보존 안함 (기본)        메시지 보존 (재처리 가능)
100대 이하 센서: MQTT로 충분   분석 서버 여러 개: Kafka 고려
```

현재 규모(100대 이하)에서는 MQTT만으로 충분.
수집 서버가 병목이면 Kafka를 MQTT와 수집 서버 사이에 끼워 넣는 패턴 사용.

#### 메시지 페이로드 설계
```python
# 좋은 예 — 타임스탬프는 센서에서 찍기 (서버 도착 시간 X)
{
    "device_id": "pump_01",
    "timestamp": 1719360000000000000,   # nanoseconds (InfluxDB 기본 단위)
    "rms": 3.42,
    "peak": 9.87,
    "crest_factor": 2.89,
    "axis": "X",
    "fs": 1000
}

# 나쁜 예 — 서버 도착 시간으로 타임스탬프 찍으면
# 네트워크 지연 / 버퍼 flush 시점에 따라 시계열이 틀어짐
```

#### InfluxDB 배치 쓰기 (성능)
```python
# 단건 쓰기는 느림 — 배치로 묶어서 한번에
from influxdb_client.client.write_api import WriteOptions

write_api = client.write_api(write_options=WriteOptions(
    batch_size=500,        # 500 포인트마다 flush
    flush_interval=1000,   # 또는 1초마다 flush
))
# 이후 write() 호출은 자동으로 배치 처리됨
```

#### 진동 분석과 MQTT의 연결 지점
```
MQTT 토픽              수집 서버 처리              분석 엔진

pdm/.../vibration  →  InfluxDB raw_1s 저장   →  1분마다 RMS 트렌드 체크
                   →  Redis 최신값 갱신            임계 초과 시 알람

pdm/.../waveform   →  InfluxDB waveform 저장  →  FFT 분석
                                                  주파수 스펙트럼 계산
                                                  Kurtosis / Crest Factor
                                                  ML 이상 감지

pdm/.../status     →  Redis alarm 상태 갱신   →  WebSocket으로 대시보드 push
                   →  Slack / SMS 알림
```
