---
title: AAS (Asset Administration Shell)
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

# AAS (Asset Administration Shell)

## 개요

- **자산 관리 쉘** — 물리적 설비(자산)를 디지털로 표현하는 표준 프레임워크
- Plattform Industrie 4.0 / IDTA(Industrial Digital Twin Association) 주도
- 설비 정보(스펙, 실시간 데이터, 이력, 매뉴얼)를 **표준 구조**로 기술하고 REST API로 노출
- 표준: IEC 63278, IDTA 명세

```
┌─────────────────────────┐                    ┌──────────────────────────────────────┐
│      물리 자산 (Physical) │                    │       디지털 트윈 (AAS)               │
├─────────────────────────┤                    ├──────────────────────────────────────┤
│  🔩 펌프 실물              │                    │  AssetAdministrationShell            │
│     - 제조사: KSB          │                    │  id: urn:pdm:ulsan:pump:pump_01:aas  │
│     - 시리얼: SN-2024-0042 │                    ├──────────────────────────────────────┤
│     - 설치위치: 라인1       │  ◄──────────────►  │  Submodel: Nameplate (명판)           │
│                           │   디지털 연결        │  Submodel: TechnicalData (기술규격)   │
│  ⚙️ 모터 실물              │                    │  Submodel: OperationalData (운전데이터)│
│  🔄 컨베이어 실물           │                    │  Submodel: PredictiveMaintenance      │
└─────────────────────────┘                    └──────────────────────────────────────┘
        현실 세계 (Physical World)                        가상 세계 (Digital World)
```

---

## AAS가 필요한 이유

| 문제 | AAS 없이 | AAS 있으면 |
|------|----------|-----------|
| 설비 정보 위치 | 제조사마다 다른 포맷 (PDF, Excel, 독자 API) | 표준 REST API 한 곳 |
| 이기종 설비 연동 | 설비마다 별도 파싱 코드 | 동일한 Submodel 구조로 접근 |
| 디지털 트윈 구현 | 직접 설계해야 함 | AAS = 표준 디지털 트윈 컨테이너 |
| 설비 교체 시 | 연동 코드 전부 수정 | AAS ID만 바꾸면 됨 |

---

## 핵심 구조

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   AAS (Asset Administration Shell)                       │
│           id: urn:pdm:ulsan:pump:pump_01:aas                            │
├─────────────────────────────────────────────────────────────────────────┤
│  Asset Information                                                       │
│    assetId  : "urn:pdm:ulsan:pump:pump_01"                              │
│    assetKind: Instance  (실제 설비)  │  Type  (설비 모델·종류)           │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────────────┐
         │               │                       │                       │
         ▼               ▼                       ▼                       ▼
┌────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────┐
│  Submodel 1    │ │  Submodel 2      │ │  Submodel 3      │ │  Submodel 4          │
│  Nameplate     │ │  TechnicalData   │ │  OperationalData │ │  Predictive          │
│  (명판)        │ │  (기술 규격)     │ │  (운전 데이터)   │ │  Maintenance         │
├────────────────┤ ├──────────────────┤ ├──────────────────┤ ├──────────────────────┤
│ Manufacturer   │ │ MaxRPM           │ │ VibrationRMS  ◄─ │ │ RUL (잔여수명)       │
│ Model          │ │ RatedPower (kW)  │ │ Temperature   실시│ │ AnomalyScore (0~1)  │
│ SerialNumber   │ │ MaxTemperature   │ │ CurrentRPM    간  │ │ DominantFrequency   │
│ MfgDate        │ │ IP등급           │ │ Current (A)   업  │ │ Kurtosis            │
│                │ │ WeightKg         │ │ Status        데  │ │ LastAnalyzedAt      │
│                │ │ FluidType        │ │               이트│ │ Recommendation      │
└────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────────┘
```

### Submodel 구성 요소

```
Submodel
│
├── SubmodelElement (기본 단위)
│     Property         ← 단일 값  (rpm: 1480)
│     MultiLanguageProperty ← 다국어 값
│     File            ← 파일 참조 (매뉴얼 PDF)
│     Blob            ← 바이너리 데이터
│     ReferenceElement ← 다른 요소 참조
│
└── SubmodelElementCollection  ← 그룹핑
      (여러 Property를 묶는 컨테이너)
