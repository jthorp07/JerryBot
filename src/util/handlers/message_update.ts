import { Events, Message } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.MessageUpdate,
    handlerFactory(client, checkPerms) {
        return async (oldMessage: Message, newMessage: Message) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;