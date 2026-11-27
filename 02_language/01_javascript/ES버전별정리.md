---
title: JavaScript(ECMAScript) 버전별 기능 정리 (ES2015 ~ 최신)
domain: language
category: javascript
tags: [language, javascript]
level: intermediate
status: published
created: 2026-07-16
updated: 2026-07-16
velog: false
related: []
---

# JavaScript(ECMAScript) 버전별 기능 정리 (ES2015 ~ 최신)

> 읽는 법
> - ⭐ = 코테/실무/면접에서 자주 쓰는 "꼭 알아야 할" 기능
> - JS의 "버전" = **ECMAScript 연도판**. `ES2015 = ES6`부터 매년 6월 새 판이 확정됨
> - 이 문서는 **버전 관점**(언제 도입됐나). 자료구조·고차함수 "사용법"은 [문법정리.md](문법정리.md) 참고
> - 각 항목: **무엇이 → (필요 시) 짧은 예제**
> - 큰 흐름: **ES6 = 모던 JS 대폭발 → ES2017 async → ES2020 `?.`/`??` → ES2022 class 필드/TLA → 이후 매년 편의 메서드 추가**

---

## ES2015 (ES6) — 모던 JavaScript의 시작 ⭐⭐

가장 크고 중요한 버전. 지금 쓰는 "모던 JS"의 절반 이상이 여기서 나옴.

- **`let` / `const`** — 블록 스코프 변수 (var의 함수 스코프/호이스팅 문제 해결)
- **화살표 함수** — 짧은 문법 + `this` 렉시컬 바인딩
- **템플릿 리터럴** — `` `${x}` ``
- **구조 분해 할당** — `const { a, b } = obj`, `const [x, y] = arr`
- **기본 매개변수 / rest / spread** — `f(a = 1)`, `...args`, `[...arr]`
- **`class`** 문법, **모듈** (`import` / `export`)
- **`Promise`** — 콜백 지옥 해소
- **`Map` / `Set`** (+ WeakMap/WeakSet), **`Symbol`**
- **이터레이터 / 제너레이터**(`function*`), **`for...of`**

```js
const sum = (...nums) => nums.reduce((a, b) => a + b, 0);
const { name, age = 20 } = user;           // 구조 분해 + 기본값
const merged = { ...a, ...b };             // 스프레드
```

---

## ES2016 (ES7) — 초미니 릴리스

- **`Array.prototype.includes`** — `NaN`도 찾음 (indexOf는 못 찾음)
- **지수 연산자 `**`** — `2 ** 10` === 1024

```js
[1, NaN].includes(NaN);   // true   (indexOf(NaN)은 -1)
```

---

## ES2017 (ES8) ⭐

- **`async` / `await`** — Promise를 동기 코드처럼 ⭐⭐
- **`Object.values` / `Object.entries`**
- **`String.prototype.padStart` / `padEnd`**
- `Object.getOwnPropertyDescriptors`, 함수 인자 트레일링 콤마

```js
async function load() {
  const res = await fetch(url);
  return res.json();
}
for (const [k, v] of Object.entries(obj)) { /* ... */ }
'5'.padStart(3, '0');   // "005"
```

