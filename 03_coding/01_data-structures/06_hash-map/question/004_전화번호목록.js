// 정렬 풀이 - O(N log N)
function solution(phone_book) {
    phone_book.sort();

    for (let i = 0; i < phone_book.length - 1; i++) {
        if (phone_book[i + 1].startsWith(phone_book[i])) {
            return false;
        }
    }

    return true;
}

// Set(해시) 풀이 - O(N × L)
function solutionSet(phone_book) {
    const phoneSet = new Set(phone_book);

    for (const phone of phone_book) {
        let prefix = '';

        for (const digit of phone) {
            prefix += digit;

            if (prefix !== phone && phoneSet.has(prefix)) {
                return false;
            }
        }
    }

    return true;
}
