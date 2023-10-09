import { ActivityType, Events } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const onReadyEventHandler: IEventHandler = {
    event: Events.ClientReady,
    handlerFactory: (client) => {
        return async () => {
            client.user?.setActivity('over your Discord server!', {
                type: ActivityType.Watching,
            });
            console.log('[Bot]: Ready')
        }
    },
}

export default onReadyEventHandler;