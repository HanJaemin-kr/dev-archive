# 배열 (Array)

## 핵심 개념

배열은 동일한 타입의 원소를 **연속된 메모리 공간**에 저장하는 자료구조.  
인덱스로 O(1) 접근이 가능하지만, 삽입/삭제는 O(n)이 걸린다.

### 시간복잡도

| 연산 | 복잡도 | 이유 |
|------|--------|------|
| 접근 `arr[i]` | O(1) | 인덱스로 직접 주소 계산 |
| 탐색 | O(n) | 최악의 경우 전체 순회 |
| 끝에 삽입 `push` | O(1) 분할상환 | 마지막 자리에 추가 |
| 중간 삽입/삭제 | O(n) | 뒤 원소를 전부 밀거나 당겨야 함 |
| 앞 삽입 `unshift` | O(n) | 전체 원소 한 칸씩 이동 |

---

## 자주 쓰는 배열 메서드

### 추가

| 메서드 | 동작 | 반환값 | 복잡도 |
|--------|------|--------|--------|
| `arr.push(v)` | 끝에 추가 | 새 length | O(1) |
| `arr.unshift(v)` | 앞에 추가 | 새 length | O(n) |
| `arr.splice(i, 0, v)` | 인덱스 i에 삽입 | `[]` (제거된 원소) | O(n) |
| `arr.concat(arr2)` | 두 배열 합쳐 새 배열 반환 | 새 배열 | O(n+m) |

```js
const a = [1, 2, 3];
a.push(4);              // [1, 2, 3, 4]
a.unshift(0);           // [0, 1, 2, 3, 4]
a.splice(2, 0, 99);     // [0, 1, 99, 2, 3, 4]
const b = a.concat([5, 6]); // 원본 불변
```

### 삭제

| 메서드 | 동작 | 반환값 | 복잡도 |
|--------|------|--------|--------|
| `arr.pop()` | 끝 원소 제거 | 제거된 원소 | O(1) |
| `arr.shift()` | 앞 원소 제거 | 제거된 원소 | O(n) |
| `arr.splice(i, n)` | 인덱스 i부터 n개 제거 | 제거된 배열 | O(n) |
| `arr.filter(fn)` | 조건 불만족 원소 제거 | 새 배열 | O(n) |

```js
const a = [1, 2, 3, 4, 5];
a.pop();                // 5 반환, a = [1,2,3,4]
a.shift();              // 1 반환, a = [2,3,4]
a.splice(1, 2);         // [3,4] 반환, a = [2]
const b = [1,2,3,4].filter(v => v % 2 === 0); // [2,4]
```

### 탐색

| 메서드 | 동작 | 반환값 | 복잡도 |
|--------|------|--------|--------|
| `arr.indexOf(v)` | 첫 번째 위치 | 인덱스 (없으면 -1) | O(n) |
| `arr.findIndex(fn)` | 조건 만족 첫 위치 | 인덱스 (없으면 -1) | O(n) |
| `arr.find(fn)` | 조건 만족 첫 원소 | 원소 (없으면 undefined) | O(n) |
| `arr.includes(v)` | 포함 여부 | boolean | O(n) |
| `arr.some(fn)` | 하나라도 조건 만족 | boolean | O(n) |
| `arr.every(fn)` | 모두 조건 만족 | boolean | O(n) |

```js
const a = [3, 1, 4, 1, 5];
a.indexOf(1);           // 1
a.findIndex(v => v > 3); // 2 (값 4의 위치)
a.find(v => v > 3);     // 4
a.includes(5);          // true
a.some(v => v > 4);     // true
a.every(v => v > 0);    // true
```

### 변환

