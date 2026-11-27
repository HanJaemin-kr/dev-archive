function solution(nums) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본', input: [100,4,200,1,3,2], expected: 4 },
  { desc: '긴 수열', input: [0,3,7,2,5,8,4,6,0,1], expected: 9 },
  { desc: '빈 배열', input: [], expected: 0 },
  { desc: '단일 원소', input: [1], expected: 1 },
  { desc: '중복 포함', input: [1,2,2,3], expected: 3 },
  { desc: '모두 불연속', input: [1,3,5,7], expected: 1 },
  { desc: '성능 (N=10^5)', input: Array.from({length: 100000}, (_,i) => i), expected: 100000 },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution([...input]);
  const ms = (performance.now() - start).toFixed(2);
  const ok = result === expected;
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${result}`); console.log(`     기대: ${expected}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
