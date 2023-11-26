import { Events, Guild } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.GuildUpdate,
    handlerFactory(client, checkPerms) {
        return async (oldGuild: Guild, newGuild: Guild) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;