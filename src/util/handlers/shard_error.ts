import { Events } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.ShardError,
    handlerFactory(client, checkPerms) {
        return async (error: Error, shardId: number) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;