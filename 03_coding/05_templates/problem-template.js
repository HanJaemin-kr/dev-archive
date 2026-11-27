/**
 * 문제: [문제 이름]
 * 출처: [Programmers / LeetCode / BOJ] - [문제 번호/링크]
 * 난이도: [Easy / Medium / Hard / Level1~3]
 * 유형: [DP / BFS / 이분탐색 / ...]
 * 풀이시간: [분]
 * 풀이날짜: [YYYY-MM-DD]
 *
 * [문제 요약]
 *
 * 접근:
 * 1.
 * 2.
 *
 * 시간복잡도: O()
 * 공간복잡도: O()
 */

function solution(input) {
  // 풀이
}

// 테스트
const testCases = [
  { input: [], expected: null },
];

testCases.forEach(({ input, expected }, i) => {
  const result = solution(input);
  const pass = JSON.stringify(result) === JSON.stringify(expected);
  console.log(`TC ${i + 1}: ${pass ? "PASS" : `FAIL (got ${result}, expected ${expected})`}`);
});
