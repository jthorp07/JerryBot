import { Events, ThreadChannel } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.ThreadCreate,
    handlerFactory(client, checkPerms) {
        return async (thread: ThreadChannel, newlyCreated: boolean) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;