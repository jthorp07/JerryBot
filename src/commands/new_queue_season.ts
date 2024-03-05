import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder, Snowflake } from "discord.js";
import { ICommand, ICommandPermission } from "../types/discord_interactions";
import { mmrManager, FirebaseUserMmr } from "../util/database_options/firestore/db_mmr";
import { getLastSeason } from "../util/neatqueue/neatqueue";
import { LeaderboardUser, leaderboardManager } from "../util/database_options/firestore/db_leaderboard";

async function removeRoleFromEveryone(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;
    if (!guild) return;
    const allMembers = await guild.members.fetch();
    for (const member of allMembers) {
        member[1].roles.remove('1180001507828043798');
    }
}

const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName('newseason')
        .setDescription('Performs all necessary data calculations for a new season')
        .addChannelOption(option => 
            option.addChannelTypes(ChannelType.GuildText)
                .setName('queuechannel')
                .setDescription('The channel the NeatQueue queue is hosted in')
                .setRequired(true)) as SlashCommandBuilder,
    execute: async (interaction) => {
        await interaction.reply({content:"In progress..."});    
    },
    permissions: ICommandPermission.BOT_ADMIN
}

export default command;