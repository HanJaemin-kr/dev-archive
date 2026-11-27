---
title: HTTP / HTTPS
domain: cs
category: network
tags: [cs, network, http-https]
level: intermediate
status: published
created: 2026-07-16
updated: 2026-07-16
velog: false
related: []
---

# HTTP / HTTPS

---

## 1. HTTP 메서드

| 메서드 | 용도 | 멱등성 | 안전성 |
|--------|------|:------:|:------:|
| **GET** | 리소스 조회 | ✅ | ✅ |
| **POST** | 리소스 생성 | ❌ | ❌ |
| **PUT** | 리소스 전체 수정 (없으면 생성) | ✅ | ❌ |
| **PATCH** | 리소스 일부 수정 | ❌ | ❌ |
| **DELETE** | 리소스 삭제 | ✅ | ❌ |
| **HEAD** | 헤더만 조회 (바디 없음) | ✅ | ✅ |
| **OPTIONS** | 지원 메서드 조회 (CORS preflight) | ✅ | ✅ |

- **멱등성(Idempotent)**: 같은 요청 여러 번 해도 결과 동일
- **안전(Safe)**: 서버 상태를 변경하지 않음

### HTTP 요청 / 응답 메시지 구조

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 300" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="http-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="320" y="24" text-anchor="middle" font-weight="bold" font-size="16">HTTP 요청 / 응답 메시지 구조</text>

  <!-- Request -->
  <text x="160" y="52" text-anchor="middle" font-size="13" font-weight="bold">요청 (Request)</text>
  <rect x="30" y="60" width="260" height="30" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="40" y="80" font-size="11">시작 줄: GET /users/1 HTTP/1.1</text>
  <rect x="30" y="90" width="260" height="70" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="40" y="110" font-size="11">헤더: Host: api.com</text>
  <text x="40" y="126" font-size="11">        Accept: application/json</text>
  <text x="40" y="142" font-size="11">        Authorization: Bearer ...</text>
  <rect x="30" y="160" width="260" height="22" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="40" y="175" font-size="10" fill="#555">빈 줄 (CRLF) — 헤더/바디 구분</text>
  <rect x="30" y="182" width="260" height="44" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="40" y="202" font-size="11">바디: (GET은 보통 없음,</text>
  <text x="40" y="218" font-size="11">        POST/PUT은 전송 데이터)</text>

  <!-- arrows -->
  <line x1="292" y1="120" x2="348" y2="120" stroke="#333" stroke-width="1.5" marker-end="url(#http-arrow)"/>
  <text x="320" y="112" text-anchor="middle" font-size="10">요청</text>
  <line x1="348" y1="150" x2="292" y2="150" stroke="#333" stroke-width="1.5" marker-end="url(#http-arrow)"/>
  <text x="320" y="168" text-anchor="middle" font-size="10">응답</text>

  <!-- Response -->
  <text x="480" y="52" text-anchor="middle" font-size="13" font-weight="bold">응답 (Response)</text>
  <rect x="350" y="60" width="260" height="30" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="360" y="80" font-size="11">상태 줄: HTTP/1.1 200 OK</text>
  <rect x="350" y="90" width="260" height="70" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="360" y="110" font-size="11">헤더: Content-Type: application/json</text>
  <text x="360" y="126" font-size="11">        Content-Length: 51</text>
  <text x="360" y="142" font-size="11">        Cache-Control: no-cache</text>
  <rect x="350" y="160" width="260" height="22" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="360" y="175" font-size="10" fill="#555">빈 줄 (CRLF) — 헤더/바디 구분</text>
  <rect x="350" y="182" width="260" height="44" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="360" y="202" font-size="11">바디: {"id":1,</text>
  <text x="360" y="218" font-size="11">          "name":"kim"}</text>

  <text x="320" y="256" text-anchor="middle" font-size="11" fill="#555">시작(상태) 줄 + 헤더 + 빈 줄 + 바디 — 요청·응답 공통 4구성</text>
</svg>

*요청과 응답 모두 "시작 줄 → 헤더 → 빈 줄(CRLF) → 바디" 구조를 공유한다. 헤더와 바디는 빈 줄 하나로 구분되며, 시작 줄만 각각 메서드/URL과 상태 코드로 다르다.*

---

## 2. HTTP 상태 코드

| 코드 | 분류 | 주요 예시 |
|:----:|------|---------|
| 2xx | 성공 | 200 OK, 201 Created, 204 No Content |
| 3xx | 리다이렉션 | 301 Moved Permanently, 302 Found, 304 Not Modified |
| 4xx | 클라이언트 오류 | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests |
| 5xx | 서버 오류 | 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable |

