import { SlashCommandBuilder } from "discord.js";
import { ICommand, ICommandPermission } from "../types/discord_interactions";
import { WCAQueue, queueManager } from "../util/queue/queue_manager";
import { queueRoot } from "../util/database_options/firestore/db_queue_root";
import { JerryErrorType } from "../types/jerry_error";

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
        await interaction.reply({ content: "The queue being cleaned up. When it is fully closed, this response will update!", ephemeral: true });
        const queue = interaction.options.getString("queue", true) as WCAQueue;
        const err = await queueManager.stopQueue(queue, interaction);
        if (err && err.type == JerryErrorType.IllegalStateError) {
            await interaction.editReply({ content: err.message });
            err.recover();
            return;
        } else if (err) {
            err.throw();
        }
        await queueRoot.deactivateQueue(queue);
        await interaction.editReply({ content: "All done! The queue is closed!" });
    },
    permissions: ICommandPermission.BOT_ADMIN,
}

export default command;