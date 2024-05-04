import { ButtonBuilder, ButtonStyle } from "discord.js";
import { IButton, ICommandPermission } from "../types/discord_interactions";
import { WCAQueue, queueManager } from "../util/queue/queue_manager";

const customId = "joinq" as const;

/**
 * 
 * Joins a user to a queue
 * 
 * Status: Ready for testing
 * 
 */
const button: IButton = {
    customId: customId,
    execute: async (interaction, idArgs) => {
        await interaction.deferReply({ ephemeral: true });
        if (interaction.user.bot) {
            await interaction.editReply({ content: "Bots cannot enter queues." });
            return;
        }
        try {
            const queueName = idArgs[1] as WCAQueue;
            await queueManager.enqueue(interaction.user.id, queueName, interaction);
            await interaction.editReply({ content: "You're in! Make sure to leave the queue before it pops if you don't intend to participate."});
        } catch (err) {
            console.log(err);
            await interaction.editReply({ content: "Something went wrong and the command could not be completed"});
            return;
        }
        
    },
    button: (queue?: WCAQueue) => {
        if (!queue) throw new Error("Button 'Join Queue' missing required param 'queue': WCAQueue");
        return new ButtonBuilder()
            .setCustomId(`${customId}:${queue}`)
            .setLabel("Join Queue")
            .setStyle(ButtonStyle.Success);
    },
    permissions: ICommandPermission.ALL
}

export default button;