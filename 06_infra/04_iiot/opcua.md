---
title: OPC UA (OPC Unified Architecture)
domain: infra
category: iiot
tags: [infra, iiot]
level: intermediate
status: published
created: 2026-07-13
updated: 2026-07-13
velog: true
related: []
---

# OPC UA (OPC Unified Architecture)

## 개요

- **산업 자동화 표준 통신 프로토콜** — OPC Foundation 주도, IEC 62541
- PLC, SCADA, DCS, 센서 등 이기종 산업 장비 간 **표준 인터페이스**
- 보안(TLS), 데이터 모델링, 실시간 구독을 하나의 표준으로 통합
- "OPC Classic(DCOM 기반, Windows 전용)"의 후계 → 플랫폼 독립

```
┌─────────────────────────────────────────────────────────────┐
│                        핵심 특징                             │
├──────────────────────┬──────────────────────────────────────┤
│  표준화된 데이터 모델 │ 설비 정보를 노드/주소 공간으로 표현  │
│  보안 내장            │ TLS + 인증서 기반 암호화·인증        │
│  플랫폼 독립          │ Windows / Linux / 임베디드 모두 가능 │
│  실시간 구독          │ Subscription + MonitoredItem 변경 감지│
│  이력 조회            │ Historical Access — 과거 데이터 요청 │
│  서비스 지향          │ Read / Write / Subscribe / Method Call│
└──────────────────────┴──────────────────────────────────────┘
```

---

## MQTT vs OPC UA — 언제 뭘 쓰는가

```
┌──────────────────────────────┐    ┌──────────────────────────────┐
│             MQTT             │    │            OPC UA            │
├──────────────────────────────┤    ├──────────────────────────────┤
│ IoT 센서 ↔ 클라우드           │    │ PLC / SCADA ↔ 서버            │
│ 경량, 저전력 디바이스         │    │ 산업 제어 장비 (OPC UA 내장)  │
│ 토픽 기반 단순 발행           │    │ 주소 공간 기반 구조화된 데이터 │
│ 데이터 모델 자유              │    │ 표준 데이터 모델 강제          │
│ 보안 별도 구성                │    │ 보안 표준 내장                │
│ 단방향 주도 (발행)            │    │ 읽기/쓰기/메서드 호출 모두 가능│
└──────────────────────────────┘    └──────────────────────────────┘
```

**실제 현장 구성:**

```
┌─────────────────────────────┐
│  PLC / 인버터 / 진동계측기   │
│  (OPC UA 서버 내장)          │
└──────────────┬──────────────┘
               │ OPC UA
               ▼
┌─────────────────────────────┐
│   OPC UA Client             │
│   (Python 수집 서버)         │
└──────────────┬──────────────┘
               │ 변환
               ▼
┌─────────────────────────────┐
│   MQTT Broker               │
│   → 이후 파이프라인 동일     │
└─────────────────────────────┘
```

→ 장비가 OPC UA를 지원하면 MQTT보다 OPC UA로 직접 연결이 더 정확하고 표준적

---

## 핵심 구조

### 주소 공간 (Address Space)

OPC UA 서버는 모든 데이터를 **노드(Node)** 로 표현하고 계층 구조로 구성

```
Root
└── Objects
    └── Line1
        └── Pump01
            ├── [ Variable ] VibrationRMS   → 현재값 읽기/구독
            ├── [ Variable ] Temperature
            ├── [ Variable ] RPM
            ├── [  Method  ] Start()        → 원격 실행
            └── Specifications
                ├── [ Variable ] Manufacturer  → "KSB"
                ├── [ Variable ] MaxRPM        → 3000
                └── [ Variable ] SerialNumber  → "SN-2024-0042"
```

### 노드 ID (NodeId)

각 노드는 고유한 NodeId로 식별

```
ns=2;i=1001        → 숫자 ID
ns=2;s=Pump01.RMS  → 문자열 ID
ns=2;g=550e8400-...→ GUID

ns = Namespace Index (0: OPC UA 표준, 1+: 서버 정의)
```

### 통신 방식

