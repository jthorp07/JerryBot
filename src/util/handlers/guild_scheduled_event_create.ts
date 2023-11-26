import { Events, GuildScheduledEvent } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.GuildScheduledEventCreate,
    handlerFactory(client, checkPerms) {
        return async (event: GuildScheduledEvent) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;