| 메서드 | 동작 | 반환값 | 복잡도 |
|--------|------|--------|--------|
| `arr.map(fn)` | 각 원소 변환 | 새 배열 | O(n) |
| `arr.reduce(fn, init)` | 누적 계산 | 누적값 | O(n) |
| `arr.flat(depth)` | 중첩 배열 펼치기 | 새 배열 | O(n) |
| `arr.reverse()` | 뒤집기 (in-place) | 원본 배열 | O(n) |
| `arr.sort(fn)` | 정렬 (in-place) | 원본 배열 | O(n log n) |
| `arr.slice(s, e)` | 부분 배열 복사 | 새 배열 | O(e-s) |
| `arr.join(sep)` | 문자열로 합치기 | 문자열 | O(n) |

```js
const a = [1, 2, 3, 4, 5];
a.map(v => v * 2);          // [2,4,6,8,10]  원본 불변
a.reduce((acc, v) => acc + v, 0); // 15
[[1,2],[3,4]].flat();        // [1,2,3,4]
[...a].reverse();            // [5,4,3,2,1]  원본 보존하려면 복사 후 뒤집기
a.slice(1, 3);               // [2,3]  (인덱스 1 이상 3 미만)
a.join('-');                 // "1-2-3-4-5"
```

### 정렬

| 방법 | 설명 | 복잡도 |
|------|------|--------|
| `arr.sort()` | 문자열 기준 정렬 (기본값) — 숫자에 쓰면 버그 | O(n log n) |
| `arr.sort((a, b) => a - b)` | 숫자 오름차순 | O(n log n) |
| `arr.sort((a, b) => b - a)` | 숫자 내림차순 | O(n log n) |
| `arr.sort((a, b) => a.localeCompare(b))` | 문자열 오름차순 | O(n log n) |

```js
// ⚠️ 기본 sort()는 문자열 변환 후 정렬 → 숫자에 절대 쓰면 안 됨
[10, 9, 2, 21].sort();              // [10, 2, 21, 9]  ← 버그!
[10, 9, 2, 21].sort((a, b) => a - b); // [2, 9, 10, 21]  ← 정상

// 숫자 오름차순 / 내림차순
const nums = [3, 1, 4, 1, 5, 9, 2];
nums.sort((a, b) => a - b);  // [1, 1, 2, 3, 4, 5, 9]
nums.sort((a, b) => b - a);  // [9, 5, 4, 3, 2, 1, 1]

// 문자열 정렬
['banana', 'apple', 'cherry'].sort((a, b) => a.localeCompare(b));
// ['apple', 'banana', 'cherry']

// 객체 배열 — 특정 필드 기준 정렬
const people = [{name:'철수', age:30}, {name:'영희', age:25}];
people.sort((a, b) => a.age - b.age);  // age 오름차순

// 원본 보존하며 정렬
const sorted = [...nums].sort((a, b) => a - b);
```

> `sort()`는 **in-place** — 원본이 바뀐다. 원본을 유지해야 하면 `[...arr].sort(...)` 로 복사 후 정렬.

---

### 생성

| 방법 | 동작 | 복잡도 |
|------|------|--------|
| `Array.from({length: n}, fn)` | 길이 n인 배열 생성 + 초기화 | O(n) |
| `Array(n).fill(v)` | 길이 n, 값 v로 채움 | O(n) |
| `[...arr]` | 얕은 복사 | O(n) |
| `arr.slice()` | 얕은 복사 | O(n) |

```js
Array.from({length: 5}, (_, i) => i);     // [0,1,2,3,4]
Array.from({length: 3}, () => []);         // [[],[],[]]  2D 초기화
Array(5).fill(0);                          // [0,0,0,0,0]

// ⚠️ 2D 배열 초기화 주의
const bad  = Array(3).fill([]);            // 같은 배열 참조 공유 → 버그
const good = Array.from({length: 3}, () => []); // 독립적인 배열
```

---

## 삽입 위치별 시간복잡도

삽입 위치에 따라 이동해야 하는 원소 수가 달라진다.

```
배열: [A, B, C, D, E]  (n = 5)
인덱스: 0  1  2  3  4
```

