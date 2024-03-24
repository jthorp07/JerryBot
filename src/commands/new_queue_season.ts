import { ChannelType, SlashCommandBuilder } from "discord.js";
import { ICommand, ICommandPermission } from "../types/discord_interactions";
import { mmrManager, FirebaseUserMmr } from "../util/database_options/firestore/db_mmr";
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
                    {name: "NA Customs", value: WCAQueue.CustomsNA },
                    {name: "EU Customs", value: WCAQueue.CustomsEU },
                )
                .setRequired(true)) as SlashCommandBuilder,
    execute: async (interaction) => {

        await interaction.reply({content:"In progress..."});
        await queueManager.close(WCAQueue.CustomsNA, interaction);
        const leaderboard = await leaderboardManager.getLeaderboard("classic");
        for (const lbUser of leaderboard) {
            mmrManager.getUser(lbUser.discordId).then(mmrUser => {
                const newMmr = mmrUser;
            });
        }
    },
    permissions: ICommandPermission.BOT_ADMIN
}

export default command;