const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AnyComponentBuilder,
} = require("discord.js");

module.exports = {
  /**
   *
   * @param {number} queueId
   * @param {string} host
   *
   * @returns {ActionRowBuilder<AnyComponentBuilder>[]}
   */
  tenMansStartComps(queueId, host) {
    return [
      new ActionRowBuilder().setComponents(
        new ButtonBuilder()
          .setCustomId(`join-tenman:${queueId}`)
          .setLabel("Join Player Pool")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`leave-queue:${queueId}`)
          .setLabel("Leave Player Pool")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("join-tenman-spec")
          .setLabel("Join Spectators")
          .setStyle(ButtonStyle.Secondary)
      ),
      new ActionRowBuilder().setComponents(
        new ButtonBuilder()
          .setCustomId(`start-draft:${queueId}:${host}`)
          .setLabel("Start Draft")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`end-queue:${queueId}:${host}`)
          .setLabel("End Game")
          .setStyle(ButtonStyle.Danger)
      ),
    ];
  },
};
