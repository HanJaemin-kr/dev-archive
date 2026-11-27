---
title: 007. H-Index
domain: coding
category: data-structures
tags: [coding, data-structures, array, question]
level: intermediate
status: published
created: 2026-05-18
updated: 2026-05-18
velog: false
related: []
---

# 007. H-Index

- **유형**: 정렬 / 완전탐색
- **출처**: 프로그래머스 Lv.2
- **날짜**: 2026-05-18
- **소요 시간**: 분
- **결과**: ✅

---

## 문제 설명

어떤 과학자가 발표한 논문 n편 중, h번 이상 인용된 논문이 h편 이상일 때 h의 최댓값을 H-Index라 한다.  
논문별 인용 횟수 배열 `citations`가 주어질 때, H-Index를 반환하라.

## 제한사항

| 항목 | 값 |
|------|-----|
| citations 길이 | 1 이상 1,000 이하 |
| citations 원소 | 0 이상 10,000 이하 |

---

## 알고리즘 선택 분석

H-Index는 최대 `citations.length`를 넘을 수 없다 (논문 편수 이상은 불가능).  
따라서 `hIndex`를 0부터 n까지 순회하면서 조건을 만족하는 최댓값을 갱신하는 완전탐색으로 해결 가능하다.

```text
citations = [3, 0, 6, 1, 5]
hIndex=3 → 3회 이상 인용된 논문: [3, 6, 5] → 3편 ≥ 3 → 만족
hIndex=4 → 4회 이상 인용된 논문: [6, 5] → 2편 < 4 → 불만족
→ 정답: 3
```

---

## 내 풀이

```js
function solution(citations) {
  let answer = 0;
  for (let hIndex = 0; hIndex <= citations.length; hIndex++) {
    const importCount = citations.filter(v => v >= hIndex).length;
    if (importCount >= hIndex) {
      answer = hIndex;
    }
  }
  return answer;
}
```

## 복잡도

- 시간: O(n²) — n번 순회 × 매번 filter O(n)
- 공간: O(1)

---

## 핵심 포인트

### H-Index 조건

```text
h번 이상 인용된 논문이 h편 이상 → 가능한 최대 h
```

### 탐색 범위

H-Index의 최댓값은 논문 편수(`citations.length`)이므로 `0 ~ n`만 탐색하면 충분하다.

### 조건 누적 갱신

```js
if (importCount >= hIndex) answer = hIndex;
```

조건을 만족할 때마다 `answer`를 갱신하기 때문에 루프가 끝나면 자동으로 최댓값이 남는다.

---

## 막혔던 점 / 오답 노트

### hIndex 범위를 n+1까지 열어야 하는 이유

`citations.length`도 유효한 후보이므로 `hIndex <= citations.length`로 설정.  
예: `[10, 10, 10]` → hIndex=3 만족 → 정답 3.

### 정렬 기반 풀이와 비교

내림차순 정렬 후 `citations[i] >= i+1`인 마지막 i+1을 찾는 방법도 있다 (O(n log n)).  
완전탐색 풀이는 O(n²)이지만 n ≤ 1,000이므로 충분히 통과 가능하다.
