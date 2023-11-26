import { Events, GuildMember } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.GuildMemberUpdate,
    handlerFactory(client, checkPerms) {
        return async (oldMember: GuildMember, newMember: GuildMember) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;