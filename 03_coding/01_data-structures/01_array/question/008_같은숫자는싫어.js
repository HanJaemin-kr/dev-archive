// ── 내 풀이 ────────────────────────────────────────────────
// Symbol()로 배열 끝을 표시하는 sentinel 사용
// Symbol은 유일값이라 어떤 배열 원소와도 절대 같지 않음
function solution(arr) {
  const END = Symbol();
  const parseArr = [...arr, END];
  const answer = [];
  for (let i = 1; i < parseArr.length; i++) {
    const cur = parseArr[i - 1];
    const next = parseArr[i];
    if (cur !== next) {
      answer.push(cur);
    }
  }
  return answer;
}

// ── 효율적 풀이 ─────────────────────────────────────────────
// arr[i+1]이 undefined일 때 마지막 원소와 절대 같지 않으므로
// sentinel 없이 filter 한 줄로 처리 가능
function solutionOpt(arr) {
  return arr.filter((v, i) => v !== arr[i + 1]);
}

// ── 테스트 ──────────────────────────────────────────────────
const tests = [
  {
    desc: '기본 케이스',
    input: [1, 1, 3, 3, 0, 1, 1],
    expected: [1, 3, 0, 1],
  },
  {
    desc: '연속 3개',
    input: [4, 4, 4, 3, 3],
    expected: [4, 3],
  },
  {
    desc: '중복 없음',
    input: [1, 2, 3],
    expected: [1, 2, 3],
  },
  {
    desc: '원소 1개',
    input: [7],
    expected: [7],
  },
  {
    desc: '모두 동일',
    input: [5, 5, 5, 5],
    expected: [5],
  },
  {
    desc: '대규모 (n=10^6)',
    input: Array.from({ length: 1_000_000 }, (_, i) => (i % 3 === 0 ? 1 : 2)),
    expected: null,
  },
];

function run(label, fn) {
  let pass = 0, fail = 0;
  console.log(`\n── ${label} ──`);
  tests.forEach(({ desc, input, expected }) => {
    const start = performance.now();
    const result = fn([...input]);
    const ms = (performance.now() - start).toFixed(2);
    if (expected === null) {
      console.log(`[⏱] ${desc} — ${ms}ms`);
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
  console.log(`결과: ${pass}/${pass + fail} 통과`);
}

run('내 풀이 (Symbol sentinel)', solution);
run('효율적 풀이 (filter)', solutionOpt);
