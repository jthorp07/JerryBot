import { Collection, Events, Message, MessageReaction, Snowflake } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.MessageReactionRemoveAll,
    handlerFactory(client, checkPerms) {
        return async (message: Message, reactions: Collection<string|Snowflake, MessageReaction>) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;