function solution(genres, plays) {
    const answer = [];
    const playsInfo = {};
    const totalPlays = {};

    for (let i = 0; i < genres.length; i++) {
        const genre = genres[i];

        if (!playsInfo[genre]) {
            playsInfo[genre] = [];
            totalPlays[genre] = 0;
        }

        playsInfo[genre].push({
            index: i,
            plays: plays[i]
        });

        totalPlays[genre] += plays[i];
    }

    for (const genre in playsInfo) {
        playsInfo[genre].sort((a, b) => {
            if (b.plays === a.plays) {
                return a.index - b.index;
            }
            return b.plays - a.plays;
        });
    }

    const genreOrder = Object.entries(totalPlays)
        .sort((a, b) => b[1] - a[1])
        .map(([genre]) => genre);

    for (const curGenre of genreOrder) {
        answer.push(playsInfo[curGenre][0].index);

        if (playsInfo[curGenre][1]) {
            answer.push(playsInfo[curGenre][1].index);
        }
    }

    return answer;
}
