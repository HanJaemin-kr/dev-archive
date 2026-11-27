---
title: nginx + Docker 운영 함정 (HSTS·bind-mount·재생성·헬스체크)
domain: infra
category: gateway
tags: [infra, gateway, nginx, docker, hsts, tls, bind-mount, healthcheck, gzip, troubleshooting]
level: intermediate
status: published
created: 2026-11-27
updated: 2026-11-27
velog: false
related: ["[[nginx-reverse-proxy-subpath]]", "[[auth]]"]
---

# nginx + Docker 운영 함정

> nginx 컨테이너 설정을 최적화(gzip·SSL·헬스체크)하다 실제로 겪은 함정들을 일반화한 정리.

## 핵심 개념

### 1. HSTS는 "호스트" 단위 — 같은 도메인의 **모든 포트**에 적용된다
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`를 443에 붙이면, 브라우저는 그 호스트로 가는 **모든 HTTP 요청을 HTTPS로 내부 업그레이드(307)** 한다.
- 같은 호스트의 `:6020` 같은 **HTTP 전용 포트 서비스**도 `https://host:6020`으로 바뀌어 접속 불가.
- 서버는 리다이렉트를 안 보내므로 `curl`로는 200이 나와 원인 찾기가 어렵다 → 브라우저 정책 캐시 문제.
- 해제: `max-age=0`을 HTTPS 응답으로 한 번 받게 하거나, Chrome `chrome://net-internals/#hsts`에서 삭제.
- 교훈: HSTS(특히 `includeSubDomains`, `preload`)는 같은 호스트/하위 도메인에 HTTP 전용 서비스가 없는지 확인 후 적용. 대안은 그 서비스도 리버스 프록시 뒤 HTTPS로.

### 2. 단일 파일 bind-mount + `cp` 교체 = inode 불일치
- `-v ./default.conf:/etc/nginx/conf.d/default.conf:ro`처럼 **파일 하나**를 마운트하면 컨테이너는 **마운트 시점의 inode**를 본다.
- 호스트에서 `cp new.conf default.conf`(구현에 따라), `mv`, 일부 에디터 저장은 **새 inode**를 만든다 → 호스트 파일은 바뀌었는데 컨테이너는 옛 파일. `nginx -s reload` 해도 옛 설정.
- 판별: `ls -i ./default.conf` vs `docker exec <c> ls -i /etc/nginx/conf.d/default.conf`.
- 해결: 컨테이너 재시작(재마운트). 예방: **디렉터리 마운트** 또는 in-place 쓰기(`cat new > default.conf`).

### 3. `docker compose up -d`는 실행 중 컨테이너를 재생성하지 않는다
- compose 정의가 바뀌지 않았다고 판단하면 `Running`만 출력. 새 volume을 붙이려면 **compose 파일에 mount를 추가**한 뒤 `--force-recreate`.
```bash
docker compose up -d --no-deps --force-recreate nginx
```
- 기본 `nginx.conf`(http 블록의 gzip 등)를 바꾸려면 컨테이너에서 꺼내(`docker exec c cat /etc/nginx/nginx.conf > nginx.conf`) 수정 후 마운트.

### 4. 헬스체크·재시작 정책은 생성 시에만
- `docker run`으로 띄운 컨테이너에 healthcheck/restart policy를 나중에 붙일 수 없다(restart는 `docker update` 가능, healthcheck는 불가) → 재생성.
```bash
docker run -d --name nginx-dev \
  --network app-net -p 19001:80 \
  -v $PWD/v1.conf:/etc/nginx/conf.d/default.conf:ro \
  --health-cmd "nginx -t || exit 1" --health-interval 30s \
  --health-timeout 10s --health-retries 3 \
  --restart unless-stopped nginx:stable
```
- `nginx -t`는 설정 문법만 본다. 실제 응답까지 보려면 `curl -f http://localhost/`를 추가.

### 5. `proxy_pass`는 IP보다 서비스명 — 단, host 네트워크 컨테이너는 예외
- 같은 Docker 네트워크면 `proxy_pass http://web-server:6001;`이 IP 변경·서버 이전에 강하다.
- `network_mode: host` 컨테이너는 Docker DNS에 등록되지 않아 이름 해석 불가 → 호스트 IP/포트 사용.
- 리터럴 서비스명도 nginx가 시작 시 한 번만 해석한다는 점은 [[nginx-reverse-proxy-subpath]]의 DNS 캐싱 참고.

## 예제 코드

### TLS 하드닝 + 압축 (http/server 블록)
```nginx
# http {}
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;
gzip_min_length 1024;
gzip_vary on;
gzip_proxied any;

# server { listen 443 ssl; }
ssl_protocols       TLSv1.2 TLSv1.3;
ssl_ciphers         HIGH:!aNULL:!MD5;
ssl_session_cache   shared:SSL:10m;
ssl_session_timeout 10m;
add_header Strict-Transport-Security "max-age=31536000" always;   # includeSubDomains는 신중히
add_header X-Content-Type-Options "nosniff" always;
```

### 안전한 변경 절차
```bash
cp default.conf default.conf.bak.$(date +%Y%m%d-%H%M%S)   # 1. 날짜 백업
vi default.conf                                            # 2. in-place 편집
docker exec nginx nginx -t && docker exec nginx nginx -s reload   # 3. 검증 후 무중단 reload
curl -sI https://example.com/ | grep -i -E 'strict|content-encoding'  # 4. 헤더 확인
openssl s_client -connect example.com:443 -tls1_1 </dev/null   # 5. 구버전 TLS 거부 확인
```
- 백업 파일을 `conf.d/` 안에 `*.conf`로 두면 `include conf.d/*.conf`에 함께 로드될 수 있으니 확장자/위치 주의.

## 면접 예상 질문

- **Q. HSTS를 켰더니 다른 포트의 HTTP 서비스가 안 열린다. 왜?**
  A. HSTS는 포트 구분 없이 호스트 단위로 적용되어 브라우저가 모든 요청을 HTTPS로 업그레이드하기 때문.
- **Q. 설정 파일을 고치고 reload했는데 반영이 안 된다. 의심할 것은?**
  A. 단일 파일 bind-mount의 inode 불일치, 다른 파일을 수정했는지(include 경로), `nginx -t` 실패 여부.
- **Q. compose에서 볼륨을 추가했는데 적용이 안 된다면?**
  A. compose 파일에 실제로 반영됐는지 확인 후 `--force-recreate`로 컨테이너를 재생성.
- **Q. 컨테이너 헬스체크로 무엇을 검사해야 하나?**
  A. 프로세스 생존·설정 문법만이 아니라 실제 엔드포인트 응답(`curl -f`)까지.