> **왜 async/await가 동기처럼 보이나 — 이벤트 루프**  
> `await` 이후 코드는 사실 마이크로태스크(Promise 콜백)로 등록된다. 이벤트 루프는 콜 스택이 빌 때마다 **마이크로태스크 큐를 먼저 전부** 비우고, 그다음 매크로태스크(콜백 큐) 하나를 꺼낸다. 그래서 `Promise.then`이 `setTimeout`보다 항상 먼저 실행된다.

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 340" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="es-loop-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="330" y="24" text-anchor="middle" font-weight="bold" font-size="16">이벤트 루프 (Call Stack / Web API / 큐)</text>

  <!-- Call Stack -->
  <rect x="30" y="55" width="150" height="150" rx="6" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="105" y="76" text-anchor="middle" font-size="13" font-weight="bold">Call Stack</text>
  <rect x="50" y="88" width="110" height="26" fill="#fff" stroke="#333" stroke-width="1"/>
  <text x="105" y="106" text-anchor="middle" font-size="11">현재 실행 프레임</text>
  <rect x="50" y="118" width="110" height="26" fill="#fff" stroke="#333" stroke-width="1"/>
  <text x="105" y="136" text-anchor="middle" font-size="11">함수 호출</text>

  <!-- Web API -->
  <rect x="255" y="55" width="150" height="150" rx="6" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="330" y="76" text-anchor="middle" font-size="13" font-weight="bold">Web API</text>
  <text x="330" y="112" text-anchor="middle" font-size="11">setTimeout</text>
  <text x="330" y="134" text-anchor="middle" font-size="11">fetch / DOM 이벤트</text>
  <text x="330" y="156" text-anchor="middle" font-size="11">(브라우저/노드가 처리)</text>

  <!-- Event Loop node -->
  <circle cx="490" cy="130" r="42" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="490" y="126" text-anchor="middle" font-size="12" font-weight="bold">Event</text>
  <text x="490" y="142" text-anchor="middle" font-size="12" font-weight="bold">Loop</text>

  <!-- Microtask Queue -->
  <rect x="255" y="235" width="180" height="70" rx="6" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="345" y="257" text-anchor="middle" font-size="12" font-weight="bold">Microtask Queue</text>
  <text x="345" y="278" text-anchor="middle" font-size="11">Promise.then / await 이후</text>
  <text x="345" y="296" text-anchor="middle" font-size="10.5" fill="#b02a37">우선 처리 (먼저 비움)</text>

  <!-- Macrotask (callback) Queue -->
  <rect x="470" y="235" width="170" height="70" rx="6" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="555" y="257" text-anchor="middle" font-size="12" font-weight="bold">Callback Queue</text>
  <text x="555" y="278" text-anchor="middle" font-size="11">setTimeout / 이벤트 콜백</text>
  <text x="555" y="296" text-anchor="middle" font-size="10.5">(매크로태스크)</text>

  <!-- flows -->
  <line x1="180" y1="120" x2="252" y2="120" stroke="#333" stroke-width="2" marker-end="url(#es-loop-arrow)"/>
  <text x="216" y="112" text-anchor="middle" font-size="10.5">① 비동기 위임</text>

  <line x1="345" y1="205" x2="345" y2="232" stroke="#333" stroke-width="2" marker-end="url(#es-loop-arrow)"/>
  <line x1="405" y1="150" x2="530" y2="235" stroke="#333" stroke-width="2" marker-end="url(#es-loop-arrow)"/>
  <text x="330" y="222" text-anchor="middle" font-size="10.5">② 완료 시 큐에 적재</text>

  <!-- loop feeds stack -->
  <path d="M460,105 C430,60 200,45 105,52" fill="none" stroke="#333" stroke-width="2" marker-end="url(#es-loop-arrow)"/>
  <text x="300" y="45" text-anchor="middle" font-size="10.5">③ 스택이 비면 큐→스택 (마이크로 먼저)</text>
</svg>

<sub>동기 코드는 Call Stack에서 즉시 실행되고, 비동기 작업은 Web API에 위임된다. 완료된 콜백은 큐에 쌓이고, 이벤트 루프가 스택이 빌 때 꺼내 올린다. 핵심: **한 틱마다 마이크로태스크 큐를 전부 비운 뒤 매크로태스크 하나**를 처리한다.</sub>

---

## ES2018 (ES9)

- **객체 rest/spread** — `const { a, ...rest } = obj` (ES6는 배열만)
- **비동기 이터레이션** — `for await (const x of asyncIterable)`
- **`Promise.prototype.finally`**
- 정규식 강화: **named capture** `(?<year>\d{4})`, lookbehind `(?<=...)`, `s`(dotAll) 플래그

```js
const { id, ...others } = record;
p.then(...).catch(...).finally(() => spinner.hide());
```

---

## ES2019 (ES10)

- **`Array.prototype.flat` / `flatMap`**
- **`Object.fromEntries`** — `entries` → 객체 (Object.entries의 역방향)
- **`String.prototype.trimStart` / `trimEnd`**
- 선택적 catch 바인딩 (`catch {}`), `Array.sort` 안정 정렬 보장

```js
[1, [2, [3]]].flat(2);                          // [1, 2, 3]
Object.fromEntries([['a', 1], ['b', 2]]);       // { a: 1, b: 2 }
```

---

## ES2020 (ES11) ⭐⭐

- **옵셔널 체이닝 `?.`** — 중간이 null/undefined면 에러 없이 undefined
- **널 병합 `??`** — 왼쪽이 **null/undefined일 때만** 오른쪽 (0, '' 은 통과)
- **`BigInt`** — 임의 정밀도 정수 (`10n`)
- **`Promise.allSettled`** — 전부 끝날 때까지 (실패해도 rejected 안 됨)
- **`globalThis`**, 동적 **`import()`**, `String.prototype.matchAll`

```js
const city = user?.address?.city ?? '미상';     // ?. 와 ?? 조합 (매우 자주 씀)
0 ?? 'x';    // 0     (|| 였다면 'x' — 이 차이가 면접 단골)
0 || 'x';    // 'x'
```

---