```
┌─────────────────────────────────────────────────────┐
│  1. Read  —  클라이언트가 노드 값을 일회성 요청      │
├─────────────────────────────────────────────────────┤
│  Client ──── Read(NodeId) ───────────────────────► Server │
│  Client ◄─── Value ──────────────────────────────        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  2. Write  —  클라이언트가 노드 값 변경               │
├─────────────────────────────────────────────────────┤
│  Client ──── Write(NodeId, Value) ───────────────► Server │
│  Client ◄─── OK ────────────────────────────────         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  3. Subscribe  —  값 변화 시 서버가 자동 전송 (핵심) │
├─────────────────────────────────────────────────────┤
│  Client ──── CreateSubscription ─────────────────► Server │
│  Client ──── CreateMonitoredItem ────────────────► Server │
│  Client ◄─── Notification(변경값) ── (변경 시마다)        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  4. Method  —  서버의 함수 원격 실행                  │
├─────────────────────────────────────────────────────┤
│  Client ──── Call(MethodId, args) ───────────────► Server │
│  Client ◄─── Result ────────────────────────────         │
└─────────────────────────────────────────────────────┘
```

---

## 구조도 — 시스템 내 위치

```
┌──────────────────────────┐     ┌──────────────────────────┐     ┌──────────────────────────┐
│      현장 설비            │     │        수집 계층           │     │       저장 / 분석          │
│  (OPC UA 서버 내장)       │     │                          │     │                          │
├──────────────────────────┤     ├──────────────────────────┤     ├──────────────────────────┤
│                          │     │                          │     │                          │
│  PLC (지멘스 S7)          │     │                          │──►  │  InfluxDB (시계열)        │
│  OPC UA Server 내장       ├────►│                          │     │                          │
│                          │     │  Python OPC UA Client    │──►  │  Redis (최신값)           │
│  인버터 (ABB)             │     │  (Subscribe·변환·라우팅) │     │                          │
│  OPC UA Server 내장       ├────►│                          │──►  │  MQTT Broker             │
│                          │     │                          │     │  (하류 파이프라인)         │
│  진동계측기               │     │                          │     │                          │
│  OPC UA Server 내장       ├────►│                          │──►  │  AAS Server              │
│                          │     │                          │     │  (표준 디지털 트윈)        │
└──────────────────────────┘     └──────────────────────────┘     └──────────────────────────┘
```

---

## 구현 — Python (opcua-asyncio)

```bash
pip install asyncua
```

### 기본 연결 및 값 읽기

```python
from asyncua import Client

async def read_values():
    async with Client(url="opc.tcp://192.168.1.50:4840") as client:
        # NodeId로 직접 읽기
        node = client.get_node("ns=2;s=Line1.Pump01.VibrationRMS")
        value = await node.read_value()
        print(f"VibrationRMS: {value}")

        # 경로로 탐색
        root   = client.get_root_node()
        pump01 = await root.get_child(["0:Objects", "2:Line1", "2:Pump01"])
        rms    = await pump01.get_child("2:VibrationRMS")
        print(await rms.read_value())
```

### Subscription — 변경 시 자동 수신 (핵심 패턴)

```python
from asyncua import Client
from asyncua.common.subscription import SubHandler
import asyncio, json
import paho.mqtt.client as mqtt

class VibrationHandler(SubHandler):
    def __init__(self, mqtt_client):
        self.mqtt = mqtt_client

    def datachange_notification(self, node, val, data):
        """노드 값 변경 시 자동 호출"""
        device_id = str(node).split(".")[-2]   # NodeId에서 device_id 추출
        payload = json.dumps({
            "device_id": device_id,
            "value": val,
            "timestamp": data.monitored_item.Value.SourceTimestamp.isoformat(),
        })
        # MQTT로 변환 발행 → 이후 파이프라인 동일
        self.mqtt.publish(f"pdm/line1/pump/{device_id}/vibration", payload, qos=1)

async def subscribe_all_pumps():
    mqtt_client = mqtt.Client()
    mqtt_client.connect("mosquitto", 1883)
    mqtt_client.loop_start()

    async with Client(url="opc.tcp://192.168.1.50:4840") as client:
        handler = VibrationHandler(mqtt_client)
        subscription = await client.create_subscription(
            period=1000,    # 1초마다 서버가 변경 확인
            handler=handler,
        )

        # 모니터링할 노드 등록
        nodes = [
            client.get_node("ns=2;s=Line1.Pump01.VibrationRMS"),
            client.get_node("ns=2;s=Line1.Pump01.Temperature"),
            client.get_node("ns=2;s=Line1.Motor03.RPM"),
        ]
        await subscription.subscribe_data_change(nodes)

        # 연결 유지
        await asyncio.sleep(float("inf"))
```

### Method 호출 — 원격 제어

