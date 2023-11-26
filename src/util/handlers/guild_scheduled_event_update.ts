import { Events, GuildScheduledEvent } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.GuildScheduledEventUpdate,
    handlerFactory(client, checkPerms) {
        return async (oldEvent: GuildScheduledEvent, newEvent: GuildScheduledEvent) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;