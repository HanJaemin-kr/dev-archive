function solution(scoville, K) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본', input: [[1,2,3,9,10,12], 7], expected: 2 },
  { desc: '이미 모두 K 이상', input: [[10,12,15], 7], expected: 0 },
  { desc: '불가능', input: [[1,1], 10000000], expected: -1 },
  { desc: '원소 2개', input: [[1,2], 3], expected: 1 },
  { desc: '0 포함', input: [[0,0,0,100], 80], expected: -1 },
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
