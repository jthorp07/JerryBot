import { ButtonInteraction, ChatInputCommandInteraction, Snowflake } from "discord.js";
import { QueueEvent } from "./queue";
import { FirebaseUserMmrLegacy, mmrManager } from "../database_options/firestore/db_queue_stats";
import { emitToQueue } from "./queue_manager";

export type QueuePlayer = {
    discordId: Snowflake;
    mmr: number;
}

const MatchmakingConfig = {
    maxSwaps: 20,
    minSwaps: 5,
    balancedThreshold: 100
} as const;

export class QueueGame {

    private id: number;
    private players: Snowflake[];
    private teamOne: QueuePlayer[] = [];
    private teamTwo: QueuePlayer[] = [];
    private cancelVotes: Snowflake[] = [];
    private winVotes: Snowflake[] = [];
    private teamOneVotes: number = 0;
    private queueName: string;

    constructor(players: Snowflake[], id: number, queueName: string) {
        this.id = id;
        this.players = players;
        this.queueName = queueName;
    }

    async init(interaction: ButtonInteraction | ChatInputCommandInteraction) {
        await this.makeTeams(this.players, interaction);
    }

    private async makeTeams(members: Snowflake[], interaction: ButtonInteraction | ChatInputCommandInteraction) {
        const players: FirebaseUserMmrLegacy[] = [];
        const promises = [];
        for (const id of members) {
            promises.push((async () => {
                const player = await mmrManager.getUser(id);
                if (!player) throw new Error("player does not exist");
                players.push(player);
            }).call(this));
        }
        await Promise.all(promises).catch(err => {
            console.error(err);
            this.cancel(interaction);
            return;
        });

        players.sort((a, b) => {
            return a.mmr - b.mmr;
        });

        // Zipper sorted players into teams
        for (let i = 0; i < players.length; i++) {
            const player: QueuePlayer = { discordId: players[i].discordId, mmr: players[i].mmr };
            if ((i % 2) === 0) {
                this.teamOne.push(player);
            } else {
                this.teamTwo.push(player);
            }
        }

        /*
            Algorithm:
                - Calculate both teams' avg mmr
                - Select players for swap that would move teams' avg mmr difference closest to zero
                - 

         */
        if (this.teamOne.length !== this.teamTwo.length || this.teamOne.length === 0) throw new Error(`Game ${this.id} in queue ${this.queueName} does not have equal size teams.`);
        const teamSize = this.teamOne.length;
        let swaps = 0;
        let t1_lastSwap = -1;
        let t2_lastSwap = -1;
        while (swaps < MatchmakingConfig.maxSwaps) {
            let t1_avg = 0;
            let t2_avg = 0;
            let avg_diff = 0;

            // Avg calc
            for (let i = 0; i < teamSize; i++) {
                t1_avg += this.teamOne[i].mmr;
                t2_avg += this.teamTwo[i].mmr;
            }
            t1_avg = t1_avg / teamSize;
            t2_avg = t2_avg / teamSize;
            avg_diff = t1_avg - t2_avg;

            // Choose swaps
            let leastNewDifference = avg_diff;
            let t1_swappee: number | undefined;
            let t2_swappee: number | undefined;
            for (let i = 0; i < teamSize; i++) {
                const teamOnePlayer = this.teamOne[i];
                for (let j = 0; j < teamSize; j++) {
                    if (i === t2_lastSwap && j === t1_lastSwap) continue; // Skip this combination if they were the last two to get swapped
                    const teamTwoPlayer = this.teamTwo[j];

                    const delta = this.deltaDifference(teamOnePlayer.mmr, teamTwoPlayer.mmr, avg_diff, teamSize);
                    if (Math.abs(delta) < Math.abs(leastNewDifference)) {
                        leastNewDifference = delta;
                        t1_swappee = i;
                        t2_swappee = j;
                    }
                }
            }

            if (!t1_swappee || !t2_swappee) {
                break; // In the future, maybe improve the algorithm by allowing a least unbalancing swap to see if future swaps can be better balanced afterward?
            }

            swaps++;
            t1_lastSwap = t1_swappee;
            t2_lastSwap = t2_swappee;
            let temp = this.teamOne[t1_swappee];
            this.teamOne[t1_swappee] = this.teamTwo[t2_swappee];
            this.teamTwo[t2_swappee] = temp;

            const hasDoneMaxSwaps = swaps >= MatchmakingConfig.maxSwaps;
            const hasDoneMinSwaps = swaps >= MatchmakingConfig.minSwaps;
            const isWithinBalanceThreshold = leastNewDifference < MatchmakingConfig.balancedThreshold;

            if (hasDoneMaxSwaps || (isWithinBalanceThreshold && hasDoneMinSwaps)) break;
        }

        // Pop game message

    }

    private deltaDifference(swappeeOne: number, swappeeTwo: number, avg_diff: number, teamSize: number) {
        return avg_diff - ((2 * swappeeOne) / teamSize) + ((2 * swappeeTwo) / teamSize);
    }

    private async cancel(interaction: ButtonInteraction | ChatInputCommandInteraction) {
        emitToQueue(QueueEvent.GameOver, this.id);
    }

    async emitEndGame(winningTeam: 1 | 2) {
        emitToQueue(QueueEvent.GameOver, this.id, this.queueName, winningTeam);
    }

    getId() {
        return this.id;
    }

    voteWin(id: Snowflake, team: 1 | 2) {
        if (!this.winVotes.includes(id)) {
            this.winVotes.push(id);
            team === 1 ? this.teamOneVotes++ : null;
        }
        if (this.winVotes.length > 5) {
            this.emitEndGame(this.teamOneVotes > 5 ? 1 : 2)
        }
    }

    voteCancel(id: Snowflake, interaction: ButtonInteraction | ChatInputCommandInteraction) {
        if (!this.cancelVotes.includes(id)) this.cancelVotes.push(id);
        if (this.cancelVotes.length >= 5) this.cancel(interaction);
    }

    forceCancel(interaction: ButtonInteraction | ChatInputCommandInteraction) {
        this.cancel(interaction);
    }
}