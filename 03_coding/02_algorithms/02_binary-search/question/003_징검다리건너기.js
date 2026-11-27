function solution(stones, k) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본', input: [[2,4,5,3,2,1,4,2,5,1], 3], expected: 3 },
  { desc: 'k=1', input: [[1,1,1,1], 1], expected: 1 },
  { desc: '모두 동일', input: [[3,3,3], 2], expected: 3 },
  { desc: '단일 돌', input: [[5], 1], expected: 5 },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution([...input[0]], input[1]);
  const ms = (performance.now() - start).toFixed(2);
  const ok = result === expected;
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${result}`); console.log(`     기대: ${expected}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
