function solution(n) {
  // 여기에 풀이 작성 — [[from, to], ...] 반환

}

const tests = [
  { desc: 'n=1', input: 1, expected: [[1,3]] },
  { desc: 'n=2', input: 2, expected: [[1,2],[1,3],[2,3]] },
  { desc: 'n=3 이동 횟수', input: 3, check: r => r.length === 7 },
  { desc: 'n=10 이동 횟수', input: 10, check: r => r.length === 1023 },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected, check }) => {
  const start = performance.now();
  const result = solution(input);
  const ms = (performance.now() - start).toFixed(2);
  const ok = check ? check(result) : JSON.stringify(result) === JSON.stringify(expected);
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력 길이: ${result?.length}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
