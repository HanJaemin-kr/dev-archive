/**
 * 문제: 두 수의 합 (Two Sum)
 * 출처: Programmers Level1
 * 유형: 배열 / 해시맵
 * 풀이날짜: 2026-04-28
 *
 * numbers 배열에서 두 수를 더해 target이 되는 인덱스 쌍을 반환
 *
 * 접근:
 * 1. 해시맵에 (값 → 인덱스) 저장
 * 2. 각 원소마다 target - 현재값이 맵에 있으면 정답
 *
 * 시간복잡도: O(N)
 * 공간복잡도: O(N)
 */

function solution(numbers, target) {
  const map = new Map();
  for (let i = 0; i < numbers.length; i++) {
    const complement = target - numbers[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(numbers[i], i);
  }
  return [];
}

// 테스트
const testCases = [
  { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
  { input: [[3, 2, 4], 6],      expected: [1, 2] },
  { input: [[3, 3], 6],         expected: [0, 1] },
];

testCases.forEach(({ input, expected }, i) => {
  const result = solution(...input);
  const pass = JSON.stringify(result) === JSON.stringify(expected);
  console.log(`TC ${i + 1}: ${pass ? "PASS" : `FAIL (got ${JSON.stringify(result)}, expected ${JSON.stringify(expected)})`}`);
});
