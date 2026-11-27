---
title: 로컬 LLM 서버 구축기 1편 — Docker + Ollama + GPU 환경 세팅
domain: llm
category: inference
tags: [llm, inference, ollama, docker, gpu, nvidia-container-toolkit]
level: intermediate
status: published
created: 2026-05-11
updated: 2026-11-27
velog: false
related: ["[[02_ollama-fastapi-server]]", "[[03_ollama-rag-pipeline]]", "[[04_ollama-agent]]", "[[05_ollama-harness-engineering]]", "[[rag-concepts]]"]
---

# 로컬 LLM 서버 구축기 1편 — Docker + Ollama + GPU 환경 세팅

> 백엔드 개발자가 LLM 전문가가 되기 위해 직접 로컬 LLM 서버를 구축한 과정을 정리한 글입니다.

---

## 왜 로컬 LLM 서버인가?

ChatGPT나 Claude 같은 API를 쓰면 편하지만 기업 환경에서는 제약이 많습니다.

- 민감한 데이터를 외부 API에 보낼 수 없음
- API 비용이 트래픽에 비례해서 증가
- 인터넷 연결 없이도 동작해야 하는 경우

이런 이유로 **온프레미스(On-premise) 로컬 LLM 서버**에 대한 수요가 늘고 있고,  
이를 구축할 수 있는 능력이 LLM 전문가에게 중요한 스킬이 됩니다.

---

## 사용 환경

| 항목 | 내용 |
|------|------|
| 서버 | Dell PowerEdge r760xs |
| OS | Ubuntu 22.04 |
| GPU | NVIDIA A2 × 2장 |
| VRAM | 15GB × 2 = 30GB |
| CUDA | 12.2 |
| Docker | 29.4.1 |
| Docker Compose | v5.1.3 |

---

## 전체 구조

```
클라이언트 (curl / 앱)
        ↓
  FastAPI 서버  ← 추후 구현 예정
        ↓
  Ollama 컨테이너  ← 이번 편에서 구축
        ↓
  NVIDIA A2 GPU
```

---

## 1단계 — GPU 확인

서버에 GPU가 있는지 확인합니다.

```bash
nvidia-smi
```

```
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 535.288.01   Driver Version: 535.288.01   CUDA Version: 12.2    |
|-------------------------------+----------------------+----------------------+
|   0  NVIDIA A2          Off  | 00000000:0D:00.0 Off |                    0 |
|  0%   28C    P8    5W / 60W  |    13MiB / 15356MiB  |      0%      Default |
+-----------------------------------------------------------------------------+
|   1  NVIDIA A2          Off  | 00000000:B5:00.0 Off |                    0 |
|  0%   29C    P8    6W / 60W  |    13MiB / 15356MiB  |      0%      Default |
+-----------------------------------------------------------------------------+
```

VRAM이 총 30GB로 7~8B 모델을 여유롭게 돌릴 수 있는 환경입니다.

---

## 2단계 — nvidia-container-toolkit 설치

Docker 컨테이너는 기본적으로 호스트의 GPU에 접근할 수 없습니다.  
`nvidia-container-toolkit`이 컨테이너와 GPU 사이를 연결해주는 역할을 합니다.

```
[컨테이너] --nvidia-container-toolkit--> [호스트 NVIDIA 드라이버] --> [GPU]
```

### 설치

```bash
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
  && curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
    sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit

sudo nvidia-ctk runtime configure --runtime=docker

sudo systemctl restart docker
```

### 설치 확인

```bash
nvidia-container-cli --version
# cli-version: 1.19.0
```

### 내부 동작 원리

`nvidia-ctk runtime configure` 명령은 `/etc/docker/daemon.json`에 아래 내용을 추가합니다.

```json
{
  "runtimes": {
    "nvidia": {
      "path": "nvidia-container-runtime"
    }
  }
}
```

Docker가 컨테이너 실행 시 nvidia 런타임을 사용하면 GPU 접근을 허용하겠다는 설정입니다.  
이 설정이 없으면 `--gpus all` 옵션을 써도 조용히 CPU로 돌아가서 성능이 매우 느려집니다.

