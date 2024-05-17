import { ButtonInteraction, ChatInputCommandInteraction, Snowflake } from "discord.js";
import { Queue, QueueEvent } from "./queue";
import { EventEmitter } from "node:events";
import { queueRoot } from "../database_options/firestore/db_queue_root";

export enum WCAQueue {
    CustomsNA="NA Customs",
    CustomsEU="EU Customs",
}

class QueueManager extends EventEmitter {

    private queues: Map<WCAQueue, Queue> = new Map();
    
    constructor() {
        super();
    }

    async enqueue(id: Snowflake, queue: WCAQueue, interaction: ButtonInteraction) {
        const target = this.queues.get(queue);
        if (!target) throw new Error("invalid queue");
        return await target.enqueue(id, interaction);
    }

    async dequeue(id: Snowflake, queue: WCAQueue, interaction: ButtonInteraction) {
        const target = this.queues.get(queue);
        if (!target) throw new Error("invalid queue");
        return await target.dequeue(id, interaction);        
    }

    async startQueue(queue: WCAQueue, channelId: Snowflake, messageId: Snowflake, interaction: ChatInputCommandInteraction, currentSeason?: number, gameSize?: number) {
        if (this.queues.size === 0) {
            addQueueListener(QueueEvent.GameOver, (gameId?: number, queueName?: WCAQueue, winningTeam?: 1 | 2) => {
                if (!gameId || !queueName) {
                    throw new Error(`Event ${QueueEvent.GameOver} requires callback parameters 'gameId' {number} and 'queueName' {WCAQueue}`);
                }
                const queue = this.queues.get(queueName);
                if (!queue) {
                    throw new Error(`Event ${QueueEvent.GameOver} was supplied an inactive queue`);
                }
                console.log(`Game ${gameId} in queue ${queueName} ended. Result was ${winningTeam ? `team ${winningTeam} won` : "cancellation"}.`);
            });
        }
        const target = this.queues.get(queue);
        if (target) throw new Error(`Queue ${queue} is already active`);
        const newQueue = new Queue(queue, channelId, messageId, currentSeason, gameSize);
        await newQueue.updateMessage(interaction)
        this.queues.set(queue, newQueue);
    }

    async stopQueue(queue: WCAQueue, interaction: ChatInputCommandInteraction) {
        const target = this.queues.get(queue);
        if (!target) throw new Error(`Queue ${queue} is not active`);
        await target.deleteMessage(interaction);
        await target.close(interaction);
        await queueRoot.deactivateQueue(queue);
        this.queues.delete(queue);
    }

    cancelGame(queue: WCAQueue, gameId: number, interaction: ButtonInteraction | ChatInputCommandInteraction) {
        const target = this.queues.get(queue);
        if (!target) throw new Error(`Queue ${queue} is not active`);
        target.cancelGame(gameId, interaction);
    }

    voteCancel(queue: WCAQueue, gameId: number, interaction: ButtonInteraction) {
        const target = this.queues.get(queue);
        if (!target) throw new Error(`Queue ${queue} is not active`);
        target.voteCancel(gameId, interaction);
    }
}


export const queueManager = new QueueManager();
export const emitToQueue = queueManager.emit;
export const addQueueListener = queueManager.on;
export const removeQueueListener = queueManager.removeAllListeners;