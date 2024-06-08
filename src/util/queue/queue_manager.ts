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

    /**
     * Enqueues a user in one of the queues managed by this instance if applicable
     * 
     * @param id User to enqueue
     * @param queue Queue to enqueue the user in
     * @param interaction Interaction requesting the enqueue
     * @returns The number of users now in the queue or an error indicating why target user could not be enqueued
     */
    async enqueue(id: Snowflake, queue: WCAQueue, interaction: ButtonInteraction) {
        const target = this.queues.get(queue);
        if (!target) {
            const e = new JerryError(
                JerryErrorType.IllegalStateError,
                JerryErrorRecoverability.BreakingRecoverable,
                `Queue ${queue} is not active.`
            );
            return e;
        }
        return await target.enqueue(id, interaction);
    }

    /**
     * Dequeues a user in one of the queues managed by this instance if applicable
     * 
     * @param id User to dequeue
     * @param queue Queue to dequeue the user in
     * @param interaction Interaction requesting the dequeue
     * @returns True if target user was successfully dequeued. False if target user was not dequeued. Otherwise, an error indicating what went wrong attempting to dequeue the user.
     */
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

    /**
     * Starts up a queue in process memory
     * 
     * @param queue Queue to start
     * @param channelId Id of the Discord channel the queue's message is in
     * @param messageId Id of the queue's Discord message
     * @param interaction Interaction requesting the queue start
     * @param currentSeason The queue's current season
     * @param gameSize The size of a game in this queue
     * @returns An error if one occurs
     */
    async startQueue(queue: WCAQueue, channelId: Snowflake, messageId: Snowflake, interaction: ChatInputCommandInteraction, currentSeason?: number, gameSize?: number) {

        const target = this.queues.get(queue);
        if (target) {
            const e = new JerryError(
                JerryErrorType.InternalError, 
                JerryErrorRecoverability.NonBreakingRecoverable, 
                `Queue ${queue} is already active`
            );
            return e;
        } 
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

    /**
     * 
     * 
     * @param queue 
     * @param gameId 
     * @param interaction 
     */
    deleteGame(queue: WCAQueue, gameId: number, interaction: ButtonInteraction | ChatInputCommandInteraction) {
        const target = this.queues.get(queue);
        if (!target) throw new Error(`Queue ${queue} is not active`);
        target.cancelGame(gameId, interaction);
    }

    voteCancel(queue: WCAQueue, gameId: number, interaction: ButtonInteraction) {
        const target = this.queues.get(queue);
        if (!target) {
            const e = new JerryError(
                JerryErrorType.IllegalStateError,
                JerryErrorRecoverability.BreakingRecoverable,
                `Queue ${queue} is not active`
            );
            return e;
        }
        target.voteCancel(gameId, interaction);
    }

    // For now, no events here

    // addListener(event: QueueEvent, callback: (...args: any[]) => void) {
    //     this.events.on(event, callback);
    // }

    // emit(event: QueueEvent, ...args: any[]) {
    //     this.events.emit(event, args);
    // }
}


export const queueManager = new QueueManager();