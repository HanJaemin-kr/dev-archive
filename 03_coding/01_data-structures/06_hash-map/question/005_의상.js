// 해시 풀이 - O(N)
function solution(clothes) {
    const map = new Map();

    for (const [name, type] of clothes) {
        map.set(type, (map.get(type) || 0) + 1);
    }

    let answer = 1;

    for (const count of map.values()) {
        answer *= (count + 1);
    }

    return answer - 1;
}

// DFS 풀이 - 비교용
function solutionDFS(clothes) {
    const map = new Map();

    for (const [name, type] of clothes) {
        if (!map.has(type)) {
            map.set(type, []);
        }

        map.get(type).push(name);
    }

    const categories = [...map.values()];
    let count = 0;

    function dfs(idx, selected) {
        if (idx === categories.length) {
            if (selected > 0) count++;
            return;
        }

        dfs(idx + 1, selected);

        for (const cloth of categories[idx]) {
            dfs(idx + 1, selected + 1);
        }
    }

    dfs(0, 0);

    return count;
}
