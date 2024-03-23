import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { WCAQueue } from "../util/queue/queue_manager";
import { QueuePlayer } from "../util/queue/queue_game";
import forceCancelGameButton from "../buttons/force_cancel_game";
import voteCancelGameButton from "../buttons/cancel_game";


export function gameMessage(queue: WCAQueue, queueName: string, gameId: number, teamOne: QueuePlayer[], teamTwo: QueuePlayer[], status: number) {
    const teamOneValue = parseTeamString(teamOne);
    const teamTwoValue = parseTeamString(teamTwo);
    const gameEmbed = new EmbedBuilder()
        .setTitle(`Queue ${queueName} | Game ${gameId}`)
        .setFields(
            {
                name: "**Status**",
                value: "Map Vote",
                inline: false,
            },
            { 
                name: "**Team One**",
                value: teamOneValue,
                inline: true,
            },
            { 
                name: "**Team Two**",
                value: teamTwoValue,
                inline: true,
            },

        );

    const buttonRow = new ActionRowBuilder<ButtonBuilder>()
            .setComponents(
                voteCancelGameButton.button(queue, gameId),
                forceCancelGameButton.button(queue, gameId),
            );

    const mapRow = new ActionRowBuilder<StringSelectMenuBuilder>()
            .setComponents();

    return {
        embeds: [gameEmbed],
        components: [buttonRow, mapRow],
    }
}


function parseTeamString(team: QueuePlayer[]) {
    // "{name} - ({mmr}, {delta})"
    const members = team.map(teamMember => `<@${teamMember.discordId}> - (${teamMember.mmr})`);
    return members.join("\n");
}