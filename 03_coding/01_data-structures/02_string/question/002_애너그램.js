function solution(s, t) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본 애너그램', input: ['anagram', 'nagaram'], expected: true },
  { desc: '애너그램 아님', input: ['rat', 'car'], expected: false },
  { desc: '길이 다름', input: ['ab', 'a'], expected: false },
  { desc: '동일 문자열', input: ['abc', 'abc'], expected: true },
  { desc: '중복 문자 개수 다름', input: ['aa', 'a'], expected: false },
  { desc: '단일 문자', input: ['a', 'a'], expected: true },
  { desc: '긴 문자열', input: ['a'.repeat(25000) + 'b'.repeat(25000), 'b'.repeat(25000) + 'a'.repeat(25000)], expected: true },
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
