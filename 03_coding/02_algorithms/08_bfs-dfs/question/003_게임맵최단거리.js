function solution(maps) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '도달 가능', input: [[[1,0,1,1,1],[1,0,1,0,1],[1,1,1,0,1],[1,1,0,1,1],[0,0,0,0,1]]], expected: 11 },
  { desc: '도달 불가', input: [[[1,0,1,1,1],[1,0,1,0,1],[1,1,1,0,0],[1,1,0,0,0],[0,0,0,0,0]]], expected: -1 },
  { desc: '1×1', input: [[[1]]], expected: 1 },
  { desc: '직선', input: [[[1,1,1,1,1]]], expected: 5 },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution(input[0].map(r => [...r]));
  const ms = (performance.now() - start).toFixed(2);
  const ok = result === expected;
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${result}`); console.log(`     기대: ${expected}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
