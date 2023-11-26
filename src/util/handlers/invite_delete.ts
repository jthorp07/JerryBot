import { Events, Invite } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.InviteDelete,
    handlerFactory(client, checkPerms) {
        return async (invite: Invite) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;