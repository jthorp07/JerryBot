import { ButtonInteraction, ChatInputCommandInteraction, Snowflake } from "discord.js";
import { Queue, QueueEvent } from "./queue";
import { EventEmitter } from "node:events";
import { queueRoot } from "../database_options/firestore/db_queue_root";
import { JerryError, JerryErrorRecoverability, JerryErrorType } from "../../types/jerry_error";

export enum WCAQueue {
    CustomsNA="NA Customs",
    CustomsEU="EU Customs",
}

class QueueManager {

    private queues: Map<WCAQueue, Queue> = new Map();
    private events: EventEmitter = new EventEmitter();
    
    constructor() {
    }

    async enqueue(id: Snowflake, queue: WCAQueue, interaction: ButtonInteraction) {
        const target = this.queues.get(queue);
        if (!target) throw new Error("invalid queue");
        return await target.enqueue(id, interaction);
    }

    async dequeue(id: Snowflake, queue: WCAQueue, interaction: ButtonInteraction) {
        const target = this.queues.get(queue);
        if (!target) {
            const e = new JerryError(
                JerryErrorType.IllegalStateError,
                JerryErrorRecoverability.NonBreakingRecoverable,
                `Queue ${queue} is not active`,
            );
            return e;
        }
        return await target.dequeue(id, interaction);        
    }

    async startQueue(queue: WCAQueue, channelId: Snowflake, messageId: Snowflake, interaction: ChatInputCommandInteraction, currentSeason?: number, gameSize?: number) {
        if (this.queues.size === 0) {
            this.addListener(QueueEvent.GameOver, (gameId?: number, queueName?: WCAQueue, winningTeam?: 1 | 2) => {
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
        await newQueue.updateMessage(interaction);
        this.queues.set(queue, newQueue);
    }

    async stopQueue(queue: WCAQueue, interaction: ChatInputCommandInteraction) {
        const target = this.queues.get(queue);
        if (!target) {
            const e = new JerryError(
                JerryErrorType.IllegalStateError,
                JerryErrorRecoverability.NonBreakingRecoverable,
                `Queue ${queue} is not active`,
            );
            return e;
        } 
        await target.deleteMessage(interaction);
        await target.close(interaction);
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

    addListener(event: QueueEvent, callback: (...args: any[]) => void) {
        this.events.on(event, callback);
    }

    emit(event: QueueEvent, ...args: any[]) {
        this.events.emit(event, args);
    }
}


export const queueManager = new QueueManager();