/**
 * 문제: 프로세스
 * 출처: Programmers Level2
 * 유형: 큐 / 시뮬레이션
 * 풀이날짜: 2026-05-20
 *
 * 실행 대기 큐에서 프로세스를 꺼낼 때, 뒤에 더 높은 우선순위가 있으면 맨 뒤로 보낸다.
 * 주어진 location의 프로세스가 몇 번째로 실행되는지 반환.
 *
 * 핵심 패턴:
 * - priorities.map((priority, index) => ({ index, priority })) 로 원래 위치 보존
 * - shift() 로 꺼내고 some() 으로 더 큰 우선순위 검사
 * - 있으면 push() 로 뒤로, 없으면 실행 카운트 증가
 *
 * 주의: forEach 대신 while + shift/push 로 큐 시뮬레이션
 *
 * 시간복잡도: O(N²) — 매 꺼냄마다 some() O(N), 최대 N번 반복
 * 공간복잡도: O(N)
 */

function solution(priorities, location) {
  const queue = priorities.map((priority, index) => ({ index, priority }));
  let answer = 0;

  while (queue.length) {
    const current = queue.shift();

    if (queue.some(item => item.priority > current.priority)) {
      queue.push(current);
    } else {
      answer++;
      if (current.index === location) return answer;
    }
  }
}

// 테스트
const testCases = [
  { input: [[2, 1, 3, 2], 2],      expected: 1 },
  { input: [[1, 1, 9, 1, 1, 1], 0], expected: 5 },
  { input: [[1], 0],               expected: 1 },
  { input: [[2, 2, 2, 2], 3],      expected: 4 },
  { input: [[1, 2, 3, 9, 1], 3],   expected: 1 },
];

testCases.forEach(({ input, expected }, i) => {
  const result = solution([...input[0]], input[1]);
  const pass = result === expected;
  console.log(`TC ${i + 1}: ${pass ? "PASS" : `FAIL (got ${result}, expected ${expected})`}`);
});
