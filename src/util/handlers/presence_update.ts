import { Events, Presence } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.PresenceUpdate,
    handlerFactory(client, checkPerms) {
        return async (oldPresence: Presence|undefined, newPresence: Presence) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;