import { ButtonBuilder, ButtonStyle } from "discord.js";
import { IButton, ICommandPermission } from "../types/discord_interactions";
import { WCAQueue, queueManager } from "../util/queue/queue_manager";
import { JerryError } from "../types/jerry_error";

const customId = "leaveq" as const;

const button: IButton = {
    customId: customId,
    execute: async (interaction, idArgs) => {
        await interaction.deferReply({ ephemeral: true });
        if (interaction.user.bot) {
            await interaction.editReply({ content: "Bots cannot interact with the queue." });
            return;
        }
        
        const queueName = idArgs[1] as WCAQueue;
        const result = await queueManager.dequeue(interaction.user.id, queueName, interaction);

        if (result instanceof JerryError) {
            await interaction.editReply({ content: `An error occurred and the command could not be completed.` });
            result.recover();
            return;
        }
        
        await interaction.editReply({ content: "You are no longer in the queue!" });
        
    },
    button: (queue: WCAQueue) => {
        return new ButtonBuilder()
            .setCustomId(`${customId}:${queue}`)
            .setLabel("Leave Queue")
            .setStyle(ButtonStyle.Danger);
    },
    permissions: ICommandPermission.ALL
}

export default button;