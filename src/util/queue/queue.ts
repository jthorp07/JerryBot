import { AnySelectMenuInteraction, ButtonInteraction, CategoryChannel, ChannelType, ChatInputCommandInteraction, Snowflake } from "discord.js";
import { QueueGame } from "./queue_game";
import { SetQueue } from "./set_queue";
import { WCAQueue } from "./queue_manager";
import { queueMessage } from "../../messages/queue_message";
import { JerryError, JerryErrorRecoverability, JerryErrorType } from "../../types/jerry_error";
import { metaDataManager } from "../database_options/firestore/db_meta";

export enum QueueEvent {
    Close="close",
    GameOver="game_over",
}

export class Queue {

    private queue: SetQueue;
    private queueName: WCAQueue;
    private games: Map<number, QueueGame>;
    private gameSize: number;
    private locked: boolean = false;
    private nextGameId: number = 0;
    private channelId: Snowflake;
    private messageId: Snowflake;
    private queueSeason: number | undefined;


    constructor(queueName: WCAQueue, channelId: Snowflake, messageId: Snowflake, queueSeason?: number, gameSize?: number) {
        this.queue = new SetQueue(25);
        this.games = new Map();
        this.queueName = queueName;
        this.gameSize = gameSize || 10;
        this.channelId = channelId;
        this.messageId = messageId;
        this.queueSeason = queueSeason;
    }

    /**
     * Enqueues a user in this queue if applicable
     * 
     * @param id User to enqueue
     * @param interaction Interaction
     * @returns The number of users now in the queue, or a JerryError indicating the error preventing target user from being enqueued
     */
    async enqueue(id: Snowflake, interaction: ButtonInteraction) {
        if (this.locked) {
            const e = new JerryError(
                JerryErrorType.IllegalStateError,
                JerryErrorRecoverability.BreakingRecoverable,
                `Queue ${this.queueName} is locked.`
            );
            return e;
        }
        const result = this.queue.enqueue(id);
        if (typeof result !== "number") {
            const e = new JerryError(
                JerryErrorType.InternalError,
                JerryErrorRecoverability.SeeUnderlying,
                `Error encountered enqueueing user ${id} in queue ${this.queueName}`,
                result
            )
            return e;
        }
        if (result >= this.gameSize) {
            this.locked = true;
            const players = [];
            const gameId = this.nextGameId;
            for (let i = 0; i < 10; i++) {
                const nextPlayer = this.queue.pop();
                if (!nextPlayer) {
                    const e = new JerryError(
                        JerryErrorType.IllegalStateError,
                        JerryErrorRecoverability.BreakingNonRecoverable,
                        `Queue ${this.queueName} cannot pop because it is already empty.`
                    );
                    return e;
                }
                players.push(nextPlayer);
            }
            const gameCategoryId = metaDataManager.getChannel("queue_games");
            if (!gameCategoryId) {
                const e = new JerryError(
                    JerryErrorType.IllegalStateError,
                    JerryErrorRecoverability.BreakingNonRecoverable,
                    `Queue ${this.queueName} cannot pop because the queue games channel is not set.`
                );
                return e;
            }
            const gameCategory = await interaction.guild?.channels.fetch(gameCategoryId.discordId);
            if (!(gameCategory?.type === ChannelType.GuildCategory)) {
                const e = new JerryError(
                    JerryErrorType.DiscordFailedFetchError,
                    JerryErrorRecoverability.BreakingNonRecoverable,
                    `Queue ${this.queueName} cannot pop without the queue games category channel.`
                );
                return e;
            }
            const gameChannel = await interaction.guild?.channels.create({
                type: ChannelType.GuildText,
                name: `${this.queueName.toLowerCase().replaceAll(" ", "-")}`,
                parent: gameCategory
            });
            if (!gameChannel) {

            }
            this.games.set(1, new QueueGame(players, gameId, this.queueName));
            this.nextGameId++;
            this.locked = false;
        }
        await this.updateMessage(interaction);
        return this.queue.getQueue.length;
    }

