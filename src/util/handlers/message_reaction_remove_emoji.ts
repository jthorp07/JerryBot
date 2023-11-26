import { Events, MessageReaction } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.MessageReactionRemoveEmoji,
    handlerFactory(client, checkPerms) {
        return async (reaction: MessageReaction) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;