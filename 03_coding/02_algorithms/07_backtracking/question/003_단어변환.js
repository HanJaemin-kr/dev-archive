function solution(begin, target, words) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본', input: ['hit','cog',['hot','dot','dog','lot','log','cog']], expected: 4 },
  { desc: '불가능 (target 없음)', input: ['hit','cog',['hot','dot','dog','lot','log']], expected: 0 },
  { desc: '직접 변환', input: ['abc','aec',['aec','bec']], expected: 1 },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution(input[0], input[1], [...input[2]]);
  const ms = (performance.now() - start).toFixed(2);
  const ok = result === expected;
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${result}`); console.log(`     기대: ${expected}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
