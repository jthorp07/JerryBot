import { ButtonBuilder, ButtonStyle } from "discord.js";
import { IButton, ICommandPermission } from "../types/discord_interactions";
import { WCAQueue, queueManager } from "../util/queue/queue_manager";

const customId = "leaveq" as const;

const button: IButton = {
    customId: customId,
    execute: async (interaction, idArgs) => {
        await interaction.deferReply({ ephemeral: true });
        if (interaction.user.bot) {
            await interaction.editReply({ content: "Bots cannot interact with the queue." });
            return;
        }
        try {
            const queueName = idArgs[1] as WCAQueue;
            queueManager.dequeue(interaction.user.id, queueName, interaction);
        } catch (err) {
            console.log(err);
            return;
        }
        
    },
    button: (queue: WCAQueue) => {
        return new ButtonBuilder()
            .setCustomId(`${customId}:${queue}`)
            .setLabel("Join Queue")
            .setStyle(ButtonStyle.Danger);
    },
    permissions: ICommandPermission.ALL
}

export default button;