import { Events, StageInstance } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.StageInstanceCreate,
    handlerFactory(client, checkPerms) {
        return async (stageInstance: StageInstance) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;