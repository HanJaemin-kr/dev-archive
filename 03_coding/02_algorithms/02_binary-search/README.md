# 02. Binary Search (이진 탐색)

## 1. 이진 탐색이란?

**정렬된 배열에서 매번 절반씩 후보를 줄여가며 찾는 알고리즘.**
한 번 비교할 때마다 탐색 공간이 절반으로 줄어 O(log n) 에 답을 찾는다.

### 도식 — 기본 동작

```
   arr = [1, 3, 5, 7, 9, 11, 13, 15],  target = 11

   lo=0                                      hi=7
    ▼                                         ▼
   [1, 3, 5, 7, 9, 11, 13, 15]      mid=3 → arr[3]=7  < 11  → lo = 4

                  lo=4              hi=7
                   ▼                 ▼
       [-, -, -, -, 9, 11, 13, 15]   mid=5 → arr[5]=11 == target ✅

   답: 인덱스 5
```

> 전제: **정렬되어 있어야 한다**. 정렬되지 않은 데이터에는 적용 불가.

## 2. 시간복잡도

| 연산 | 복잡도 | 비고 |
|------|--------|------|
| 표준 이진 탐색 | O(log n) | 한 번 비교마다 후보 절반 |
| `lowerBound` / `upperBound` | O(log n) | 같은 값 여러 개 처리 |
| 파라메트릭 서치 | O(log W × f(n)) | W = 답의 범위, f = 판정 함수 |
| 공간 | O(1) | 반복문 / O(log n) 재귀 |

> log₂(10⁹) ≈ 30. 즉 10억 짜리 배열도 30번이면 끝.

## 3. JS 구현 템플릿

### 표준 이진 탐색

```js
function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
```

### lowerBound / upperBound

```js
// target 이상이 처음 등장하는 인덱스
function lowerBound(arr, target) {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// target 초과가 처음 등장하는 인덱스
function upperBound(arr, target) {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] <= target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// target 의 등장 횟수 = upperBound - lowerBound
```

### 파라메트릭 서치 골격

```js
function parametric(lo, hi, canDo) {
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (canDo(mid)) hi = mid;       // 가능 → 더 작게
    else            lo = mid + 1;   // 불가 → 더 크게
  }
  return lo;
}
```

> 핵심: 결정 함수 `canDo(x)` 가 **단조적**(어떤 x 이상에서 true 또는 이하에서 true)이어야 함.

## 4. 대표 패턴

### 패턴 A — 값 찾기

```
   정렬 배열에서 target 위치.
   정확히 표준 이진 탐색.
```

용도: 정렬된 배열에서 존재 여부, 인덱스

### 패턴 B — lowerBound / upperBound

```
   같은 값이 여러 번 등장하는 정렬 배열에서:

   arr = [1, 2, 2, 2, 5, 7]

   lowerBound(arr, 2) = 1   ← 처음 등장
   upperBound(arr, 2) = 4   ← 마지막 다음
   count(arr, 2)     = 3   ← 4 - 1

   "범위 [a, b] 안의 원소 수" = upperBound(b) - lowerBound(a)
```

용도: 카운트, 범위 쿼리, 정렬 + 전처리 후 다중 쿼리

### 패턴 C — 파라메트릭 서치

```
   "최댓값을 최소화" / "최솟값을 최대화"

   "n명이 T시간 안에 입국심사를 받을 수 있는가?"
       T를 이진 탐색.
       canDo(T) = Σ floor(T / times[i]) >= n

       T가 크면 canDo=true → 더 작게 시도
       T가 작으면 canDo=false → 더 크게 시도

       canDo 의 결과가 F F F F T T T T 처럼 단조적이어야 함.
                              ↑
                              여기가 답
```

```js
// 입국심사 예시
function solution(n, times) {
  let lo = 1, hi = Math.min(...times) * n;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    let processed = 0;
    for (const t of times) processed += Math.floor(mid / t);
    if (processed >= n) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
```

용도: 답이 정수 범위, 판정 함수가 빠르게 가능 여부 판단 가능

### 패턴 D — "n명/n개 가능?" 결정 함수

```
   "징검다리를 건널 수 있는 최대 인원?"

   n명이 건넌다 = 각 돌이 n번 사용됨.
   stones[i] - n < 0 이면 그 돌은 못 밟음.
   k개 연속 못 밟는 돌이 있으면 건널 수 없음.

   canDo(n):
     skip = 0
     for v in stones:
       if v - n < 0: skip++; if skip >= k: return false
       else: skip = 0
     return true
```

용도: 자원 분배, 통과 여부, 최대/최소 답 탐색

## 5. 자주 하는 실수

- **`mid = (lo + hi) / 2` 정수화 누락** → JS는 `(lo + hi) / 2` 가 실수. `>> 1` 또는 `Math.floor` 필수.
- **무한 루프** — `lo = mid` 와 `hi = mid` 를 둘 다 쓰면 멈추지 않음.
  → 일반적으로 한쪽은 `mid + 1` 또는 `mid - 1` 로 강제 이동.
- **경계 (`hi = n` vs `hi = n - 1`)** → 표준 탐색은 `n - 1`, lowerBound 류는 `n`.
- **결정 함수 단조성 검증 누락** → `canDo` 가 단조적이지 않으면 이진 탐색 불가.
- **정렬 안 된 배열에 적용** → 정렬되어 있다고 가정한다는 사실을 까먹음.
- **`<` 와 `<=` 헷갈림** — lowerBound 와 upperBound 의 차이는 단 한 글자.

## 6. 정리된 문제

| # | 문제 | 패턴 | 비고 |
|---|------|------|------|
| 001 | [입국심사](./question/001_입국심사.md) | C. 파라메트릭 | "T시간에 n명 가능?" |
| 002 | [순위 검색](./question/002_순위검색.md) | B. lowerBound | 16조합 전처리 |
| 003 | [징검다리 건너기](./question/003_징검다리건너기.md) | C/D. 파라메트릭 | "n명 건널 수 있나?" |

## 7. 한 줄 요약

> **"정렬되어 있고 단조성이 있다면, 답을 이진 탐색하라."**
>
> 값을 찾는 게 아니라 **"답이 가능한가?"** 를 묻는 순간 파라메트릭 서치.
> 10⁹ 짜리 답도 30번이면 좁힐 수 있다.
