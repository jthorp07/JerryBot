import { AnySelectMenuInteraction, ButtonInteraction, ChatInputCommandInteraction, Interaction, Snowflake } from "discord.js";
import { QueueGame } from "./queue_game";
import { SetQueue } from "./set_queue";
import { WCAQueue, addQueueListener } from "./queue_manager";

export enum QueueEvent {
    Close="close",
    GameOver="game_over",
}

export class Queue {

    private queue: SetQueue = new SetQueue();
    private queueName: string;
    private games: Map<number, QueueGame> = new Map();
    private gameSize: number;
    private locked: boolean = false;
    private nextGameId: number = 0;
    private channelId: Snowflake;
    private messageId: Snowflake;


    constructor(queueName: string, channelId: Snowflake, messageId: Snowflake, gameSize?: number) {
        this.queueName = queueName;
        this.gameSize = gameSize || 10;
        this.channelId = channelId;
        this.messageId = messageId;
    }

    enqueue(id: Snowflake, interaction: ButtonInteraction) {
        if (this.locked) throw new Error("lock");
        const result = this.queue.enqueue(id);
        if (result >= this.gameSize) {
            this.locked = true;
            const players = [];
            const gameId = this.nextGameId;
            for (let i = 0; i < 10; i++) {
                const nextPlayer = this.queue.pop();
                if (!nextPlayer) throw new Error("queue empty");
                players.push(nextPlayer);
            }
            this.games.set(1, new QueueGame(players, gameId, this.queueName));
            this.nextGameId++;
            this.locked = false;
        }
        this.updateMessage(interaction);
    }

    dequeue(id: Snowflake) {
        if (this.locked) throw new Error("lock");
        return this.queue.dequeue(id);
    }

    getQueue() {
        return this.queue.getQueue() as Snowflake[];
    }

    getGame(id: number) {
        const target = this.games.get(id);
        if (!target) throw new Error(`Queue ${this.queueName} does not have a game with ID ${id}.`);
        return target;
    }

    async close() {
        
    }

    async updateMessage(interaction: ChatInputCommandInteraction | ButtonInteraction | AnySelectMenuInteraction) {
        const channel = (await (interaction.guild?.channels.fetch(this.channelId)));
        if (!channel?.isTextBased()) {
            throw new Error(`Failed to fetch a text-based channel in queue ${this.queueName}.\nFetched:\n${JSON.stringify(channel)}`);
        }
        const message = await channel.messages.fetch(this.messageId);
        if (!message.editable) {
            throw new Error(`Message not editable for queue ${this.queueName}.\nMessage:\n${JSON.stringify(message)}`);
        }
    }

    cancelGame(gameId: number, interaction: ButtonInteraction | ChatInputCommandInteraction) {
        const target = this.games.get(gameId);
        if (!target) throw new Error(`Queue ${this.queueName} does not have an active game with ID ${gameId}.`);
        target.forceCancel(interaction);
    }

    voteCancel(gameId: number, interaction: ButtonInteraction) {
        const target = this.games.get(gameId);
        if (!target) throw new Error(`Queue ${this.queueName} does not have an active game with ID ${gameId}`);
        target.voteCancel(interaction.user.id, interaction);
    }
}