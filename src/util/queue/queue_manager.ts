import { Snowflake } from "discord.js";
import { SetQueue } from "./set_queue";
import { Queue } from "./queue";

export type WCAQueue = "classic";

class QueueManager {

    private queues: Map<WCAQueue, Queue> = new Map();
    
    constructor() {
        this.queues.set("classic", new Queue());
    }

    enqueue(id: Snowflake, queue: WCAQueue) {
        const target = this.queues.get(queue);
        if (!target) throw new Error("invalid queue");
        return target.enqueue(id);
    }
}

export const queueManager = new QueueManager();
