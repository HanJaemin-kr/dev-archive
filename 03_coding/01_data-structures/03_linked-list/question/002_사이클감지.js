class ListNode {
  constructor(val, next = null) { this.val = val; this.next = next; }
}
function toListWithCycle(arr, pos) {
  if (!arr.length) return null;
  const nodes = arr.map(v => new ListNode(v));
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i+1];
  if (pos !== -1) nodes[nodes.length - 1].next = nodes[pos];
  return nodes[0];
}

function solution(head) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '사이클 있음 (pos=1)', input: [[3,2,0,-4], 1], expected: true },
  { desc: '사이클 있음 (pos=0)', input: [[1,2], 0], expected: true },
  { desc: '사이클 없음 (단일)', input: [[1], -1], expected: false },
  { desc: '사이클 없음 (일반)', input: [[1,2,3,4,5], -1], expected: false },
  { desc: '빈 리스트', input: [[], -1], expected: false },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input: [arr, pos], expected }) => {
  const start = performance.now();
  const result = solution(toListWithCycle(arr, pos));
  const ms = (performance.now() - start).toFixed(2);
  const ok = result === expected;
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${result}`); console.log(`     기대: ${expected}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
