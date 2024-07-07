import { ICommandPermission, ISelectMenu } from "../types/discord_interactions";
import { StringSelectMenuBuilder } from "discord.js";
import { JerryError, JerryErrorType, JerryErrorRecoverability } from "../types/jerry_error";
import { WCAQueue } from "../util/queue/queue_manager";
import { ValorantMap } from "../util/database_options/firestore/db_meta";

const customId = "valmapselect" as const;
const selectMenu: ISelectMenu = {
    customId: customId,
    async execute(interaction, idArgs) {
        await interaction.deferReply({ ephemeral: true });
        if (!interaction.isStringSelectMenu()) {
            const e = new JerryError(
                JerryErrorType.InternalError,
                JerryErrorRecoverability.BreakingNonRecoverable,
                "Select Menu 'qvotewin' expects a StringSelectMenuInteraction, but a different kind of interaction was provided."
            );
            await interaction.editReply({ content: "An internal error occurred and this action could not be completed." });
            e.throw();
            return;
        }
        if (idArgs.length < 3) {
            const e = new JerryError(
                JerryErrorType.InternalError,
                JerryErrorRecoverability.BreakingNonRecoverable,
                "Select Menu 'qvotewin' expects 3 idArgs, but less than that were supplied."
            );
            await interaction.editReply({ content: "An internal error occurred and this action could not be completed." });
            e.throw();
            return;
        }

        const q = idArgs[1] as WCAQueue;
        const gameId = parseInt(idArgs[2]);
    },
    selectMenu(queue: WCAQueue, gameId: number, maps: ValorantMap[]) {
        let options: {label:string,value:string}[] = [];
        for (const map of maps) {
            options.push({ label: map, value: map.toLowerCase() });
        }
        return new StringSelectMenuBuilder()
            .setCustomId(`${customId}:${queue}:${gameId}`)
            .setPlaceholder("Vote For A Map")
            .setMaxValues(1)
            .setOptions(options);
    },
    permissions: ICommandPermission.ALL
}