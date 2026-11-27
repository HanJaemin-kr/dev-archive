function solution(arr) {
  // 여기에 풀이 작성 (내장 sort 사용 금지)

}

const tests = [
  { desc: '기본', input: [5,2,4,6,1,3], expected: [1,2,3,4,5,6] },
  { desc: '역순', input: [5,4,3,2,1], expected: [1,2,3,4,5] },
  { desc: '이미 정렬', input: [1,2,3,4,5], expected: [1,2,3,4,5] },
  { desc: '중복 포함', input: [3,1,4,1,5,9,2,6,5], expected: [1,1,2,3,4,5,5,6,9] },
  { desc: '음수 포함', input: [-3,1,-2,4,0], expected: [-3,-2,0,1,4] },
  { desc: '단일 원소', input: [1], expected: [1] },
  { desc: '성능 (N=10^5)', input: Array.from({length:100000},()=>Math.floor(Math.random()*200000)-100000), expected: null },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution([...input]);
  const ms = (performance.now() - start).toFixed(2);
  if (expected === null) {
    const sorted = result.every((v,i,a) => i===0 || a[i-1]<=v);
    console.log(`[${sorted?'✅':'❌'}] ${desc} — ${ms}ms`);
    sorted ? pass++ : fail++; return;
  }
  const ok = JSON.stringify(result) === JSON.stringify(expected);
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${JSON.stringify(result)}`); console.log(`     기대: ${JSON.stringify(expected)}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
