import { Collection, Events, GatewayGuildMembersChunkDispatchData, Guild, GuildMember, Snowflake } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const eventHandler: IEventHandler = {
    event: Events.GuildMembersChunk,
    handlerFactory(client, checkPerms) {
        return async (members: Collection<Snowflake, GuildMember>, guild: Guild, chunk: GatewayGuildMembersChunkDispatchData) => {
            // TODO: Implement
            return;
        }
    },
    useHandler: false
}

export default eventHandler;