### 끝에 삽입 — O(1)
```
[A, B, C, D, E, X]
                ↑ 이동 없음, 그냥 추가
```
- 이동할 원소: **0개**
- JS `push()` 사용

### 중간에 삽입 — O(n)
```
삽입 전: [A, B, C, D, E]
인덱스 2에 X 삽입
삽입 후: [A, B, X, C, D, E]
               ↑ C, D, E 를 한 칸씩 뒤로 이동
```
- 이동할 원소: **n - i개** (삽입 위치 뒤의 원소 전부)
- 인덱스 0에 삽입하면 n개 이동 → O(n)
- 인덱스 n/2에 삽입하면 n/2개 이동 → 여전히 O(n)

### 앞에 삽입 — O(n) (최악)
```
삽입 전: [A, B, C, D, E]
삽입 후: [X, A, B, C, D, E]
          ↑ 전체 원소 한 칸씩 뒤로 이동
```
- 이동할 원소: **n개** (전체)
- JS `unshift()` 사용, 성능상 가장 비쌈

### 삭제도 동일한 원리
```
인덱스 i 삭제 → 뒤 원소를 앞으로 당겨야 함
→ n - i - 1 개 이동
```
- 끝 삭제 `pop()` → O(1)
- 앞 삭제 `shift()` → O(n)
- 중간 삭제 `splice(i, 1)` → O(n)

### 코딩 테스트에서의 주의점
큐를 배열로 구현할 때 `shift()`를 쓰면 매 dequeue마다 O(n) 발생.  
원소가 많을수록 TLE 원인이 된다. → 포인터 방식 또는 직접 Queue 구현 사용.

```js
// 느린 방법 — shift()는 O(n)
const queue = [1, 2, 3];
queue.shift(); // 매번 전체 원소 이동

// 빠른 방법 — 포인터로 앞을 건너뜀 O(1)
let head = 0;
const queue2 = [1, 2, 3];
queue2[head++]; // head만 이동, 원소 이동 없음
```

---

## 메모리

### 정적 배열 vs 동적 배열

| | 정적 배열 (C, Java) | 동적 배열 (JS, Python) |
|-|---------------------|------------------------|
| 크기 | 선언 시 고정 | 자동 확장 |
| 메모리 | 선언 시 연속 공간 확보 | 필요 시 재할당 |
| 오버헤드 | 없음 | 확장 시 복사 비용 |

### 동적 배열의 크기 확장 원리

배열이 꽉 찼을 때 바로 1칸만 늘리면 push마다 O(n) 복사가 발생.  
그래서 실제 구현은 **현재 크기의 2배**로 확장한다(더블링).

```
크기 1 → 2 → 4 → 8 → 16 ...
복사 횟수: 1 + 2 + 4 + 8 + ... + n = 2n - 1
→ n번 push의 총 복사 비용 = O(n)
→ 1번 push의 분할상환 비용 = O(1)
```

이것이 `push()`가 **분할상환 O(1)**인 이유.

### JS 배열의 메모리 특성

```js
// V8이 배열을 최적화하는 경우 (C 배열처럼 처리)
const a = [1, 2, 3, 4];       // 정수만 → SMI Array (연속 메모리)

// V8이 최적화를 포기하는 경우 (해시맵으로 처리)
const b = [1, 'hello', null]; // 타입 혼합 → Generic Array
a[100] = 5;                   // 희소 배열 → Dictionary Mode
```

- 타입을 통일하면 V8이 배열을 연속 메모리로 최적화
- 희소 배열(중간에 빈 슬롯)이 생기면 해시맵으로 전환 → 성능 저하

### 메모리 사용량 추정

코딩 테스트에서 메모리 초과 여부를 판단할 때 참고.

| 타입 | 원소당 크기 |
|------|------------|
| 정수 (32bit) | 4 bytes |
| 정수 (64bit / JS number) | 8 bytes |
| 포인터/참조 | 8 bytes (64bit 환경) |

