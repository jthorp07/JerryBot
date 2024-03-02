import { Snowflake } from "discord.js";
import { SetQueue } from "./set_queue";
import { QueueGame } from "./queue_game";

export type WCAQueue = "classic";
const queues = new Map<WCAQueue, SetQueue>();
queues.set("classic", new SetQueue());

export function enqueue(queue: WCAQueue, user: Snowflake) {
    const result = queues.get(queue)?.enqueue(user);
}

class QueueManager {

    private queues: Map<WCAQueue, SetQueue> = new Map();
    private games: Map<WCAQueue, QueueGame[]> = new Map();

    constructor() {
        this.queues.set("classic", new SetQueue())
    }

}

export const queueManager = new QueueManager();
