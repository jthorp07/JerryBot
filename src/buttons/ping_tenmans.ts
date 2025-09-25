import { ButtonBuilder, ButtonStyle, Snowflake } from "discord.js";
import { IButton, ICommandPermission } from "../types/discord_interactions";

const wcaChannel = '1180381773176254525';
const wcaNaPingRole = '1046897930382082088';
const wcaEuPingRole = '1061374516514799646';

const patreonChannel = '1396220384998719518';
const patreonPingRole = '1396240041839296692';

const mostRecentPings = new Map<Snowflake, number>();
mostRecentPings.set(wcaNaPingRole, 0);
mostRecentPings.set(wcaEuPingRole, 0);
mostRecentPings.set(patreonPingRole, 0);

const pingChannels = new Map<Snowflake, Snowflake>();
pingChannels.set(wcaNaPingRole, wcaChannel);
pingChannels.set(wcaEuPingRole, wcaChannel);
pingChannels.set(patreonPingRole, patreonChannel);

const PING_COOLDOWN_MINUTES = 30;
const PING_COOLDOWN_MS = PING_COOLDOWN_MINUTES * 60 * 1000;

const customId = 'pingtens'
const button: IButton = {
    customId: customId,
    execute: async (interaction, idArgs) => {

        await interaction.deferReply({ephemeral: true});
        const pingRole = idArgs[1];
        const pingChannel = idArgs[2];

        // Check ping cooldown
        const now = Date.now();
        const lastPing = mostRecentPings.get(pingRole) ?? 0;
        if (now - lastPing < PING_COOLDOWN_MS) {
            const minutesLeft = Math.ceil((PING_COOLDOWN_MS - (now - lastPing)) / 60000);
            await interaction.editReply({content: `You can only ping this role once every ${PING_COOLDOWN_MINUTES} minutes. Please wait another ${minutesLeft} minute(s).`});
            return;
        }

        // Update last ping time
        mostRecentPings.set(pingRole, now);

        // Send ping message
        const channel = await interaction.guild?.channels.fetch(pingChannel);
        if (!channel || !channel.isTextBased()) {
            await interaction.editReply({content: `Could not find the ping channel. Please report this to a staff member.`});
            return;
        }
        await channel.send({content: `<@&${pingRole}> Ten mans are starting soon! Join the queue in <#${pingChannel}>`});
        await interaction.editReply({content: `Ping Sent! Please wait ${PING_COOLDOWN_MINUTES} minutes before pinging again.`});
        return;

    },
    permissions: ICommandPermission.ALL,
    button: (pingRole: string, pingChannel: string, queueName: string) => {
        return new ButtonBuilder()
            .setCustomId(`${customId}:${pingRole}:${pingChannel}`)
            .setLabel(`Ping for ${queueName} Ten Mans`)
            .setStyle(ButtonStyle.Primary);
    }
}

export default button;