```
n = 1,000,000 (백만) 짜리 정수 배열
→ 8 bytes × 1,000,000 = 8 MB

2차원 배열 1000 × 1000
→ 8 bytes × 1,000,000 = 8 MB
```

보통 코딩 테스트 메모리 제한은 256MB.  
n이 10^7(천만) 이상이면 메모리 사용량을 의식해야 한다.

---

## 자주 쓰는 패턴

### 투 포인터 (Two Pointer)
정렬된 배열에서 두 인덱스를 양 끝에서 좁혀가며 탐색.

```js
let lo = 0, hi = arr.length - 1;
while (lo < hi) {
  const sum = arr[lo] + arr[hi];
  if (sum === target) return [lo, hi];
  else if (sum < target) lo++;
  else hi--;
}
```

### 슬라이딩 윈도우 (Sliding Window)
고정/가변 크기의 구간을 이동하며 최적값 탐색.

```js
// 크기 k인 윈도우의 최대 합
let sum = arr.slice(0, k).reduce((a, b) => a + b, 0);
let max = sum;
for (let i = k; i < arr.length; i++) {
  sum += arr[i] - arr[i - k];
  max = Math.max(max, sum);
}
```

### 누적 합 (Prefix Sum)
구간 합을 O(1)에 구하기 위한 전처리.

```js
const prefix = [0];
for (const v of arr) prefix.push(prefix.at(-1) + v);
// [l, r] 구간 합
const rangeSum = (l, r) => prefix[r + 1] - prefix[l];
```

### 카데인 알고리즘 (최대 부분 배열 합)

```js
let maxSum = arr[0], cur = arr[0];
for (let i = 1; i < arr.length; i++) {
  cur = Math.max(arr[i], cur + arr[i]);
  maxSum = Math.max(maxSum, cur);
}
```

---

## 자주 나오는 유형

| 유형 | 핵심 아이디어 |
|------|--------------|
| 중복 제거 | Set 또는 정렬 후 투 포인터 |
| 구간 합 | 누적 합(Prefix Sum) |
| 연속 부분 배열 | 슬라이딩 윈도우 or 카데인 |
| 정렬 + 탐색 | 정렬 후 이진 탐색 or 투 포인터 |
| 회전 배열 | 인덱스 `% n` 활용 |

---

## 면접 예상 질문

- Q: 배열과 연결 리스트의 차이?
  A: 배열은 인덱스 접근 O(1)이지만 삽입/삭제 O(n). 연결 리스트는 삽입/삭제 O(1)이지만 접근 O(n). 메모리 연속성 여부도 다름.

- Q: JS 배열은 실제로 배열인가?
  A: 아니다. JS 배열은 내부적으로 객체(해시맵)이며, 인덱스가 문자열 키로 저장됨. 단, V8 엔진은 정수 인덱스만 있는 배열을 C 배열처럼 최적화함.

- Q: `splice`와 `slice` 차이?
  A: `slice(s, e)`는 원본 불변, 복사본 반환. `splice(i, n)`은 원본 변경, 제거된 요소 반환.

- Q: 배열을 뒤집는 가장 효율적인 방법은?
  A: 투 포인터로 양 끝에서 swap하면 O(n) 시간, O(1) 공간. JS에서는 `arr.reverse()`가 in-place O(n). 새 배열이 필요하면 `[...arr].reverse()`.

- Q: 중복이 없는 배열에서 특정 값을 찾는 최선의 방법은?
  A: 정렬되어 있으면 이진 탐색 O(log n), 정렬 안 되어 있으면 선형 탐색 O(n). 여러 번 조회한다면 정렬(O(n log n)) 후 이진 탐색이 유리.

- Q: 2차원 배열을 1차원처럼 인덱싱하는 방법은?
  A: `matrix[i][j]` → 1차원 인덱스 `i * cols + j`. 반대로 1차원 인덱스 `k` → `row = Math.floor(k / cols)`, `col = k % cols`.

