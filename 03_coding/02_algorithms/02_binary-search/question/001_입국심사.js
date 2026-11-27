function solution(n, times) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본', input: [6, [7,10]], expected: 28 },
  { desc: '심사관 1명', input: [5, [10]], expected: 50 },
  { desc: '모두 같은 시간', input: [4, [5,5]], expected: 10 },
  { desc: 'n=1', input: [1, [7,10]], expected: 7 },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution(...input);
  const ms = (performance.now() - start).toFixed(2);
  const ok = result === expected;
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${result}`); console.log(`     기대: ${expected}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
