import { ButtonInteraction, Snowflake } from "discord.js";
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


    constructor(queueName: string, channelId: Snowflake, gameSize?: number) {
        this.queueName = queueName;
        this.gameSize = gameSize || 10;
        this.channelId = channelId;
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
    }

    dequeue(id: Snowflake) {
        if (this.locked) throw new Error("lock");
        return this.queue.dequeue(id);
    }

    getQueue() {
        return this.queue.getQueue() as Snowflake[];
    }

    async close() {
        
    }
}