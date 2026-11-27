function solution(participant, completion) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본', input: [['leo','kiki','eden'], ['eden','kiki']], expected: 'leo' },
  { desc: '기본2', input: [['marina','josipa','nikola','vinko','filipa'], ['josipa','filipa','marina','nikola']], expected: 'vinko' },
  { desc: '동명이인', input: [['mislav','stanko','mislav','ana'], ['stanko','ana','mislav']], expected: 'mislav' },
  { desc: '참가자 1명', input: [['solo'], []], expected: 'solo' },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution([...input[0]], [...input[1]]);
  const ms = (performance.now() - start).toFixed(2);
  const ok = result === expected;
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${result}`); console.log(`     기대: ${expected}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
