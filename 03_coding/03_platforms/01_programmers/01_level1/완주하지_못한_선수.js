/**
 * 문제: 완주하지 못한 선수
 * 출처: Programmers Level1 - Hash
 * 유형: 해시맵
 * 풀이날짜: 2026-04-28
 *
 * 마라톤 참가자 중 완주하지 못한 한 명의 이름 반환
 * (동명이인 있을 수 있음)
 *
 * 접근:
 * 1. 참가자 이름을 Map으로 카운팅
 * 2. 완주자 이름으로 카운트 차감
 * 3. 카운트가 남은 이름이 정답
 *
 * 시간복잡도: O(N)
 * 공간복잡도: O(N)
 */

function solution(participant, completion) {
  const count = new Map();
  for (const name of participant) {
    count.set(name, (count.get(name) ?? 0) + 1);
  }
  for (const name of completion) {
    count.set(name, count.get(name) - 1);
  }
  for (const [name, cnt] of count) {
    if (cnt > 0) return name;
  }
}

// 테스트
const testCases = [
  { participant: ["leo", "kiki", "eden"],              completion: ["eden", "kiki"],       expected: "leo" },
  { participant: ["marina", "josipa", "nikola", "vinko", "filipa"], completion: ["josipa", "filipa", "marina", "nikola"], expected: "vinko" },
  { participant: ["mislav", "stanko", "mislav", "ana"], completion: ["stanko", "ana", "mislav"], expected: "mislav" },
];

testCases.forEach(({ participant, completion, expected }, i) => {
  const result = solution(participant, completion);
  const pass = result === expected;
  console.log(`TC ${i + 1}: ${pass ? "PASS" : `FAIL (got "${result}", expected "${expected}")`}`);
});
