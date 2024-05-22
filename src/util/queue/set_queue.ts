import { Snowflake } from "discord.js";

/**
 * An array-based FIFO queue in which all enqueued items are unique
 */
export class SetQueue {

    private queue: Snowflake[];
    private length: number;
    private capacity: number;

    constructor(capacity?: number) {
        this.queue = [];
        this.length = 0;
        this.capacity = capacity || -1;
    }

    /**
     * Adds user to the end of the queue if they are not already in it. Returns new queue size
     * 
     * @param user Snowflake (Discord ID) of user to add
     */
    enqueue(user: Snowflake) {
        for (const queuedUser of this.queue) {
            if (user == queuedUser) throw new Error("duplicate");
        }
        if (++this.length > this.capacity || this.capacity == -1) {
            this.length--;
            throw new Error(`Capacity error: Enqueue would result in capacity over ${this.capacity}`);
        }
        this.length = this.queue.push(user);
        return this.length;
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
                return true;
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

    getQueue() {
        return this.queue;
    }
}