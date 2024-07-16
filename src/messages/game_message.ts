import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { WCAQueue } from "../util/queue/queue_manager";
import { QueueGameStatus, QueuePlayer } from "../util/queue/queue_game";
import forceCancelGameButton from "../buttons/force_cancel_game";
import voteCancelGameButton from "../buttons/cancel_game";
import voteWinSelectMenu from "../selectmenus/queue_vote_win";
import voteMapSelectMenu from "../selectmenus/queue_vote_map";
import { JerryError, JerryErrorRecoverability, JerryErrorType } from "../types/jerry_error";
import { ValorantMap } from "../util/database_options/firestore/db_meta";


export function gameMessage(queue: WCAQueue, gameId: number, teamOne: QueuePlayer[], teamTwo: QueuePlayer[], status: QueueGameStatus, maps: ValorantMap[] = ["Bind"], chosenMap?: ValorantMap) {
    const teamOneValue = parseTeamString(teamOne);
    const teamTwoValue = parseTeamString(teamTwo);
    const gameEmbed = new EmbedBuilder()
        .setTitle(`Queue ${queue} | Game ${gameId}`)
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
            {
                name: "**Map**",
                value: chosenMap ? chosenMap : "Map vote in progress",
                inline: false,
            }
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
    const voteMapMenu = voteMapSelectMenu.selectMenu(queue, gameId, maps);
    if (!(voteMapMenu instanceof StringSelectMenuBuilder)) {
        if (voteMapMenu instanceof JerryError) return voteMapMenu;
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
                status == QueueGameStatus.PregameVoting ? voteMapMenu : voteWinMenu,
            );

    return {
        embeds: [gameEmbed],
        components: status == QueueGameStatus.WaitingForPlayers ? [buttonRow] : [buttonRow, selectMenusRow],
    }
}


function parseTeamString(team: QueuePlayer[]) {
    // "{name} - ({mmr}, {delta})"
    const members = team.map(teamMember => `<@${teamMember.discordId}> - (${teamMember.mmr})`);
    return members.join("\n");
}