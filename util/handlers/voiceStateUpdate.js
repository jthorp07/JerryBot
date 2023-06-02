const { VoiceState } = require('discord.js');
const { ConnectionPool } = require('mssql');
const { GCADB, BaseDBError } = require('../gcadb');

/**
 * 
 * @param {VoiceState} oldState 
 * @param {GCADB} db
 */
async function checkForDeletion(oldState, db) {

    let guildId = oldState.guild.id;
    let channelId = oldState.channelId;

    let trans = await db.beginTransaction();

    let triggerable = await db.getTriggerableChannels(guildId, channelId, trans);
    
    if (triggerable instanceof BaseDBError) {
        triggerable.log();
        await trans.rollback();
        console.log('  [Bot]: Failed to check channel for triggerability');
        return;
    }

    // Channel is triggerable and empty - delete
    if (triggerable && oldState.channel.members.size === 0) {

        // QUERY: Delete channel in DB
        let deleteChannelResult = await db.deleteChannelById(guildId, channelId, trans);
        if (deleteChannelById) {
            deleteChannelResult.log();
            await trans.rollback();
            console.log('  [Bot]: Failed to delete channel on trigger');
            return;
        }

        oldState.channel.delete();
    }

    await db.commitTransaction(trans);
}


module.exports = {

    /**
     * Parent handler for the VoiceStateUpdate event
     * Takes the callbacks from the event (oldState & newState),
     * as well as a database connection
     * 
     * @param {VoiceState} oldState 
     * @param {VoiceState} newState 
     * @param {GCADB} db 
     */
    async onVoiceStateUpdate(oldState, newState, db) {

        let oldChannelId = oldState.channelId;
        let newChannelId = newState.channelId;

        // Check if oldState channel triggers a delete
        if (oldChannelId !== null) {
            await checkForDeletion(oldState, db);
        }

        // Check if newState chanel is 10 mans queue



    }
}