function solution(nums, k) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본', input: [[1,3,-1,-3,5,3,6,7], 3], expected: [3,3,5,5,6,7] },
  { desc: 'k=1', input: [[1,3,2], 1], expected: [1,3,2] },
  { desc: 'k=n', input: [[1,3,2], 3], expected: [3] },
  { desc: '모두 동일', input: [[5,5,5,5], 2], expected: [5,5,5] },
  { desc: '내림차순', input: [[5,4,3,2,1], 3], expected: [5,4,3] },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution([...input[0]], input[1]);
  const ms = (performance.now() - start).toFixed(2);
  const ok = JSON.stringify(result) === JSON.stringify(expected);
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${JSON.stringify(result)}`); console.log(`     기대: ${JSON.stringify(expected)}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
