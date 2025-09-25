import { ActivityType, Events } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.ClientReady,
    handlerFactory: (client) => {
        return async () => {
            client.user?.setActivity('VALORANT with w0rthyTV\'s awesome coaching!', {
                type: ActivityType.Competing,
            });
            console.log('[Bot]: Ready')
        }
    },
    useHandler: true,
}

export default eventHandler;