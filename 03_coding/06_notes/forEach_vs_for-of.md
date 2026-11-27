---
title: forEach vs for...of
domain: coding
category: notes
tags: [coding, notes]
level: intermediate
status: published
created: 2026-05-20
updated: 2026-05-20
velog: false
related: []
---

# forEach vs for...of

## 핵심 차이: 함수 분리 여부

`forEach`는 콜백 함수를 배열 요소마다 실행하는 구조라서,
콜백 내부의 `return`은 **콜백만 종료**하고 바깥 함수는 계속 실행된다.

```js
function test() {
    [1, 2, 3].forEach((x) => {
        if (x === 2) return false;  // 콜백만 종료
        console.log(x);
    });
    console.log("끝");
}
test();
// 출력: 1, 3, 끝
```

`for...of`는 진짜 반복문이라서 `return`하면 **바깥 함수 자체가 종료**된다.

```js
function test() {
    for (const x of [1, 2, 3]) {
        if (x === 2) return false;  // 함수 종료
        console.log(x);
    }
    console.log("끝");
}
console.log(test());
// 출력: 1, false
```

---

## 상황별 선택 기준

| 상황 | 추천 |
|------|------|
| 단순 출력/부수효과 | `forEach` |
| 조건 검사 후 조기 종료 | `for...of` |
| `break` / `continue` 필요 | `for...of` |
| `return` 필요 | `for...of` |
| `async/await` 처리 | `for...of` |
| 알고리즘 코테 | 거의 무조건 `for...of` |

---

## forEach + async 함정

```js
// 이렇게 쓰면 안 됨 — await가 실제로 기다리지 않음
arr.forEach(async (item) => {
    await fetch(item);
});

// 올바른 방법
for (const item of arr) {
    await fetch(item);
}
```

---

## 코테 권장 순서

처음에는 `map` / `filter` / `reduce` 남발 대신
`for` / `for...of` 위주로 익히는 것이 흐름 제어에 훨씬 유리하다.

> 실제 오답 사례: 올바른_괄호 문제에서 `forEach` 내부 `return false`가
> `solution()` 을 종료하지 않아 잘못된 결과 반환 → `for...of`로 교체 후 해결