## ES2021 (ES12)

- **논리 할당 연산자 `&&=` `||=` `??=`**
- **`String.prototype.replaceAll`** — 정규식 `/g` 없이 전체 치환
- **`Promise.any`** — 가장 먼저 성공한 하나 (+ `AggregateError`)
- **숫자 구분자** `1_000_000`, `WeakRef` / `FinalizationRegistry`

```js
config.port ??= 3000;                    // 없을 때만 대입
'a-b-c'.replaceAll('-', '_');            // "a_b_c"
```

---

## ES2022 (ES13) ⭐

- **클래스 필드** — public 필드, **`#private`** 필드/메서드, `static` 필드/블록
- **Top-level await** — 모듈 최상단에서 `await` 직접 사용 ⭐
- **`.at()`** — 음수 인덱스 지원 (`arr.at(-1)` = 마지막) ⭐
- **`Object.hasOwn(obj, key)`** — `hasOwnProperty`의 안전한 대체
- **Error `cause`** — `new Error(msg, { cause })`, 정규식 `d`(indices) 플래그

```js
arr.at(-1);                              // 마지막 요소 (arr[arr.length-1] 대체)
Object.hasOwn(obj, 'key');
class C { #secret = 1; #calc() {} }      // 진짜 private
```

---

## ES2023 (ES14) ⭐

- **불변 배열 메서드** — `toSorted` / `toReversed` / `toSpliced` / `with`
  → 원본을 **바꾸지 않고** 새 배열 반환 (코테에서 side-effect 사고 방지)
- **`Array.prototype.findLast` / `findLastIndex`** — 뒤에서부터 탐색
- Hashbang(`#!`) 문법, WeakMap 키로 Symbol 허용

```js
const sorted = arr.toSorted((a, b) => a - b);   // arr 원본 유지! (sort는 원본 변경)
[1, 2, 3, 4].findLast(x => x % 2 === 0);         // 4
[10, 20, 30].with(1, 99);                        // [10, 99, 30] (원본 유지)
```

---

## ES2024 (ES15) ⭐

- **`Object.groupBy` / `Map.groupBy`** — 배열을 키 기준으로 그룹핑 ⭐
- **`Promise.withResolvers`** — resolve/reject를 밖으로 꺼냄 (deferred 패턴) ⭐
- **`String.prototype.isWellFormed` / `toWellFormed`**
- 정규식 `v` 플래그(unicodeSets), `Atomics.waitAsync`

```js
Object.groupBy([1, 2, 3, 4], n => n % 2 ? 'odd' : 'even');
// { odd: [1, 3], even: [2, 4] }
const { promise, resolve, reject } = Promise.withResolvers();
```

---

## ES2025 (ES16) — 2025.06 확정 ⭐

- **Iterator Helpers** — 이터레이터에 `map`/`filter`/`take`/`drop`/`reduce`/`toArray` (지연 평가, 중간 배열 X)
- **Set 메서드** — `intersection` / `union` / `difference` / `symmetricDifference` / `isSubsetOf` 등 ⭐
- **Import Attributes + JSON 모듈** — `import data from './x.json' with { type: 'json' }`
- **`RegExp.escape()`** — 문자열을 정규식에 안전하게 삽입 (인젝션 방지)
- **`Promise.try()`** — 동기/비동기 함수를 안전하게 Promise로 감쌈
- RegExp modifiers(인라인 플래그 `(?i:...)`), 중복 named capture, `ArrayBuffer.prototype.transfer`

```js
new Set([1, 2, 3]).intersection(new Set([2, 3, 4]));   // Set {2, 3}
[1, 2, 3, 4].values().filter(x => x % 2).take(1).toArray();  // [1] (지연 평가)
```

---

## ES2026 (ES17) — 최신 확정 ⭐

- **`Array.fromAsync()`** — 비동기 이터러블 → 배열 (`for await`의 `Array.from` 버전) ⭐
- **`Map.prototype.getOrInsert` / `getOrInsertComputed`** (Upsert) — "있으면 반환, 없으면 넣고 반환"
- **`Error.isError()`** — 진짜 Error 인스턴스인지 신뢰성 있게 판별
- **`Math.sumPrecise()`** — 부동소수 오차 없는 정밀 합
- **`Uint8Array` ↔ Base64 / Hex** — `toBase64` / `fromBase64` / `toHex` / `fromHex`
- **`Float16Array`** + DataView `getFloat16`/`setFloat16` — 반정밀도 실수(ML 등)
- **JSON.parse source 접근** — reviver 3번째 인자로 원본 소스 텍스트 제공

