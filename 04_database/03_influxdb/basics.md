---
title: InfluxDB 기초
domain: database
category: influxdb
tags: [database, influxdb]
level: intermediate
status: published
created: 2026-07-16
updated: 2026-07-16
velog: true
related: []
---

# InfluxDB 기초

## 개념

시계열 데이터(Time-Series Data)에 특화된 DB.  
센서, 메트릭, 로그, 모니터링 데이터 저장에 최적화.

- 기본 포트: `8086`
- InfluxDB 2.x 기준 (1.x와 쿼리 언어 다름)

## 핵심 개념

| 개념 | 설명 | RDBMS 대응 |
|------|------|-----------|
| **Bucket** | 데이터 저장소 + retention policy | Database |
| **Measurement** | 데이터 유형 이름 | Table |
| **Tag** | 인덱싱되는 메타데이터 (string only) | Indexed column |
| **Field** | 실제 측정값 (숫자, 문자열 등) | Non-indexed column |
| **Timestamp** | 나노초 단위 시간 | Primary Key의 일부 |
| **Point** | 하나의 데이터 포인트 | Row |

```
measurement: cpu_usage
tags:        host=server01, region=ap-northeast-2
fields:      usage_user=23.1, usage_system=5.4
timestamp:   2024-01-15T09:00:00Z
```

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 290" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <text x="330" y="24" text-anchor="middle" font-weight="bold" font-size="16">InfluxDB 데이터 모델 (하나의 Point)</text>

  <!-- outer point box -->
  <rect x="20" y="45" width="620" height="180" rx="10" fill="#f7f7f7" stroke="#333" stroke-width="2"/>
  <text x="40" y="68" font-size="13" font-weight="bold">Point (한 개의 데이터 포인트 = RDBMS의 Row)</text>

  <!-- Measurement -->
  <rect x="40" y="80" width="580" height="34" rx="5" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="55" y="102" font-size="12" font-weight="bold">Measurement:</text>
  <text x="175" y="102" font-size="12">cpu_usage  (측정 대상 = Table)</text>

  <!-- Tags -->
  <rect x="40" y="120" width="285" height="60" rx="5" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="55" y="140" font-size="12" font-weight="bold">Tags (인덱싱됨 · String)</text>
  <text x="55" y="160" font-size="11">host = server01</text>
  <text x="55" y="175" font-size="11">region = ap-northeast-2</text>

  <!-- Fields -->
  <rect x="335" y="120" width="285" height="60" rx="5" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="350" y="140" font-size="12" font-weight="bold">Fields (측정값 · 인덱스 X)</text>
  <text x="350" y="160" font-size="11">usage_user = 23.1</text>
  <text x="350" y="175" font-size="11">usage_system = 5.4</text>

  <!-- Timestamp -->
  <rect x="40" y="186" width="580" height="30" rx="5" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="55" y="206" font-size="12" font-weight="bold">Timestamp:</text>
  <text x="160" y="206" font-size="12">2024-01-15T09:00:00Z  (나노초 단위, PK의 일부)</text>

  <text x="330" y="250" text-anchor="middle" font-size="11" fill="#555">Tag는 검색·GROUP BY 키(인덱스), Field는 집계 대상 값.</text>
  <text x="330" y="268" text-anchor="middle" font-size="11" fill="#555">동일 measurement + tag 조합 = 하나의 "시리즈(Series)"</text>
</svg>

## Line Protocol (데이터 입력 형식)

```
<measurement>[,<tag_key>=<tag_value>...] <field_key>=<field_value>[,<field_key>=<field_value>...] [<timestamp>]
```

```bash
# 예시
cpu_usage,host=server01,region=ap-northeast-2 usage_user=23.1,usage_system=5.4 1705312800000000000

# curl로 데이터 쓰기
curl -X POST "http://localhost:8086/api/v2/write?org=myorg&bucket=mybucket&precision=ns" \
  -H "Authorization: Token MY_TOKEN" \
  --data-raw 'cpu_usage,host=server01 usage_user=23.1 1705312800000000000'
```

## Flux 쿼리 언어 (InfluxDB 2.x)

```flux
// 기본 조회
from(bucket: "mybucket")
  |> range(start: -1h)                          // 최근 1시간
  |> filter(fn: (r) => r._measurement == "cpu_usage")
  |> filter(fn: (r) => r.host == "server01")
  |> filter(fn: (r) => r._field == "usage_user")

// 집계: 5분 평균
from(bucket: "mybucket")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "cpu_usage")
  |> filter(fn: (r) => r._field == "usage_user")
  |> aggregateWindow(every: 5m, fn: mean, createEmpty: false)

// 여러 host 비교
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "cpu_usage")
  |> filter(fn: (r) => r._field == "usage_user")
  |> group(columns: ["host"])
  |> mean()

// 최댓값 상위 N개
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "cpu_usage")
  |> top(n: 5, columns: ["_value"])
```

## 주요 집계 함수

| 함수 | 설명 |
|------|------|
| `mean()` | 평균 |
| `sum()` | 합계 |
| `count()` | 개수 |
| `min()` / `max()` | 최솟값 / 최댓값 |
| `last()` | 마지막 값 |
| `first()` | 첫 번째 값 |
| `derivative()` | 변화율 (초당) |
| `difference()` | 이전 값과의 차이 |
| `stddev()` | 표준편차 |

## 다운샘플링 (Downsampling)

고해상도 데이터를 저해상도로 변환해 장기 보관.

```flux
// Task로 자동 다운샘플링 (매시간 실행)
option task = {name: "downsample_cpu", every: 1h}

from(bucket: "raw_data")
  |> range(start: -task.every)
  |> filter(fn: (r) => r._measurement == "cpu_usage")
  |> aggregateWindow(every: 5m, fn: mean, createEmpty: false)
  |> to(bucket: "downsampled_data", org: "myorg")
```

## Tag vs Field 선택 기준

| 기준 | Tag | Field |
|------|-----|-------|
| 인덱싱 | ✅ 됨 | ❌ 안 됨 |
| 쿼리 필터 성능 | 빠름 | 느림 |
| 카디널리티 | 낮아야 함 | 무관 |
| 값 타입 | String만 | 숫자, 문자열, bool |
| 예시 | host, region, env | temperature, cpu, memory |

> **High Cardinality 주의**: Tag 조합이 너무 많으면 (user_id 같은 고유값) 성능 급저하.

## Python 클라이언트

```python
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

client = InfluxDBClient(
    url="http://localhost:8086",
    token="MY_TOKEN",
    org="myorg"
)

# 쓰기
write_api = client.write_api(write_options=SYNCHRONOUS)
point = (
    Point("cpu_usage")
    .tag("host", "server01")
    .field("usage_user", 23.1)
    .field("usage_system", 5.4)
)
write_api.write(bucket="mybucket", record=point)

# 조회
query_api = client.query_api()
tables = query_api.query('''
    from(bucket: "mybucket")
      |> range(start: -1h)
      |> filter(fn: (r) => r._measurement == "cpu_usage")
''')

for table in tables:
    for record in table.records:
        print(record.get_time(), record.get_value())
```
