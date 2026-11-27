function solution(words) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본', input: [['go','gone','guild']], expected: 6 },
  { desc: '모두 다른 첫 글자', input: [['abc','def','ghi','jklm']], expected: 4 },
  { desc: '단일 단어', input: [['hello']], expected: 1 },
  { desc: '완전히 같은 접두사', input: [['word','world','worry']], expected: 9 },
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
