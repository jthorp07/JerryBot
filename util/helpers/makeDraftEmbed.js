const { tenMansStartEmbed, tenMansDraftEmbed } = require("../embeds");
const { IRecordSet } = require('mssql');
const { EmbedBuilder } = require("discord.js");


module.exports = {

  /**
   * Takes queue information fetched from the database and uses
   * it to construct the next embed that should be displayed in
   * a Classic Ten Mans queue
   * 
   * @param {number} numPlayers Number of players in queue
   * @param {number} numCaptains Number of potential captains in queue
   * @param {string} queueStatus Current queue status
   * @param {IRecordSet<any>} playersAndCanBeCapt Set of potential captains in queue
   * @param {IRecordSet<any>} playersAvailable Set of available players in queue
   * @param {IRecordSet<any>} teamOnePlayers Set of players in team one in queue
   * @param {IRecordSet<any>} teamTwoPlayers Set of players in team two in queue
   * @param {IRecordSet<any>} spectators Set of spectators in queue
   * 
   * @returns {EmbedBuilder[]} embeds component of the message payload to be sent
   */
  makeDraftEmbed(numPlayers, numCaptains, queueStatus, 
    playersAndCanBeCapt, playersAvailable, teamOnePlayers, teamTwoPlayers, spectators) {

      
    
  },
};
