---
title: 브라우저 렌더링 파이프라인
domain: web
category: browser
tags: [web, browser]
level: intermediate
status: published
created: 2026-07-16
updated: 2026-07-16
velog: false
related: []
---

# 브라우저 렌더링 파이프라인

브라우저가 HTML/CSS/JS를 받아 화면 픽셀로 그려내는 과정을 **Critical Rendering Path(CRP, 주요 렌더링 경로)** 라고 한다.
이 경로를 이해하면 "왜 특정 CSS/JS가 렌더링을 막는지", "왜 레이아웃이 자주 깨지고 느린지"를 설명할 수 있다.

## 핵심 개념

렌더링은 크게 다음 6단계로 진행된다.

1. **HTML 파싱 → DOM(Document Object Model)**
   - HTML 바이트 → 문자 → 토큰 → 노드 → **DOM 트리** 구성
   - 파서는 위에서 아래로 진행하며, `<script>`를 만나면 (기본적으로) 파싱을 멈추고 실행 → 파서 블로킹 발생

2. **CSS 파싱 → CSSOM(CSS Object Model)**
   - CSS 바이트 → 토큰 → **CSSOM 트리** 구성
   - CSS는 **렌더링 차단 리소스(render-blocking)**: CSSOM이 완성되기 전에는 렌더 트리를 만들 수 없다

3. **Render Tree(렌더 트리) 구성**
   - DOM + CSSOM 결합
   - `display: none` 등 **화면에 그려지지 않는 노드는 제외** (반면 `visibility: hidden`은 공간을 차지하므로 포함)
   - "무엇을, 어떤 스타일로 그릴지"만 담긴 트리

4. **Layout(레이아웃 / Reflow)**
   - 각 노드의 **정확한 위치와 크기(geometry)** 를 계산
   - 뷰포트 크기, `%`, `em`, `flex` 등이 여기서 실제 px로 확정됨
   - 크롬에서는 이 단계를 Layout, 파이어폭스에서는 Reflow라고 부른다

5. **Paint(페인트)**
   - 계산된 결과를 실제 픽셀로 채움 — 텍스트, 색, 그림자, 이미지, 테두리 등
   - 여러 개의 **레이어(layer)** 로 나눠 그릴 수 있음

6. **Composite(합성)**
   - 페인트된 레이어들을 올바른 순서(z-index 등)로 합쳐 최종 화면 출력
   - GPU가 담당하는 경우가 많아 상대적으로 저렴

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 300" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="crp-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="350" y="24" text-anchor="middle" font-weight="bold" font-size="16">Critical Rendering Path (주요 렌더링 경로)</text>

  <!-- HTML -> DOM -->
  <rect x="20" y="70" width="110" height="46" rx="4" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="75" y="90" text-anchor="middle" font-size="12" font-weight="bold">① HTML</text>
  <text x="75" y="107" text-anchor="middle" font-size="11">→ DOM</text>

  <!-- CSS -> CSSOM -->
  <rect x="20" y="150" width="110" height="46" rx="4" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="75" y="170" text-anchor="middle" font-size="12" font-weight="bold">① CSS</text>
  <text x="75" y="187" text-anchor="middle" font-size="11">→ CSSOM</text>

  <!-- Render Tree -->
  <rect x="185" y="110" width="110" height="46" rx="4" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="240" y="130" text-anchor="middle" font-size="12" font-weight="bold">② Render</text>
  <text x="240" y="147" text-anchor="middle" font-size="11">Tree</text>

  <!-- Layout -->
  <rect x="345" y="110" width="90" height="46" rx="4" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="390" y="130" text-anchor="middle" font-size="12" font-weight="bold">③ Layout</text>
  <text x="390" y="147" text-anchor="middle" font-size="11">(Reflow)</text>

  <!-- Paint -->
  <rect x="485" y="110" width="90" height="46" rx="4" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="530" y="130" text-anchor="middle" font-size="12" font-weight="bold">④ Paint</text>
  <text x="530" y="147" text-anchor="middle" font-size="11">(Repaint)</text>

  <!-- Composite -->
  <rect x="625" y="110" width="60" height="46" rx="4" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="655" y="130" text-anchor="middle" font-size="11" font-weight="bold">⑤ Com-</text>
  <text x="655" y="147" text-anchor="middle" font-size="11">posite</text>

  <!-- arrows into render tree -->
  <line x1="130" y1="93" x2="180" y2="125" stroke="#333" stroke-width="1.5" marker-end="url(#crp-arrow)"/>
  <line x1="130" y1="173" x2="180" y2="141" stroke="#333" stroke-width="1.5" marker-end="url(#crp-arrow)"/>
  <line x1="295" y1="133" x2="340" y2="133" stroke="#333" stroke-width="1.5" marker-end="url(#crp-arrow)"/>
  <line x1="435" y1="133" x2="480" y2="133" stroke="#333" stroke-width="1.5" marker-end="url(#crp-arrow)"/>
  <line x1="575" y1="133" x2="620" y2="133" stroke="#333" stroke-width="1.5" marker-end="url(#crp-arrow)"/>

  <text x="350" y="245" text-anchor="middle" font-size="12">DOM·CSSOM(파랑) → 렌더 트리(초록) → 레이아웃·페인트(노랑, 비쌈) → 합성(회색)</text>
  <text x="350" y="266" text-anchor="middle" font-size="11" fill="#555">CSS·JS는 이 경로를 막을 수 있어 최적화 대상이 된다</text>
