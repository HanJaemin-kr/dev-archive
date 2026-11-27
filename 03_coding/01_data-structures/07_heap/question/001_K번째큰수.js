class MinHeap {
  constructor() { this.h = []; }
  size() { return this.h.length; }
  peek() { return this.h[0]; }

  push(v) {
    this.h.push(v);
    this._up(this.h.length - 1);
  }

  pop() {
    const top = this.h[0];
    const last = this.h.pop();
    if (this.h.length) {
      this.h[0] = last;
      this._down(0);
    }
    return top;
  }

  _up(i) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.h[p] <= this.h[i]) break;
      [this.h[p], this.h[i]] = [this.h[i], this.h[p]];
      i = p;
    }
  }

  _down(i) {
    const n = this.h.length;
    while (true) {
      const l = i * 2 + 1, r = i * 2 + 2;
      let s = i;
      if (l < n && this.h[l] < this.h[s]) s = l;
      if (r < n && this.h[r] < this.h[s]) s = r;
      if (s === i) break;
      [this.h[s], this.h[i]] = [this.h[i], this.h[s]];
      i = s;
    }
  }
}

function solution(nums, k) {
  const heap = new MinHeap();
  for (const v of nums) {
    if (heap.size() < k) heap.push(v);
    else if (v > heap.peek()) {
      heap.pop();
      heap.push(v);
    }
  }
  return heap.peek();
}

const tests = [
  { desc: '기본', input: [[3,2,1,5,6,4], 2], expected: 5 },
  { desc: '기본2', input: [[3,2,3,1,2,4,5,5,6], 4], expected: 4 },
  { desc: 'k=1 (최댓값)', input: [[7,2,5,1], 1], expected: 7 },
  { desc: 'k=n (최솟값)', input: [[3,1,2], 3], expected: 1 },
  { desc: '음수 포함', input: [[-1,-2,-3,-4], 2], expected: -2 },
  { desc: '성능 (N=10^4)', input: [Array.from({length:10000},(_,i)=>i), 5000], expected: 9999-5000+1 },
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
