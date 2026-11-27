# 09. Divide and Conquer (분할 정복)

## 1. 분할 정복이란?

**문제를 더 작은 부분 문제로 나누고(Divide), 각각 재귀로 풀고(Conquer), 결과를 합친다(Combine).**
"같은 형태의 작은 문제로 줄이는" 게 재귀의 일반 정의라면, 분할 정복은 그 중 **균등 분할**에 초점.

### 도식 — 재귀 트리

```
                   T(n)
                 /      \
              T(n/2)   T(n/2)            ← 분할
              /  \     /  \
           T(n/4)... ... ...             ← 계속 분할
              ...

   합치는 비용 (combine) 이 각 레벨에 분포됨:
       레벨 0:  f(n)
       레벨 1:  2 · f(n/2)
       레벨 2:  4 · f(n/4)
       ...

   총 비용 = 모든 레벨 합산.
```

### 분할 정복의 3단계

```
   1. Divide   : 문제를 부분 문제로 나눔.
   2. Conquer  : 각 부분 문제를 재귀로 풀음.
   3. Combine  : 결과를 합쳐 최종 답.
```

## 2. 시간복잡도 — 마스터 정리

```
   T(n) = a · T(n/b) + f(n)
        a: 부분 문제 개수
        b: 크기 줄어드는 비율
        f(n): 합치는 비용
```

| 점화식 | 결과 | 예 |
|--------|------|-----|
| T(n) = 2T(n/2) + O(n) | O(n log n) | 병합 정렬 |
| T(n) = 2T(n/2) + O(1) | O(n) | 트리 순회 |
| T(n) = T(n/2) + O(1) | O(log n) | 이진 탐색, 빠른 거듭제곱 |
| T(n) = T(n/2) + O(n) | O(n) | 선형 탐색의 분할 정복 변형 |
| T(n) = 2T(n/2) + O(n log n) | O(n log² n) | 최근접 점쌍 |

## 3. JS 구현 템플릿

```js
function divideAndConquer(arr, lo, hi) {
  // 종료 조건
  if (lo >= hi) return baseAnswer(arr, lo);

  // Divide
  const mid = (lo + hi) >> 1;

  // Conquer
  const leftAns  = divideAndConquer(arr, lo, mid);
  const rightAns = divideAndConquer(arr, mid + 1, hi);

  // Combine
  return combine(leftAns, rightAns, arr, lo, mid, hi);
}
```

### 병합 정렬

```js
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = arr.length >> 1;
  const left  = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const out = [];
  let l = 0, r = 0;
  while (l < left.length && r < right.length) {
    out.push(left[l] <= right[r] ? left[l++] : right[r++]);
  }
  return out.concat(left.slice(l), right.slice(r));
}
```

## 4. 대표 패턴

### 패턴 A — 정렬 (Merge Sort / Quick Sort)

```
   병합 정렬: 절반 분할 → 재귀 정렬 → 병합

      [5,3,1,4,2]
       ├── [5,3,1]                 [4,2]
       │     ├── [5,3]   [1]        [4] [2]
       │     │    [5] [3]
       │     │     ↓ merge
       │     [3,5,1]  → [1,3,5]
       │
       └── [4,2] → [2,4]
                ↓ final merge
         [1,2,3,4,5]

   T(n) = 2T(n/2) + O(n) = O(n log n).  항상 보장.
```

용도: 안정 정렬, 외부 정렬

### 패턴 B — 검색 (이진 탐색)

```
   T(n) = T(n/2) + O(1) = O(log n)

   매번 절반을 버린다. 자세한 내용은 02_binary-search/.
```

용도: 정렬된 배열에서 값 / lowerBound / 파라메트릭

### 패턴 C — 카운팅 (병합 단계에서 카운트)

```
   "역순 쌍의 개수" — arr[i] > arr[j] (i < j) 인 쌍 수

   병합 정렬을 활용:
     왼쪽 배열과 오른쪽 배열을 merge 할 때,
     오른쪽의 j번째 원소가 왼쪽의 i번째보다 작으면
       → 왼쪽 [i..mid] 모두가 역순 쌍.
       → 카운트 += (mid - i + 1)

   브루트포스 O(n²) → 분할 정복 O(n log n)
```

```js
function mergeAndCount(arr, lo, mid, hi) {
  const out = [];
  let l = lo, r = mid + 1, count = 0;
  while (l <= mid && r <= hi) {
    if (arr[l] <= arr[r]) out.push(arr[l++]);
    else { out.push(arr[r++]); count += mid - l + 1; }
  }
  while (l <= mid) out.push(arr[l++]);
  while (r <= hi)  out.push(arr[r++]);
  for (let i = 0; i < out.length; i++) arr[lo + i] = out[i];
  return count;
}
```

용도: 역순 쌍, 합 분포, 정렬 거리

### 패턴 D — 기하 (최근접 점쌍)

```
   2D 점들 중 가장 가까운 두 점의 거리?

   1. x 기준 정렬
   2. 중앙 기준 좌/우 분할
   3. 각 절반에서 최근접 거리 d 구함
   4. 경계 ±d 이내 점들 (스트립) 에서 더 가까운 쌍 확인
      → y 정렬 후 최대 7개씩만 비교하면 충분 → O(n)

   T(n) = 2T(n/2) + O(n)  =  O(n log n)
```

용도: 계산기하, 클러스터링

### 패턴 E — 거듭제곱 (O(log n))

```
   pow(x, n):
     n=0   → 1
     n<0   → 1 / pow(x, -n)
     짝수  → pow(x*x, n/2)
     홀수  → x * pow(x*x, (n-1)/2)

   T(n) = T(n/2) + O(1) = O(log n)
```

행렬 거듭제곱으로 확장하면 O(log n) 에 피보나치 등 선형 점화식 계산 가능.

용도: 큰 지수 모듈러 연산, 선형 점화식 가속

## 5. 자주 하는 실수

- **합치는 단계 비용 잘못 계산** → 마스터 정리 적용이 어긋남.
- **재귀 깊이가 stack 한계** — V ≥ 10⁵ 이면 반복 또는 명시적 스택.
- **중간 배열 메모리 폭발** — 병합 정렬은 O(n) 추가. 큰 입력이면 in-place 변형 고려.
- **종료 조건 (`lo >= hi`)** — `lo > hi` 와 `lo >= hi` 차이가 무한 재귀의 갈림길.
- **`mid = (lo + hi) / 2`** — JS는 실수. `>> 1` 또는 `Math.floor`.
- **카운팅 패턴에서 `mid - l + 1` 누락** → 한 쌍씩만 세고 끝남.

## 6. 정리된 문제

| # | 문제 | 패턴 | 비고 |
|---|------|------|------|
| 001 | [병합 정렬 구현](./question/001_병합정렬구현.md) | A. 정렬 | 안정 정렬 |
| 002 | [역순 쌍 개수](./question/002_역순쌍개수.md) | C. 병합 + 카운트 | `mid - l + 1` |
| 003 | [최근접 점쌍](./question/003_최근접점쌍.md) | D. 기하 | 스트립 최대 7개 |

## 7. 한 줄 요약

> **"나눠서 풀고 합쳐라. 재귀 + 합치는 비용 = 전체 비용."**
>
> 마스터 정리 한 줄로 복잡도 결정. 정렬·검색·카운팅·기하·거듭제곱 — 다 같은 골격.
> "균등 분할 + Combine" 이라는 한 가지 패턴이 알고리즘의 절반을 차지한다.
