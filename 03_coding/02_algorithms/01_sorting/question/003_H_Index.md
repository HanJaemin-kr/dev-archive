---
title: 003. H-Index
domain: coding
category: algorithms
tags: [coding, algorithms, sorting, question]
level: intermediate
status: published
created: 2026-05-17
updated: 2026-05-17
velog: false
related: []
---

# 003. H-Index

- **유형**: 정렬
- **출처**: Programmers Lv.2
- **날짜**: 2026-05-17
- **소요 시간**: 분
- **결과**: 

---

## 문제 설명

논문 인용 횟수 배열 `citations`가 주어졌을 때, H-Index를 반환하라.  
H-Index: h편 이상 인용된 논문이 h편 이상이고, 나머지는 h번 이하 인용된 최대 h값.

## 제한사항

| 항목 | 값 |
|------|-----|
| 논문 수 | 1 이상 1000 이하 |
| 인용 횟수 | 0 이상 10000 이하 |
| 제한 시간 | 1초 |

## 입출력 예

| citations | result |
|-----------|--------|
| [3,0,6,1,5] | 3 |

---

## 알고리즘 선택 분석

내림차순 정렬 후 인덱스와 비교.

```
정렬: [6, 5, 3, 1, 0]
인덱스:  0  1  2  3  4

i=0: citations[0]=6 >= 1 → h=1
i=1: citations[1]=5 >= 2 → h=2
i=2: citations[2]=3 >= 3 → h=3  ← 3편 이상이 3번 이상 인용
i=3: citations[3]=1 < 4  → 중단
```

`citations[i] >= i+1` 조건이 깨지는 순간 이전 i가 H-Index.

---

## 내 풀이

```js

```

## 복잡도

- 시간: O()
- 공간: O()

## 막혔던 점 / 오답 노트
