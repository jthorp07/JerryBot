import { ChannelType, SlashCommandBuilder } from "discord.js";
import { ICommand, ICommandPermission } from "../types/discord_interactions";
import { mmrManager, FirebaseUserMmrLegacy } from "../util/database_options/firestore/db_queue_stats";
import { LeaderboardUser, leaderboardManager } from "../util/database_options/firestore/db_queue_leaderboard";
import { WCAQueue, queueManager } from "../util/queue/queue_manager";
import { endOfSeasonCalculations, mmrAdjustment } from "../util/queue/queue_utils";
import { FbQueuePartial, queueRoot } from "../util/database_options/firestore/db_queue_root";
import { DocumentReference } from "firebase/firestore";
import { queueMessage } from "../messages/queue_message";
import { JerryError, JerryErrorRecoverability, JerryErrorType } from "../types/jerry_error";

// Because discord only allows fully lowercase alphabetic strings for values we can't use the user readable strings in the WCAQueue enum as values
const customNa = "na" as const;
const customEu = "eu" as const;
const queueMap = new Map<string, WCAQueue>();
queueMap.set(customNa, WCAQueue.CustomsNA);
queueMap.set(customEu, WCAQueue.CustomsEU);

/**
 * Make end of season calculations, close queue, and post final leaderboard
 * 
 * Order of events:
 *  - Close the queue
 *      - QueueManager tells the queue to close
 *          - Queue ends all of its games
 *          - Queue deletes its Discord message
 *      - QueueManager deactivates Queue in the database
 *  - Force refresh and fetch final leaderboard
 *  - Update users on the database using the final leaderboard data
 *  - Reopen the queue
 *      - Make a new queue message
 *      - Activate the queue on the database and grab queue metadata
 *      - QueueManager takes message and metadata information and opens the queue in main memory
 *      - Send the new queue message to Discord so users can start interacting with it
 * 
 * Status: Ready for Testing
 */
const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName('newseason')
        .setDescription('Performs all necessary data calculations for a new season')
        .addStringOption(option =>
            option.setName('queue')
                .setDescription('The queue to operate on')
                .setChoices(
                    { name: "NA Customs", value: customNa },
                    { name: "EU Customs", value: customEu },
                )
                .setRequired(true)) as SlashCommandBuilder,
    execute: async (interaction) => {

        await interaction.reply({ content: "In progress..." });

        // Prepare options
        const queue = queueMap.get(interaction.options.getString("queue", true));
        if (!queue) {
            await interaction.editReply({ content: "Provided option 'queue' is invalid." });
            return;
        }

        await queueManager.stopQueue(queue, interaction);
        const refs = await queueRoot.getQueue(queue, true);
        const ref = refs.ref;
        // const leaderboard = await leaderboardManager.getLeaderboard(queue, "classic", true);
        const users = await mmrManager.getAllUserStats(queue, true, ref);
        const newStats = endOfSeasonCalculations(users);
        const promises: Promise<any>[] = [];
        for (const user of newStats.finalStats) {
            promises.push(mmrManager.updateUserNewSeason(queue, user.discordId, user.newMmr, user.gamesPlayed, ref));
        }
        await Promise.all(promises);
        if (!refs.doc) {
            const e = new JerryError(
                JerryErrorType.InternalError,
                JerryErrorRecoverability.NonBreakingRecoverable,
                `Expected a DocumentSnapshot for queue ${queue}`
            );
            await interaction.editReply({ content: `All done! However, there was an error preventing the queue from being reopened.\nError: ${e.message}` });
            e.recover();
            return;
        }
        const queueData = refs.doc.data();
        if (!queueData) {
            const e = new JerryError(
                JerryErrorType.DatabaseReadError,
                JerryErrorRecoverability.NonBreakingRecoverable,
                `Failed to fetch document data for queue ${queue}`
            );
            await interaction.editReply({ content: `All done! However, there was an error preventing the queue from being reopened.\nError: ${e.message}` });
            e.recover();
            return;
        }
        const channel = await interaction.guild?.channels.fetch(queueData.channelId);
        if (!channel || !channel.isTextBased()) {
            const e = new JerryError(
                JerryErrorType.DiscordFailedFetchError,
                JerryErrorRecoverability.NonBreakingRecoverable,
                `Failed to fetch a text-based channel for queue ${queue}`
            );
            await interaction.editReply({ content: `All done! However, there was an error preventing the queue from being reopened.\nError: ${e.message}` });
            e.recover();
            return;
        }
        const sentMessage = await channel.send({ content: "Preparing queue..." });
        await queueManager.startQueue(queue, sentMessage.channelId, sentMessage.id, interaction, queueData.season + 1);
        await interaction.editReply({ content: "All done! End of season calculations have been completed and the queue has been reopened for the next season." })
    },
    permissions: ICommandPermission.BOT_ADMIN
}

export default command;