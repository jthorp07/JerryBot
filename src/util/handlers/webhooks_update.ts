import { Events, ForumChannel, NewsChannel, StageChannel, TextChannel, VoiceChannel } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.WebhooksUpdate,
    handlerFactory(client, checkPerms) {
        return async (channel: TextChannel|NewsChannel|VoiceChannel|StageChannel|ForumChannel) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;