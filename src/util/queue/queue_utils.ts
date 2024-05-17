import { Snowflake } from "discord.js";
import { UserQueueStats } from "../database_options/firestore/db_queue_stats";

const GAMES_PLAYED_DECOUPLE_THRESHOLD = 10 as const;

export function endOfSeasonCalculations (userStats: UserQueueStats[]) {
    
    let finalStats = [];
    let newlyDecoupled: Snowflake[] = [];
    for (const user of userStats) {

        // Final score and MMR adjustment calculations
        const oldMmr = user.initialMmr;
        const deltaMmr = user.mmr - oldMmr;
        const finalScore = leaderboardScore(oldMmr, deltaMmr);
        const newMmr = mmrAdjustment(oldMmr, deltaMmr);
        let newStats = {
            newMmr: newMmr,
            finalScore: finalScore,
            discordId: user.discordId,
            decoupled: user.decoupled,
            newlyDecoupled: false,
            gamesPlayed: user.gamesPlayed,
        }
        
        // Decoupling calculations
        if (!user.decoupled) {
            if (user.gamesPlayedAllTime + user.gamesPlayed >= GAMES_PLAYED_DECOUPLE_THRESHOLD) {
                newStats.newlyDecoupled = true;
                newStats.decoupled = true;
            }
        }

        finalStats.push(newStats);
    }
    return {
        finalStats: finalStats,
        newlyDecoupled: newlyDecoupled,
    };
}


export function mmrAdjustment (oldMmr: number, deltaMmr: number) {
    return oldMmr + (deltaMmr / Math.max(2, Math.log2(Math.abs(deltaMmr))));
}


export function leaderboardScore (oldMmr: number, deltaMmr: number) {
    return (deltaMmr * (deltaMmr < 0 ? 1 - (oldMmr / 10000) : 1 + (oldMmr / 10000))).toFixed(2) as unknown as number
}