- Q: 배열 회전(rotate)을 O(1) 공간으로 구현하려면?
  A: 전체 뒤집기 → 앞 k개 뒤집기 → 나머지 뒤집기. 예) `[1,2,3,4,5]` k=2 오른쪽 회전: 전체 뒤집으면 `[5,4,3,2,1]` → 앞 2개 뒤집으면 `[4,5,3,2,1]` → 나머지 뒤집으면 `[4,5,1,2,3]`.

- Q: 정렬된 두 배열을 합치는 효율적인 방법은?
  A: 투 포인터로 각 배열의 앞에서부터 비교하며 작은 값을 결과 배열에 넣음. O(n+m) 시간, O(n+m) 공간. 병합 정렬의 merge 단계와 동일.

- Q: 배열에서 합이 0인 세 수를 찾는 방법은? (3Sum)
  A: 정렬 후 각 원소를 고정하고, 나머지 두 수는 투 포인터로 탐색. O(n²). 브루트포스 O(n³)보다 효율적.

- Q: `Array.from`과 `new Array`의 차이?
  A: `new Array(3)`은 길이 3인 빈 슬롯(empty slot) 배열 생성 → `map`이 동작 안 함. `Array.from({length: 3}, () => 0)`은 실제 값이 채워진 배열 생성 → `map` 정상 동작.

- Q: 희소 배열(sparse array)이란?
  A: 인덱스가 연속적이지 않은 배열. `const a = []; a[100] = 1;`처럼 중간에 비어있는 슬롯이 있는 배열. `length`는 101이지만 실제 원소는 1개. `forEach`는 빈 슬롯을 건너뜀.

---

## 정렬 알고리즘 개념 정리

### 비교 기반 정렬

#### 버블 정렬 (Bubble Sort) — O(n²)

인접한 두 원소를 비교해 큰 값을 오른쪽으로 밀어 올린다.  
매 pass마다 가장 큰 값이 끝으로 "버블처럼 떠오른다"는 데서 이름이 유래.

```
[5, 3, 1, 4, 2]
pass 1: [3,1,4,2,5]  ← 5가 끝으로
pass 2: [1,3,2,4,5]  ← 4가 끝에서 두 번째로
...
```

```js
for (let i = 0; i < n - 1; i++) {
  for (let j = 0; j < n - 1 - i; j++) {
    if (arr[j] > arr[j + 1]) [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
  }
}
```

| 항목 | 값 |
|------|-----|
| 시간 (최선) | O(n) — 이미 정렬된 경우 + 조기 종료 플래그 |
| 시간 (평균/최악) | O(n²) |
| 공간 | O(1) in-place |
| 안정성 | 안정 (stable) |

---

#### 선택 정렬 (Selection Sort) — O(n²)

매 pass마다 미정렬 구간에서 최솟값을 찾아 앞으로 가져온다.  
swap 횟수는 최대 n-1번으로 적지만, 비교 횟수는 항상 O(n²).

```
[5, 3, 1, 4, 2]
pass 1: 최솟값 1 → 인덱스 0과 swap → [1, 3, 5, 4, 2]
pass 2: 최솟값 2 → 인덱스 1과 swap → [1, 2, 5, 4, 3]
...
```

```js
for (let i = 0; i < n - 1; i++) {
  let minIdx = i;
  for (let j = i + 1; j < n; j++) {
    if (arr[j] < arr[minIdx]) minIdx = j;
  }
  [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
}
```

| 항목 | 값 |
|------|-----|
| 시간 (항상) | O(n²) — 최선/최악 동일 |
| 공간 | O(1) in-place |
| 안정성 | 불안정 (unstable) — swap이 순서를 깨뜨릴 수 있음 |

---

#### 삽입 정렬 (Insertion Sort) — O(n²) / O(n)

카드를 한 장씩 뽑아 정렬된 패에 올바른 위치에 꽂는 방식.  
**이미 거의 정렬된 데이터**에서는 O(n)에 가까워 실용적.

