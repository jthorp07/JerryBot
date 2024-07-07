import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { WCAQueue } from "../util/queue/queue_manager";
import { QueueGameStatus, QueuePlayer } from "../util/queue/queue_game";
import forceCancelGameButton from "../buttons/force_cancel_game";
import voteCancelGameButton from "../buttons/cancel_game";
import voteWinSelectMenu from "../selectmenus/queue_vote_win";
import { JerryError, JerryErrorRecoverability, JerryErrorType } from "../types/jerry_error";


export function gameMessage(queue: WCAQueue, queueName: string, gameId: number, teamOne: QueuePlayer[], teamTwo: QueuePlayer[], status: QueueGameStatus) {
    const teamOneValue = parseTeamString(teamOne);
    const teamTwoValue = parseTeamString(teamTwo);
    const gameEmbed = new EmbedBuilder()
        .setTitle(`Queue ${queueName} | Game ${gameId}`)
        .setFields(
            {
                name: "**Status**",
                value: status,
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

    const voteCancelBtn = voteCancelGameButton.button(queue, gameId);
    if (voteCancelBtn instanceof JerryError) {
        const e = new JerryError(
            JerryErrorType.InternalError,
            JerryErrorRecoverability.SeeUnderlying,
            `Game message for game ${gameId} in queue ${queue} cannot be made due to a missing component`,
            voteCancelBtn
        );
        return e;
    }
    const forceCancelBtn = forceCancelGameButton.button(queue, gameId);
    if (forceCancelBtn instanceof JerryError) {
        const e = new JerryError(
            JerryErrorType.InternalError,
            JerryErrorRecoverability.SeeUnderlying,
            `Game message for game ${gameId} in queue ${queue} cannot be made due to a missing component`,
            forceCancelBtn
        );
        return e;
    }
    const voteWinMenu = voteWinSelectMenu.selectMenu(queue, gameId);
    if (!(voteWinMenu instanceof StringSelectMenuBuilder)) {
        if (voteWinMenu instanceof JerryError) return voteWinMenu;
        const e = new JerryError(
            JerryErrorType.InternalError,
            JerryErrorRecoverability.BreakingNonRecoverable,
            `Game message for game ${gameId} in queue ${queue} cannot be made due to a missing component`
        );
        return e;
    }
    const buttonRow = new ActionRowBuilder<ButtonBuilder>()
            .setComponents(
                voteCancelBtn,
                forceCancelBtn,
            );

    const selectMenusRow = new ActionRowBuilder<StringSelectMenuBuilder>()
            .setComponents(
                voteWinMenu,
            );

    return {
        embeds: [gameEmbed],
        components: [buttonRow, selectMenusRow],
    }
}


function parseTeamString(team: QueuePlayer[]) {
    // "{name} - ({mmr}, {delta})"
    const members = team.map(teamMember => `<@${teamMember.discordId}> - (${teamMember.mmr})`);
    return members.join("\n");
}