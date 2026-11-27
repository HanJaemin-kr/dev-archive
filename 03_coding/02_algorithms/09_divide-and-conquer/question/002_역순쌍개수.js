function solution(arr) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본', input: [2,4,1,3,5], expected: 3 },
  { desc: '정렬된 배열 (역순 없음)', input: [1,2,3,4,5], expected: 0 },
  { desc: '완전 역순', input: [5,4,3,2,1], expected: 10 },
  { desc: '단일 원소', input: [1], expected: 0 },
  { desc: '두 원소 역순', input: [2,1], expected: 1 },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution([...input]);
  const ms = (performance.now() - start).toFixed(2);
  const ok = result === expected;
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${result}`); console.log(`     기대: ${expected}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
