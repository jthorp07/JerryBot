import { Events } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.ShardReconnecting,
    handlerFactory(client, checkPerms) {
        return async (id: number) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;