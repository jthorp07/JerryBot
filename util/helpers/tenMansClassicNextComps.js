const { tenMansStartComps, tenMansDraftComps, tenMansInGameComps } = require('../components');
const { ActionRowBuilder, AnyComponentBuilder } = require('discord.js');
const { IRecordSet } = require('mssql');
const { QUEUE_STATES } = require('../database-enums');


module.exports = {

    /**
     * @param {number} queueId Current queue ID
     * @param {string} queueStatus Current queue status
     * @param {IRecordSet<any>} playersAvailable Set of available players in queue
     * @param {string} map Name of map, if selected
     * 
     * @returns {ActionRowBuilder<AnyComponentBuilder>}
     */
    tenMansClassicNextComps(queueId, queueStatus, playersAvailable, map) {

        if (queueStatus == QUEUE_STATES.TENMANS_WAITING || queueStatus == QUEUE_STATES.TENMANS_STARTING_DRAFT) {
            return tenMansStartComps(queueId);
        }

        if (queueStatus == QUEUE_STATES.TENMANS_DRAFTING) {

            // Just defining this object with a schema for intellisense - not necessary for prod
            let playerDraftOptions = [{
                label: "",
                value: ""
            }];
            playerDraftOptions = [];

            // Parse available players into valid StringSelectMenu options
            playersAvailable.forEach(player => {
                let name = player.ValorantDisplayName ? player.ValorantDisplayName : player.DiscordDisplayName;
                playerDraftOptions.push({
                    label: name,
                    value: player.PlayerId
                });
            });


            return tenMansDraftComps(queueId, playerDraftOptions, false, map);
        }

        if (queueStatus == QUEUE_STATES.TENMANS_MAP_PICK) {
            return tenMansDraftComps(queueId, null, true, map);
        }

        if (queueStatus == QUEUE_STATES.TENMANS_IN_GAME) {
            return tenMansInGameComps(queueId);
        }

        return tenMansDraftComps(queueId, null, false, map);

    }

}
