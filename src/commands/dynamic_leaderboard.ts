import { SlashCommandBuilder } from "discord.js";
import { ICommand, ICommandPermission } from "../types/discord_interactions";
import { LeaderboardUser, getLeaderboard, updateDynamicLeaderboard } from "../util/database_options/firestore/db_leaderboard";

const modes = new Map<string, (lb: LeaderboardUser[]) => string[]>();
modes.set('comp', competitionLeaderboard);
modes.set('all', completeLeaderboard);

const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Displays the leaderboard')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('The type of leaderboar to display')
                .setChoices(
                    { name: 'Competition Leaderboard', value: 'comp' },
                    { name: 'Complete Leaderboard', value: 'all' }
                )) as SlashCommandBuilder,
    execute: async (interaction) => {
        await interaction.deferReply();
        await updateDynamicLeaderboard('1180382139712286791', '710741097126821970');
        const leaderboard = (await getLeaderboard(true)).sort((a, b) => b.score - a.score);
        const func = modes.get(interaction.options.getString('mode', true));
        if (!func) {
            await interaction.editReply({ content: 'Invalid mode selected' });
            return;
        }
        const messages = func(leaderboard);
        console.log('Leaderboard Messages:')
        for (const message of messages) {
            console.log(message);
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
        console.log('Processing user...');
        if (!(user.decoupled)) continue;
        
        let toAppend = `${rank}. <@${user.discordId}> - Score: ${user.score}\n`;
        console.log(toAppend);
        if (toAppend.length + current.length >= 2000) {
            console.log('Message filled -> Making a new one')
            messages.push(current);
            current = toAppend;
            addCurrent = false;
        } else {
            console.log('Appending to current message');
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

export default command;