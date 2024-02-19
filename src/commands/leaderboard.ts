import { SlashCommandBuilder } from "discord.js";
import { ICommand, ICommandPermission } from "../types/discord_interactions";
import { LeaderboardUser, getLeaderboard, updateDynamicLeaderboard } from "../util/database_options/firestore/db_leaderboard";


const modes = new Map<string, { dynamic: boolean, func: (lb: LeaderboardUser[]) => string[]}>();
modes.set('comp', { dynamic: true, func: competitionLeaderboard });
modes.set('all', { dynamic: true, func: completeLeaderboard });
modes.set('lastcomp', { dynamic: false, func: competitionLeaderboard});
modes.set('last', { dynamic: false, func: completeLeaderboard})

const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Displays the leaderboard')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('The type of leaderboard to display')
                .setRequired(true)
                .setChoices(
                    // { name: 'Competition Leaderboard', value: 'comp' },
                    { name: 'Complete Leaderboard', value: 'all' },
                    // { name: 'Last Season Final Leaderboard', value: 'last'},
                    // { name: 'Last Season Final Leaderboard', value: 'lastcomp'}
                )) as SlashCommandBuilder,
    execute: async (interaction) => {
        await interaction.deferReply();
        const method = modes.get(interaction.options.getString('mode', true));
        if (!method) {
            await interaction.editReply({ content: 'Invalid mode selected' });
            return;
        } else if (method.dynamic) {
            const channel = "1180382139712286791";
            await updateDynamicLeaderboard(channel, interaction.guildId!);
        }
        const leaderboard = (await getLeaderboard(method.dynamic)).sort((a, b) => b.score - a.score);
        const messages = method.func(leaderboard);
        for (const message of messages) {
            if (!message || message.length == 0) continue;
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
    let addCurrent = true;
    for (const user of lb) {
        if (!(user.decoupled) || (user.gamesPlayed || 0 < 10)) continue;
        let toAppend = `${rank}. <@${user.discordId}>\n  Score: ${user.score}\n  Games Played: ${user.gamesPlayed || 0}\n`;
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
        let toAppend = `${rank}. <@${user.discordId}>\n  Score: ${user.score}\n  Games Played: ${user.gamesPlayed || 0}\n`;
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

export default command;