```

---

## 구조도 — 시스템 내 위치

```
  Layer 1: 현장 설비                Layer 2: MQTT / Collector          Layer 3: AAS 계층                Layer 4: 서비스
 ┌─────────────────────┐           ┌──────────────────────────┐       ┌───────────────────────────┐    ┌──────────────────────┐
 │  펌프 01 (물리)      │           │  MQTT Broker             │       │  AAS Server (BaSyx)       │    │  내부 대시보드        │
 │  - 진동 센서         │  MQTT     │  topic: pdm/line1/       │       │  REST API 노출            │    │  (WebSocket/HTTP)     │
 │  - 온도 센서         │ ────────► │        pump/pump_01/...  │       │  GET /shells/{aasId}      │    └──────────────────────┘
 │  - 전류 센서         │           └────────────┬─────────────┘       │  GET .../submodels/...    │
 └─────────────────────┘                        │                      │  PUT .../value            │    ┌──────────────────────┐
                                                │                      └─────────────┬─────────────┘    │  외부 시스템          │
 ┌─────────────────────┐                        ▼                                    │             ────► │  ERP / MES / CMMS    │
 │  모터 02 (물리)      │           ┌──────────────────────────┐                      │                  │  (AAS REST API)      │
 │  - 진동 센서         │  MQTT     │  Collector (Python)      │       ┌──────────────┴────────────┐    └──────────────────────┘
 │  - 온도 센서         │ ────────► │                          │──────►│  AAS Registry             │
 └─────────────────────┘           │  ├──► InfluxDB (시계열)   │       │  - 설비 목록 관리          │    ┌──────────────────────┐
                                   │  ├──► Redis (최신값캐시)   │       │  - AAS 검색·탐색          │    │  분석 툴 / ML 서비스  │
 ┌─────────────────────┐           │  └──► AAS Server 동기화   │       │  POST /shell-descriptors  │    │  (표준 포맷 연동)     │
 │  컨베이어 03 (물리)  │  MQTT     │                          │       └───────────────────────────┘    └──────────────────────┘
 │  - 속도 센서         │ ────────► │                          │
 └─────────────────────┘           └──────────────────────────┘
```

---

## REST API 구조

AAS Server는 표준 HTTP REST API를 제공함

```
Base URL: http://aas-server:8080/shells/{aasId}/

# AAS 전체 조회
GET /shells/{aasId}

# Submodel 목록
GET /shells/{aasId}/submodels

# 특정 Submodel 조회
GET /shells/{aasId}/submodels/OperationalData

# 특정 Property 조회
GET /shells/{aasId}/submodels/OperationalData/submodel-elements/VibrationRMS

# Property 값 업데이트
PUT /shells/{aasId}/submodels/OperationalData/submodel-elements/VibrationRMS/value
Body: 3.42
```

### 응답 예시 (JSON)

```json
{
  "modelType": "Property",
  "idShort": "VibrationRMS",
  "valueType": "double",
  "value": "3.42",
  "description": [
    { "language": "ko", "text": "진동 RMS (mm/s)" }
  ]
}
```

---

## AASX 파일 포맷

- AAS를 파일로 저장하는 표준 포맷 (`.aasx` = 사실상 ZIP)
- 설비 납품 시 제조사가 제공하거나 직접 생성
- AAS Server에 업로드 → API로 접근 가능

```
pump_01.aasx
├── [Content_Types].xml
├── _rels/
├── aasx/
│   └── pump_01.json    ← AAS 정의 (Submodel 포함)
└── files/
    └── manual.pdf      ← 참조 파일
