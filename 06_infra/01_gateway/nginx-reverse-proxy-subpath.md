---
title: nginx 리버스 프록시와 서브패스 라우팅
domain: infra
category: gateway
tags: [infra, gateway, nginx, reverse-proxy, subpath, sub_filter, websocket, spa, docker]
level: intermediate
status: published
created: 2026-11-27
updated: 2026-11-27
velog: false
related: ["[[nginx-docker-ops-pitfalls]]", "[[github-actions-ssh-deploy]]", "[[dns]]"]
---

# nginx 리버스 프록시와 서브패스 라우팅

> 한 도메인 아래에 운영·개발 환경을 경로(`/`, `/dev/v1/`, `/dev/v2/`)로 나눠 붙이는 구조를 실습하며 정리한 내용.

## 핵심 개념

### 리버스 프록시의 역할
- 클라이언트 요청을 받아 내부 서버로 **대신 전달**하고 응답을 돌려준다. 앱 서버는 앞단을 모른 채 HTTP만 처리.
- 주요 기능: **TLS 종단**, **경로/호스트 기반 라우팅**, 헤더 조작, 압축, 정적 파일 서빙.

### 단일 도메인 + 서브패스 분기 구조
```
Browser ──HTTPS──▶ [게이트웨이 nginx]  (TLS 종료, location 분기)
                      ├─ /          → prod 앱
                      ├─ /dev/v1/   → [개발서버 nginx-v1] → dev v1 앱
                      └─ /dev/v2/   → [개발서버 nginx-v2] → dev v2 앱
```
- 장점: DNS·인증서 추가 없이 환경을 늘릴 수 있다.
- 핵심 난제: **앱은 자기가 `/`에 있다고 생각**하는데 브라우저는 `/dev/v2/` 아래에 있다. 요청은 프리픽스를 **벗기고**, 응답은 프리픽스를 **붙여야** 한다.

### 요청 쪽: 프리픽스 strip — `proxy_pass` 끝 슬래시
```nginx
location /dev/v2/ {
    proxy_pass http://backend:6001/;   # 끝 '/' 있음 → /dev/v2/utility → /utility
}
location /dev/v2/ {
    proxy_pass http://backend:6001;    # 끝 '/' 없음 → /dev/v2/utility 그대로 전달
}
```
`proxy_pass`에 URI(슬래시 포함)가 있으면 location 매칭 부분이 그 URI로 **치환**된다.

### 응답 쪽: Location 헤더와 HTML 본문 재작성
| 대상 | 지시어 | 왜 필요한가 |
|---|---|---|
| 리다이렉트 `Location` 헤더 | `proxy_redirect` | 백엔드가 `/utility/`로 301(예: trailing-slash 정규화)하면 브라우저가 서브패스를 탈출 |
| HTML 본문의 절대 경로 | `sub_filter` | 빌드 결과물의 `/assets/...js`가 루트로 요청돼 404 |

```nginx
proxy_redirect ~^(/(?!dev/v2).*)$              /dev/v2$1;   # 상대 Location
proxy_redirect ~https?://[^/]+(/(?!dev/v2).*)$ /dev/v2$1;   # 절대 URL Location
proxy_set_header Accept-Encoding "";   # ★ upstream이 gzip이면 sub_filter가 압축 바이트에 적용돼 무효
sub_filter '<base href="/" />' '<base href="/dev/v2/" />';
sub_filter 'href="/assets' 'href="/dev/v2/assets';
sub_filter 'src="/assets'  'src="/dev/v2/assets';
sub_filter_once off;                   # 기본은 첫 매치만 치환
```

### SPA가 서브패스를 아는 두 방식
| | 빌드타임 고정 | 런타임 주입 |
|---|---|---|
| 방법 | `publicPath`/`base`를 `/dev/v1/`로 빌드 | `<base href="/">`를 nginx `sub_filter`로 교체, 라우터는 `<base>`에서 basename 읽기 |
| 경로 변경 시 | 재빌드 | nginx 설정만 |
| 비용 | 응답 변환 0 | 매 HTML 응답 스캔 |
| 단점 | 환경별 dist 분리 | 프록시 설정 의존 |

React Router 예: `const basename = new URL(document.baseURI).pathname; <BrowserRouter basename={basename}>`.

