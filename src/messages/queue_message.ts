import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "discord.js";
import joinQueueButton from "../buttons/join_queue";
import leaveQueueButton from "../buttons/leave_queue";
import { WCAQueue } from "../util/queue/queue_manager";

export function queueMessage(queue: WCAQueue, seasonNumber?: number) {
    const lastEdit = new Date(Date.now());
    const queueEmbed = new EmbedBuilder()
        .setTitle(`${queue}${seasonNumber ? ` - Season ${seasonNumber}` : ""}`)
        .addFields(
            { name: "Use the buttons below to join the queue!", value: "" },
            { name: "Players: 0/10", value: "" }
        )
        .setFooter({ text: `Last Updated: ${lastEdit.getHours() > 12 ? lastEdit.getHours() - 12 : lastEdit.getHours()}:${lastEdit.getMinutes()}, ${lastEdit.getMonth() + 1}/${lastEdit.getDate()}` });
    const buttonRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(joinQueueButton.button(queue), leaveQueueButton.button(queue));
    return {
        embeds: [queueEmbed],
        components: [buttonRow],
    }
}