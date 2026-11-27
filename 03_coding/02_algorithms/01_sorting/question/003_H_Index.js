function solution(citations) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본', input: [[3,0,6,1,5]], expected: 3 },
  { desc: '모두 0', input: [[0,0,0]], expected: 0 },
  { desc: '단일', input: [[10]], expected: 1 },
  { desc: '모두 높은 인용', input: [[10,10,10,10]], expected: 4 },
  { desc: '1편만 많이 인용', input: [[100,0,0,0]], expected: 1 },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution([...input[0]]);
  const ms = (performance.now() - start).toFixed(2);
  const ok = result === expected;
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${result}`); console.log(`     기대: ${expected}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
