function solution(people, limit) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본1', input: [[70,50,80,50], 100], expected: 3 },
  { desc: '기본2', input: [[70,80,50], 100], expected: 3 },
  { desc: '1명', input: [[80], 100], expected: 1 },
  { desc: '모두 혼자', input: [[60,70,80], 100], expected: 3 },
  { desc: '모두 함께', input: [[40,40,40,40], 100], expected: 2 },
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