**자주 헷갈리는 것:**
- `401 Unauthorized`: 인증 안 됨 (로그인 필요)
- `403 Forbidden`: 인증은 됐지만 권한 없음
- `301 vs 302`: 301은 영구 이동 (캐시됨), 302는 임시 이동

---

## 3. HTTP 버전 비교

| 버전 | 핵심 특징 | 문제점 |
|------|---------|-------|
| **HTTP/1.0** | 요청마다 새 TCP 연결 | 매번 handshake 비용 |
| **HTTP/1.1** | Persistent Connection, Pipelining | HOL Blocking (앞 요청 응답 대기) |
| **HTTP/2.0** | 멀티플렉싱, 헤더 압축(HPACK), 서버 푸시, 바이너리 | TCP HOL Blocking 여전히 존재 |
| **HTTP/3.0** | QUIC(UDP 기반), 연결 다중화, 0-RTT | UDP 기반 신뢰성 직접 구현 |

### HOL Blocking (Head-of-Line Blocking)

앞의 패킷/요청이 처리될 때까지 뒤의 것이 블로킹되는 현상.
- HTTP/1.1: 앞 응답 받기 전에 뒤 요청 처리 불가
- HTTP/2: 스트림 단위로 분리 → TCP 레벨 HOL는 여전히 존재
- HTTP/3(QUIC): UDP로 스트림별 독립 처리 → 완전 해결

---

## 4. HTTPS / TLS

HTTP + TLS(Transport Layer Security) = HTTPS

### TLS Handshake (TLS 1.2 기준)

```
Client                              Server
  │── ClientHello (버전, 암호화 목록) ──►│
  │◄─ ServerHello (버전, 암호화 선택) ──│
  │◄─ Certificate (서버 인증서) ────────│
  │◄─ ServerHelloDone ─────────────────│
  │── ClientKeyExchange (대칭키 교환) ──►│
  │── ChangeCipherSpec ────────────────►│
  │── Finished ────────────────────────►│
  │◄─ ChangeCipherSpec, Finished ───────│
  │           암호화 통신 시작            │
```

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 380" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="tls-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="250" y="24" text-anchor="middle" font-weight="bold" font-size="16">TLS 1.2 Handshake</text>

  <rect x="70" y="44" width="100" height="30" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="120" y="64" text-anchor="middle" font-size="13" font-weight="bold">Client</text>
  <rect x="330" y="44" width="100" height="30" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="380" y="64" text-anchor="middle" font-size="13" font-weight="bold">Server</text>
  <line x1="120" y1="74" x2="120" y2="350" stroke="#333" stroke-width="1.5"/>
  <line x1="380" y1="74" x2="380" y2="350" stroke="#333" stroke-width="1.5"/>

  <!-- ① ClientHello -->
  <line x1="120" y1="102" x2="380" y2="102" stroke="#333" stroke-width="1.5" marker-end="url(#tls-arrow)"/>
  <text x="250" y="96" text-anchor="middle" font-size="12">① ClientHello (TLS버전, 암호목록, 랜덤)</text>

  <!-- ② ServerHello -->
  <line x1="380" y1="132" x2="120" y2="132" stroke="#333" stroke-width="1.5" marker-end="url(#tls-arrow)"/>
  <text x="250" y="126" text-anchor="middle" font-size="12">② ServerHello (암호선택, 랜덤)</text>

  <!-- ③ Certificate -->
  <line x1="380" y1="162" x2="120" y2="162" stroke="#333" stroke-width="1.5" marker-end="url(#tls-arrow)"/>
  <text x="250" y="156" text-anchor="middle" font-size="12">③ Certificate (서버 인증서) + ServerHelloDone</text>

  <!-- CA verify note -->
  <rect x="30" y="176" width="180" height="24" fill="#fff3cd" stroke="#333" stroke-width="1"/>
  <text x="120" y="192" text-anchor="middle" font-size="10">CA 서명 검증 → 신뢰 확인</text>

  <!-- ④ ClientKeyExchange -->
  <line x1="120" y1="228" x2="380" y2="228" stroke="#333" stroke-width="1.5" marker-end="url(#tls-arrow)"/>
  <text x="250" y="222" text-anchor="middle" font-size="12">④ ClientKeyExchange (비대칭키로 pre-master 암호화)</text>

  <!-- ⑤ ChangeCipherSpec + Finished -->
  <line x1="120" y1="258" x2="380" y2="258" stroke="#333" stroke-width="1.5" marker-end="url(#tls-arrow)"/>
  <text x="250" y="252" text-anchor="middle" font-size="12">⑤ ChangeCipherSpec + Finished</text>

  <!-- ⑥ server -->
  <line x1="380" y1="288" x2="120" y2="288" stroke="#333" stroke-width="1.5" marker-end="url(#tls-arrow)"/>
  <text x="250" y="282" text-anchor="middle" font-size="12">⑥ ChangeCipherSpec + Finished</text>

  <!-- symmetric channel -->
  <rect x="90" y="304" width="320" height="34" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="250" y="320" text-anchor="middle" font-size="12" font-weight="bold">대칭키(AES)로 암호화된 통신 시작</text>
  <text x="250" y="334" text-anchor="middle" font-size="10" fill="#555">양쪽 랜덤값 + pre-master → 세션키 생성</text>
