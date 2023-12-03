import { SlashCommandBuilder } from "discord.js";
import { ICommand, ICommandPermission } from "../types/discord_interactions";
import { LeaderboardUser, getLeaderboard } from "../util/database_options/firestore/db_leaderboard";

const modes = new Map<string, (lb: LeaderboardUser[]) => string[]>();
modes.set('comp', competitionLeaderboard);
modes.set('all', completeLeaderboard);

const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Displays the leaderboard')
        .addStringOption(option =>
            option.setName('mode')
                .setChoices(
                    { name: 'Competition Leaderboard', value: 'comp' },
                    { name: 'Complete Leaderboard', value: 'all' }
                )) as SlashCommandBuilder,
    execute: async (interaction) => {
        await interaction.deferReply();
        const leaderboard = (await getLeaderboard()).sort((a, b) => b.score - a.score);
        const func = modes.get(interaction.options.getString('mode', true));
        if (!func) {
            await interaction.editReply({ content: 'Invalid mode selected' });
            return;
        }
        const messages = func(leaderboard);
        for (const message of messages) {
            interaction.channel?.send({content: message});
        }
        await interaction.deleteReply();
    },
    permissions: ICommandPermission.BOT_ADMIN,
}

function competitionLeaderboard(lb: LeaderboardUser[]) {
    const messages = [];
    let current = '';
    let rank = 1;
    let addCurrent = false;
    for (const user of lb) {
        if (!(user.decoupled)) continue;
        let toAppend = `${rank}. <@${user.discordId}> - Score: ${user.score}\n`;
        if (toAppend.length + current.length >= 2000) {
            messages.push(current);
            current = toAppend;
            addCurrent = false;
        } else {
            current = `${current}${toAppend}`;
            addCurrent = true;
        }
        rank++;
    }
    if (addCurrent) messages.push(current);
    return messages;
}

function completeLeaderboard(lb: LeaderboardUser[]) {
    const messages = [];
    let current = '';
    let rank = 1;
    let addCurrent = false;
    for (const user of lb) {
        let toAppend = `${rank}. <@${user.discordId}> - Score: ${user.score}\n`;
        if (toAppend.length + current.length >= 2000) {
            messages.push(current);
            current = toAppend;
            addCurrent = false;
        } else {
            current = `${current}${toAppend}`;
            addCurrent = true;
        }
        rank++;
    }
    if (addCurrent) messages.push(current);
    return messages;
}