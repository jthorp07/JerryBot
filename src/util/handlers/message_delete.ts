import { Events, Message } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.MessageDelete,
    handlerFactory(client, checkPerms) {
        return async (message: Message) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;