import { Collection, Events, GuildTextBasedChannel, Message, Snowflake } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.MessageBulkDelete,
    handlerFactory(client, checkPerms) {
        return async (messages: Collection<Snowflake, Message>, channel: GuildTextBasedChannel) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;