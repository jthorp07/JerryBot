import { Events, Role } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.GuildRoleUpdate,
    handlerFactory(client, checkPerms) {
        return async (oldRole: Role, newRole: Role) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;