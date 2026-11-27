function solution(nums, target) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본', input: [[1,2,3], 3], expected: 2 },
  { desc: '0 포함', input: [[0,0,0], 0], expected: 8 },
  { desc: '불가능', input: [[1,2,3], 10], expected: 0 },
  { desc: '단일 원소 일치', input: [[5], 5], expected: 1 },
  { desc: '단일 원소 불일치', input: [[5], 3], expected: 0 },
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