```

---

## 구현 — Python (aas-core3.0)

```bash
pip install aas-core3.0-rc02
pip install basyx-python-sdk   # BaSyx SDK
```

### AAS 생성 및 Submodel 구성

```python
import aas_core3.types as aas_types
import aas_core3.jsonization as aas_json
import json

# 자산 정의
asset_info = aas_types.AssetInformation(
    global_asset_id="urn:pdm:ulsan:pump:pump_01",
    asset_kind=aas_types.AssetKind.Instance,
)

# Nameplate Submodel
nameplate = aas_types.Submodel(
    id="urn:pdm:ulsan:pump:pump_01:nameplate",
    id_short="Nameplate",
    submodel_elements=[
        aas_types.Property(
            id_short="Manufacturer",
            value_type=aas_types.DataTypeDefXsd.String,
            value="KSB",
        ),
        aas_types.Property(
            id_short="SerialNumber",
            value_type=aas_types.DataTypeDefXsd.String,
            value="SN-2024-0042",
        ),
        aas_types.Property(
            id_short="ManufacturingDate",
            value_type=aas_types.DataTypeDefXsd.Date,
            value="2024-03-15",
        ),
    ],
)

# OperationalData Submodel (실시간 데이터)
operational = aas_types.Submodel(
    id="urn:pdm:ulsan:pump:pump_01:operational",
    id_short="OperationalData",
    submodel_elements=[
        aas_types.Property(
            id_short="VibrationRMS",
            value_type=aas_types.DataTypeDefXsd.Double,
            value="0.0",   # Collector가 주기적으로 업데이트
        ),
        aas_types.Property(
            id_short="Temperature",
            value_type=aas_types.DataTypeDefXsd.Double,
            value="0.0",
        ),
        aas_types.Property(
            id_short="Status",
            value_type=aas_types.DataTypeDefXsd.String,
            value="online",
        ),
    ],
)

# AAS 조립
pump_aas = aas_types.AssetAdministrationShell(
    id="urn:pdm:ulsan:pump:pump_01:aas",
    id_short="Pump01",
    asset_information=asset_info,
    submodels=[
        aas_types.Reference(
            type=aas_types.ReferenceTypes.ExternalReference,
            keys=[aas_types.Key(
                type=aas_types.KeyTypes.Submodel,
                value=nameplate.id,
            )],
        ),
    ],
)
```

### Collector에서 AAS Property 업데이트

```python
import httpx
import json

AAS_SERVER = "http://aas-server:8080"

async def update_aas_operational(device_id: str, rms: float, temp: float):
    """MQTT 메시지 수신 후 AAS OperationalData 동기화"""
    base = f"{AAS_SERVER}/shells/urn:pdm:ulsan:pump:{device_id}:aas"
    base += "/submodels/OperationalData/submodel-elements"

    async with httpx.AsyncClient() as client:
        await client.put(
            f"{base}/VibrationRMS/value",
            content=str(rms),
            headers={"Content-Type": "application/json"},
        )
        await client.put(
            f"{base}/Temperature/value",
            content=str(temp),
            headers={"Content-Type": "application/json"},
        )
```

### AAS Registry에 등록

```python
REGISTRY = "http://aas-registry:8082"

async def register_aas(device_id: str):
    descriptor = {
        "id": f"urn:pdm:ulsan:pump:{device_id}:aas",
        "assetInformation": {
            "globalAssetId": f"urn:pdm:ulsan:pump:{device_id}"
        },
        "endpoints": [{
            "protocolInformation": {
                "href": f"http://aas-server:8080/shells/urn:pdm:ulsan:pump:{device_id}:aas"
            },
            "interface": "AAS-3.0"
        }]
    }
    async with httpx.AsyncClient() as client:
        await client.post(f"{REGISTRY}/shell-descriptors", json=descriptor)
