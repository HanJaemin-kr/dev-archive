function solution(nums) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본', input: [2,1,2,4,3], expected: [4,2,4,-1,-1] },
  { desc: '기본2', input: [1,3,2], expected: [3,-1,-1] },
  { desc: '단일 원소', input: [5], expected: [-1] },
  { desc: '오름차순', input: [1,2,3,4,5], expected: [2,3,4,5,-1] },
  { desc: '내림차순', input: [5,4,3,2,1], expected: [-1,-1,-1,-1,-1] },
  { desc: '모두 동일', input: [3,3,3], expected: [-1,-1,-1] },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution([...input]);
  const ms = (performance.now() - start).toFixed(2);
  const ok = JSON.stringify(result) === JSON.stringify(expected);
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${JSON.stringify(result)}`); console.log(`     기대: ${JSON.stringify(expected)}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
