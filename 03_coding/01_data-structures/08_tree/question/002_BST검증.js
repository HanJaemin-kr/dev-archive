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
  { desc: '유효한 BST', input: [2,1,3], expected: true },
  { desc: '유효하지 않은 BST', input: [5,1,4,null,null,3,6], expected: false },
  { desc: '단일 노드', input: [1], expected: true },
  { desc: '왼쪽만 있는 BST', input: [2,1], expected: true },
  { desc: '서브트리 경계 위반', input: [10,5,15,null,null,6,20], expected: false },
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
