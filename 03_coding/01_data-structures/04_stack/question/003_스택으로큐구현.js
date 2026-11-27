class MyQueue {
  constructor() {
    // 여기에 풀이 작성
  }
  push(x) {

  }
  pop() {

  }
  peek() {

  }
  empty() {

  }
}

// ── 테스트 ──────────────────────────────────────────────────
let pass = 0, fail = 0;
function check(desc, result, expected) {
  const ok = result === expected;
  console.log(`[${ok ? '✅' : '❌'}] ${desc}`);
  if (!ok) { console.log(`     출력: ${result}`); console.log(`     기대: ${expected}`); }
  ok ? pass++ : fail++;
}

const q = new MyQueue();
q.push(1); q.push(2);
check('peek() → 1 (FIFO)', q.peek(), 1);
check('pop() → 1', q.pop(), 1);
check('empty() → false', q.empty(), false);
check('pop() → 2', q.pop(), 2);
check('empty() → true', q.empty(), true);

const q2 = new MyQueue();
q2.push(3); q2.push(4); q2.push(5);
check('pop() → 3', q2.pop(), 3);
q2.push(6);
check('peek() → 4', q2.peek(), 4);
check('pop() → 4', q2.pop(), 4);
check('pop() → 5', q2.pop(), 5);
check('pop() → 6', q2.pop(), 6);
check('empty() → true', q2.empty(), true);

console.log(`\n결과: ${pass}/${pass + fail} 통과`);
