---
title: 001. N-Queens
domain: coding
category: algorithms
tags: [coding, algorithms, backtracking, question]
level: intermediate
status: published
created: 2026-05-17
updated: 2026-05-17
velog: false
related: []
---

# 001. N-Queens

- **유형**: 백트래킹
- **날짜**: 2026-05-17
- **소요 시간**: 분
- **결과**: 

---

## 문제 설명

N×N 체스판에 N개의 퀸을 서로 공격하지 않도록 배치하는 경우의 수를 반환하라.  
퀸은 같은 행, 열, 대각선에 있으면 서로 공격.

## 제한사항

| 항목 | 값 |
|------|-----|
| N | 1 이상 15 이하 |
| 제한 시간 | 1초 |

## 입출력 예

| N | result |
|---|--------|
| 1 | 1 |
| 4 | 2 |
| 8 | 92 |

---

## 알고리즘 선택 분석

행마다 퀸을 하나씩 배치. 각 열에 퀸을 놓고 유효하면 다음 행으로.  
유효하지 않으면 백트래킹.

유효성 검사:
- 같은 열: `col[j] === true`
- 대각선: `Math.abs(row - prevRow) === Math.abs(col - prevCol)`

Set으로 열, 좌대각선(`row-col`), 우대각선(`row+col`) 추적하면 O(1) 검사.

---

## 내 풀이

```js

```

## 복잡도

- 시간: O(N!)
- 공간: O(N)

## 막혔던 점 / 오답 노트
