import { Events, GuildMember } from "discord.js";
import { IEventHandler } from "../../types/event_handler";

const WcaPatreonRoleId = "1152001445390983218" as const;
const PatreonServerRoleIds = [] as const;

const eventHandler: IEventHandler = {
    event: Events.GuildMemberUpdate,
    handlerFactory(client, checkPerms) {
        return async (oldMember: GuildMember, newMember: GuildMember) => {
            // If user is given a new patreon role in patreon server
            if (oldMember.guild.id === process.env.PATREON_SERVER && newMember.roles.cache.size > oldMember.roles.cache.size) {

                // Determine if newMember's new role is a patreon server role

                // If has new patreon role: Fetch member from WCA server

                // Add patreon role to WCA member

            }

            // If user loses a patreon role in the patreon server
            if (oldMember.guild.id === process.env.PATREON_SERVER && newMember.roles.cache.size < oldMember.roles.cache.size) {

                // Determine if oldMember's lost role is a patreon server role

                // If has lost patreon role: Fetch member from WCA server

                // Remove patreon role to WCA member
            }
        }
    },
    useHandler: false
}

export default eventHandler;