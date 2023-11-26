import { Events, MessageReaction, User } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.MessageReactionAdd,
    handlerFactory(client, checkPerms) {
        return async (reaction: MessageReaction, user: User) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;