function solution(n, edges, start) {
  // 여기에 풀이 작성

}

const tests = [
  {
    desc: '기본',
    input: [6, [[0,1],[0,2],[1,3],[2,4],[3,5]], 0],
    expected: [0,1,1,2,2,3],
  },
  {
    desc: '단일 노드',
    input: [1, [], 0],
    expected: [0],
  },
  {
    desc: '도달 불가 노드 포함',
    input: [4, [[0,1],[1,2]], 0],
    expected: [0,1,2,-1],
  },
  {
    desc: '시작이 중간 노드',
    input: [5, [[0,1],[1,2],[2,3],[3,4]], 2],
    expected: [2,1,0,1,2],
  },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start2 = performance.now();
  const result = solution(...input);
  const ms = (performance.now() - start2).toFixed(2);
  const ok = JSON.stringify(result) === JSON.stringify(expected);
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${JSON.stringify(result)}`); console.log(`     기대: ${JSON.stringify(expected)}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
