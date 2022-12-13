const { VoiceState } = require('discord.js');
const { ConnectionPool } = require('mssql');

/**
 * 
 * @param {VoiceState} oldState 
 * @param {VoiceState} newState 
 * @param {ConnectionPool} con 
 */
async function tenMans(oldState, newState, con) {

    /**
     * 10 MANS
     * 
     * 
     * 
     */

}


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
        let guildId = oldState.guild.id;
        let channelId = oldState.channelId;

        let trans = con.transaction();
        trans.begin(async (err) => {

            let rolledBack = false;
            trans.on("rollback", (aborted) => {
                if (aborted) {
                    console.log("This rollback was triggered by SQL server");
                }
                rolledBack = true;
            });

            let result = await con.request(trans)
                .input('GuildId', guildId)
                .input('ChannelId', channelId)
                .execute('GetTriggerableChannels');

            // Channel is triggerable and empty - delete
            if (result.recordset.length > 0 && oldState.channel.members.size === 0) {
                oldState.channel.delete();
            }

        });

    }

}