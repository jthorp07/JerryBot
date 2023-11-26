import { Events, GuildScheduledEvent, User } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.GuildScheduledEventUserAdd,
    handlerFactory(client, checkPerms) {
        return async (event: GuildScheduledEvent, user: User) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;