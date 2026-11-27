function solution(numbers) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본1', input: [[6,10,2]], expected: '6210' },
  { desc: '기본2', input: [[3,30,34,5,9]], expected: '9534330' },
  { desc: '모두 0', input: [[0,0,0]], expected: '0' },
  { desc: '단일 원소', input: [[5]], expected: '5' },
  { desc: '같은 수 반복', input: [[1,1,1]], expected: '111' },
  { desc: '0과 큰 수', input: [[0,999]], expected: '9990' },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution([...input[0]]);
  const ms = (performance.now() - start).toFixed(2);
  const ok = result === expected;
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${result}`); console.log(`     기대: ${expected}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
