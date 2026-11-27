function solution(priorities, location) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본', input: [[2,1,3,2], 2], expected: 1 },
  { desc: '기본2', input: [[1,1,9,1,1,1], 0], expected: 5 },
  { desc: '단일 문서', input: [[1], 0], expected: 1 },
  { desc: '모두 동일 우선순위', input: [[2,2,2,2], 3], expected: 4 },
  { desc: '내 문서가 가장 높은 우선순위', input: [[1,2,3,9,1], 3], expected: 1 },
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
