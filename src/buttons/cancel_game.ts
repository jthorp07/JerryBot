import { ButtonBuilder, ButtonStyle } from "discord.js";
import { IButton, ICommandPermission } from "../types/discord_interactions";
import { WCAQueue, queueManager } from "../util/queue/queue_manager";

const customId = "cancelq" as const;

const button: IButton = {
    customId: customId,
    execute: async (interaction, idArgs) => {
        await interaction.deferReply({ ephemeral: true });
        if (interaction.user.bot) {
            await interaction.editReply({ content: "Bots cannot cancel queues." });
            return;
        }
        try {
            const queueName = idArgs[1] as WCAQueue;
            const gameId = parseInt(idArgs[2]);
        } catch (err) {
            console.log(err);
            return;
        }
    },
    button: (queue: WCAQueue, gameId: number) => {
        return new ButtonBuilder()
            .setCustomId(`${customId}:${queue}:${gameId}`)
            .setLabel("Vote Cancel")
            .setStyle(ButtonStyle.Primary);
    },
    permissions: ICommandPermission.ALL
}

export default button;