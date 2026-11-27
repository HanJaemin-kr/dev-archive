---
title: 시간복잡도 치트시트
domain: coding
category: notes
tags: [coding, notes]
level: intermediate
status: published
created: 2026-05-16
updated: 2026-05-16
velog: true
related: []
---

# 시간복잡도 치트시트

## 입력 크기별 허용 복잡도 (제한 시간 1~2초 기준)

| N 크기    | 허용 복잡도        | 대표 알고리즘                    |
|-----------|-------------------|--------------------------------|
| N ≤ 10    | O(N!) / O(2^N)    | 완전탐색, 백트래킹               |
| N ≤ 20    | O(2^N)            | 비트마스킹, 분할정복 DP          |
| N ≤ 500   | O(N^3)            | 플로이드-워셜                   |
| N ≤ 5,000 | O(N^2)            | 버블정렬, 삽입정렬, 2중 반복문   |
| N ≤ 100K  | O(N log N)        | 정렬, 이분탐색, 세그먼트 트리    |
| N ≤ 1M    | O(N)              | 해시맵, 투포인터, 슬라이딩 윈도우|
| N ≤ 10M   | O(N) (tight)      | 선형 알고리즘만 가능             |

## 자료구조별 연산 복잡도

| 자료구조       | 접근    | 탐색    | 삽입    | 삭제    |
|----------------|---------|---------|---------|---------|
| 배열           | O(1)    | O(N)    | O(N)    | O(N)    |
| 연결 리스트    | O(N)    | O(N)    | O(1)    | O(1)    |
| 해시맵         | -       | O(1)    | O(1)    | O(1)    |
| 이진탐색트리   | O(logN) | O(logN) | O(logN) | O(logN) |
| 힙             | -       | -       | O(logN) | O(logN) |

## JS 내장 메서드 복잡도

| 메서드                   | 복잡도  |
|--------------------------|---------|
| Array.sort()             | O(N logN) |
| Array.includes/indexOf   | O(N)    |
| Map/Set has/get/set      | O(1)    |
| String.split/join        | O(N)    |
