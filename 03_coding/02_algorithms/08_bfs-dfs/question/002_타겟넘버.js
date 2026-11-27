function solution(numbers, target) {
  let count = 0;

  function dfs(index, sum) {
    if (index === numbers.length) {
      if (sum === target) count++;
      return;
    }
    dfs(index + 1, sum + numbers[index]); // + 노드
    dfs(index + 1, sum - numbers[index]); // - 노드
  }
  dfs(0, 0);

  return count;
}

const tests = [
  { desc: '기본', input: [[1,1,1,1,1], 3], expected: 5 },
  { desc: '기본2', input: [[4,1,2,1], 4], expected: 2 },
  { desc: '경우 없음', input: [[1,2,3], 100], expected: 0 },
  { desc: '단일 원소 일치', input: [[5], 5], expected: 1 },
  { desc: '단일 원소 불일치', input: [[5], -5], expected: 1 },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution([...input[0]], input[1]);
  const ms = (performance.now() - start).toFixed(2);
  const ok = result === expected;
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${result}`); console.log(`     기대: ${expected}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
