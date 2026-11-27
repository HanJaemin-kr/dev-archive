function solution(x, n) {
  // 여기에 풀이 작성

}

const EPS = 1e-5;
const tests = [
  { desc: '기본', input: [2.0, 10], expected: 1024.0 },
  { desc: '소수 지수', input: [2.1, 3], expected: 9.261000000000001 },
  { desc: '음수 지수', input: [2.0, -2], expected: 0.25 },
  { desc: 'n=0', input: [5.0, 0], expected: 1.0 },
  { desc: 'n=1', input: [3.0, 1], expected: 3.0 },
  { desc: '큰 지수', input: [1.0, 2147483647], expected: 1.0 },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution(...input);
  const ms = (performance.now() - start).toFixed(2);
  const ok = Math.abs(result - expected) < EPS;
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${result}`); console.log(`     기대: ${expected}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
