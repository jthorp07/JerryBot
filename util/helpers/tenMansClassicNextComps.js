const { tenMansStartComps, tenMansDraftComps } = require('../components');
const { ActionRowBuilder, AnyComponentBuilder } = require('discord.js');
const { IRecordSet } = require('mssql');
const { QUEUE_STATES } = require('../database-enums');


module.exports = {

    /**
     * @param {number} queueId Current queue ID
     * @param {string} queueStatus Current queue status
     * @param {IRecordSet<any>} playersAvailable Set of available players in queue
     * @param {IRecordSet<any>} teamOnePlayers Set of players in team one in queue
     * @param {IRecordSet<any>} teamTwoPlayers Set of players in team two in queue
     * @param {IRecordSet<any>} spectators Set of spectators in queue
     * @param {string} hostName Display name of the host
     * @param {string} hostPfp Discord PFP of the host
     * 
     * @returns {ActionRowBuilder<AnyComponentBuilder>}
     */
    tenMansClassicNextComps(queueStatus, playersAvailable, teamOnePlayers, teamTwoPlayers, spectators, hostName, hostPfp) {

        if (queueStatus == QUEUE_STATES.TENMANS_WAITING || queueStatus == QUEUE_STATES.TENMANS_STARTING_DRAFT) {
            return tenMansStartComps(queueId);
        }

        return;

    }

}
