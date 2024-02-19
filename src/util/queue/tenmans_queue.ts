import { Snowflake } from "discord.js";


/**
 * An array-based FIFO queue in which all enqueued items are unique
 */
class SetQueue {
    queue: Snowflake[];
    length: number;
    capacity: number;
    subscribers: unknown[];

    constructor(capacity?: number) {
        this.queue = [];
        this.length = 0;
        this.capacity = capacity || -1;
        this.subscribers = [];
    }

    /**
     * Adds user to the end of the queue if they are not already in it. Returns true upon success, false upon failure.
     * 
     * @param user Snowflake (Discord ID) of user to add
     */
    enqueue(user: Snowflake) {
        for (const queuedUser of this.queue) {
            if (user == queuedUser) return false;
        }
        this.length = this.queue.push(user);
        return true;
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

    subscribe(subscriber: unknown) {

    }

    unsubscribe(subscriber: unknown) {

    }
}

const queue = new SetQueue();

export function enqueue(user: Snowflake) {
    return queue.enqueue(user);
}

export function dequeue(user: Snowflake) {
    return queue.dequeue(user);
}

export function pop() {
    return queue.pop();
}