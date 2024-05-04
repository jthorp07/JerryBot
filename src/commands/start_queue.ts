import { SlashCommandBuilder } from "discord.js";
import { ICommand, ICommandPermission } from "../types/discord_interactions";
import { WCAQueue, queueManager } from "../util/queue/queue_manager";

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
        .addIntegerOption(option =>
            option.setName("season")
                .setDescription("The season the queue is in")
                .setRequired(false)
                .setMinValue(1)
        ) as SlashCommandBuilder,
    execute: async (interaction) => {
        await interaction.reply({ content: "The queue is starting. Once it is fully prepared, the queue message will be updated.", ephemeral: true });
        const queue = interaction.options.getString("queue", true) as WCAQueue;
        const season = interaction.options.getInteger("season") || undefined;
        const channelId = interaction.channelId;
        const message = await (interaction.channel?.send({ content:"Preparing the queue..." }));
        if (!message || !message.id) {
            throw new Error(`Failed to reserve a message for queue ${queue} in channel ${channelId}`);
        }
        queueManager.startQueue(queue, channelId, message.id, interaction, season);
        await interaction.editReply({ content: "All done! Users should now be able to queue up!" });
    },
    permissions: ICommandPermission.BOT_ADMIN,
}

export default command;