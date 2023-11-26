import { Events, StageInstance } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.StageInstanceUpdate,
    handlerFactory(client, checkPerms) {
        return async (oldStageInstance: StageInstance|undefined, newStageInstance: StageInstance) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;