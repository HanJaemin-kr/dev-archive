---
title: "인증(Authentication): 세션 vs 토큰, JWT, OAuth2"
domain: web
category: auth
tags: [web, auth]
level: intermediate
status: published
created: 2026-07-16
updated: 2026-07-16
velog: false
related: []
---

# 인증(Authentication): 세션 vs 토큰, JWT, OAuth2

웹 인증은 "이 요청을 보낸 사용자가 누구인지"를 매 요청마다 확인하는 문제다.
HTTP는 무상태(stateless)이므로, 로그인 이후 사용자를 식별할 방법이 필요하고 그 방식이 **세션(Session)** 과 **토큰(Token, JWT)** 으로 나뉜다.

## 핵심 개념

### 인증(Authentication) vs 인가(Authorization)
- **인증(AuthN)**: 너 누구야? (신원 확인 — 로그인)
- **인가(AuthZ)**: 너 이거 할 수 있어? (권한 확인 — 접근 제어)

### 세션 vs 토큰 비교

| 구분 | 세션(Session) | 토큰(JWT) |
|------|---------------|-----------|
| 상태 저장 위치 | **서버**(메모리/DB/Redis) | **클라이언트**(토큰 자체에 정보) |
| 서버 상태 | Stateful | Stateless |
| 식별 수단 | 세션 ID(쿠키) | 서명된 토큰(주로 `Authorization: Bearer`) |
| 확장성(scale-out) | 세션 공유 저장소 필요 | 서버 간 공유 불필요(서명만 검증) |
| 즉시 무효화 | 쉬움(서버에서 삭제) | 어려움(만료 전까지 유효) → 블랙리스트 필요 |
| 저장 부담 | 사용자 수만큼 서버 저장 | 서버 저장 없음 |
| 대표 취약점 | 세션 하이재킹, CSRF | 토큰 탈취, 페이로드 노출(암호화 아님) |

**한 줄 요약**: 세션은 "서버가 기억", JWT는 "토큰이 스스로 증명". 확장성은 JWT가 유리하지만 즉시 로그아웃/무효화는 세션이 유리하다.

### JWT 구조 (`header.payload.signature`)

