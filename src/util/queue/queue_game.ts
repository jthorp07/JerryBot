import { AnySelectMenuInteraction, ButtonInteraction, ChatInputCommandInteraction, Snowflake } from "discord.js";
import { FirebaseUserMmrLegacy, mmrManager } from "../database_options/firestore/db_queue_stats";
import { WCAQueue, queueManager } from "./queue_manager";
import { gameMessage } from "../../messages/game_message";
import { JerryError, JerryErrorRecoverability, JerryErrorType } from "../../types/jerry_error";

export type QueuePlayer = {
    discordId: Snowflake;
    mmr: number;
}

export enum QueueGameStatus {
    WaitingForPlayers = "Waiting for players",
    PregameVoting = "Pre-Game Votes",
    InGame = "In Game",

}

const MatchmakingConfig = {
    maxSwaps: 20,
    minSwaps: 5,
    balancedThreshold: 100
} as const;

export class QueueGame {

    private id: number;
    private players: Snowflake[];
    private channelId: Snowflake;
    private messageId: Snowflake;
    private status: QueueGameStatus = QueueGameStatus.WaitingForPlayers;
    private teamOne: QueuePlayer[] = [];
    private teamTwo: QueuePlayer[] = [];
    private cancelVotes: Snowflake[] = [];
    private winVotes: Snowflake[] = [];
    private teamOneVotes: number = 0;
    private queueName: WCAQueue;

    constructor(players: Snowflake[], id: number, queueName: WCAQueue, channelId: Snowflake, messageId: Snowflake) {
        this.id = id;
        this.players = players;
        this.queueName = queueName;
        this.channelId = channelId;
        this.messageId = messageId;
    }

    /**
     * 
     * @param interaction 
     */
    async init(interaction: ButtonInteraction | ChatInputCommandInteraction) {
        await this.makeTeams(this.players, interaction);
    }


    async updateMessage(interaction: ChatInputCommandInteraction | ButtonInteraction | AnySelectMenuInteraction) {

        const channel = await interaction.guild?.channels.fetch(this.channelId);
        if (!channel) {
            const e = new JerryError(
                JerryErrorType.DiscordFailedFetchError,
                JerryErrorRecoverability.BreakingNonRecoverable,
                `Game ${this.id} in queue ${this.queueName} failed to fetch channel ${this.channelId}.`
            );
            return e;
        }
        if (!channel.isTextBased()) {
            const e = new JerryError(
                JerryErrorType.IllegalStateError,
                JerryErrorRecoverability.BreakingNonRecoverable,
                `Channel ${this.channelId} is not text-based for game ${this.id} in queue ${this.queueName}.`
            );
            return e;
        }
        const message = await channel.messages.fetch(this.messageId);
        if (!message) {
            const e = new JerryError(
                JerryErrorType.DiscordFailedFetchError,
                JerryErrorRecoverability.BreakingNonRecoverable,
                `Game ${this.id} in queue ${this.queueName} failed to fetch message ${this.messageId}.`
            );
            return e;
        }
        const newMessage = gameMessage(this.queueName, this.queueName, this.id, this.teamOne, this.teamTwo, this.status);
        if (newMessage instanceof JerryError) {
            const e = new JerryError(
                JerryErrorType.InternalError,
                JerryErrorRecoverability.SeeUnderlying,
                `Game ${this.id} in queue ${this.queueName} failed to create new message payload`,
                newMessage
            );
            return e;
        }
        try {
            return await message.edit(newMessage);
        } catch (err) {
            return new JerryError(
                JerryErrorType.DiscordAPIError,
                JerryErrorRecoverability.SeeUnderlying,
                `Game ${this.id} in queue ${this.queueName} failed to edit message.`,
                err instanceof Error ? err : new Error("How did we get here?")
            );
        }
    }


    async deleteMessage(interaction: ChatInputCommandInteraction | ButtonInteraction | AnySelectMenuInteraction) {
        const channel = await interaction.guild?.channels.fetch(this.channelId);
        if (!channel) {
            const e = new JerryError(
                JerryErrorType.DiscordFailedFetchError,
                JerryErrorRecoverability.BreakingNonRecoverable,
                `Game ${this.id} in queue ${this.queueName} failed to fetch channel ${this.channelId}.`
            );
            return e;
        }
        if (!channel.isTextBased()) {
            const e = new JerryError(
                JerryErrorType.IllegalStateError,
                JerryErrorRecoverability.BreakingNonRecoverable,
                `Channel ${this.channelId} is not text-based for game ${this.id} in queue ${this.queueName}.`
            );
            return e;
        }
        const message = await channel.messages.fetch(this.messageId);
        if (!message) {
            const e = new JerryError(
                JerryErrorType.DiscordFailedFetchError,
                JerryErrorRecoverability.BreakingNonRecoverable,
                `Game ${this.id} in queue ${this.queueName} failed to fetch message ${this.messageId}.`
            );
            return e;
        }
        try {
            const result = await message.delete();
            await channel.delete();
            return result;
        } catch (err) {
            return new JerryError(
                JerryErrorType.DiscordAPIError,
                JerryErrorRecoverability.SeeUnderlying,
                `Game ${this.id} in queue ${this.queueName} failed to edit message.`,
                err instanceof Error ? err : new Error("How did we get here?")
            );
        }
    }


    async endGame(winningTeam: 1 | 2, interaction: ButtonInteraction) {
        //TODO: Team win logic
        const promises: Promise<any>[] = [];
        for (let i = 0; i < 5; i++) {
            promises.push()
        }

    }

    getId() {
        return this.id;
    }

    async voteWin(id: Snowflake, team: 1 | 2, interaction: ButtonInteraction) {
        if (!this.winVotes.includes(id)) {
            this.winVotes.push(id);
            team === 1 ? this.teamOneVotes++ : null;
        }
        if (this.winVotes.length > 5) {
            await this.endGame(this.teamOneVotes > 5 ? 1 : 2, interaction);
        }
    }

    voteCancel(id: Snowflake, interaction: ButtonInteraction | ChatInputCommandInteraction) {
        if (!this.cancelVotes.includes(id)) this.cancelVotes.push(id);
        if (this.cancelVotes.length >= 5) this.cancel(interaction);
    }

    forceCancel(interaction: ButtonInteraction | ChatInputCommandInteraction) {
        this.cancel(interaction);
    }
    private async makeTeams(members: Snowflake[], interaction: ButtonInteraction | ChatInputCommandInteraction) {
        const players: FirebaseUserMmrLegacy[] = [];
        const promises = [];
        for (const id of members) {
            promises.push((async () => {
                const player = await mmrManager.legacy_getUser(id);
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
        queueManager.deleteGame(this.queueName, this.id, interaction);
    }


}