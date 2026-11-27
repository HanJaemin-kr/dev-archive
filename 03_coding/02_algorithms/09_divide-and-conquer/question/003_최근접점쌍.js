function solution(points) {
  // 여기에 풀이 작성 — 두 점 사이 거리의 제곱 반환

}

const dist2 = (a, b) => (a[0]-b[0])**2 + (a[1]-b[1])**2;

const tests = [
  { desc: '기본', input: [[0,0],[3,4],[1,1]], expected: 2 },
  { desc: '직선 위', input: [[0,0],[1,0],[2,0]], expected: 1 },
  { desc: '두 점', input: [[0,0],[3,4]], expected: 25 },
  { desc: '동일 점 여러 개', input: [[1,1],[1,1],[5,5]], expected: 0 },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution(input.map(p => [...p]));
  const ms = (performance.now() - start).toFixed(2);
  const ok = result === expected;
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${result}`); console.log(`     기대: ${expected}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
