import { ChannelType, SlashCommandBuilder } from "discord.js";
import { ICommand, ICommandPermission } from "../types/discord_interactions";
import { mmrManager, FirebaseUserMmrLegacy } from "../util/database_options/firestore/db_queue_stats";
import { LeaderboardUser, leaderboardManager } from "../util/database_options/firestore/db_leaderboard";
import { WCAQueue, queueManager } from "../util/queue/queue_manager";

const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName('newseason')
        .setDescription('Performs all necessary data calculations for a new season')
        .addStringOption(option =>
            option.setName('queue')
                .setDescription('The queue to operate on')
                .setChoices(
                    { name: "NA Customs", value: WCAQueue.CustomsNA },
                    { name: "EU Customs", value: WCAQueue.CustomsEU },
                )
                .setRequired(true)) as SlashCommandBuilder,
    execute: async (interaction) => {

        await interaction.reply({ content: "In progress..." });
        await queueManager.close(WCAQueue.CustomsNA, interaction);
        const leaderboard = await leaderboardManager.getLeaderboard("classic");
        const promises: Promise<any>[] = [];
        for (const lbUser of leaderboard) {
            promises.push(updateInitialMmr(lbUser));
        }
        await Promise.all(promises);
        await interaction.editReply({ content: "All done! The queue has been closed and all users' final scores and new starting MMR have been calculated. You can use the leaderboard command for this queue now to see the final leaderboard from this season." })
    },
    permissions: ICommandPermission.BOT_ADMIN
}

async function updateInitialMmr(lbUser: LeaderboardUser) {
    const discordId = lbUser.discordId;
    const mmrUser = await mmrManager.legacy_getUser(discordId);
    if (!mmrUser) throw new Error(`Failed to fetch user ${lbUser.discordId}`);
    const delta = mmrUser.mmr - mmrUser.initialMMR;
    const newMmr = (mmrUser.initialMMR + (delta / Math.max(2, Math.log2(Math.abs(delta)))));
    await mmrManager.legacy_updateUser({
        discordId: discordId,
        initialMMR: newMmr,
    });
}

export default command;