---
title: 알림 설계
domain: pdm
category: alerting
tags: [pdm, alerting]
level: intermediate
status: published
created: 2026-05-12
updated: 2026-05-12
velog: false
related: []
---

# 알림 설계

## 알림 레벨 정의

| 레벨 | 의미 | 대응 |
|------|------|------|
| **INFO** | 정상 범위 내 주목할 변화 | 로그만 기록 |
| **WARN** | 주의 필요, 모니터링 강화 | 담당자 알림 |
| **ALARM** | 점검 필요 | 즉시 담당자 + 팀장 알림 |
| **DANGER** | 운전 중단 고려 | 전체 관계자 알림 + 에스컬레이션 |

## 에스컬레이션 정책

```
ALARM 발생
  ↓ 즉시
담당자 알림 (Slack / SMS)
  ↓ 15분 내 미확인
팀장 에스컬레이션
  ↓ 30분 내 미확인
부서장 에스컬레이션
  ↓ DANGER 전환 시
전체 관계자 동시 알림
```

## 알림 중복 방지 (Redis 기반)

같은 알람이 계속 울리지 않도록 쿨다운 적용.

```python
import redis
from datetime import datetime, timedelta

r = redis.Redis(host="redis", port=6379)

def should_notify(device_id, metric, level, cooldown_min=30):
    key = f"notify_cooldown:{device_id}:{metric}:{level}"
    if r.exists(key):
        return False  # 쿨다운 중

    r.set(key, "1", ex=cooldown_min * 60)
    return True

def send_alarm(device_id, metric, level, value):
    if not should_notify(device_id, metric, level):
        return

    message = format_message(device_id, metric, level, value)
    dispatch(level, message)
```

## Slack 알림

```python
import requests, json

SLACK_WEBHOOKS = {
    "warn":   "https://hooks.slack.com/services/WARN_WEBHOOK",
    "alarm":  "https://hooks.slack.com/services/ALARM_WEBHOOK",
    "danger": "https://hooks.slack.com/services/DANGER_WEBHOOK",
}

LEVEL_EMOJI = {
    "warn":   ":warning:",
    "alarm":  ":rotating_light:",
    "danger": ":sos:",
}

def send_slack(level, device_id, metric, value, threshold):
    emoji = LEVEL_EMOJI.get(level, "")
    payload = {
        "attachments": [{
            "color": {"warn": "warning", "alarm": "danger", "danger": "#8B0000"}.get(level),
            "title": f"{emoji} [{level.upper()}] {device_id}",
            "fields": [
                {"title": "측정 항목", "value": metric, "short": True},
                {"title": "현재값",    "value": f"{value:.3f}", "short": True},
                {"title": "임계값",    "value": f"{threshold:.3f}", "short": True},
                {"title": "시각",      "value": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"), "short": True},
            ],
            "footer": "PDM Monitoring"
        }]
    }
    requests.post(SLACK_WEBHOOKS[level], json=payload, timeout=5)
```

## SMS / 전화 (Twilio)

```python
from twilio.rest import Client

twilio = Client(account_sid, auth_token)

def send_sms(to_number, device_id, level, metric, value):
    body = f"[PDM {level.upper()}] {device_id}\n{metric}: {value:.2f}\n{datetime.now().strftime('%H:%M')}"
    twilio.messages.create(body=body, from_=from_number, to=to_number)

def make_call(to_number, message):
    # TwiML로 자동 음성 통화
    twiml = f'<Response><Say language="ko-KR">{message}</Say></Response>'
    twilio.calls.create(
        twiml=twiml,
        to=to_number,
        from_=from_number
    )
```

## 알림 라우터

```python
CONTACTS = {
    "line1": {
        "operators": [{"slack": "@operator1", "phone": "+8210xxxxxxxx"}],
        "supervisors": [{"slack": "@supervisor1", "phone": "+8210yyyyyyyy"}],
    }
}

def dispatch(level, device_id, metric, value, threshold):
    site = device_id.split("_")[0]  # pump_01 → pump
    contacts = CONTACTS.get(site, {})

    if level in ("warn", "alarm"):
        for op in contacts.get("operators", []):
            send_slack(level, device_id, metric, value, threshold)

    if level == "alarm":
        for op in contacts.get("operators", []):
            send_sms(op["phone"], device_id, level, metric, value)

    if level == "danger":
        for contact in contacts.get("operators", []) + contacts.get("supervisors", []):
            send_slack(level, device_id, metric, value, threshold)
            send_sms(contact["phone"], device_id, level, metric, value)
            make_call(contact["phone"], f"{device_id} 위험 수준 알람 발생")
```

## 알림 이력 저장 (InfluxDB)

```python
from influxdb_client import Point

def log_alarm(write_api, device_id, metric, level, value):
    point = (
        Point("alarm_history")
        .tag("device_id", device_id)
        .tag("metric", metric)
        .tag("level", level)
        .field("value", value)
    )
    write_api.write(bucket="alarms", record=point)
```

## Grafana 알람 연동

```
Grafana Alert Rule 설정:
  Query: InfluxDB에서 RMS 조회
  Condition: last() > 7.1
  Evaluate: every 1m for 2m   (2분 지속 시 발동)
  Contact point: Slack webhook
  Notification policy: severity별 라우팅
```