### 원칙: 재작성은 한 계층에서만
게이트웨이와 내부 nginx 둘 다 `sub_filter`를 걸면, 앞에서 이미 `/dev/v2/assets`로 바뀐 본문에 뒤의 `/assets` 패턴은 매칭되지 않아 **dead rule**이 된다. 디버깅 혼란만 남으므로 한 곳(보통 응답을 만드는 쪽에 가까운 계층)으로 통일.

### WebSocket / SSE
```nginx
location ^~ /dev/v2/socket.io/ {          # ^~ : 정규식 location보다 이 prefix 우선
    proxy_pass http://backend:6003/socket.io/;
    proxy_http_version 1.1;               # 기본 1.0 → Upgrade 불가
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade"; # hop-by-hop 헤더라 명시 필요
    proxy_read_timeout 86400;             # 메시지 사이 idle 허용 (기본 60s면 끊김)
}
```
SSE는 추가로 `proxy_buffering off;`가 흔히 필요.

### 공통 헤더
| 헤더 | 누락 시 |
|---|---|
| `Host $host` | 백엔드가 가상호스트/절대 URL을 잘못 생성 |
| `X-Real-IP $remote_addr` | 백엔드 로그가 전부 프록시 IP |
| `X-Forwarded-For $proxy_add_x_forwarded_for` | 다단 프록시에서 원 IP 추적 불가 |
| `X-Forwarded-Proto $scheme` | HTTPS 페이지에서 `http://` 리다이렉트(mixed content) |

반복되는 헤더는 `snippets/proxy-common.conf`로 빼서 `include`.

### upstream 호스트명 DNS 캐싱 (Docker에서 자주 터짐)
- `proxy_pass http://backend:6001;`처럼 **리터럴 호스트명**이면 nginx는 **시작/reload 때 한 번만** 이름을 해석해 IP를 고정한다.
- 백엔드 컨테이너를 재생성해 IP가 바뀌면 nginx는 죽은 IP로 접속 → **502**. 브라우저에선 JS 자리에 HTML 에러 페이지가 와서 `Uncaught SyntaxError: Unexpected token '<'`.
- 해결: 임시로 `nginx -s reload`, 영구적으로는 resolver + 변수.
```nginx
resolver 127.0.0.11 valid=10s;      # Docker 내장 DNS
set $up backend;
location /api/ {
    rewrite ^/api/(.*)$ /$1 break;  # 변수 proxy_pass는 URI 치환 규칙이 달라 strip을 직접
    proxy_pass http://$up:6001;
}
```

## 예제 코드

### 장애 분리 진단 순서
```bash
curl -sI http://localhost:<backend-port>/js/app.js     # 백엔드 직접: 200?
curl -sI http://localhost:<nginx-port>/js/app.js       # nginx 경유: 502?
docker logs <nginx> --tail 20                          # upstream: "http://<옛IP>:6001"
docker exec <nginx> getent hosts <backend>             # 현재 IP와 비교
docker exec <nginx> nginx -t && docker exec <nginx> nginx -s reload
```
`Unexpected token '<'`는 (1) 프록시 에러 페이지 또는 (2) 없는 자산 요청에 SPA 폴백이 `index.html`을 200으로 준 경우 — 응답 `Content-Type`을 보면 구분된다.

## 면접 예상 질문

- **Q. `proxy_pass http://a/;`와 `proxy_pass http://a;`의 차이는?**
  A. URI가 있으면 location 매칭 부분이 그 URI로 치환되어 프리픽스가 벗겨지고, 없으면 원래 URI가 그대로 전달된다.
- **Q. sub_filter가 동작하지 않는 흔한 원인은?**
  A. upstream이 압축 응답을 보내는 경우(`Accept-Encoding ""`로 해결), `sub_filter_once` 기본값 on, 대상 MIME이 `text/html`이 아닌 경우.
- **Q. 컨테이너 재시작 후 nginx가 502를 내는 이유는?**
  A. nginx가 기동 시 해석한 옛 컨테이너 IP를 계속 쓰기 때문. reload하거나 resolver+변수로 요청 시 재해석하게 한다.
- **Q. 서브패스 배포에서 빌드타임 base와 런타임 재작성의 트레이드오프는?**
  A. 빌드타임은 성능상 유리하지만 환경별 빌드가 필요하고, 런타임은 같은 산출물을 재사용하지만 프록시가 매 응답을 스캔한다.
- **Q. WebSocket 프록시에 필요한 설정은?**
  A. HTTP/1.1, `Upgrade`/`Connection` 헤더 전달, 긴 `proxy_read_timeout`.
