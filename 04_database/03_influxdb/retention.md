---
title: "Retention Policy & Task"
domain: database
category: influxdb
tags: [database, influxdb]
level: intermediate
status: published
created: 2026-05-12
updated: 2026-05-12
velog: true
related: []
---

# Retention Policy & Task

## Retention Policy (데이터 보존 기간)

InfluxDB 2.x에서는 **Bucket** 생성 시 Retention Period를 설정.

```bash
# CLI로 Bucket 생성
influx bucket create \
  --name raw_metrics \
  --org myorg \
  --retention 7d    # 7일 후 자동 삭제 (0 = 영구 보존)

# 기존 Bucket retention 수정
influx bucket update \
  --name raw_metrics \
  --retention 30d
```

### 다중 계층 보존 전략 (Tiered Retention)

```
raw_data    (보존 7일)   ← 1분 해상도 원시 데이터
1h_data     (보존 90일)  ← 1시간 평균 다운샘플링
1d_data     (보존 3년)   ← 1일 평균 장기 보관
```

## Task (자동화 작업)

InfluxDB 2.x의 Task는 Flux 쿼리를 스케줄에 따라 자동 실행.  
다운샘플링, 알림, 데이터 변환에 사용.

### Task 구조

```flux
// Task 옵션 선언
option task = {
  name: "downsample_to_1h",
  every: 1h,          // 실행 주기
  offset: 5m          // 지연 실행 (데이터 수집 완료 대기)
}

// 다운샘플링 로직
from(bucket: "raw_data")
  |> range(start: -task.every)
  |> filter(fn: (r) => r._measurement == "cpu_usage")
  |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
  |> set(key: "_measurement", value: "cpu_usage_1h")
  |> to(bucket: "1h_data", org: "myorg")
```

### Task 관리 (CLI)

```bash
# Task 목록
influx task list

# Task 생성
influx task create --file downsample.flux --org myorg

# Task 실행 이력
influx task run list --task-id <TASK_ID>

# Task 활성화/비활성화
influx task update --id <TASK_ID> --status active
influx task update --id <TASK_ID> --status inactive

# Task 삭제
influx task delete --id <TASK_ID>
```

## 알림 (Alerting)

### Check + Notification Rule

```flux
// Threshold Check: CPU 90% 초과 시 경보
from(bucket: "raw_data")
  |> range(start: -5m)
  |> filter(fn: (r) => r._measurement == "cpu_usage" and r._field == "usage_user")
  |> last()
  |> map(fn: (r) => ({
      r with
      _level: if r._value > 90.0 then "crit"
              else if r._value > 75.0 then "warn"
              else "ok"
  }))
```

### Deadman Check: 데이터 수신 중단 감지

```flux
// 10분 이상 데이터 없으면 경보
from(bucket: "raw_data")
  |> range(start: -10m)
  |> filter(fn: (r) => r._measurement == "heartbeat")
  |> count()
  |> map(fn: (r) => ({r with _level: if r._count == 0 then "crit" else "ok"}))
```

## 백업 & 복원

```bash
# 백업
influx backup /path/to/backup --org myorg

# 복원
influx restore /path/to/backup --org myorg

# 특정 Bucket만 백업
influx backup /path/to/backup --bucket raw_data --org myorg
```

## 성능 최적화 팁

1. **Tag Cardinality 관리**: Tag 조합의 경우의 수를 수백만 이하로 유지
2. **쿼리 range 필수**: 항상 `range()`로 시간 범위 제한
3. **다운샘플링**: 오래된 데이터는 저해상도로 변환 후 보관
4. **Batch Write**: 데이터는 개별 write가 아닌 배치로 전송
5. **Field 집중**: 자주 필터링하는 값은 Tag, 측정값은 Field
