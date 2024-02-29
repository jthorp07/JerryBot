import { Snowflake } from "discord.js";
import { EventEmitter } from "events";

type SetQueueEvent = "match_full" | "empty" | "full" | "subscribe" | "unsubscribe";
type QueueResult = "at_capacity" | "duplicate" | "success"

/**
 * An array-based FIFO queue in which all enqueued items are unique
 */
export class SetQueue {

    private queue: Snowflake[];
    private length: number;
    private capacity: number;
    private subscribers: unknown[];
    private eventEmitter: EventEmitter;
    private lock: boolean;

    constructor(capacity?: number) {
        this.queue = [];
        this.length = 0;
        this.capacity = capacity || -1;
        this.subscribers = [];
        this.eventEmitter = new EventEmitter();
        this.lock = false;
    }

    /**
     * Adds user to the end of the queue if they are not already in it. Returns true upon success, false upon failure.
     * 
     * @param user Snowflake (Discord ID) of user to add
     */
    enqueue(user: Snowflake) {
        for (const queuedUser of this.queue) {
            if (user == queuedUser) return "duplicate" as QueueResult;
        }
        if (++this.length > this.capacity) {
            this.length--;
            return "at_capacity" as QueueResult;
        }
        this.length = this.queue.push(user);
        return 0;
    }

    /**
     * Removes user from the queue. Returns true if a user was removed, false otherwise.
     * 
     * @param user Snowflake (Discord ID) of user to remove
     */
    dequeue(user: Snowflake) {
        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i] == user) {
                this.queue.splice(i, 1);
                this.length--;
                return 0;
            }
        }
        return false;
    }

    /**
     * Pops the queue, removing and returning the first item in the queue according to first-in-first-out rules
     * 
     * @returns The first user in the queue or false if the queue is empty
     */
    pop() {
        if (--this.length >= 0) {
            return this.queue.splice(0,1)[0];
        } else {
            this.length++;
            return false;
        }
    }

    on(event: SetQueueEvent, callback: ((...args: any[]) => void | Promise<void>)) {
        this.eventEmitter.on(event, callback);
    }

    subscribe(subscriber: unknown) {

    }

    unsubscribe(subscriber: unknown) {

    }
    
}