```

---

## AAS Server 선택

| 구현체 | 언어 | 특징 | 적합한 경우 |
|--------|------|------|-----------|
| BaSyx (Eclipse) | Java | 가장 성숙, IDTA 공식 참조 구현 | 표준 준수 중요할 때 |
| AASX Server | C# | AASX 파일 기반, UI 포함 | 빠른 프로토타입 |
| FA³ST Service | Java | 경량, 임베디드 가능 | 엣지 디바이스 |
| PyAAS | Python | Python 기반 | Python 스택과 통합 |

### Docker로 BaSyx 실행

```yaml
# docker-compose.yml 추가
aas-server:
  image: eclipsebasyx/aas-environment:2.0.0
  ports:
    - "8080:8080"
  environment:
    - BASYX_ENVIRONMENT_UPLOADPATH=/tmp/aasx
  volumes:
    - ./aasx:/tmp/aasx

aas-registry:
  image: eclipsebasyx/aas-registry-log-mem:2.0.0
  ports:
    - "8082:8080"

aas-ui:
  image: eclipsebasyx/aas-gui:v2-240918
  ports:
    - "3001:3000"
  environment:
    - AAS_REGISTRY_PATH=http://localhost:8082/shell-descriptors
    - AAS_REPO_PATH=http://localhost:8080/shells
```

---

## 실제 모니터링 시스템 연계

### MQTT + AAS 통합 파이프라인

```
┌────────┐  MQTT   ┌──────────────────────┐
│  센서   │ ──────► │   Collector (Python)  │
└────────┘         └──────────┬───────────┘
                              │
              ┌───────────────┼───────────────────┐
              │               │                   │
              ▼               ▼                   ▼
  ┌───────────────────┐  ┌──────────────┐  ┌─────────────────────────┐
  │  InfluxDB         │  │  Redis       │  │  AAS Server (BaSyx)     │
  │  (시계열 저장)     │  │  (최신값캐시) │  │  PUT .../VibrationRMS   │
  │  measurement:     │  │  key:        │  │  PUT .../Temperature    │
  │    vibration      │  │   pump_01:   │  │  → Submodel 동기화      │
  │    temperature    │  │   latest     │  └────────────┬────────────┘
  └────────┬──────────┘  └──────┬───────┘               │
           │                   │              ┌──────────┴──────────┐
           ▼                   ▼              ▼                     ▼
  ┌────────────────┐   ┌───────────────┐  ┌────────────────┐  ┌──────────────┐
  │  내부 대시보드  │   │  내부 대시보드 │  │  내부 대시보드  │  │ 외부 시스템   │
  │  (이력 차트)    │   │  (실시간 표시) │  │  (WebSocket)   │  │ ERP/MES/CMMS │
  └────────────────┘   └───────────────┘  └────────────────┘  └──────────────┘
```

### Collector 통합 코드 패턴

```python
async def on_mqtt_message(topic: str, data: dict):
    device_id = topic.split("/")[3]   # pdm/line1/pump/pump_01/vibration

    # 기존 파이프라인
    await write_influxdb(device_id, data)
    await update_redis(device_id, data)

    # AAS 동기화 (추가)
    if data.get("rms") is not None:
        await update_aas_operational(
            device_id=device_id,
            rms=data["rms"],
            temp=data.get("temperature", 0.0),
        )
