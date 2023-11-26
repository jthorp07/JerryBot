import { Events, Sticker } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.GuildStickerCreate,
    handlerFactory(client, checkPerms) {
        return async (sticker: Sticker) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;