```python
async def start_pump(client, pump_id: str):
    pump_node = client.get_node(f"ns=2;s=Line1.{pump_id}")
    method    = await pump_node.get_child("2:Start")

    result = await pump_node.call_method(method, 1500)   # 인자: 목표 RPM
    print(f"Start result: {result}")

async def stop_pump(client, pump_id: str):
    pump_node = client.get_node(f"ns=2;s=Line1.{pump_id}")
    await pump_node.call_method("2:Stop")
```

### Historical Access — 과거 데이터 조회

```python
from asyncua import ua
from datetime import datetime, timedelta, timezone

async def read_history(client):
    node = client.get_node("ns=2;s=Line1.Pump01.VibrationRMS")

    end   = datetime.now(timezone.utc)
    start = end - timedelta(hours=1)

    history = await node.read_raw_history(
        starttime=start,
        endtime=end,
        numvalues=0,    # 0 = 제한 없음
    )
    for dv in history:
        print(f"{dv.SourceTimestamp}: {dv.Value.Value}")
```

---

## OPC UA 서버 직접 구축 (Python)

장비가 OPC UA를 지원하지 않을 때 → Python으로 OPC UA 서버 구축 후 노출

```python
from asyncua import Server
from asyncua import ua
import asyncio, time

async def run_server():
    server = Server()
    await server.init()
    server.set_endpoint("opc.tcp://0.0.0.0:4840/pdm/")
    server.set_server_name("PDM OPC UA Server")

    # Namespace 등록
    ns = await server.register_namespace("urn:pdm:ulsan")

    # 주소 공간 구성
    objects = server.get_objects_node()
    line1   = await objects.add_object(ns, "Line1")
    pump01  = await line1.add_object(ns, "Pump01")

    # Variable 노드 추가
    vib_rms = await pump01.add_variable(ns, "VibrationRMS", 0.0)
    temp    = await pump01.add_variable(ns, "Temperature",  0.0)
    await vib_rms.set_writable()   # 외부에서 쓰기 허용

    async with server:
        while True:
            # 실제 센서값으로 업데이트
            rms  = read_vibration_sensor()
            t    = read_temperature_sensor()
            await vib_rms.write_value(rms)
            await temp.write_value(t)
            await asyncio.sleep(1)
```

---

## 보안 설정

OPC UA는 보안 3단계를 표준으로 지원

```
보안 수준 (낮음 ──────────────────────────────────────────► 높음)

┌─────────────────┐
│  None           │  암호화/인증 없음   (개발·테스트 전용)
└────────┬────────┘
         │ 보안 강화
         ▼
┌─────────────────────────────┐
│  Sign                       │  서명 추가 — 무결성 보장
└────────────────┬────────────┘  (위변조 감지 가능)
                 │ 보안 강화
                 ▼
┌─────────────────────────────────────────┐
│  SignAndEncrypt                         │  서명 + TLS 암호화
└─────────────────────────────────────────┘  (운영 환경 필수)
```

```python
from asyncua.crypto.security_policies import SecurityPolicyBasic256Sha256
from asyncua import ua

async def secure_connect():
    client = Client(url="opc.tcp://192.168.1.50:4840")
    await client.set_security(
        SecurityPolicyBasic256Sha256,
        certificate="client_cert.pem",
        private_key="client_key.pem",
        server_certificate="server_cert.pem",
        mode=ua.MessageSecurityMode.SignAndEncrypt,
    )
    await client.connect()
```

---

## 설치 및 설정 — Docker로 OPC UA 서버 테스트

개발·테스트용 OPC UA 서버 (Prosys OPC UA Simulation Server 대신)

```yaml
services:
  opcua-server:
    image: ghcr.io/umati/sample-server:latest
    ports:
      - "4840:4840"
    # 접속: opc.tcp://localhost:4840
```

UaExpert (무료 GUI 클라이언트)로 주소 공간 탐색 가능
→ NodeId 확인, 값 모니터링, Method 호출 테스트

---

## 실제 모니터링 시스템 연계

### OPC UA → MQTT 브리지 패턴

현장 설비는 OPC UA, 서버 파이프라인은 MQTT 기반일 때 브리지 구성