```

### PredictiveMaintenance Submodel 설계

```python
# FFT 분석 결과를 AAS에 저장
pm_submodel_elements = [
    aas_types.Property(
        id_short="RUL",                    # Remaining Useful Life (일)
        value_type=aas_types.DataTypeDefXsd.Integer,
        value="365",
    ),
    aas_types.Property(
        id_short="AnomalyScore",           # ML 이상 점수 (0~1)
        value_type=aas_types.DataTypeDefXsd.Double,
        value="0.12",
    ),
    aas_types.Property(
        id_short="DominantFrequency",      # FFT 주요 주파수 (Hz)
        value_type=aas_types.DataTypeDefXsd.Double,
        value="29.5",
    ),
    aas_types.Property(
        id_short="Kurtosis",
        value_type=aas_types.DataTypeDefXsd.Double,
        value="3.1",
    ),
    aas_types.Property(
        id_short="LastAnalyzedAt",
        value_type=aas_types.DataTypeDefXsd.DateTime,
        value="2026-06-26T10:00:00Z",
    ),
    aas_types.Property(
        id_short="MaintenanceRecommendation",
        value_type=aas_types.DataTypeDefXsd.String,
        value="normal",                    # normal / warning / critical
    ),
]
```

---

## 알아두면 좋은 것

### AAS vs 일반 REST API

```
┌─────────────────────────────────────┐      ┌─────────────────────────────────────┐
│          일반 REST API               │      │              AAS                    │
├─────────────────────────────────────┤      ├─────────────────────────────────────┤
│ 엔드포인트  자체 설계 (임의 구조)     │      │ 엔드포인트  IDTA 표준 경로           │
│ 구조       설비마다 제각각            │      │ 구조       모든 설비 동일한 Submodel │
│ 대상       내부 시스템 전용           │      │ 대상       이기종 시스템 간 상호운용  │
│ 연동       파싱 코드 별도 작성 필요   │      │ 연동       표준 클라이언트 재사용     │
│ 교체 시    연동 코드 전부 수정        │      │ 교체 시    AAS ID만 교체             │
│ 적합       내부 모니터링 전용         │      │ 적합       ERP/MES/CMMS 외부 연동    │
└─────────────────────────────────────┘      └─────────────────────────────────────┘
```

→ 내부 모니터링만 할 때는 일반 REST로도 충분.
  외부 시스템(ERP, CMMS, 타사 분석툴) 연동이 생기면 AAS가 필요해짐.

### Type AAS vs Instance AAS

```
┌─────────────────────────────────────┐      ┌─────────────────────────────────────┐
│           Type AAS (설비 모델)       │      │        Instance AAS (실제 설비)      │
├─────────────────────────────────────┤      ├─────────────────────────────────────┤
│ 대상    KSB 펌프 NM65-200 모델       │      │ 대상    라인1 펌프 01번               │
│         (설비 종류·카탈로그)          │      │         (SN-2024-0042, 실물)          │
│ 데이터  최대 RPM, 정격 출력           │      │ 데이터  현재 RPM, 누적 운전시간       │
│         IP등급, 설계 수명             │      │         현재 온도, 진동 RMS           │
│ 수량    제조사가 1개 제공             │      │ 수량    설비 대수만큼 존재             │
│ 갱신    설계 변경 시                  │      │ 갱신    Collector가 실시간 업데이트   │
│ assetKind: Type                      │      │ assetKind: Instance                  │
└─────────────────────────────────────┘      └─────────────────────────────────────┘
              │                                              ▲
              │         Type → 파생 (instantiate)            │
              └──────────────────────────────────────────────┘
```

### 토픽 구조와 AAS ID 매핑

```python
# MQTT 토픽 → AAS ID 변환 규칙 통일
# pdm/{site}/{type}/{device_id}/...
# urn:pdm:{site}:{type}:{device_id}:aas

def topic_to_aas_id(topic: str) -> str:
    parts = topic.split("/")
    site, equip_type, device_id = parts[1], parts[2], parts[3]
    return f"urn:pdm:{site}:{equip_type}:{device_id}:aas"
```

### IDTA Submodel 템플릿 (표준 사용 권장)

IDTA가 공식 Submodel 템플릿을 제공함. 직접 설계하기 전에 확인:

| 템플릿 | 내용 |
|--------|------|
| IDTA-02006 | Digital Nameplate |
| IDTA-02017 | Asset Interfaces Description |
| IDTA-02031 | Predictive Maintenance |
| IDTA-02045 | Time Series Data |

→ 표준 템플릿 사용 시 타사 툴과 자동 호환
