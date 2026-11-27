function solution(nums) {
  // 여기에 풀이 작성

}

// ── 테스트 ──────────────────────────────────────────────────
const tests = [
  {
    desc: '기본 케이스',
    input: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
    expected: 6,
  },
  {
    desc: '원소 1개',
    input: [1],
    expected: 1,
  },
  {
    desc: '전체가 최대',
    input: [5, 4, -1, 7, 8],
    expected: 23,
  },
  {
    desc: '모두 음수 — 최솟값 반환',
    input: [-1, -2, -3],
    expected: -1,
  },
  {
    desc: '음수 하나만 섞임',
    input: [1, 2, -1, 3, 4],
    expected: 9,
  },
  {
    desc: '앞쪽이 최대',
    input: [10, -5, 1, 1],
    expected: 10,
  },
  {
    desc: '0 포함',
    input: [-2, 0, -1],
    expected: 0,
  },
  {
    desc: '성능 (N=10^5, 모두 1)',
    input: Array(100000).fill(1),
    expected: 100000,
  },
  {
    desc: '성능 (N=10^5, 교대)',
    input: Array.from({ length: 100000 }, (_, i) => i % 2 === 0 ? 10000 : -9999),
    expected: null, // 정답보다 시간 확인
  },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution([...input]);
  const ms = (performance.now() - start).toFixed(2);

  if (expected === null) {
    console.log(`[⏱️ ] ${desc} — ${ms}ms (result: ${result})`);
    pass++;
    return;
  }

  const ok = result === expected;
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) {
    console.log(`     출력: ${result}`);
    console.log(`     기대: ${expected}`);
  }
  ok ? pass++ : fail++;
});

console.log(`\n결과: ${pass}/${pass + fail} 통과`);
