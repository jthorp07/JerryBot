import { Events, GuildMember } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const PATREON_ROLE_ID = "1152001445390983218" as const;

const eventHandler: IEventHandler = {
    event: Events.GuildMemberAdd,
    handlerFactory(client, checkPerms) {
        return async (member: GuildMember) => {
            if (member.guild.id === process.env.PATREON_SERVER) {
                const mainGuild = await client.guilds.fetch(process.env.WORTHY_SERVER || "");
                const mainGuildMember = await mainGuild.members.fetch(member.id);
                await mainGuildMember.roles.add(PATREON_ROLE_ID);
                console.log(`[Bot]: Patreon role added to new Patreon member ${member.id}`);
            }
            return;
        }
    },
    useHandler: true
}

export default eventHandler;