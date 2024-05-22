import { SlashCommandBuilder } from "discord.js";
import { ICommand, ICommandPermission } from "../types/discord_interactions";
import { WCAQueue, queueManager } from "../util/queue/queue_manager";
import { queueRoot } from "../util/database_options/firestore/db_queue_root";
import { JerryError, JerryErrorRecoverability, JerryErrorType } from "../types/jerry_error";

/**
 * ADMIN ONLY:
 * 
 * Starts the queue corresponding with provided queue name
 * 
 * Status: Ready for Testing
 */
const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName("startqueue")
        .setDescription("Starts a new queue in the channel where the command is used")
        .addStringOption(option =>
            option.setName("queue")
                .setDescription("The queue to start from a predefined set of queues")
                .setRequired(true)
                .setChoices(
                    { name: "NA Customs", value: WCAQueue.CustomsNA },
                    { name: "EU Customs", value: WCAQueue.CustomsEU },
                    // makeQueueOptions()
                ))
        .addBooleanOption(option =>
            option.setName("newseason")
                .setDescription("If true, increments to a new season")
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName("seasonovr")
                .setDescription("Overrides the \"newseason\" option - sets the queue's season")
                .setRequired(false)
                .setMinValue(1)) as SlashCommandBuilder,
    execute: async (interaction) => {
        await interaction.reply({ content: "The queue is starting. Once it is fully prepared, the queue message will be updated.", ephemeral: true });
        const queue = interaction.options.getString("queue", true) as WCAQueue;
        const seasonOverride = interaction.options.getInteger("seasonovr") || undefined;
        const newSeason = interaction.options.getBoolean("newseason", true);
        const channelId = interaction.channelId;
        const message = await (interaction.channel?.send({ content:"Preparing the queue..." }));
        if (!message || !message.id) {
            const e = new JerryError(
                JerryErrorType.DiscordFailedPostError, 
                JerryErrorRecoverability.NonBreakingRecoverable, 
                `Failed to reserve a message for queue ${queue} in channel ${channelId}`);
            await interaction.editReply({ content: e.message });
            e.recover();
            return;
        }
        const queueInfo = await queueRoot.activateQueue(queue, channelId, message.id, newSeason, seasonOverride);
        await queueManager.startQueue(queue, channelId, message.id, interaction, queueInfo.season);
        await interaction.editReply({ content: "All done! Users should now be able to queue up!" });
    },
    permissions: ICommandPermission.BOT_ADMIN,
}

export default command;