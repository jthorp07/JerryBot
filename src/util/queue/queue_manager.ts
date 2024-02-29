import { Snowflake } from "discord.js";
import { SetQueue } from "./set_queue";

export type WCAQueue = "classic";
const queues = new Map<WCAQueue, SetQueue>();
queues.set("classic", new SetQueue());

export function enqueue(queue: WCAQueue, user: Snowflake) {
    const result = queues.get(queue)?.enqueue(user);
}

