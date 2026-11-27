function solution(s) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '공백+특수문자 포함 팰린드롬', input: 'A man, a plan, a canal: Panama', expected: true },
  { desc: '팰린드롬 아님', input: 'race a car', expected: false },
  { desc: '공백만', input: ' ', expected: true },
  { desc: '단일 문자', input: 'a', expected: true },
  { desc: '숫자 포함', input: '0P0', expected: true },
  { desc: '짝수 길이 팰린드롬', input: 'abba', expected: true },
  { desc: '영숫자 외 문자만 있는 경우', input: '.,', expected: true },
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
