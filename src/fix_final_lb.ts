import { Snowflake } from "discord.js";
import { __getLeaderboardUser, __updateUserOnLeaderboard, getLeaderboard } from "./util/database_options/firestore/db_leaderboard";
import { getUserByDiscordId } from "./util/database_options/firestore/db_mmr";
import { NeatQueueApiLeaderboardUser, getLastSeason } from "./util/neatqueue/neatqueue";

const currentLbMap = new Map<Snowflake, NeatQueueApiLeaderboardUser>()

getLastSeason('1180382139712286791', '710741097126821970').then(async (nqLb) => {
    for (const user of nqLb.alltime) {
        currentLbMap.set(user.id, user);
    }
    getLeaderboard().then(async (lb) => {
        lb.forEach(async (user) => {
            const discordId = user.discordId;
            const overall = await getUserByDiscordId(discordId);
            const currentLbPos = currentLbMap.get(discordId);
            if (discordId == '957396902964523008') {
                console.log(`Overall: ${overall?.gamesPlayed || 0}\nCurrent: ${currentLbPos?.data.totalgames || 0}`);
            }
            if (!overall) return;
            let oldGamesPlayed = 0;
            if (!currentLbPos) {
                oldGamesPlayed = overall.gamesPlayed;
            } else {
                oldGamesPlayed = overall.gamesPlayed - (currentLbPos.data.wins + currentLbPos.data.losses);
            }
            const result = await __updateUserOnLeaderboard(discordId, oldGamesPlayed);
            console.log(`${result ? "Success" : "Fail"}`);
        });
    });
});