JWT는 점(`.`)으로 구분된 세 부분을 Base64Url로 인코딩한 문자열이다. **암호화가 아니라 서명**이라는 점이 핵심 — 페이로드는 누구나 디코드해서 읽을 수 있으므로 비밀번호 등 민감정보를 넣으면 안 된다.

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9   ← Header (alg, typ)
.
eyJzdWIiOiIxMjM0IiwibmFtZSI6IkphZW1pbiIsImV4cCI6MTcyMH0   ← Payload (claims)
.
dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk   ← Signature
```

- **Header**: 서명 알고리즘(`alg`, 예: HS256/RS256), 타입(`typ: JWT`)
- **Payload**: 클레임(claim) 모음
  - 등록 클레임: `iss`(발급자), `sub`(주체/사용자ID), `exp`(만료시각), `iat`(발급시각)
  - 사용자 정의 클레임: `role`, `name` 등
- **Signature**: `HMACSHA256(base64Url(header) + "." + base64Url(payload), secret)`
  - 서버만 아는 비밀키(또는 개인키)로 서명 → **내용을 위변조하면 서명 검증에 실패**

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 260" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="jwt-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="320" y="24" text-anchor="middle" font-weight="bold" font-size="16">JWT 구조: header . payload . signature</text>

  <rect x="30" y="60" width="170" height="70" rx="4" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="115" y="82" text-anchor="middle" font-size="13" font-weight="bold">① Header</text>
  <text x="115" y="102" text-anchor="middle" font-size="11">alg: HS256</text>
  <text x="115" y="119" text-anchor="middle" font-size="11">typ: JWT</text>

  <text x="212" y="100" text-anchor="middle" font-size="20" font-weight="bold">.</text>

  <rect x="225" y="60" width="190" height="70" rx="4" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="320" y="82" text-anchor="middle" font-size="13" font-weight="bold">② Payload</text>
  <text x="320" y="102" text-anchor="middle" font-size="11">sub, exp, iat, role...</text>
  <text x="320" y="119" text-anchor="middle" font-size="10" fill="#a33">(암호화 X — 읽힘 주의)</text>

  <text x="427" y="100" text-anchor="middle" font-size="20" font-weight="bold">.</text>

  <rect x="440" y="60" width="170" height="70" rx="4" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="525" y="82" text-anchor="middle" font-size="13" font-weight="bold">③ Signature</text>
  <text x="525" y="102" text-anchor="middle" font-size="10">HMAC(①.②, secret)</text>
  <text x="525" y="119" text-anchor="middle" font-size="10">위변조 검증</text>

  <text x="320" y="175" text-anchor="middle" font-size="12">서버는 ③ 서명만 재계산해 검증 → DB 조회 없이 무상태 인증</text>
  <text x="320" y="200" text-anchor="middle" font-size="11" fill="#a33">Payload는 Base64 디코드로 누구나 읽을 수 있다 → 민감정보 금지</text>
  <text x="320" y="225" text-anchor="middle" font-size="11" fill="#555">보통 Access Token(짧게) + Refresh Token(길게) 조합으로 운용</text>
</svg>

### Access Token vs Refresh Token
- **Access Token**: 실제 API 호출에 쓰는 짧은 수명(분 단위) 토큰. 탈취돼도 곧 만료.
- **Refresh Token**: Access Token 재발급용 긴 수명(일~주) 토큰. 안전한 저장소(HttpOnly 쿠키 등)에 보관.
- Access가 만료되면 Refresh로 조용히 재발급 → 잦은 재로그인 방지 + 탈취 리스크 완화.

## OAuth2 — Authorization Code Grant

OAuth2는 "제3자 앱에 비밀번호를 주지 않고 권한을 위임"하는 표준이다.
가장 표준적인 흐름이 **Authorization Code Grant**로, 서버 사이드 웹앱에서 널리 쓰인다.

**등장 인물(role)**
- **Resource Owner**: 사용자(자원의 주인)
- **Client**: 권한을 위임받으려는 우리 애플리케이션
- **Authorization Server**: 인증/동의를 처리하고 코드·토큰을 발급 (예: 구글 OAuth)
- **Resource Server**: 실제 보호된 자원을 가진 API 서버

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 470" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="oauth-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="350" y="24" text-anchor="middle" font-weight="bold" font-size="16">OAuth2 Authorization Code 흐름</text>

  <!-- actor boxes -->
  <rect x="20" y="45" width="120" height="34" rx="4" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="80" y="67" text-anchor="middle" font-size="12" font-weight="bold">사용자(브라우저)</text>
  <rect x="200" y="45" width="120" height="34" rx="4" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="260" y="67" text-anchor="middle" font-size="12" font-weight="bold">Client 앱</text>
  <rect x="390" y="45" width="140" height="34" rx="4" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="460" y="67" text-anchor="middle" font-size="12" font-weight="bold">Authorization Server</text>
  <rect x="580" y="45" width="110" height="34" rx="4" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="635" y="67" text-anchor="middle" font-size="12" font-weight="bold">Resource Server</text>

  <!-- lifelines -->
  <line x1="80" y1="79" x2="80" y2="440" stroke="#999" stroke-width="1" stroke-dasharray="4 3"/>
  <line x1="260" y1="79" x2="260" y2="440" stroke="#999" stroke-width="1" stroke-dasharray="4 3"/>
  <line x1="460" y1="79" x2="460" y2="440" stroke="#999" stroke-width="1" stroke-dasharray="4 3"/>
  <line x1="635" y1="79" x2="635" y2="440" stroke="#999" stroke-width="1" stroke-dasharray="4 3"/>

  <!-- ① 로그인 요청 -->
  <line x1="80" y1="110" x2="256" y2="110" stroke="#333" stroke-width="1.5" marker-end="url(#oauth-arrow)"/>
  <text x="168" y="104" text-anchor="middle" font-size="11">① "구글로 로그인" 클릭</text>

  <!-- ② 인가서버로 리다이렉트 -->
  <line x1="260" y1="145" x2="80" y2="145" stroke="#333" stroke-width="1.5" marker-end="url(#oauth-arrow)"/>
  <text x="168" y="139" text-anchor="middle" font-size="11">② 인가서버로 리다이렉트</text>

  <!-- ③ 로그인+동의 -->
  <line x1="80" y1="185" x2="456" y2="185" stroke="#333" stroke-width="1.5" marker-end="url(#oauth-arrow)"/>
  <text x="270" y="179" text-anchor="middle" font-size="11">③ 로그인 + 권한 동의(consent)</text>

  <!-- ④ authorization code 반환 -->
  <line x1="460" y1="220" x2="264" y2="220" stroke="#333" stroke-width="1.5" marker-end="url(#oauth-arrow)"/>
  <text x="362" y="214" text-anchor="middle" font-size="11">④ Authorization Code (via redirect)</text>

  <!-- ⑤ code + secret -> token 교환 -->
  <line x1="260" y1="258" x2="456" y2="258" stroke="#333" stroke-width="1.5" marker-end="url(#oauth-arrow)"/>
  <text x="358" y="252" text-anchor="middle" font-size="11">⑤ code + client_secret 전송</text>

  <!-- ⑥ access token -->
  <line x1="460" y1="293" x2="264" y2="293" stroke="#333" stroke-width="1.5" marker-end="url(#oauth-arrow)"/>
  <text x="360" y="287" text-anchor="middle" font-size="11">⑥ Access Token (+ Refresh)</text>

  <!-- ⑦ 자원요청 with token -->
  <line x1="260" y1="335" x2="631" y2="335" stroke="#333" stroke-width="1.5" marker-end="url(#oauth-arrow)"/>
  <text x="445" y="329" text-anchor="middle" font-size="11">⑦ Bearer Access Token 으로 API 호출</text>

  <!-- ⑧ 보호 자원 응답 -->
  <line x1="635" y1="373" x2="264" y2="373" stroke="#333" stroke-width="1.5" marker-end="url(#oauth-arrow)"/>
  <text x="448" y="367" text-anchor="middle" font-size="11">⑧ 보호된 자원(사용자 정보 등) 응답</text>

  <text x="350" y="415" text-anchor="middle" font-size="11" fill="#a33">핵심: 토큰 교환(⑤⑥)은 브라우저를 거치지 않는 서버↔서버 통신 → client_secret 노출 방지</text>
  <text x="350" y="435" text-anchor="middle" font-size="11" fill="#555">SPA/모바일은 client_secret 은닉 불가 → PKCE로 code 탈취 방지 보완</text>
</svg>

**흐름 요약**
1. 사용자가 Client에서 "소셜 로그인"을 누른다.
2. Client는 사용자를 Authorization Server로 리다이렉트한다(`client_id`, `redirect_uri`, `scope` 포함).
3. 사용자가 인가서버에서 로그인하고 권한 사용에 **동의(consent)** 한다.
4. 인가서버가 `redirect_uri`로 **인가 코드(Authorization Code)** 를 돌려준다(일회성, 짧은 수명).
5. Client(백엔드)가 그 코드에 **`client_secret`을 더해** 인가서버에 토큰을 요청한다.
6. 인가서버가 **Access Token**(및 Refresh Token)을 발급한다.
7. Client가 Access Token을 `Authorization: Bearer <token>` 헤더로 Resource Server에 붙여 자원을 요청한다.
8. Resource Server가 토큰을 검증하고 보호된 자원을 응답한다.

**왜 "코드"를 한 번 더 교환할까?**
액세스 토큰을 곧바로 브라우저(URL/프론트)로 던지면 노출 위험이 크다. 그래서 노출돼도 곧 만료되는 일회성 **code**만 브라우저 경유로 주고받고, 실제 토큰은 **서버↔서버**로 안전하게 교환한다. 브라우저에 `client_secret`을 둘 수 없는 SPA/모바일은 **PKCE**(코드 검증자/챌린지)로 이 단계를 보강한다.

## 면접 예상 질문

- **Q. JWT는 왜 "즉시 로그아웃"이 어려운가?**
  JWT는 서버에 상태를 저장하지 않고 서명만 검증하므로, 만료(`exp`) 전까지는 유효하다. 강제 무효화를 하려면 별도의 블랙리스트/버전 관리나 Refresh Token 회수 같은 상태를 서버에 다시 두어야 한다.

- **Q. JWT 페이로드에 비밀번호를 넣으면 안 되는 이유는?**
  JWT는 암호화가 아니라 서명이다. 페이로드는 Base64Url 인코딩일 뿐이라 누구나 디코드해 읽을 수 있다. 위변조는 서명으로 막지만 내용 노출은 막지 못한다.

- **Q. OAuth2에서 인가 코드를 한 번 더 토큰으로 교환하는 이유는?**
  액세스 토큰이 브라우저(리다이렉트 URL)에 노출되는 것을 막기 위해서다. 노출돼도 위험이 작은 일회성 code만 브라우저를 경유시키고, 실제 토큰 교환은 `client_secret`을 포함한 서버 간 통신으로 처리한다.

- **Q. 세션 방식에서 서버를 여러 대로 늘리면(scale-out) 생기는 문제와 해결책은?**
  각 서버가 자기 메모리에만 세션을 두면 요청이 다른 서버로 가면 로그인이 풀린다. 해결책은 세션을 Redis 같은 공유 저장소에 두거나(세션 스토어), 로드밸런서 sticky session, 또는 애초에 무상태 JWT로 전환하는 것이다.
