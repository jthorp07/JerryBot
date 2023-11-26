import { ActivityType, Events } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.ClientReady,
    handlerFactory: (client) => {
        return async () => {
            client.user?.setActivity('over your Discord server!', {
                type: ActivityType.Watching,
            });
            console.log('[Bot]: Ready')
        }
    },
    useHandler: true,
}

export default eventHandler;