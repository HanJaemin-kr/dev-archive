function solution(nums, target) {
  // 여기에 풀이 작성

}

// ── 테스트 ──────────────────────────────────────────────────
const tests = [
  {
    desc: '기본 케이스',
    input: [[2, 7, 11, 15], 9],
    expected: [0, 1],
  },
  {
    desc: '앞에 없고 뒤에서 찾는 경우',
    input: [[3, 2, 4], 6],
    expected: [1, 2],
  },
  {
    desc: '같은 값 두 개',
    input: [[3, 3], 6],
    expected: [0, 1],
  },
  {
    desc: '음수 포함',
    input: [[-3, 4, 3, 90], 0],
    expected: [0, 2],
  },
  {
    desc: '정답이 배열 맨 끝',
    input: [[1, 2, 3, 4, 5], 9],
    expected: [3, 4],
  },
  {
    desc: '큰 값 범위',
    input: [[-1000000000, 1000000000, 0], 0],
    expected: [0, 1],
  },
  {
    desc: '성능 (N=10^4)',
    input: [Array.from({ length: 10000 }, (_, i) => i), 19997],
    expected: [9998, 9999],
  },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution(...input.map(x => Array.isArray(x) ? [...x] : x));
  const ms = (performance.now() - start).toFixed(2);

  const ok = JSON.stringify(result?.sort((a,b)=>a-b)) === JSON.stringify(expected?.sort((a,b)=>a-b));
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) {
    console.log(`     출력: ${JSON.stringify(result)}`);
    console.log(`     기대: ${JSON.stringify(expected)}`);
  }
  ok ? pass++ : fail++;
});

console.log(`\n결과: ${pass}/${pass + fail} 통과`);
