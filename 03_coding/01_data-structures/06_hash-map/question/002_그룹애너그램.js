function solution(strs) {
  // 여기에 풀이 작성

}

function normalize(groups) {
  return groups.map(g => g.slice().sort()).sort((a, b) => a[0] < b[0] ? -1 : 1);
}

const tests = [
  {
    desc: '기본',
    input: [['eat','tea','tan','ate','nat','bat']],
    expected: [['bat'],['nat','tan'],['ate','eat','tea']],
  },
  {
    desc: '단일 원소',
    input: [['a']],
    expected: [['a']],
  },
  {
    desc: '모두 같은 애너그램',
    input: [['abc','bca','cab']],
    expected: [['abc','bca','cab']],
  },
  {
    desc: '빈 문자열',
    input: [['','']],
    expected: [['','']],
  },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = normalize(solution(...input));
  const exp = normalize(expected);
  const ms = (performance.now() - start).toFixed(2);
  const ok = JSON.stringify(result) === JSON.stringify(exp);
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${JSON.stringify(result)}`); console.log(`     기대: ${JSON.stringify(exp)}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
