const {VoiceState} = require('discord.js');
const {ConnectionPool} = require('mssql');

module.exports = {

    /**
     * 
     * @param {VoiceState} oldState 
     * @param {VoiceState} newState 
     * @param {ConnectionPool} con 
     */
    async onVoiceStateUpdate(oldState, newState, con) {

        /**
         * TODO:
         * 
         * - Query database for channels which might trigger bot action
         * 
         * - If oldState or newState involve a channel returned from the query, continue
         *   and check for/handle whatever needs done with that channel
         * 
         * - Otherwise, return
         */

    }

}