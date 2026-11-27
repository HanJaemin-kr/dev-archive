class TreeNode {
  constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}
function build(arr, i = 0) {
  if (i >= arr.length || arr[i] === null) return null;
  const node = new TreeNode(arr[i]);
  node.left = build(arr, 2*i+1);
  node.right = build(arr, 2*i+2);
  return node;
}

function solution(root) {
  // 여기에 풀이 작성

}

const tests = [
  { desc: '기본', input: [3,9,20,null,null,15,7], expected: 3 },
  { desc: '오른쪽만', input: [1,null,2], expected: 2 },
  { desc: '단일 노드', input: [1], expected: 1 },
  { desc: '빈 트리', input: [], expected: 0 },
  { desc: '편향 트리', input: [1,2,null,3,null,4], expected: 4 },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const result = solution(build(input));
  const ok = result === expected;
  console.log(`[${ok ? '✅' : '❌'}] ${desc}`);
  if (!ok) { console.log(`     출력: ${result}`); console.log(`     기대: ${expected}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
