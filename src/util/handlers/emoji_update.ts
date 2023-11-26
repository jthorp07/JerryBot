import { Events, GuildEmoji } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.GuildEmojiUpdate,
    handlerFactory(client, checkPerms) {
        return async (oldEmoji: GuildEmoji, newEmoji: GuildEmoji) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;