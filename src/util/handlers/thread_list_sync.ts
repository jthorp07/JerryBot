import { Collection, Events, Guild, Snowflake, ThreadChannel } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.ThreadListSync,
    handlerFactory(client, checkPerms) {
        return async (threads: Collection<Snowflake, ThreadChannel>, guild: Guild) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;