```python
async def opcua_to_mqtt_bridge():
    """OPC UA 변경 감지 → MQTT 변환 발행"""

    DEVICE_NODE_MAP = {
        "ns=2;s=Line1.Pump01.VibrationRMS":  "pdm/line1/pump/pump_01/vibration",
        "ns=2;s=Line1.Pump01.Temperature":   "pdm/line1/pump/pump_01/temperature",
        "ns=2;s=Line1.Motor03.RPM":          "pdm/line1/motor/motor_03/rpm",
    }

    mqtt_client = mqtt.Client(client_id="opcua-bridge")
    mqtt_client.connect("mosquitto", 1883)
    mqtt_client.loop_start()

    class BridgeHandler(SubHandler):
        def datachange_notification(self, node, val, data):
            node_id = str(node.nodeid)
            topic   = DEVICE_NODE_MAP.get(node_id)
            if topic:
                payload = json.dumps({
                    "value":     val,
                    "timestamp": data.monitored_item.Value.SourceTimestamp.isoformat(),
                })
                mqtt_client.publish(topic, payload, qos=1)

    async with Client("opc.tcp://plc-line1:4840") as client:
        sub = await client.create_subscription(500, BridgeHandler())
        await sub.subscribe_data_change([
            client.get_node(nid) for nid in DEVICE_NODE_MAP
        ])
        await asyncio.sleep(float("inf"))
```

### Collector에서 OPC UA와 MQTT 동시 수집

```python
async def main():
    await asyncio.gather(
        opcua_to_mqtt_bridge(),   # PLC → MQTT
        mqtt_collector(),         # MQTT → InfluxDB/Redis
    )
```

### 데이터 흐름 요약

```
┌──────────────────────────────────────────────┐
│  PLC (OPC UA 서버)                            │
│  ns=2;s=Line1.Pump01.VibrationRMS = 3.42     │
└───────────────────────┬──────────────────────┘
                        │ Subscribe (변경 감지)
                        ▼
┌──────────────────────────────────────────────┐
│  브리지 (Python OPC UA Client)                │
│  datachange_notification() 호출              │
└───────────────────────┬──────────────────────┘
                        │ 변환·발행
                        ▼
┌──────────────────────────────────────────────┐
│  MQTT Broker                                  │
│  topic  : pdm/line1/pump/pump_01/vibration   │
│  payload: {"value": 3.42, "timestamp": "..."}│
└───────────────────────┬──────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────┐
│  Collector                                    │
│  ──►  InfluxDB   (시계열 저장)                │
│  ──►  Redis      (최신값 캐시)                │
│  ──►  AAS Server (디지털 트윈 업데이트)       │
└──────────────────────────────────────────────┘
```

---

## 알아두면 좋은 것

### OPC UA Companion Specification

산업별 표준 데이터 모델 — 노드 구조를 직접 설계하지 않아도 됨

| Specification | 대상 |
|---------------|------|
| OPC UA for Machinery | 일반 기계 설비 |
| OPC UA for PLC (PLCopen) | PLC 데이터 |
| OPC UA for Pumps | 펌프 |
| OPC UA for CNC | CNC 공작기계 |
| OPC UA for Drives | 인버터/드라이브 |

→ 설비 종류에 맞는 Companion Spec 노드 구조 사용 시 이기종 툴 자동 호환

### OPC UA + AAS 연계

```
AAS Submodel: OperationalData
  → OPC UA 주소 공간의 노드와 1:1 매핑
  → AAS Asset Interfaces Description (IDTA-02017)이 표준 매핑 방법 정의

실제 흐름
  OPC UA 노드 변경
    → Collector가 읽어 AAS Property 업데이트
    → AAS REST API로 외부 시스템에 노출
```

### 주소 공간 탐색 — NodeId 모를 때

```python
async def browse_address_space(client, node=None, indent=0):
    """서버 전체 주소 공간 출력 — 처음 연결 시 NodeId 파악용"""
    if node is None:
        node = client.get_root_node()

    children = await node.get_children()
    for child in children:
        name    = await child.read_browse_name()
        node_id = child.nodeid
        print("  " * indent + f"{name.Name}  [{node_id}]")
        await browse_address_space(client, child, indent + 1)

# 사용
async with Client("opc.tcp://plc:4840") as client:
    await browse_address_space(client)
```

### 주요 에러 & 대응

| 에러 | 원인 | 대응 |
|------|------|------|
| `BadSecurityChecksFailed` | 인증서 불일치 | 서버 인증서 재발급 또는 None 모드로 테스트 |
| `BadNodeIdUnknown` | NodeId 오타 | UaExpert로 실제 NodeId 확인 |
| `BadTooManySubscriptions` | 구독 수 초과 | 서버 설정 `maxSubscriptionsPerSession` 증가 |
| `BadConnectionClosed` | 네트워크 단절 | `on_disconnect` 핸들러에서 재연결 로직 |
| `BadTimeout` | 응답 지연 | `timeout` 파라미터 늘리기 |
