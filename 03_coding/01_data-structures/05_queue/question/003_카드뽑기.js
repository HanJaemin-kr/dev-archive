function solution(n) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: 'N=1', input: 1, expected: 1 },
  { desc: 'N=6', input: 6, expected: 4 },
  { desc: 'N=7', input: 7, expected: 6 },
  { desc: 'N=2', input: 2, expected: 2 },
  { desc: 'N=4', input: 4, expected: 4 },
  { desc: 'N=10', input: 10, expected: 4 },
  { desc: 'N=100000 (성능)', input: 100000, expected: null },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution(input);
  const ms = (performance.now() - start).toFixed(2);
  if (expected === null) {
    console.log(`[⏱️ ] ${desc} — ${ms}ms (result: ${result})`);
    pass++; return;
  }
  const ok = result === expected;
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${result}`); console.log(`     기대: ${expected}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
