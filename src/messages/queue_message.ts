import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, Snowflake } from "discord.js";
import joinQueueButton from "../buttons/join_queue";
import leaveQueueButton from "../buttons/leave_queue";
import { WCAQueue } from "../util/queue/queue_manager";

export function queueMessage(queue: WCAQueue, queuedUsers: Snowflake[], seasonNumber?: number) {
    const lastEdit = new Date(Date.now());
    const lastEditString = `Last Updated: ${lastEdit.getHours() > 12 ? lastEdit.getHours() - 12 : lastEdit.getHours()}:${lastEdit.getMinutes() < 10 ? `0${lastEdit.getMinutes()}` : lastEdit.getMinutes()}, ${lastEdit.getMonth() + 1}/${lastEdit.getDate()}`;
    const queuedUsersString = queuedUsers.length == 0 ? "Users will show up here when they queue" : queuedUsers.reduce((str: string, user: Snowflake, index: number) => {
        return `${queuedUsers.length - index}. <@${user}>\n${str}`;
    }, "");
    const queueEmbed = new EmbedBuilder()
        .setTitle(`${queue}${seasonNumber ? ` - Season ${seasonNumber}` : ""}`)
        .addFields(
            { name: "Use the buttons below to join the queue!", value: "Make sure you've read the rules and registered before attempting to join the queue!" },
            { name: `Players: ${queuedUsers.length}/10`, value: queuedUsersString }
        )
        .setFooter({ text: lastEditString });
    const buttonRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(joinQueueButton.button(queue), leaveQueueButton.button(queue));
    return {
        content: "",
        embeds: [queueEmbed],
        components: [buttonRow],
    }
}