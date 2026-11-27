function solution(coins, amount) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본', input: [[1,5,10,25], 30], expected: 2 },
  { desc: '불가능', input: [[2], 3], expected: -1 },
  { desc: '기본2', input: [[1,2,5], 11], expected: 3 },
  { desc: 'amount=0', input: [[1,5], 0], expected: 0 },
  { desc: '그리디 안 통하는 케이스', input: [[1,3,4], 6], expected: 2 },
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
