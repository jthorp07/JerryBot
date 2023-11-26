import { Collection, Events, Snowflake, ThreadChannel, ThreadMember } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.ThreadMembersUpdate,
    handlerFactory(client, checkPerms) {
        return async (addedMembers: Collection<Snowflake, ThreadMember>, removedMembers: Collection<Snowflake, ThreadMember>, thread: ThreadChannel) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;