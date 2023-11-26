import { Events, TextBasedChannel } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.ChannelPinsUpdate,
    handlerFactory(client, checkPerms) {
        return async (channel: TextBasedChannel, time: Date) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;