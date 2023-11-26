import { Events } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.Error,
    handlerFactory(client, checkPerms) {
        return async (error: Error) => {
            // TODO: Implement
            console.error(`[Error]: ${error.name}  -  ${error.message}`)
            return;
        }
    },
    useHandler: true
}

export default eventHandler;