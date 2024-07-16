import { StringSelectMenuBuilder } from "discord.js";
import { ICommandPermission, ISelectMenu } from "../types/discord_interactions";
import { queueManager, WCAQueue } from "../util/queue/queue_manager";
import { JerryError, JerryErrorRecoverability, JerryErrorType } from "../types/jerry_error";
import { ValorantMap } from "../util/database_options/firestore/db_meta";

const customId = "qvotemap";

/**
 * Submits a vote for a map on the game this
 * component is attached to.
 * 
 * Status: Needs added to game message; otherwise ready
 */
const selectMenu: ISelectMenu = {
    customId: customId,
    async execute(interaction, idArgs) {
        await interaction.deferReply({ ephemeral: true });
        if (!interaction.isStringSelectMenu()) {
            const e = new JerryError(
                JerryErrorType.InternalError,
                JerryErrorRecoverability.BreakingNonRecoverable,
                "Select Menu 'qvotemap' expects a StringSelectMenuInteraction, but a different kind of interaction was provided."
            );
            await interaction.editReply({ content: "An internal error occurred and this action could not be completed." });
            e.throw();
            return;
        }
        if (idArgs.length < 3) {
            const e = new JerryError(
                JerryErrorType.InternalError,
                JerryErrorRecoverability.BreakingNonRecoverable,
                "Select Menu 'qvotemap' expects 3 idArgs, but less than that were supplied."
            );
            await interaction.editReply({ content: "An internal error occurred and this action could not be completed." });
            e.throw();
            return;
        }

        const q = idArgs[1] as WCAQueue;
        const gameId = parseInt(idArgs[2]);

        const result = queueManager.voteWin(q, gameId, interaction);
        if (result) {
            await interaction.editReply({ content: "An internal error occurred and this action could not be completed." });
            result.throw();
            return;
        }
        await interaction.editReply({ content: "Your vote has been submitted." });

    },
    selectMenu(queue: WCAQueue, gameId: number, maps: ValorantMap[]) {
        const mapOptions = maps.map(map => {
            return { label: map, value: map.toLowerCase() }
        });
        return new StringSelectMenuBuilder()
            .setCustomId(`${customId}:${queue}:${gameId}`)
            .setOptions(mapOptions)
            .setPlaceholder("Vote for a Map")
            .setMaxValues(1);
    },
    permissions: ICommandPermission.ALL
}

export default selectMenu;