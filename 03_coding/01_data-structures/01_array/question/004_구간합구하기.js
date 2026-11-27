function solution(nums, queries) {
  // 여기에 풀이 작성

}

// ── 테스트 ──────────────────────────────────────────────────
const tests = [
  {
    desc: '기본 케이스',
    input: [[1, 2, 3, 4, 5], [[0,2],[1,3],[0,4]]],
    expected: [6, 9, 15],
  },
  {
    desc: '단일 원소 쿼리',
    input: [[10, 20, 30], [[0,0],[1,1],[2,2]]],
    expected: [10, 20, 30],
  },
  {
    desc: '전체 구간 쿼리',
    input: [[1, 2, 3], [[0,2]]],
    expected: [6],
  },
  {
    desc: '음수 포함',
    input: [[-1, 2, -3, 4, -5], [[0,4],[1,3],[2,2]]],
    expected: [-3, 3, -3],
  },
  {
    desc: '같은 구간 반복 쿼리',
    input: [[1, 2, 3, 4, 5], [[0,4],[0,4],[0,4]]],
    expected: [15, 15, 15],
  },
  {
    desc: '성능 (N=10^5, Q=10^5)',
    input: [
      Array.from({ length: 100000 }, (_, i) => i % 10000 - 5000),
      Array.from({ length: 100000 }, () => {
        const l = Math.floor(Math.random() * 100000);
        const r = Math.floor(Math.random() * (100000 - l)) + l;
        return [l, r];
      }),
    ],
    expected: null,
  },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution([...input[0]], input[1]);
  const ms = (performance.now() - start).toFixed(2);

  if (expected === null) {
    console.log(`[⏱️ ] ${desc} — ${ms}ms`);
    pass++;
    return;
  }

  const ok = JSON.stringify(result) === JSON.stringify(expected);
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) {
    console.log(`     출력: ${JSON.stringify(result)}`);
    console.log(`     기대: ${JSON.stringify(expected)}`);
  }
  ok ? pass++ : fail++;
});

console.log(`\n결과: ${pass}/${pass + fail} 통과`);
