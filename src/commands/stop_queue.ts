import { SlashCommandBuilder } from "discord.js";
import { ICommand, ICommandPermission } from "../types/discord_interactions";
import { WCAQueue, queueManager } from "../util/queue/queue_manager";

/**
 * ADMIN ONLY:
 * 
 * Stops the queue corresponding with provided queue name
 * 
 * Status: Ready for Testing
 */
const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName("stopqueue")
        .setDescription("Closes the queue")
        .addStringOption(option =>
            option.setName("queue")
                .setDescription("The queue to stop from a predefined set of queues")
                .setRequired(true)
                .setChoices(
                    { name: "NA Customs", value: WCAQueue.CustomsNA },
                    { name: "EU Customs", value: WCAQueue.CustomsEU },
                    // makeQueueOptions()
                )) as SlashCommandBuilder,
    execute: async (interaction) => {
        await interaction.reply({ content: "The queue is starting. Once it is fully prepared, the queue message will be updated.", ephemeral: true });
        const queue = interaction.options.getString("queue", true) as WCAQueue;
        await queueManager.stopQueue(queue, interaction);
        await interaction.editReply({ content: "All done! Users should now be able to queue up!" });
    },
    permissions: ICommandPermission.BOT_ADMIN,
}

export default command;