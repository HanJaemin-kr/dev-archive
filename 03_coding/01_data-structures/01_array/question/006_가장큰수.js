function solution(numbers) {
  const answer = numbers
    .map(String)
    .sort((a, b) => (b + a) - (a + b))
    .join('');

  return answer[0] === '0' ? '0' : answer;
}

// ── 테스트 ──────────────────────────────────────────────────
const tests = [
  {
    desc: '기본 케이스',
    input: [6, 10, 2],
    expected: '6210',
  },
  {
    desc: '기본 케이스 2',
    input: [3, 30, 34, 5, 9],
    expected: '9534330',
  },
  {
    desc: '모두 0 — 예외 처리',
    input: [0, 0, 0],
    expected: '0',
  },
  {
    desc: '단일 원소',
    input: [1],
    expected: '1',
  },
  {
    desc: '3 vs 30 순서',
    input: [3, 30],
    expected: '330',
  },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution([...input]);
  const ms = (performance.now() - start).toFixed(2);

  const ok = result === expected;
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) {
    console.log(`     출력: ${result}`);
    console.log(`     기대: ${expected}`);
  }
  ok ? pass++ : fail++;
});

console.log(`\n결과: ${pass}/${pass + fail} 통과`);
