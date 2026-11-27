function solution(bridge_length, weight, truck_weights) {
  let count = 0;
  let bridge_queue = new Array(bridge_length).fill(0);
  let bridge_weight = 0;

  while (truck_weights.length > 0 || bridge_weight > 0) {
    count++; // 순서 체크 들어오고

    bridge_weight -= bridge_queue.shift(); // 앞차 먼저 나가고
    if (
      truck_weights.length > 0 &&
      bridge_weight + truck_weights[0] <= weight
    ) {
      let cur = truck_weights.shift();
      bridge_queue.push(cur); // 뒷차 들어옴
      bridge_weight += cur;
    } else {
      bridge_queue.push(0);
    }
  }

  return count;
}

const tests = [
  { desc: '예제 1', input: [2, 10, [7, 4, 5, 6]], expected: 8 },
  { desc: '예제 2', input: [100, 100, [10]], expected: 101 },
  { desc: '예제 3', input: [100, 100, [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]], expected: 110 },
  { desc: '트럭 1대 / 다리 1', input: [1, 10, [5]], expected: 2 },
  { desc: '꽉 채워 통과', input: [3, 6, [2, 2, 2]], expected: 5 },
  { desc: '성능 (10000대)', input: [10000, 10000, Array(10000).fill(1)], expected: null },
];

let pass = 0, fail = 0;
tests.forEach(({ desc, input, expected }) => {
  const start = performance.now();
  const result = solution(input[0], input[1], [...input[2]]);
  const ms = (performance.now() - start).toFixed(2);
  if (expected === null) {
    console.log(`[⏱️ ] ${desc} — ${ms}ms (result: ${result})`);
    pass++; return;
  }
  const ok = result === expected;
  console.log(`[${ok ? '✅' : '❌'}] ${desc} — ${ms}ms`);
  if (!ok) { console.log(`     출력: ${result}`); console.log(`     기대: ${expected}`); }
  ok ? pass++ : fail++;
});
console.log(`\n결과: ${pass}/${pass + fail} 통과`);
