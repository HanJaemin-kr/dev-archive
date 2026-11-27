class Trie {
  constructor() {
    // 여기에 풀이 작성
  }
  insert(word) {

  }
  search(word) {

  }
  startsWith(prefix) {

  }
}

let pass = 0, fail = 0;
function check(desc, result, expected) {
  const ok = result === expected;
  console.log(`[${ok ? '✅' : '❌'}] ${desc}`);
  if (!ok) { console.log(`     출력: ${result}`); console.log(`     기대: ${expected}`); }
  ok ? pass++ : fail++;
}

const t = new Trie();
t.insert('apple');
check('search("apple") → true', t.search('apple'), true);
check('search("app") → false', t.search('app'), false);
check('startsWith("app") → true', t.startsWith('app'), true);
t.insert('app');
check('search("app") after insert → true', t.search('app'), true);
check('startsWith("ap") → true', t.startsWith('ap'), true);
check('search("appl") → false', t.search('appl'), false);
check('startsWith("b") → false', t.startsWith('b'), false);

console.log(`\n결과: ${pass}/${pass + fail} 통과`);
