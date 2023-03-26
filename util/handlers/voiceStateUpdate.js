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
            console.log("2\n" + err);
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

    console.log(3);
    let result = await con.request(trans)
        .input('GuildId', guildId)
        .input('ChannelId', channelId)
        .execute('GetTriggerableChannels');

        console.log(4);

    // Channel is triggerable and empty - delete
    if (result.recordset.length && oldState.channel.members.size === 0) {

        // QUERY: Delete channel in DB
        result = await con.request(trans)
            .input('GuildId', guildId)
            .input('ChannelId', channelId)
            .execute('DeleteChannelById');

            console.log(5);

        // ERROR Handling
        if (result.returnValue != 0) {
            console.log('Database issue on query \'DeleteChannelById\' in voiceStateUpdate.js');
            trans.rollback();
            return;
        }
        oldState.channel.delete();
    }

    trans.commit(async (err) => {
        if (err) {
            console.log("1\n" + err);
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

        console.log("VC Update");
        let oldChannelId = oldState.channelId;
        let newChannelId = newState.channelId;

        // Check if oldState channel triggers a delete
        if (oldChannelId !== null) {
            await checkForDeletion(oldState, con);
        }

        // Check if newState chanel is 10 mans queue



    }
}