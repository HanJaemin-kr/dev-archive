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
  const r = [];
  while (head) { r.push(head.val); head = head.next; }
  return r;
}

function solution(head) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본', input: [1,2,3,4,5], expected: [5,4,3,2,1] },
  { desc: '두 노드', input: [1,2], expected: [2,1] },
  { desc: '단일 노드', input: [1], expected: [1] },
  { desc: '빈 리스트', input: [], expected: [] },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = toArr(solution(toList(input)));
  const ms = (performance.now() - start).toFixed(2);
  const ok = JSON.stringify(result) === JSON.stringify(expected);
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${JSON.stringify(result)}`); console.log(`     기대: ${JSON.stringify(expected)}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
