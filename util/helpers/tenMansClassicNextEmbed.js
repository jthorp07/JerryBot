const { tenMansStartEmbed, tenMansDraftEmbed, tenMansInGameEmbed } = require("../embeds");
const { EmbedBuilder } = require("discord.js");
const { QUEUE_STATES } = require("../database-enums");
const { QueueState } = require("../gcadb/enums");



module.exports = {

  /**
   * Takes queue information fetched from the database and uses
   * it to construct the next embed that should be displayed in
   * a Classic Ten Mans queue
   * 
   * @param {string} queueStatus Current queue status
   * @param {import("../gcadb/stored-procedures/get-queue").TenmansClassicAvailablePlayerRecord[]} playersAvailable Set of available players in queue
   * @param {import("../gcadb/stored-procedures/get-queue").TenmansClassicTeamPlayerRecord[]} teamOnePlayers Set of players in team one in queue
   * @param {import("../gcadb/stored-procedures/get-queue").TenmansClassicTeamPlayerRecord[]} teamTwoPlayers Set of players in team two in queue
   * @param spectators Set of spectators in queue
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
    if (playersAvailable) {
      playersAvailable.forEach(player => {
        let dispName = player.valorantDisplayName ? player.valorantDisplayName : player.discordDisplayName;
        let dispRole = player.roleEmote ? player.roleEmote : player.roleName ? parseRoleName(player.roleName) : "";
        draftListString = `${draftListString}${dispName} ${dispRole}\n`;
      });
    }

    // Spectators
    let specString = spectators ? "" : undefined;
    if (spectators) {
      spectators.forEach(spectator => {
        let dispName = spectator.valorantDisplayName ? spectator.valorantDisplayName : spectator.discordDisplayName;
        specString = `${specString}${dispName}\n`;
      });
    }

    // Queue states of drafting or in-game: Make Draft embed 
    if (queueStatus == QueueState.WAITING_FOR_PLAYERS) {
      return tenMansStartEmbed(draftListString, specString, hostName, hostPfp);
    } else {
      // Team One
      let teamOneString = '';
      for (let player of teamOnePlayers) {
        if (player.isCaptain) {
          continue;
        }

        let dispName = player.valorantDisplayName ? player.valorantDisplayName : player.discordDisplayName;
        let dispRole = player.roleEmote ? player.roleEmote : player.roleName ? parseRoleName(player.roleName) : "";
        teamOneString = `${teamOneString}${dispName} ${dispRole}\n`;
      };

      // Team One Captain
      let capOne = '';
      for (let player of teamOnePlayers) {
        if (!player.isCaptain) {
          continue;
        }

        let dispName = player.valorantDisplayName ? player.valorantDisplayName : player.discordDisplayName;
        let dispRole = player.roleEmote ? player.roleEmote : player.roleName ? parseRoleName(player.roleName) : "";
        capOne = `${dispName} ${dispRole}`;
      };

      // Team Two
      let teamTwoString = '';
      for (let player of teamTwoPlayers) {
        if (player.isCaptain) {
          continue;
        }
        let dispName = player.valorantDisplayName ? player.valorantDisplayName : player.discordDisplayName;
        let dispRole = player.roleEmote ? player.roleEmote : player.roleName ? parseRoleName(player.roleName) : "";
        teamTwoString = `${teamTwoString}${dispName} ${dispRole}\n`;
      }

      // Team Two Captain
      let capTwo = '';
      for (let player of teamTwoPlayers) {
        if (!player.isCaptain) {
          continue;
        }

        let dispName = player.valorantDisplayName ? player.valorantDisplayName : player.discordDisplayName;
        let dispRole = player.roleEmote ? player.roleEmote : player.roleName ? parseRoleName(player.roleName) : "";
        capTwo = `${dispName} ${dispRole}`;
      };

      if (queueStatus == QueueState.SIDE_PICK || queueStatus == QueueState.IN_GAME) {
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