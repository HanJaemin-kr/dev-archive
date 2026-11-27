function solution(arr) {
  // 여기에 풀이 작성
  return arr.sort((a, b) => a - b);
}

// ── 테스트 ──────────────────────────────────────────────────
const tests = [
  {
    desc: '기본 케이스',
    input: [3, 1, 4, 1, 5, 9, 2, 6],
    expected: [1, 1, 2, 3, 4, 5, 6, 9],
  },
  {
    desc: '음수 포함',
    input: [-3, 0, -1, 2, -100000, 100000],
    expected: [-100000, -3, -1, 0, 2, 100000],
  },
  {
    desc: '이미 정렬됨',
    input: [1, 2, 3, 4, 5],
    expected: [1, 2, 3, 4, 5],
  },
  {
    desc: '역순',
    input: [5, 4, 3, 2, 1],
    expected: [1, 2, 3, 4, 5],
  },
  {
    desc: '중복값 포함',
    input: [3, 3, 3, 1, 1, 2],
    expected: [1, 1, 2, 3, 3, 3],
  },
  {
    desc: '원소 1개',
    input: [42],
    expected: [42],
  },
  {
    desc: '모두 동일한 값',
    input: [7, 7, 7, 7],
    expected: [7, 7, 7, 7],
  },
  {
    desc: '경계값 (최대 N=10^5 랜덤)',
    input: Array.from({ length: 100000 }, () => Math.floor(Math.random() * 200001) - 100000),
    expected: null, // 시간만 측정
  },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution([...input]);
  const ms = (performance.now() - start).toFixed(2);

  if (expected === null) {
    const sorted = [...result].every((v, i, a) => i === 0 || a[i-1] <= v);
    console.log(`[${sorted ? '✅' : '❌'}] ${desc} — ${ms}ms (n=${input.length})`);
    sorted ? pass++ : fail++;
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