    /**
     * Dequeues User from this queue, if applicable
     * 
     * @param id User to dequeue
     * @param interaction Interaction requesting user to be dequeued
     * @returns True if target user was successfully dequeued. False if target user was not dequeued. Otherwise, an error indicating what went wrong attempting to dequeue the user.
     */
    async dequeue(id: Snowflake, interaction: ButtonInteraction) {
        if (this.locked) {
            const e = new JerryError(
                JerryErrorType.IllegalStateError,
                JerryErrorRecoverability.BreakingRecoverable,
                `Queue ${this.queueName} is locked.`
            );
            return e;
        }
        const result = this.queue.dequeue(id);
        await this.updateMessage(interaction);
        return result;
    }

    getQueue() {
        return this.queue.getQueue() as Snowflake[];
    }

    getGame(id: number) {
        const target = this.games.get(id);
        if (!target) throw new Error(`Queue ${this.queueName} does not have a game with ID ${id}.`);
        return target;
    }

    async close(interaction?: ChatInputCommandInteraction) {
        if (this.games.size > 0 && !interaction) throw new Error(`Queue ${this.queueName} cannot be closed without an interaction since it has running games`); 

        // Ensure there are no running games in the queue
        this.games.forEach(game => {
            game.forceCancel(interaction!);
        });

        // TODO: Should queued users be informed that the queue closed? Otherwise, at this point the method can return and the queue manager can delete this queue from main memory

    }

    async updateMessage(interaction: ChatInputCommandInteraction | ButtonInteraction | AnySelectMenuInteraction) {
        const channel = (await (interaction.guild?.channels.fetch(this.channelId)));
        if (!channel || !channel.isTextBased()) {
            const e = new JerryError(
                JerryErrorType.DiscordFailedFetchError,
                JerryErrorRecoverability.BreakingRecoverable,
                `Failed to fetch a text-based channel in queue ${this.queueName}.\nFetched:\n${JSON.stringify(channel)}`
            );
            return e;
        }
        const message = await channel.messages.fetch(this.messageId);
        if (!message) {
            const e = new JerryError(
                JerryErrorType.DiscordFailedFetchError,
                JerryErrorRecoverability.BreakingRecoverable,
                `Message not editable for queue ${this.queueName}.\nMessage Object:\n${JSON.stringify(message)}`
            )
            return e;
        }
        const newMessage = queueMessage(this.queueName, this.queue.getQueue(), this.queueSeason);
        return await message.edit(newMessage);
    }

    async deleteMessage(interaction: ChatInputCommandInteraction | ButtonInteraction | AnySelectMenuInteraction) {
        const channel = (await (interaction.guild?.channels.fetch(this.channelId)));
        if (!channel?.isTextBased()) {
            const e = new JerryError(
                JerryErrorType.DiscordFailedFetchError,
                JerryErrorRecoverability.BreakingRecoverable,
                `Failed to fetch a text-based channel in queue ${this.queueName}.\nFetched:\n${JSON.stringify(channel)}`
            );
            return e;
        }
        const message = await channel.messages.fetch(this.messageId);
        if (!message.deletable) {
            const e = new JerryError(
                JerryErrorType.DiscordFailedFetchError,
                JerryErrorRecoverability.BreakingRecoverable,
                `Message not deletable for queue ${this.queueName}.\nMessage:\n${JSON.stringify(message)}`
            );
            return e;
        }
        return await message.delete();
    }

    cancelGame(gameId: number, interaction: ButtonInteraction | ChatInputCommandInteraction) {
        const target = this.games.get(gameId);
        if (!target) {
            const e = new JerryError(
                JerryErrorType.IllegalStateError,
                JerryErrorRecoverability.BreakingRecoverable,
                `Queue ${this.queueName} does not have an active game with ID ${gameId}.`
            );
            return e;
        }
        target.forceCancel(interaction);
        return this.games.delete(gameId);
    }

    voteCancel(gameId: number, interaction: ButtonInteraction) {
        const target = this.games.get(gameId);
        if (!target) throw new Error(`Queue ${this.queueName} does not have an active game with ID ${gameId}`);
        target.voteCancel(interaction.user.id, interaction);
    }
}