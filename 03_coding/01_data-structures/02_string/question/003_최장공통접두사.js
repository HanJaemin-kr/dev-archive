function solution(strs) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본', input: [['flower', 'flow', 'flight']], expected: 'fl' },
  { desc: '공통 없음', input: [['dog', 'racecar', 'car']], expected: '' },
  { desc: '원소 1개', input: [['a']], expected: 'a' },
  { desc: '모두 동일', input: [['abc', 'abc', 'abc']], expected: 'abc' },
  { desc: '한 문자가 접두사', input: [['c', 'acc', 'ccc']], expected: '' },
  { desc: '전체가 접두사', input: [['ab', 'abc', 'abcd']], expected: 'ab' },
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
