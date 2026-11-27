function solution(weights, values, capacity) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본', input: [[2,3,4,5],[3,4,5,6],8], expected: 10 },
  { desc: '물건 1개 — 들어감', input: [[3],[5],5], expected: 5 },
  { desc: '물건 1개 — 안 들어감', input: [[10],[5],5], expected: 0 },
  { desc: '모두 넣기 가능', input: [[1,2,3],[10,20,30],10], expected: 60 },
  { desc: '용량 딱 맞게 선택', input: [[2,3,5],[4,5,8],5], expected: 9 },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution(...input);
  const ms = (performance.now() - start).toFixed(2);
  const ok = result === expected;
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${result}`); console.log(`     기대: ${expected}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
