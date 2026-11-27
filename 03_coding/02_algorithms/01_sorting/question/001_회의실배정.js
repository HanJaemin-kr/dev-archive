function solution(meetings) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본', input: [[[1,4],[3,5],[0,6],[5,7],[3,8],[5,9],[6,10],[8,11],[8,12],[2,13],[12,14]]], expected: 4 },
  { desc: '회의 1개', input: [[[0,1]]], expected: 1 },
  { desc: '겹치지 않음', input: [[[0,1],[1,2],[2,3]]], expected: 3 },
  { desc: '모두 겹침', input: [[[0,5],[1,5],[2,5]]], expected: 1 },
  { desc: '시작=종료', input: [[[1,1],[2,2],[3,3]]], expected: 3 },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution(input[0].map(m => [...m]));
  const ms = (performance.now() - start).toFixed(2);
  const ok = result === expected;
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${result}`); console.log(`     기대: ${expected}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