</svg>

*비대칭키(RSA/ECDH)로 대칭키(pre-master)를 안전하게 교환한 뒤, 이후 실제 데이터는 빠른 대칭키(AES)로 암호화한다. TLS 1.3은 이 왕복을 1-RTT로 단축한다.*

- **비대칭키**: 인증서 검증, 키 교환에 사용 (RSA, ECDH)
- **대칭키**: 실제 데이터 암호화에 사용 (AES)
- **인증서**: CA(Certificate Authority)가 서버의 공개키에 서명 → 신뢰 보장

### TLS 1.3

- 1-RTT Handshake (1.2는 2-RTT)
- 취약한 암호화 제거, 0-RTT 지원

---

## 5. REST API 설계 원칙

| 원칙 | 설명 |
|------|------|
| **Stateless** | 서버가 클라이언트 상태 저장 안 함, 요청마다 모든 정보 포함 |
| **Uniform Interface** | URI로 자원 식별, HTTP 메서드로 행위 표현 |
| **Client-Server** | 클라이언트와 서버 역할 분리 |
| **Cacheable** | 응답에 캐싱 가능 여부 명시 |

### URI 설계 규칙

```
✅ GET  /users/1         (사용자 1 조회)
✅ POST /users           (사용자 생성)
✅ PUT  /users/1         (사용자 1 수정)
✅ DELETE /users/1       (사용자 1 삭제)

❌ GET /getUser          (동사 사용 금지)
❌ GET /users/1/delete   (메서드로 행위 표현)
❌ GET /Users/1          (소문자 사용)
```

---

## 6. 쿠키 vs 세션 vs JWT

| | 쿠키 | 세션 | JWT |
|--|:----:|:----:|:---:|
| 저장 위치 | 클라이언트 | 서버 | 클라이언트 |
| 보안 | 낮음 (탈취 위험) | 높음 | 중간 |
| 서버 부하 | 없음 | 있음 (저장소 필요) | 없음 |
| 확장성 | 좋음 | 나쁨 (세션 공유 필요) | 좋음 |
| 만료 처리 | 자동 | 서버에서 삭제 | 어려움 (블랙리스트) |

### JWT 구조

```
Header.Payload.Signature

eyJhbGciOiJIUzI1NiJ9.  ← Header (알고리즘)
eyJ1c2VySWQiOjF9.      ← Payload (데이터, Base64)
SflKxwRJSMeKKF2QT4      ← Signature (서명, 위변조 감지)
```

---

## 7. CORS (Cross-Origin Resource Sharing)

다른 Origin(프로토콜+도메인+포트)의 요청을 브라우저가 기본적으로 차단 → 서버에서 허용 헤더 설정.

```
요청: http://frontend.com → http://api.com
브라우저: "다른 Origin인데 허용됩니까?"

서버 응답 헤더:
Access-Control-Allow-Origin: http://frontend.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
```

**Simple Request vs Preflight**:
- Simple: GET/POST + 단순 헤더 → 바로 전송
- Preflight: OPTIONS 요청 먼저 보내 허가 확인 → PUT/DELETE, 커스텀 헤더 시

---

## 면접 자주 출제 Q&A

**Q. GET과 POST의 차이?**  
→ GET은 URL에 파라미터 노출(캐싱 가능, 멱등), POST는 Body에 데이터(캐싱 불가, 비멱등). 보안 측면에서 민감 데이터는 POST (단, HTTPS 없으면 body도 평문).

**Q. HTTP/1.1 vs HTTP/2 차이?**  
→ HTTP/2는 멀티플렉싱으로 하나의 TCP 연결에서 여러 요청 병렬 처리, 헤더 압축(HPACK), 서버 푸시 지원. 바이너리 프로토콜이라 파싱 빠름.

**Q. JWT의 단점과 해결법?**  
→ 발급된 JWT를 서버에서 즉시 무효화 불가(만료 전까지 유효). 해결: Access Token(짧은 만료) + Refresh Token(긴 만료) 조합. Refresh Token을 DB에 저장해 로그아웃/탈취 시 삭제.

**Q. HTTPS인데도 패킷을 캡처하면 내용을 볼 수 있나?**  
→ TLS로 암호화되어 있어 내용 확인 불가. 단, 중간자 공격(MITM)이나 클라이언트에 가짜 인증서 설치 시 복호화 가능.