```
[5, 3, 1, 4, 2]
i=1: 3을 꺼내 → [3, 5, 1, 4, 2]
i=2: 1을 꺼내 → [1, 3, 5, 4, 2]
i=3: 4를 꺼내 → [1, 3, 4, 5, 2]
i=4: 2를 꺼내 → [1, 2, 3, 4, 5]
```

```js
for (let i = 1; i < n; i++) {
  const key = arr[i];
  let j = i - 1;
  while (j >= 0 && arr[j] > key) {
    arr[j + 1] = arr[j];
    j--;
  }
  arr[j + 1] = key;
}
```

| 항목 | 값 |
|------|-----|
| 시간 (최선) | O(n) — 이미 정렬된 경우 |
| 시간 (평균/최악) | O(n²) |
| 공간 | O(1) in-place |
| 안정성 | 안정 (stable) |

---

#### 병합 정렬 (Merge Sort) — O(n log n)

분할 정복. 배열을 절반씩 재귀적으로 나눈 뒤, 정렬하면서 합친다.  
**항상 O(n log n)** 이 보장되며, 안정 정렬. 단, O(n) 추가 공간 필요.

```
[5, 3, 1, 4, 2]
   분할: [5,3,1] / [4,2]
   분할: [5,3]/[1] / [4]/[2]
   분할: [5]/[3] / [1] / [4] / [2]
   병합: [3,5] / [1] / [2,4]
   병합: [1,3,5] / [2,4]
   병합: [1,2,3,4,5]
```

```js
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let l = 0, r = 0;
  while (l < left.length && r < right.length) {
    result.push(left[l] <= right[r] ? left[l++] : right[r++]);
  }
  return result.concat(left.slice(l), right.slice(r));
}
```

| 항목 | 값 |
|------|-----|
| 시간 (항상) | O(n log n) — 최선/최악 동일 |
| 공간 | O(n) — 병합 시 임시 배열 필요 |
| 안정성 | 안정 (stable) |

---

#### 퀵 정렬 (Quick Sort) — 평균 O(n log n)

pivot을 기준으로 작은 값은 왼쪽, 큰 값은 오른쪽에 배치 후 재귀.  
평균적으로 가장 빠르지만, **정렬된 배열에서 pivot을 잘못 고르면 O(n²)** 로 퇴화.

```
[5, 3, 1, 4, 2]  pivot = 3
→ [1, 2] + [3] + [4, 5]
→ [1, 2, 3, 4, 5]
```

```js
function quickSort(arr, lo = 0, hi = arr.length - 1) {
  if (lo >= hi) return;
  const p = partition(arr, lo, hi);
  quickSort(arr, lo, p - 1);
  quickSort(arr, p + 1, hi);
}

function partition(arr, lo, hi) {
  const pivot = arr[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (arr[j] <= pivot) [arr[i++], arr[j]] = [arr[j], arr[i]];
  }
  [arr[i], arr[hi]] = [arr[hi], arr[i]];
  return i;
}
```

| 항목 | 값 |
|------|-----|
| 시간 (평균) | O(n log n) |
| 시간 (최악) | O(n²) — 이미 정렬된 배열 + 나쁜 pivot |
| 공간 | O(log n) 재귀 스택 (in-place) |
| 안정성 | 불안정 (unstable) |

> 실무에서는 pivot을 랜덤하게 고르거나 median-of-3 방식으로 최악 케이스를 회피한다.

---

#### 힙 정렬 (Heap Sort) — O(n log n)

최대 힙을 구성한 뒤, 루트(최댓값)를 하나씩 꺼내 배열 뒤에 채운다.  
추가 공간 없이 O(n log n) 이 보장되지만, 캐시 비효율로 퀵 정렬보다 실제로는 느린 편.

```
[5, 3, 1, 4, 2]
   heapify → [5, 4, 1, 3, 2]  (최대 힙)
   extract: 5 → [4, 3, 1, 2, | 5]
   extract: 4 → [3, 2, 1, | 4, 5]
   ...
   → [1, 2, 3, 4, 5]
```

