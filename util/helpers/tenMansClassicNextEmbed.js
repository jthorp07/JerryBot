const { tenMansStartEmbed, tenMansDraftEmbed } = require("../embeds");
const { IRecordSet } = require('mssql');
const { EmbedBuilder } = require("discord.js");
const { QUEUE_STATES } = require("../../util");


module.exports = {

  /**
   * Takes queue information fetched from the database and uses
   * it to construct the next embed that should be displayed in
   * a Classic Ten Mans queue
   * 
   * @param {string} queueStatus Current queue status
   * @param {IRecordSet<any>} playersAvailable Set of available players in queue
   * @param {IRecordSet<any>} teamOnePlayers Set of players in team one in queue
   * @param {IRecordSet<any>} teamTwoPlayers Set of players in team two in queue
   * @param {IRecordSet<any>} spectators Set of spectators in queue
   * @param {string} hostName Display name of the host
   * @param {string} hostPfp Discord PFP of the host
   * 
   * @returns {EmbedBuilder[]} embeds component of the message payload to be sent
   */
  tenMansClassicNextEmbed(queueStatus, playersAvailable,
    teamOnePlayers, teamTwoPlayers, spectators, hostName, hostPfp) {

    // Available Players
    let draftListString = '';
    playersAvailable.forEach(player => {
      let dispName = player.ValorantDisplayName ? player.ValorantDisplayName : player.DiscordDisplayName;
      let dispRole = player.ValorantRankRoleIcon ? player.ValorantRankRoleIcon : "";
      draftListString = `${draftListString}${dispName} ${dispRole}\n`;
    });

    // Spectators
    let specString
    spectators.forEach(spectator => {
      let dispName = spectator.ValorantDisplayName ? spectator.ValorantDisplayName : spectator.DiscordDisplayName;
      specString = `${specString}${dispName}\n`;
    })


    // Queue states of drafting or in-game: Make Draft embed 
    if (queueStatus == QUEUE_STATES.TENMANS_DRAFTING || queueStatus == QUEUE_STATES.TENMANS_IN_GAME) {

      // Team One
      let teamOneString = '';
      for (player of teamOnePlayers) {
        if (player.IsCaptain == 1) {
          continue;
        }

        let dispName = player.ValorantDisplayName ? player.ValorantDisplayName : player.DiscordDisplayName;
        let dispRole = player.ValorantRankRoleIcon ? player.ValorantRankRoleIcon : "";
        teamOneString = `${draftListString}${dispName} ${dispRole}\n`;
      };

      // Team One Captain
      let capOne = '';
      for (player of teamOnePlayers) {
        if (player.IsCaptain == 0) {
          continue;
        }

        let dispName = player.ValorantDisplayName ? player.ValorantDisplayName : player.DiscordDisplayName;
        let dispRole = player.ValorantRankRoleIcon ? player.ValorantRankRoleIcon : "";
        capOne = `${draftListString}${dispName} ${dispRole}\n`;
      };

      // Team Two
      let teamTwoString = '';
      for (player of teamTwoPlayers) {
        let dispName = player.ValorantDisplayName ? player.ValorantDisplayName : player.DiscordDisplayName;
        let dispRole = player.ValorantRankRoleIcon ? player.ValorantRankRoleIcon : "";
        teamTwoString = `${draftListString}${dispName} ${dispRole}\n`;
      }

      // Team Two Captain
      let capTwo = '';
      for (player of teamTwoPlayers) {
        if (player.IsCaptain == 0) {
          continue;
        }

        let dispName = player.ValorantDisplayName ? player.ValorantDisplayName : player.DiscordDisplayName;
        let dispRole = player.ValorantRankRoleIcon ? player.ValorantRankRoleIcon : "";
        capTwo = `${draftListString}${dispName} ${dispRole}\n`;
      };

      // Return Draft Embed
      return tenMansDraftEmbed(capOne, capTwo, draftListString, teamOneString, teamTwoString, specString);

    } else {
      return tenMansStartEmbed(draftListString, specString, hostName, hostPfp);
    }
  },
};
