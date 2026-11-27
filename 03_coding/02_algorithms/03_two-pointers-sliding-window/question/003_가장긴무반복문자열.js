function solution(s) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본', input: 'abcabcbb', expected: 3 },
  { desc: '전부 중복', input: 'bbbbb', expected: 1 },
  { desc: '혼합', input: 'pwwkew', expected: 3 },
  { desc: '빈 문자열', input: '', expected: 0 },
  { desc: '단일 문자', input: 'a', expected: 1 },
  { desc: '모두 다름', input: 'abcdef', expected: 6 },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution(input);
  const ms = (performance.now() - start).toFixed(2);
  const ok = result === expected;
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${result}`); console.log(`     기대: ${expected}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
