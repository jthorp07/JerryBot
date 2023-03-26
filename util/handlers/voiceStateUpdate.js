const { VoiceState } = require('discord.js');
const { ConnectionPool } = require('mssql');
const { beginOnErrMaker, commitOnErrMaker } = require("../helpers");

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

/**
 * 
 * @param {VoiceState} oldState 
 * @param {ConnectionPool} con 
 */
async function checkForDeletion(oldState, con) {

    let guildId = oldState.guild.id;
    let channelId = oldState.channelId;

    let trans = con.transaction();
    await trans.begin(async (err) => {

        if (err) {
            console.log(err);
            return;
        }

        let rolledBack = false;
        trans.on("rollback", (aborted) => {
            if (aborted) {
                console.log("This rollback was triggered by SQL server");
            }
            rolledBack = true;
        });

    });

    let result = await con.request(trans)
        .input('GuildId', guildId)
        .input('ChannelId', channelId)
        .execute('GetTriggerableChannels');

    // Channel is triggerable and empty - delete
    if (result.recordset.length && oldState.channel.members.size === 0) {

        // QUERY: Delete channel in DB
        result = await con.request(trans)
            .input('GuildId', guildId)
            .input('ChannelId', channelId)
            .execute('DeleteChannelById');

        // ERROR Handling
        if (result.returnValue != 0) {
            console.log('Database issue on query \'DeleteChannelById\' in voiceStateUpdate.js');
            trans.rollback();
            return;
        }
        oldState.channel.delete();
    }

    // TODO: Unidentified non-critical bug causing error callback to trigger
    trans.commit(async (err) => {
        if (err) {
            console.log(err.message);
            return;
        }
    });

}


module.exports = {

    /**
     * Parent handler for the VoiceStateUpdate event
     * Takes the callbacks from the event (oldState & newState),
     * as well as a database connection
     * 
     * @param {VoiceState} oldState 
     * @param {VoiceState} newState 
     * @param {ConnectionPool} con 
     */
    async onVoiceStateUpdate(oldState, newState, con) {

        let oldChannelId = oldState.channelId;
        let newChannelId = newState.channelId;

        // Check if oldState channel triggers a delete
        if (oldChannelId !== null) {
            await checkForDeletion(oldState, con);
        }

        // Check if newState chanel is 10 mans queue



    }
}