```js
const arr = await Array.fromAsync(asyncIterable);
const count = map.getOrInsert('key', 0);        // 없으면 0 넣고 0 반환
Uint8Array.fromBase64('aGVsbG8=');              // "hello" 바이트
```

---

## ES2027 (예정) — Stage 4, 향후 판

> 아직 확정 판(edition)에는 안 들어갔지만 stage 4까지 온 것들. "곧 온다" 정도로 알아두기.

- **Temporal** — `Date`를 대체할 새 날짜/시간 API (불변, 타임존/달력 제대로 지원) ⭐
- **Explicit Resource Management** — `using` / `await using` + `Symbol.dispose` (자동 리소스 정리)
  ※ **TS는 5.2(2023)에 문법을 먼저 도입**했지만, JS 런타임 표준으로는 ES2027 예정
- Joint Iteration(`Iterator.zip`), `Atomics.pause`

```js
// (ES2027 예정) 스코프 종료 시 자동 정리
{
  using file = openFile();
}   // 여기서 file[Symbol.dispose]() 자동 호출
```

---

## 한눈에 보는 요약 표 (⭐ 핵심만)

| 버전 | 연도 | 핵심 기능 |
|------|------|-----------|
| **ES2015 (ES6)** | 2015 | let/const, 화살표함수, 구조분해, 스프레드, class, Promise, Map/Set |
| ES2016 | 2016 | `Array.includes`, 지수 `**` |
| **ES2017** | 2017 | **async/await**, Object.entries/values |
| ES2018 | 2018 | 객체 rest/spread, `Promise.finally` |
| ES2019 | 2019 | `flat`/`flatMap`, `Object.fromEntries` |
| **ES2020** | 2020 | **`?.` 옵셔널 체이닝, `??` 널 병합**, BigInt, allSettled |
| ES2021 | 2021 | `&&=`/`\|\|=`/`??=`, `replaceAll`, `Promise.any` |
| **ES2022** | 2022 | class 필드/`#private`, **top-level await**, `.at()`, `Object.hasOwn` |
| **ES2023** | 2023 | **`toSorted`/`toReversed`/`with`(불변)**, `findLast` |
| **ES2024** | 2024 | **`Object.groupBy`**, `Promise.withResolvers` |
| ES2025 | 2025 | Iterator Helpers, Set 메서드, `RegExp.escape`, `Promise.try` |
| ES2026 | 2026 | `Array.fromAsync`, `Map.getOrInsert`, `Error.isError`, Float16Array |
| ES2027(예정) | — | Temporal, `using`(리소스 관리), `Iterator.zip` |

---

## 코테 / 면접 메모 (Q/A)

- Q: `??`와 `||`의 차이는? (면접 단골)
  A: `||`는 **falsy 전체**(`0`, `''`, `false`, `NaN`)에 반응. `??`는 **`null`/`undefined`에만** 반응. 기본값 줄 때 `0`/`''`을 유효값으로 남기려면 `??`. (ES2020)

- Q: `sort()` 대신 `toSorted()`를 쓰는 이유?
  A: `sort()`는 **원본 배열을 변경**(side-effect)해서 버그의 원인. `toSorted()`는 원본을 두고 새 배열 반환. 코테에서 안전. (ES2023)

- Q: `arr[arr.length - 1]` 대신?
  A: `arr.at(-1)`. 음수 인덱스로 뒤에서 접근. (ES2022)

- Q: 배열을 조건별로 묶으려면?
  A: `Object.groupBy(arr, fn)`. 직접 reduce 안 짜도 됨. (ES2024)

- Q: `async/await`는 어느 버전? Promise는?
  A: Promise = **ES6(2015)**, async/await = **ES2017**. async 함수는 항상 Promise를 반환.

- Q: `let`/`const`가 `var`와 다른 점?
  A: `let`/`const`는 **블록 스코프** + TDZ(선언 전 접근 시 에러). `var`는 함수 스코프 + 호이스팅되어 `undefined`. (ES6)

- Q: `Object.hasOwn` vs `obj.hasOwnProperty`?
  A: `hasOwnProperty`는 `Object.create(null)` 객체나 오버라이드된 경우 위험. `Object.hasOwn(obj, key)`가 안전한 표준. (ES2022)

- Q: 얕은 복사 방법들?
  A: `{...obj}` / `[...arr]`(ES6 spread), `Object.assign`. 깊은 복사는 `structuredClone(obj)`(런타임 내장).

- Q: `using` / Temporal은 지금 써도 되나?
  A: 표준은 **ES2027 예정**이라 런타임 지원 확인 필요. 단 TS는 `using`을 5.2부터 문법 지원. → [../02_typescript/버전별정리.md](../02_typescript/버전별정리.md)
