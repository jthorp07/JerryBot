import { Events, Interaction } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.InteractionCreate,
    handlerFactory(client, checkPerms) {
        return async (interaction: Interaction) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;