import { Events, ThreadChannel } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.ThreadUpdate,
    handlerFactory(client, checkPerms) {
        return async (oldThread: ThreadChannel, newThread: ThreadChannel) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;