</svg>

각 단계는 순차적이며, 앞 단계가 끝나야 뒤 단계가 진행된다. 따라서 **CSSOM/DOM 완성이 늦어지면 첫 화면(First Paint)도 늦어진다.**

## Reflow(리플로우) vs Repaint(리페인트)

렌더링이 끝난 후에도, JS나 사용자 상호작용으로 화면이 변하면 파이프라인의 일부가 다시 실행된다.

| 구분 | 트리거 예시 | 재실행 범위 | 비용 |
|------|-------------|-------------|------|
| **Reflow(리플로우)** | 크기/위치 변경 (`width`, `height`, `top`, `font-size`, DOM 추가/삭제, `offsetHeight` 읽기) | Layout → Paint → Composite | 비쌈 (기하 재계산) |
| **Repaint(리페인트)** | 색상만 변경 (`color`, `background`, `visibility`, `box-shadow`) | Paint → Composite | 중간 |
| **Composite만** | `transform`, `opacity` | Composite | 저렴 (GPU) |

핵심 규칙: **Reflow는 항상 Repaint를 유발하지만, Repaint가 Reflow를 유발하지는 않는다.**
가장 저렴한 애니메이션은 `transform`/`opacity`처럼 **합성 단계만 건드리는 속성**을 쓰는 것이다.

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 250" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="rf-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="280" y="24" text-anchor="middle" font-weight="bold" font-size="16">변경 유형별 재실행 범위</text>

  <!-- Layout -->
  <rect x="60" y="90" width="120" height="46" rx="4" fill="#f8d7da" stroke="#333" stroke-width="1.5"/>
  <text x="120" y="118" text-anchor="middle" font-size="13" font-weight="bold">Layout</text>
  <!-- Paint -->
  <rect x="220" y="90" width="120" height="46" rx="4" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="280" y="118" text-anchor="middle" font-size="13" font-weight="bold">Paint</text>
  <!-- Composite -->
  <rect x="380" y="90" width="120" height="46" rx="4" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="440" y="118" text-anchor="middle" font-size="13" font-weight="bold">Composite</text>

  <line x1="180" y1="113" x2="216" y2="113" stroke="#333" stroke-width="1.5" marker-end="url(#rf-arrow)"/>
  <line x1="340" y1="113" x2="376" y2="113" stroke="#333" stroke-width="1.5" marker-end="url(#rf-arrow)"/>

  <text x="120" y="165" text-anchor="middle" font-size="12" font-weight="bold" fill="#a33">Reflow: 여기부터 전부</text>
  <text x="280" y="185" text-anchor="middle" font-size="12" font-weight="bold" fill="#8a6d00">Repaint: 여기부터</text>
  <text x="440" y="205" text-anchor="middle" font-size="12" font-weight="bold" fill="#2a7">transform/opacity: 여기만</text>
</svg>

왼쪽에서 진입할수록(리플로우) 재계산 범위가 넓어 비싸고, 오른쪽에서 진입할수록(합성) 싸다.

## 렌더링 차단(Blocking)과 최적화

- **CSS는 렌더링 차단**: `<head>`의 CSS가 다 로드/파싱되기 전에는 렌더 트리를 못 만든다 → CSS는 작게, 상단에.
- **JS는 파서 차단**: `<script>`는 기본적으로 HTML 파싱을 멈춘다.
  - `defer`: HTML 파싱과 병렬 다운로드, **파싱 완료 후** 순서대로 실행 (가장 무난)
  - `async`: 병렬 다운로드, **다운로드되는 즉시** 실행 (순서 보장 X, 독립 스크립트에 적합)
- **최적화 원칙**
  - 리플로우를 유발하는 스타일 읽기/쓰기를 반복 루프에서 번갈아 하지 말 것 (레이아웃 스래싱)
  - DOM 변경은 모아서 한 번에 (DocumentFragment, `class` 토글)
  - 애니메이션은 `transform`/`opacity` 위주, 필요 시 `will-change`로 레이어 승격

## 면접 예상 질문

- **Q. `display: none`과 `visibility: hidden`의 렌더링 차이는?**
  `display: none`은 렌더 트리에서 제외되어 공간도 차지하지 않고, 다시 표시하면 리플로우가 발생한다. `visibility: hidden`은 렌더 트리에 남아 공간을 차지하며 리페인트만 유발한다.

- **Q. `transform`으로 이동시키는 게 `top`/`left`보다 빠른 이유는?**
  `top`/`left` 변경은 레이아웃(리플로우)부터 다시 계산하지만, `transform`은 합성 단계만 건드리며 GPU에서 처리되기 때문이다.

- **Q. `async`와 `defer`의 차이는?**
  둘 다 HTML 파싱을 막지 않고 병렬 다운로드하지만, `async`는 다운로드 즉시 실행(순서 보장 X), `defer`는 파싱 완료 후 문서 순서대로 실행한다.
