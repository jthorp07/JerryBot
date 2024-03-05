import { SlashCommandBuilder } from "discord.js";
import { ICommand, ICommandPermission } from "../types/discord_interactions";
import { leaderboardManager } from "../util/database_options/firestore/db_leaderboard";

const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName('removerole')
        .setDescription('Removes a role from all users in the server')
        .addRoleOption(
            option =>
                option.setName('role')
                    .setDescription('Role to remove')
                    .setRequired(true)
        ) as SlashCommandBuilder,
    execute: async (interaction) => {
        await interaction.reply({ content: 'Removing role from all users...' });
        const role = interaction.options.getRole('role', true).id;
        const lastLeaderboard = await leaderboardManager.getLeaderboard("classic");
        for (const user of lastLeaderboard) {           
            interaction.guild?.members.fetch(user.discordId).then(member => member.roles.remove(role)).catch((err) => {if (err) console.error(err)});  
        }
    },
    permissions: ICommandPermission.BOT_ADMIN
}

export default command;