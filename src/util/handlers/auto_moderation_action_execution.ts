import { AutoModerationActionExecution, Events } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.AutoModerationActionExecution,
    handlerFactory(client, checkPerms) {
        return async (actionExecution: AutoModerationActionExecution) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;