const { ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
  /**
   *
   * @param {string[]} draftablePlayers Array if player IDs
   */
  tenMansDraftComps() {
    return [
      new ActionRowBuilder().setComponents(
        new ButtonBuilder()
          .setCustomId("join-tenman-pool")
          .setLabel("Join Player Pool")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("leave-tenman-pool")
          .setLabel("Leave Player Pool")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("join-tenman-spec")
          .setLabel("Join Spectators")
          .setStyle(ButtonStyle.Secondary)
      ),
      new ActionRowBuilder().setComponents(
        new ButtonBuilder()
          .setCustomId("start-tenman-game")
          .setLabel("Start Draft")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("end-tenman-game")
          .setLabel("End Game")
          .setStyle(ButtonStyle.Danger)
      ),
    ];
  },
};
