function solution(info, query) {
  // 여기에 풀이 작성

}

const tests = [
  {
    desc: '기본',
    input: [
      ['java backend junior pizza 150','python frontend senior chicken 210','python frontend senior chicken 150','cpp backend senior pizza 260','java backend junior pizza 150','python frontend senior chicken 150'],
      ['java and backend and junior and pizza 100','python and frontend and senior and chicken 200','cpp and - and senior and - 250','- and backend and senior and - 150','- and - and - and - 100','- and - and - and - 150']
    ],
    expected: [1,1,1,1,2,4],
  },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution(...input);
  const ms = (performance.now() - start).toFixed(2);
  const ok = JSON.stringify(result) === JSON.stringify(expected);
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${JSON.stringify(result)}`); console.log(`     기대: ${JSON.stringify(expected)}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
