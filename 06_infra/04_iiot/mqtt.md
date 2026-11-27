---
title: MQTT
domain: infra
category: iiot
tags: [infra, iiot]
level: intermediate
status: published
created: 2026-07-09
updated: 2026-07-09
velog: true
related: ["[[01_cs/02_network/06_mqtt/mqtt|MQTT (네트워크 프로토콜 관점)]]"]
---

# MQTT

> **ISO/IEC 20922 · OASIS 표준** | TCP 포트 1883 (TLS: 8883) | Publish/Subscribe

---

## 개요

MQTT(Message Queuing Telemetry Transport)는 저대역폭·고지연 환경을 위해 설계된 경량 발행-구독 프로토콜.
1999년 IBM에서 원유 파이프라인 모니터링용으로 개발 → 2014년 OASIS 표준 → 2016년 ISO/IEC 20922 국제 표준.

| 특징 | 내용 |
|------|------|
| 최소 헤더 | 2 byte (HTTP 대비 100배 이상 작음) |
| 연결 방식 | TCP 영속 연결 (연결 유지 → 재연결 오버헤드 없음) |
| 통신 패턴 | Pub/Sub — Publisher↔Subscriber가 직접 연결 안 함, Broker가 라우팅 |
| QoS | 0(Fire-and-forget) · 1(At least once) · 2(Exactly once) |
| 보안 | TLS + username/password + X.509 인증서 (별도 구성 필요) |

---

## 핵심 개념

| 개념 | 설명 |
|------|------|
| **Broker** | 모든 메시지가 거치는 중앙 서버. 토픽 매칭·QoS 관리·Retain·Will 처리 |
| **Topic** | `/`로 구분된 계층 경로. `pdm/line1/pump01/vibration` |
| **QoS** | 전달 보증 수준. 0=손실 허용, 1=최소 1회, 2=정확히 1회 |
| **Retain** | 브로커가 토픽의 마지막 메시지 저장. 새 구독자 연결 즉시 최신값 수신 |
| **Last Will (LWT)** | 비정상 종료 시 브로커가 지정 토픽에 대신 발행하는 메시지 |
| **Keep-Alive** | 클라이언트가 일정 주기로 PINGREQ 전송. 응답 없으면 LWT 트리거 |
| **Clean Session** | true: 재접속 시 세션 초기화 / false: 오프라인 중 메시지 유지(QoS 1·2) |

---

## 토픽 구조 & 와일드카드

```
pdm/line1/pump01/vibration   ← 풀 토픽 (4단계)

와일드카드:
  +   단일 레벨   pdm/+/pump01/vibration  → line1·line2·line3 매칭
  #   다중 레벨   pdm/line1/#             → line1 이하 전체 매칭
```

**설계 원칙**: 왼쪽→오른쪽으로 넓은 범위→좁은 범위. 소문자·슬래시만 사용. 4단계 이내 권장.

---

## QoS 상세

| QoS | 명칭 | 전달 흐름 | 왕복 패킷 | 사용처 |
|:---:|------|----------|:--------:|------|
| 0 | At Most Once | PUBLISH 단방향 | 1 | 고주파 센서 (손실 허용) |
| 1 | At Least Once | PUBLISH → PUBACK | 2 | 일반 IoT 데이터 (가장 일반적) |
| 2 | Exactly Once | PUBLISH→PUBREC→PUBREL→PUBCOMP | 4 | 제어 명령, 중복 불가 이벤트 |

> QoS 2는 4-way 핸드셰이크 → 오버헤드 큼. 반드시 필요한 경우만 사용.

---

## 동작 방식

```
① CONNECT       Client → Broker  (clientId, will, cleanSession, keepAlive)
② CONNACK       Broker → Client  (rc=0 성공)
③ SUBSCRIBE     Sub    → Broker  (topic, QoS)
④ SUBACK        Broker → Sub     (granted QoS)
⑤ PUBLISH       Pub    → Broker  (topic, payload, QoS, retain)
⑥ PUBACK        Broker → Pub     (QoS=1)
⑦ PUBLISH       Broker → Sub     (토픽 매칭 구독자에게 전달)
⑧ DISCONNECT    Client → Broker  (정상 종료 → LWT 미발행)
   비정상 종료 시 → Keep-Alive 초과 → Broker가 Will 메시지 발행
```

---

## 보안

| 계층 | 방법 |
|------|------|
| 전송 암호화 | TLS/SSL (포트 8883) |
| 인증 | username/password (반드시 TLS와 함께) |
| 클라이언트 인증 | X.509 인증서 (mTLS) |
| 권한 제어 | ACL 파일 — 클라이언트별 발행/구독 토픽 제한 |

> `allow_anonymous true`는 개발 전용. 운영 환경에서 절대 금지.

---

## Python 구현

### Publisher (paho-mqtt)

```python
import json, time
import paho.mqtt.client as mqtt

client = mqtt.Client(client_id="collector_01")
client.connect("localhost", 1883, keepalive=60)
client.loop_start()

client.publish(
    topic="pdm/line1/pump01/vibration",
    payload=json.dumps({"value": 3.14, "ts": time.time()}),
    qos=1,
    retain=True,
)

client.loop_stop()
client.disconnect()
```

### Subscriber (paho-mqtt)