| 항목 | 값 |
|------|-----|
| 시간 (항상) | O(n log n) |
| 공간 | O(1) in-place |
| 안정성 | 불안정 (unstable) |

---

### 비교 없는 정렬 (Non-Comparison Sort)

#### 계수 정렬 (Counting Sort) — O(n + k)

값의 범위 k가 제한되어 있을 때 사용. 각 값의 등장 횟수를 세어 재구성.  
비교를 하지 않으므로 **O(n log n) 하한선을 깬다**.

```
값 범위: -10만 ~ 10만  → offset = 100000 을 더해 인덱스로 사용

arr = [3, -1, 2, 3, 1]
count[-1+offset]++ → count[1]++  ... 등
결과 배열에 count 순서대로 채움
```

```js
function countingSort(arr, min, max) {
  const count = new Array(max - min + 1).fill(0);
  for (const v of arr) count[v - min]++;
  const result = [];
  for (let i = 0; i < count.length; i++) {
    while (count[i]-- > 0) result.push(i + min);
  }
  return result;
}
```

| 항목 | 값 |
|------|-----|
| 시간 | O(n + k) |
| 공간 | O(k) — 범위만큼의 카운트 배열 |
| 안정성 | 안정 (구현 방식에 따라 다름) |
| 조건 | 값 범위 k가 작을 때만 유효 |

---

### 정렬 알고리즘 비교 요약

| 알고리즘 | 평균 | 최악 | 최선 | 공간 | 안정 | 특징 |
|----------|------|------|------|------|------|------|
| 버블 | O(n²) | O(n²) | O(n) | O(1) | ✅ | 구현 가장 단순. 조기 종료 플래그로 최선 O(n) 가능. 실전 사용 거의 없음 |
| 선택 | O(n²) | O(n²) | O(n²) | O(1) | ❌ | swap 횟수 최대 n-1번으로 최소. 최선/최악이 동일해 항상 느림 |
| 삽입 | O(n²) | O(n²) | O(n) | O(1) | ✅ | 거의 정렬된 데이터에 가장 빠름. 소규모 데이터나 온라인 정렬에 유리 |
| 병합 | O(n log n) | O(n log n) | O(n log n) | O(n) | ✅ | 성능이 항상 보장됨. 연결 리스트 정렬에 최적. 외부 정렬(디스크)에도 사용 |
| 퀵 | O(n log n) | O(n²) | O(n log n) | O(log n) | ❌ | 평균 실제 속도 가장 빠름 (캐시 효율). 정렬된 배열 + 고정 pivot이 최악 케이스 |
| 힙 | O(n log n) | O(n log n) | O(n log n) | O(1) | ❌ | 추가 메모리 없이 O(n log n) 항상 보장. 캐시 비효율로 퀵보다 실제로는 느림 |
| 계수 | O(n + k) | O(n + k) | O(n + k) | O(k) | ✅ | 비교 없음 → O(n log n) 하한 돌파. 값 범위 k가 작을 때만 유효 |

### 언제 어떤 정렬을 쓰나

| 상황 | 선택 |
|------|------|
| 범위가 고정된 정수 (`-10만 ~ 10만`) | 계수 정렬 |
| 안정 정렬이 필요 (`동점자 순위 유지`) | 병합 정렬 |
| 추가 메모리 없이 O(n log n) 보장 | 힙 정렬 |
| 일반적인 경우 (라이브러리 정렬) | 퀵 정렬 (TimSort) |
| 거의 정렬된 소규모 데이터 | 삽입 정렬 |
| n ≤ 1000 이고 구현이 우선 | 선택/삽입 정렬 |

---

## 문제 목록

| 번호 | 제목 | 출처 | 유형 | 난이도 | 풀이 |
|------|------|------|------|--------|------|
| 001 | | | | | |
