function solution(n, edges) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본 (2개 컴포넌트)', input: [5, [[0,1],[1,2],[3,4]]], expected: 2 },
  { desc: '모두 연결', input: [4, [[0,1],[1,2],[2,3]]], expected: 1 },
  { desc: '간선 없음', input: [4, []], expected: 4 },
  { desc: '단일 노드', input: [1, []], expected: 1 },
  { desc: '3개 컴포넌트', input: [6, [[0,1],[2,3]]], expected: 3 },
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
