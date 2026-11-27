function solution(n, prerequisites) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '수강 가능', input: [2, [[1,0]]], expected: true },
  { desc: '사이클 존재', input: [2, [[1,0],[0,1]]], expected: false },
  { desc: '과목 1개', input: [1, []], expected: true },
  { desc: '선수과목 없음', input: [4, []], expected: true },
  { desc: '긴 체인', input: [4, [[1,0],[2,1],[3,2]]], expected: true },
  { desc: '복잡한 사이클', input: [4, [[1,0],[2,1],[0,3],[3,2]]], expected: false },
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
