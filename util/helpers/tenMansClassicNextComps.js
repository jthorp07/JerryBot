const {
  tenMansStartComps,
  tenMansDraftComps,
  tenMansInGameComps,
} = require("../components");
const { ActionRowBuilder, AnyComponentBuilder } = require("discord.js");
const { QueueState } = require("../gcadb/enums");

module.exports = {
  /**
   * @param {number} queueId Current queue ID
   * @param {string} queueStatus Current queue status
   * @param {import("../gcadb/stored-procedures/get-queue").TenmansClassicAvailablePlayerRecord[]} playersAvailable Set of available players in queue
   * @param {string} map Name of map, if selected
   * @param {string} host id of host for queue
   *
   * @returns {ActionRowBuilder<AnyComponentBuilder>}
   */
  tenMansClassicNextComps(queueId, queueStatus, playersAvailable, map, host) {
    if (
      queueStatus == QueueState.WAITING_FOR_PLAYERS ||
      queueStatus == QueueState.STARTING_DRAFT
    ) {
      return tenMansStartComps(queueId, host);
    }

    if (queueStatus == QueueState.DRAFTING) {
      // Just defining this object with a schema for intellisense - not necessary for prod
      let playerDraftOptions = [
        {
          label: "",
          value: "",
        },
      ];
      playerDraftOptions = [];

      // Parse available players into valid StringSelectMenu options
      playersAvailable.forEach((player) => {
        let name = player.valorantDisplayName
          ? player.valorantDisplayName
          : player.discordDisplayName;
        playerDraftOptions.push({
          label: name,
          value: player.playerId,
        });
      });

      return tenMansDraftComps(queueId, playerDraftOptions, false, map, host);
    }

    if (queueStatus == QueueState.MAP_PICK) {
      return tenMansDraftComps(queueId, null, true, map, host);
    }

    if (queueStatus == QueueState.IN_GAME) {
      return tenMansInGameComps(queueId, host);
    }

    return tenMansDraftComps(queueId, null, false, map, host);
  },
};
