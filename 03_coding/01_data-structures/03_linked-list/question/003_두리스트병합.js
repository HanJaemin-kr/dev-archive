class ListNode {
  constructor(val, next = null) { this.val = val; this.next = next; }
}
function toList(arr) {
  if (!arr.length) return null;
  const head = new ListNode(arr[0]);
  let cur = head;
  for (let i = 1; i < arr.length; i++) { cur.next = new ListNode(arr[i]); cur = cur.next; }
  return head;
}
function toArr(head) {
  const r = []; while (head) { r.push(head.val); head = head.next; } return r;
}

function solution(l1, l2) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본', input: [[1,2,4],[1,3,4]], expected: [1,1,2,3,4,4] },
  { desc: '둘 다 빈 리스트', input: [[],[]], expected: [] },
  { desc: '한쪽이 빈 리스트', input: [[],[0]], expected: [0] },
  { desc: '길이 다름', input: [[1,3,5,7],[2,4]], expected: [1,2,3,4,5,7] },
  { desc: '모두 동일한 값', input: [[1,1,1],[1,1,1]], expected: [1,1,1,1,1,1] },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input: [a, b], expected }) => {
  const start = performance.now();
  const result = toArr(solution(toList(a), toList(b)));
  const ms = (performance.now() - start).toFixed(2);
  const ok = JSON.stringify(result) === JSON.stringify(expected);
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${JSON.stringify(result)}`); console.log(`     기대: ${JSON.stringify(expected)}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
