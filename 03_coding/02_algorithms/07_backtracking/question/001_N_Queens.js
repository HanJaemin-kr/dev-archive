function solution(n) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: 'N=1', input: 1, expected: 1 },
  { desc: 'N=4', input: 4, expected: 2 },
  { desc: 'N=5', input: 5, expected: 10 },
  { desc: 'N=8', input: 8, expected: 92 },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution(input);
  const ms = (performance.now() - start).toFixed(2);
  const ok = result === expected;
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${result}`); console.log(`     기대: ${expected}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