> **참고:** [nvidia-container-toolkit 공식 문서](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html)

---

## 3단계 — Ollama란?

**Ollama**는 LLM을 쉽게 다운받고 실행할 수 있는 런타임입니다.

### Ollama 없이 LLM 실행하려면

```
1. Hugging Face에서 모델 파일 직접 다운로드 (수십 GB)
2. Python 환경 세팅 (torch, transformers, CUDA 설정...)
3. 모델 로드 코드 직접 작성
4. API 서버도 직접 구현
```

### Ollama 있으면

```bash
ollama pull qwen2.5:7b   # 모델 다운로드
ollama run qwen2.5:7b    # 실행
```

그리고 **REST API를 자동으로 제공**합니다.

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5:7b",
  "prompt": "안녕?"
}'
```

| 역할 | 내용 |
|------|------|
| 모델 관리 | 다운로드, 저장, 버전 관리 |
| 실행 | GPU/CPU 자동 감지 후 최적화 실행 |
| API 제공 | OpenAI 호환 REST API 자동 제공 |

즉 Ollama = **모델 실행 엔진 + API 서버** 역할을 동시에 합니다.

> **참고:** [Ollama 공식 사이트](https://ollama.com) | [Ollama 모델 라이브러리](https://ollama.com/library)

---

## 4단계 — Docker Compose로 Ollama 실행

### 디렉토리 생성

```bash
mkdir ~/llm-server && cd ~/llm-server
```

### docker-compose.yml 작성

```yaml
services:
  ollama:
    image: ollama/ollama
    container_name: ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]

volumes:
  ollama_data:
```

### GPU 설정 설명

```yaml
deploy:
  resources:
    reservations:        # 최소 보장 리소스 설정
      devices:
        - driver: nvidia        # NVIDIA GPU 드라이버 사용
          count: all            # 서버의 모든 GPU 사용
          capabilities: [gpu]   # GPU 기능을 컨테이너에 노출
```

`docker run --gpus all` 옵션을 docker-compose.yml로 표현한 것입니다.  
`count: all` 대신 숫자를 지정해서 특정 GPU만 할당할 수도 있습니다.

### 컨테이너 실행

```bash
docker compose up -d
```

### 실행 확인

```bash
docker ps
# ollama 컨테이너가 Up 상태인지 확인
```

---

## 5단계 — 모델 다운로드

### 모델 선택 기준

| 모델 | VRAM | 한국어 | 특징 |
|------|------|--------|------|
| `llama3.1:8b` | ~6GB | ★★★ | Meta 제작, 영어 강점 |
| `mistral:7b` | ~5GB | ★★ | 영어 특화, 빠름 |
| `gemma2:9b` | ~7GB | ★★★ | Google 제작 |
| `qwen2.5:7b` | ~5GB | ★★★★★ | Alibaba 제작, 아시아 언어 강점 |

한국어 블로그 작성과 한국어 테스트를 목적으로 **qwen2.5:7b**를 선택했습니다.

### 모델 다운로드

```bash
docker exec -it ollama ollama pull qwen2.5:7b
```

---

## 전체 스택 요약

```
NVIDIA 드라이버        ← GPU 자체를 OS가 인식
        ↓
nvidia-container-toolkit  ← Docker가 GPU에 접근할 수 있게 연결
        ↓
Docker Compose 설정   ← 어떤 컨테이너가 GPU 쓸지 지정
        ↓
Ollama 컨테이너       ← 모델 실행 엔진 + REST API 서버
        ↓
qwen2.5:7b 모델       ← 실제 LLM
```

---

## 다음 편 예고

- FastAPI로 Ollama REST API 감싸기
- 기본 채팅 API 구현
- Docker Compose에 FastAPI 서비스 추가

---

## 참고 링크

- [Ollama 공식 사이트](https://ollama.com)
- [Ollama 모델 라이브러리](https://ollama.com/library)
- [nvidia-container-toolkit 설치 가이드](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html)
- [Ollama Docker Hub](https://hub.docker.com/r/ollama/ollama)
- [Qwen2.5 모델 소개](https://huggingface.co/Qwen)
