import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, Snowflake } from "discord.js";
import joinQueueButton from "../buttons/join_queue";
import leaveQueueButton from "../buttons/leave_queue";
import { WCAQueue } from "../util/queue/queue_manager";

export function queueMessage(queue: WCAQueue, queuedUsers: Snowflake[], seasonNumber?: number) {
    const lastEdit = new Date(Date.now());
    const lastEditString = `Last Updated: ${lastEdit.getHours() > 12 ? lastEdit.getHours() - 12 : lastEdit.getHours()}:${lastEdit.getMinutes()}, ${lastEdit.getMonth() + 1}/${lastEdit.getDate()}`;
    const queuedUsersString = queuedUsers.reduce((str: string, user: Snowflake, index: number) => {
        console.log(`str: ${str}`);
        return `<@${user}>\n${str}`;
    }, "");
    const queueEmbed = new EmbedBuilder()
        .setTitle(`${queue}${seasonNumber ? ` - Season ${seasonNumber}` : ""}`)
        .addFields(
            { name: "Use the buttons below to join the queue!", value: "" },
            { name: "Players: 0/10", value: queuedUsersString }
        )
        .setFooter({ text: lastEditString });
    const buttonRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(joinQueueButton.button(queue), leaveQueueButton.button(queue));
    return {
        embeds: [queueEmbed],
        components: [buttonRow],
    }
}