function solution(s) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본 유효', input: '()', expected: true },
  { desc: '복합 유효', input: '()[]{}', expected: true },
  { desc: '중첩 유효', input: '{[]}', expected: true },
  { desc: '잘못된 순서', input: '([)]', expected: false },
  { desc: '닫힌 괄호만', input: ']', expected: false },
  { desc: '열린 괄호만', input: '(', expected: false },
  { desc: '빈 문자열', input: '', expected: true },
  { desc: '긴 유효 문자열', input: '({[]})'.repeat(1000), expected: true },
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
