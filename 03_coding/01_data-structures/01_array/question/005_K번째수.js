function solution(array, commands) {
  var answer = [];
  commands.forEach(commandRow => {
    var sortedParse = array.slice(commandRow[0] - 1, commandRow[1])
                          .sort((a, b) => a - b);
    answer.push(sortedParse[commandRow[2] - 1]);
  });
  return answer;
}

// ── 테스트 ──────────────────────────────────────────────────
const tests = [
  {
    desc: '기본 케이스',
    array: [1, 5, 2, 6, 3, 7, 4],
    commands: [[2, 5, 3], [4, 4, 1], [1, 7, 3]],
    expected: [5, 6, 3],
  },
  {
    desc: '명령어 1개',
    array: [3, 1, 2],
    commands: [[1, 3, 2]],
    expected: [2],
  },
  {
    desc: '범위가 전체 배열',
    array: [5, 4, 3, 2, 1],
    commands: [[1, 5, 1]],
    expected: [1],
  },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, array, commands, expected }) => {
  const start = performance.now();
  const result = solution([...array], commands);
  const ms = (performance.now() - start).toFixed(2);

  const ok = JSON.stringify(result) === JSON.stringify(expected);
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) {
    console.log(`     출력: ${JSON.stringify(result)}`);
    console.log(`     기대: ${JSON.stringify(expected)}`);
  }
  ok ? pass++ : fail++;
});

console.log(`\n결과: ${pass}/${pass + fail} 통과`);
