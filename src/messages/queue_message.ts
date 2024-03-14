import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "discord.js";
import joinQueueButton from "../buttons/join_queue";

export function queueMessage(queueName: string, seasonNumber?: number) {
    const lastEdit = new Date(Date.now());
    const queueEmbed = new EmbedBuilder()
        .setTitle(queueName)
        .addFields(
            { name: "Use the buttons below to join the queue!", value: "" },
            { name: "Players: 0/10", value: "" }
        )
        .setFooter({ text: `Last Updated: ${lastEdit.getHours() > 12 ? lastEdit.getHours() - 12 : lastEdit.getHours()}:${lastEdit.getMinutes()}, ${lastEdit.getMonth() + 1}/${lastEdit.getDate()}` });
    
    return {
        embeds: [queueEmbed],
        components: [],
    }
}