```python
import json
import paho.mqtt.client as mqtt

def on_connect(client, userdata, flags, rc):
    client.subscribe("pdm/line1/#", qos=1)

def on_message(client, userdata, msg):
    data = json.loads(msg.payload)
    print(f"[{msg.topic}] {data}")

client = mqtt.Client(client_id="sub_01")
client.on_connect = on_connect
client.on_message  = on_message
client.connect("localhost", 1883, 60)
client.loop_forever()
```

### 비동기 구독 (aiomqtt)

```python
import asyncio, json
import aiomqtt

async def main():
    async with aiomqtt.Client("localhost") as client:
        await client.subscribe("pdm/#")
        async for message in client.messages:
            data = json.loads(message.payload)
            print(f"{message.topic}: {data['value']}")

asyncio.run(main())
```

### Last Will + TLS

```python
import ssl, paho.mqtt.client as mqtt

client = mqtt.Client(client_id="pump_gw_01")

client.will_set(
    topic="devices/pump_gw_01/status",
    payload="offline",
    qos=1,
    retain=True,
)

client.tls_set(
    ca_certs="ca.crt",
    certfile="client.crt",
    keyfile="client.key",
    tls_version=ssl.PROTOCOL_TLS_CLIENT,
)
client.connect("broker.example.com", 8883, 60)
client.publish("devices/pump_gw_01/status", "online", qos=1, retain=True)
```

---

## 브로커 종류

| 브로커 | 특징 | 용도 |
|--------|------|------|
| **Mosquitto** | 경량, 설정 단순, Eclipse 오픈소스 | 개발·테스트, 소규모 IoT |
| **EMQX** | 수백만 동시 연결, 클러스터링, 규칙 엔진 | 대규모 산업 IoT |
| **HiveMQ** | 엔터프라이즈, MQTT 5.0 완벽 지원 | 제조·자동차·에너지 |
| **AWS IoT Core** | 완전 관리형, AWS 서비스 통합 | AWS 기반 IoT |

```bash
# Mosquitto Docker 빠른 시작
docker run -d --name mosquitto \
  -p 1883:1883 \
  -e MQTT_ALLOW_ANONYMOUS=true \
  eclipse-mosquitto

# CLI 테스트
mosquitto_sub -h localhost -t "pdm/#" -v &
mosquitto_pub -h localhost -t "pdm/line1/pump01/temp" -m '{"value":72.3}' -q 1
```

---

## MQTT vs 타 프로토콜

| 항목 | MQTT | AMQP | Kafka | HTTP |
|------|------|------|-------|------|
| 최소 헤더 | **2 byte** | ~8 byte | ~26 byte | 수백 byte |
| 메시지 보존 | Retain (최신 1개) | 큐 영속 | **디스크 영속** | 없음 |
| 재처리 | 불가 | 제한적 | **오프셋 재설정** | 불가 |
| 주 용도 | **IoT·센서** | 마이크로서비스 | 이벤트 스트림 | 웹 API |

---

## SparkplugB

MQTT 위에서 동작하는 산업 IoT 표준 페이로드 규격 (Eclipse Foundation).

- **토픽 구조**: `spBv1.0/{groupId}/{messageType}/{edgeNodeId}/{deviceId}`
- **페이로드**: Protobuf (JSON 대비 소형, 타입 포함)
- **메시지 타입**: DBIRTH (기기 등록), DDATA (변경 데이터), DDEATH (오프라인)
- **지원 도구**: Ignition, EMQX, HiveMQ 등 주요 산업 플랫폼 네이티브 지원

> OPC UA로 PLC 데이터 구조화 → SparkplugB/MQTT로 클라우드 전달 = Industry 4.0 레퍼런스 아키텍처

---

## 면접 Q&A

**Q. MQTT가 HTTP보다 IoT에 적합한 이유?**
→ 최소 2 byte 헤더, TCP 영속 연결, 비동기 Pub/Sub, 저전력·저대역폭 환경 최적화.

**Q. QoS 1 vs QoS 2 선택 기준?**
→ 중복 수신이 허용되면(멱등 처리 가능) QoS 1. 제어 명령·중복 불가 이벤트는 QoS 2.

**Q. Retain과 Last Will의 차이?**
→ Retain: 최신 메시지를 새 구독자에게 즉시 제공. Last Will: 비정상 종료 감지·알림.

**Q. MQTT 5.0의 주요 추가 기능?**
→ 공유 구독(로드 밸런싱), 메시지 만료, 사용자 속성(헤더 Key-Value), 향상된 인증(OAuth).

**Q. 브로커 다운 시 대응 방법?**
→ 클라이언트 지수 백오프 재연결 + Persistent Session(QoS 1·2) + 브로커 클러스터링(EMQX·HiveMQ) + 엣지 버퍼링.

---

## 참고

- [공식 MQTT 사양 v5.0](https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html)
- [paho-mqtt Python](https://pypi.org/project/paho-mqtt/)
- [aiomqtt (asyncio)](https://aiomqtt.bo-scha.de/)
- [EMQX 공식 문서](https://docs.emqx.com/)
- [SparkplugB 사양](https://sparkplug.eclipse.org/)
- 비주얼 가이드: `mqtt_guide.html` (같은 폴더)
