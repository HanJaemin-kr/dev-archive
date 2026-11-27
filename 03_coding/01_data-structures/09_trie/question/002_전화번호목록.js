function solution(phone_book) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '접두사 있음', input: [['119','97674223','1195524421']], expected: false },
  { desc: '접두사 없음', input: [['123','456','789']], expected: true },
  { desc: '접두사 있음2', input: [['12','123','1235','567','88']], expected: false },
  { desc: '단일 번호', input: [['123']], expected: true },
  { desc: '완전히 같은 번호 없음', input: [['1','2','3']], expected: true },
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
