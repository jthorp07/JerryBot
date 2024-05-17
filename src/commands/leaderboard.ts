import { SlashCommandBuilder } from "discord.js";
import { ICommand, ICommandPermission } from "../types/discord_interactions";
import { LeaderboardUser, leaderboardManager } from "../util/database_options/firestore/db_queue_leaderboard";
import { WCAQueue } from "../util/queue/queue_manager";


const modes = new Map<string, (lb: LeaderboardUser[]) => string[]>();
modes.set('comp',  competitionLeaderboard);
modes.set('all', completeLeaderboard);
modes.set('lastcomp', competitionLeaderboard);
modes.set('last', completeLeaderboard);

const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Displays the leaderboard')
        .addStringOption(option =>
            option.setName('queue')
                .setDescription('The queue to grab the leaderboard for')
                .setRequired(true)
                .setChoices(
                    { name: "NA Customs", value: "na" },
                    { name: "EU Customs", value: "eu" },
                ))
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('The type of leaderboard to display')
                .setRequired(true)
                .setChoices(
                    { name: 'Complete Leaderboard', value: 'all' },
                )) as SlashCommandBuilder,
    execute: async (interaction) => {
        await interaction.deferReply();
        const method = modes.get(interaction.options.getString('mode', true));
        if (!method) {
            await interaction.editReply({ content: 'Invalid mode selected' });
            return;
        }
        const leaderboard = await leaderboardManager.getLeaderboard(WCAQueue.CustomsNA, "classic");
        const messages = method(leaderboard);
        for (const message of messages) {
            if (!message || message.length == 0) continue;
            interaction.channel?.send({content: message});
        }
        await interaction.deleteReply();
    },
    permissions: ICommandPermission.ALL,
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