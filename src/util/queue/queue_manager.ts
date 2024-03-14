import { ButtonInteraction, Snowflake } from "discord.js";
import { Queue, QueueEvent } from "./queue";
import { EventEmitter } from "node:events";

export enum WCAQueue {
    CustomsNA="na_customs",
    CustomsEU="eu_customs",
}

class QueueManager extends EventEmitter {

    private queues: Map<WCAQueue, Queue> = new Map();
    
    constructor() {
        super();
    }

    enqueue(id: Snowflake, queue: WCAQueue, interaction: ButtonInteraction) {
        const target = this.queues.get(queue);
        if (!target) throw new Error("invalid queue");
        return target.enqueue(id, interaction);
    }

    dequeue(id: Snowflake, queue: WCAQueue, interaction: ButtonInteraction) {
        const target = this.queues.get(queue);
        if (!target) throw new Error("invalid queue");
        return target.dequeue(id);        
    }

    startQueue(queue: WCAQueue, channelId: Snowflake) {
        if (this.queues.size === 0) {
            addQueueListener(QueueEvent.GameOver, (gameId?: number, queueName?: WCAQueue, winningTeam?: 1 | 2) => {
                if (!gameId || !queueName) {
                    throw new Error(`Event ${QueueEvent.GameOver} requires callback parameters 'gameId' {number} and 'queueName' {WCAQueue}`);
                }
                console.log(`Game ${gameId} in queue ${queueName} ended. Result was ${winningTeam ? `team ${winningTeam} won` : "cancellation"}.`);
            });
        }
        const target = this.queues.get(queue);
        if (target) target.close();
        this.queues.set(queue, new Queue(queue, channelId));
    }

    stopQueue(queue: WCAQueue) {
        const target = this.queues.get(queue);
        if (!target) return;
        return target.close().then(() => {
            this.queues.delete(queue);
            if (this.queues.size === 0) {
                removeQueueListener(QueueEvent.GameOver);
            }
            return;
        });
    }
}


export const queueManager = new QueueManager();
export const emitToQueue = queueManager.emit;
export const addQueueListener = queueManager.on;
export const removeQueueListener = queueManager.removeAllListeners;