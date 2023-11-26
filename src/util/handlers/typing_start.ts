import { Events, Typing } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.TypingStart,
    handlerFactory(client, checkPerms) {
        return async (typing: Typing) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;