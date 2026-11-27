// ===== Stack =====
class Stack {
  #data = [];
  push(val) { this.#data.push(val); }
  pop()      { return this.#data.pop(); }
  peek()     { return this.#data.at(-1); }
  isEmpty()  { return this.#data.length === 0; }
  size()     { return this.#data.length; }
}

// ===== Queue (O(1) dequeue) =====
class Queue {
  #data = {};
  #head = 0;
  #tail = 0;
  enqueue(val) { this.#data[this.#tail++] = val; }
  dequeue()    { if (this.isEmpty()) return undefined; const v = this.#data[this.#head]; delete this.#data[this.#head++]; return v; }
  peek()       { return this.#data[this.#head]; }
  isEmpty()    { return this.#head === this.#tail; }
  size()       { return this.#tail - this.#head; }
}

// ===== Min Heap =====
class MinHeap {
  #h = [];
  push(val) {
    this.#h.push(val);
    this.#bubbleUp(this.#h.length - 1);
  }
  pop() {
    const min = this.#h[0];
    const last = this.#h.pop();
    if (this.#h.length) { this.#h[0] = last; this.#sinkDown(0); }
    return min;
  }
  peek()    { return this.#h[0]; }
  size()    { return this.#h.length; }
  isEmpty() { return this.#h.length === 0; }
  #bubbleUp(i) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.#h[p] <= this.#h[i]) break;
      [this.#h[p], this.#h[i]] = [this.#h[i], this.#h[p]];
      i = p;
    }
  }
  #sinkDown(i) {
    const n = this.#h.length;
    while (true) {
      let min = i, l = 2*i+1, r = 2*i+2;
      if (l < n && this.#h[l] < this.#h[min]) min = l;
      if (r < n && this.#h[r] < this.#h[min]) min = r;
      if (min === i) break;
      [this.#h[min], this.#h[i]] = [this.#h[i], this.#h[min]];
      i = min;
    }
  }
}

// ===== Union-Find =====
class UnionFind {
  #parent; #rank;
  constructor(n) {
    this.#parent = Array.from({ length: n }, (_, i) => i);
    this.#rank = new Array(n).fill(0);
  }
  find(x) {
    if (this.#parent[x] !== x) this.#parent[x] = this.find(this.#parent[x]);
    return this.#parent[x];
  }
  union(a, b) {
    const [ra, rb] = [this.find(a), this.find(b)];
    if (ra === rb) return false;
    if (this.#rank[ra] < this.#rank[rb]) this.#parent[ra] = rb;
    else if (this.#rank[ra] > this.#rank[rb]) this.#parent[rb] = ra;
    else { this.#parent[rb] = ra; this.#rank[ra]++; }
    return true;
  }
  connected(a, b) { return this.find(a) === this.find(b); }
}

// ===== BFS =====
function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = new Queue();
  queue.enqueue(start);
  while (!queue.isEmpty()) {
    const node = queue.dequeue();
    for (const next of graph[node] ?? []) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.enqueue(next);
      }
    }
  }
}

// ===== DFS =====
function dfs(graph, node, visited = new Set()) {
  visited.add(node);
  for (const next of graph[node] ?? []) {
    if (!visited.has(next)) dfs(graph, next, visited);
  }
}

// ===== Binary Search =====
function lowerBound(arr, target) {
  let [lo, hi] = [0, arr.length];
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    arr[mid] < target ? lo = mid + 1 : hi = mid;
  }
  return lo;
}

module.exports = { Stack, Queue, MinHeap, UnionFind, bfs, dfs, lowerBound };
