class MinHeap {
  constructor() {
    // 여기에 풀이 작성
  }
  push(val) {

  }
  pop() {

  }
  peek() {

  }
  size() {

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

const h = new MinHeap();
h.push(5); h.push(3); h.push(8); h.push(1);
check('peek() → 1', h.peek(), 1);
check('size() → 4', h.size(), 4);
check('pop() → 1', h.pop(), 1);
check('pop() → 3', h.pop(), 3);
check('size() → 2', h.size(), 2);
h.push(2);
check('peek() → 2', h.peek(), 2);
check('pop() → 2', h.pop(), 2);
check('pop() → 5', h.pop(), 5);
check('pop() → 8', h.pop(), 8);
check('size() → 0', h.size(), 0);

// 성능: 10^5 push/pop
const h2 = new MinHeap();
const start = performance.now();
for (let i = 100000; i >= 1; i--) h2.push(i);
let sorted = true;
let prev = -Infinity;
for (let i = 0; i < 100000; i++) {
  const v = h2.pop();
  if (v < prev) { sorted = false; break; }
  prev = v;
}
const ms = (performance.now() - start).toFixed(2);
check(`성능 (10^5 push/pop, ${ms}ms) — 오름차순 정렬됨`, sorted, true);

console.log(`\n결과: ${pass}/${pass + fail} 통과`);
