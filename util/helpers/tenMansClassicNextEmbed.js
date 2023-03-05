const { tenMansStartEmbed, tenMansDraftEmbed, tenMansInGameEmbed } = require("../embeds");
const { IRecordSet } = require('mssql');
const { EmbedBuilder } = require("discord.js");
const { QUEUE_STATES } = require("../database-enums");



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
   * @param {string} map Name of map if selected
   * @param {number} teamTwoAttack 0 if not selected, 1 if Team 2 is attackers, 2 if Team 2 is defenders
   * 
   * @returns {EmbedBuilder[]} embeds component of the message payload to be sent
   */
  tenMansClassicNextEmbed(queueStatus, playersAvailable,
    teamOnePlayers, teamTwoPlayers, spectators, hostName, hostPfp, map, teamTwoAttack) {

    // Available Players
    let draftListString = playersAvailable ? "" : undefined;
    if (playersAvailable) playersAvailable.forEach(player => {
      console.log(JSON.stringify(player));
      let dispName = player.ValorantDisplayName ? player.ValorantDisplayName : player.DiscordDisplayName;
      let dispRole = player.RoleEmote ? player.RoleEmote : player.RoleName ? parseRoleName(player.RoleName) : "";
      draftListString = `${draftListString}${dispName} ${dispRole}\n`;
    });

    // Spectators
    let specString = spectators ? "" : undefined;
    if (spectators) spectators.forEach(spectator => {
      let dispName = spectator.ValorantDisplayName ? spectator.ValorantDisplayName : spectator.DiscordDisplayName;
      specString = `${specString}${dispName}\n`;
    });


    // Queue states of drafting or in-game: Make Draft embed 
    if (queueStatus == QUEUE_STATES.TENMANS_WAITING) {
      return tenMansStartEmbed(draftListString, specString, hostName, hostPfp);
    } else {
      // Team One
      let teamOneString = '';
      for (player of teamOnePlayers) {
        if (player.IsCaptain == 1) {
          continue;
        }

        let dispName = player.ValorantDisplayName ? player.ValorantDisplayName : player.DiscordDisplayName;
        let dispRole = player.RoleEmote ? player.RoleEmote : player.RoleName ? parseRoleName(player.RoleName) : "";
        teamOneString = `${teamOneString}${dispName} ${dispRole}\n`;
      };

      // Team One Captain
      let capOne = '';
      for (player of teamOnePlayers) {
        if (player.IsCaptain == 0) {
          continue;
        }

        let dispName = player.ValorantDisplayName ? player.ValorantDisplayName : player.DiscordDisplayName;
        let dispRole = player.RoleEmote ? player.RoleEmote : player.RoleName ? parseRoleName(player.RoleName) : "";
        capOne = `${dispName} ${dispRole}`;
      };

      // Team Two
      let teamTwoString = '';
      for (player of teamTwoPlayers) {
        if (player.IsCaptain == 1) {
          continue;
        }
        let dispName = player.ValorantDisplayName ? player.ValorantDisplayName : player.DiscordDisplayName;
        let dispRole = player.RoleEmote ? player.RoleEmote : player.RoleName ? parseRoleName(player.RoleName) : "";
        teamTwoString = `${teamTwoString}${dispName} ${dispRole}\n`;
      }

      // Team Two Captain
      let capTwo = '';
      for (player of teamTwoPlayers) {
        if (player.IsCaptain == 0) {
          continue;
        }

        let dispName = player.ValorantDisplayName ? player.ValorantDisplayName : player.DiscordDisplayName;
        let dispRole = player.RoleEmote ? player.RoleEmote : player.RoleName ? parseRoleName(player.RoleName) : "";
        capTwo = `${dispName} ${dispRole}`;
      };

      if (queueStatus == QUEUE_STATES.TENMANS_SIDE_PICK || queueStatus == QUEUE_STATES.TENMANS_IN_GAME) {
        return tenMansInGameEmbed(capOne, capTwo, draftListString, teamOneString, teamTwoString, specString, hostName, hostPfp, map, teamTwoAttack);
      }

      // Return Draft Embed
      return tenMansDraftEmbed(capOne, capTwo, draftListString, teamOneString, teamTwoString, specString, hostName, hostPfp);

    }

  },
};


function parseRoleName(roleName) {
  let currentRank = roleName;
  let parts = currentRank.toLowerCase().split('_');
  for (let i = 0; i < parts.length; i++) {
    let part = parts[i];
    parts[i] = part.charAt(0).toUpperCase().concat(part.substring(1));
  }
  currentRank = parts.join(' ');
  return currentRank;
}