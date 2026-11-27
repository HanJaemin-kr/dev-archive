/**
 * 문제: 올바른 괄호
 * 출처: Programmers Level2
 * 유형: 스택 / 문자열
 * 풀이날짜: 2026-05-20
 *
 * '(' 와 ')' 로만 이루어진 문자열 s가 올바른 괄호이면 true, 아니면 false 반환
 *
 * 핵심 아이디어:
 * - count로 '(' +1, ')' -1
 * - 중간에 count < 0 이면 닫는 괄호가 먼저 나온 것 → 즉시 false
 * - 끝에 count === 0 이어야 쌍이 맞음
 *
 * forEach 함정:
 * - forEach 콜백 안에서 return false 해도 바깥 함수는 종료되지 않음
 * - 조기 종료가 필요할 땐 for...of 사용
 *
 * 시간복잡도: O(N)
 * 공간복잡도: O(1)
 */

function solution(s) {
    let count = 0;

    for (const c of s) {
        if (c === "(") count++;
        else count--;

        if (count < 0) return false;
    }

    return count === 0;
}

// 테스트
const testCases = [
    { input: "()()",   expected: true  },
    { input: "(())()", expected: true  },
    { input: ")(",     expected: false },
    { input: "(()",    expected: false },
    { input: "())((",  expected: false },
];

testCases.forEach(({ input, expected }, i) => {
    const result = solution(input);
    const pass = result === expected;
    console.log(`TC ${i + 1}: ${pass ? "PASS" : `FAIL (got ${result}, expected ${expected})`}`);
});
