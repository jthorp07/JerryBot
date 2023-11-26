import { DMChannel, Events, GuildChannel } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.ChannelDelete,
    handlerFactory(client, checkPerms) {
        return async (channel: GuildChannel | DMChannel) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;