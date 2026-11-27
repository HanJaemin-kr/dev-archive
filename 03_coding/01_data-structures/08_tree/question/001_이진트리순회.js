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

function preorder(root) {
  // 여기에 풀이 작성 (전위)
}
function inorder(root) {
  // 여기에 풀이 작성 (중위)
}
function postorder(root) {
  // 여기에 풀이 작성 (후위)
}
function levelorder(root) {
  // 여기에 풀이 작성 (레벨)
}

const tree = build([1, 2, 3, 4, 5]);
const tests = [
  { desc: '전위 순회', fn: preorder, expected: [1,2,4,5,3] },
  { desc: '중위 순회', fn: inorder,  expected: [4,2,5,1,3] },
  { desc: '후위 순회', fn: postorder,expected: [4,5,2,3,1] },
  { desc: '레벨 순회', fn: levelorder,expected: [1,2,3,4,5] },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, fn, expected }) => {
  const result = fn(tree);
  const ok = JSON.stringify(result) === JSON.stringify(expected);
  console.log(`[${ok ? '✅' : '❌'}] ${desc}`);
  if (!ok) { console.log(`     출력: ${JSON.stringify(result)}`); console.log(`     기대: ${JSON.stringify(expected)}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
