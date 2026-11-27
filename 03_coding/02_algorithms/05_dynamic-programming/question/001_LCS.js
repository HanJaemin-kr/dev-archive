function solution(s1, s2) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본', input: ['abcde', 'ace'], expected: 3 },
  { desc: '완전 일치', input: ['abc', 'abc'], expected: 3 },
  { desc: '공통 없음', input: ['abc', 'def'], expected: 0 },
  { desc: '한쪽이 부분수열', input: ['abcdef', 'bdf'], expected: 3 },
  { desc: '단일 문자', input: ['a', 'a'], expected: 1 },
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
